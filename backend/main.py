"""
SentinelX Backend — FastAPI Application
========================================

Main application entry point. Loads the XGBoost model at startup,
exposes all API endpoints per 05_backend_api_spec.md.
"""

import os
import json
import hmac
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from contextlib import asynccontextmanager

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_

from database import (
    get_db, init_db, Order, Nudge, Payment, AuditLog, ModelMetrics,
    generate_uuid, engine, SessionLocal
)
from shared.features import (
    get_city_tier, get_zone_complexity, has_landmark_keyword,
    order_to_feature_vector, MODEL_FEATURE_COLUMNS
)

# ─── Config ───
IST = timezone(timedelta(hours=5, minutes=30))
SENTINELX_API_KEY = os.environ.get("SENTINELX_API_KEY", "dev-key-change-me")
RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# ─── Model loading ───
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "rto_model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "models", "metrics.json")

model = None
metrics_data = None
model_threshold = 0.5  # default, overridden from metrics.json


def load_model():
    """Load model and metrics at startup."""
    global model, metrics_data, model_threshold
    try:
        model = joblib.load(MODEL_PATH)
        print(f"[SentinelX] Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"[SentinelX] WARNING: Could not load model: {e}")
        model = None

    try:
        with open(METRICS_PATH, "r") as f:
            metrics_data = json.load(f)
        model_threshold = metrics_data.get("threshold", 0.5)
        print(f"[SentinelX] Metrics loaded. Threshold: {model_threshold}")
    except Exception as e:
        print(f"[SentinelX] WARNING: Could not load metrics: {e}")
        metrics_data = None


# ─── Pincode → state/district lookup ───
PINCODE_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "pincode_directory.csv")
if not os.path.exists(PINCODE_DATA_PATH):
    PINCODE_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "pincode_directory.csv")
pincode_lookup = {}

def load_pincode_data():
    """Load pincode directory for lookups."""
    global pincode_lookup
    try:
        df = pd.read_csv(PINCODE_DATA_PATH, dtype={"pincode": str})
        pincode_lookup = {}
        for _, row in df.iterrows():
            pincode_lookup[row["pincode"]] = {
                "district": row.get("district", ""),
                "state": row.get("state", ""),
            }
        print(f"[SentinelX] Pincode data loaded: {len(pincode_lookup)} entries")
    except Exception as e:
        print(f"[SentinelX] WARNING: Could not load pincode data: {e}")


# ─── SHAP explainer ───
shap_explainer = None

def load_shap_explainer():
    """Load SHAP TreeExplainer for per-prediction explanations."""
    global shap_explainer
    if model is not None:
        try:
            import shap
            shap_explainer = shap.TreeExplainer(model)
            print("[SentinelX] SHAP explainer loaded")
        except Exception as e:
            print(f"[SentinelX] WARNING: Could not load SHAP explainer: {e}")


# ─── Groq (LLM explanation) ───
groq_client = None

def init_groq():
    """Initialize Groq client for explanation generation."""
    global groq_client
    if GROQ_API_KEY:
        try:
            from openai import OpenAI
            groq_client = OpenAI(
                api_key=GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
            )
            print("[SentinelX] Groq client initialized")
        except Exception as e:
            print(f"[SentinelX] WARNING: Could not initialize Groq: {e}")


async def generate_explanation(top_factors: list) -> str:
    """
    Generate a plain-English explanation using Groq, with fallback template.
    Per 05_backend_api_spec.md: one-sentence explanation from top 3 SHAP factors.
    """
    factor_names = [f["feature"].replace("_", " ") for f in top_factors[:3]]
    
    # Fallback template (always available, per spec)
    fallback = f"Flagged mainly due to: {', '.join(factor_names)}."
    
    if groq_client is None:
        return fallback
    
    try:
        prompt = f"""You are a risk analyst. Given these top risk factors for an e-commerce order:
{json.dumps(top_factors[:3], indent=2)}

Write ONE short plain-English sentence (max 30 words) explaining why this order was flagged as high RTO risk. Be specific about the factors. Do not use technical jargon."""

        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.3,
        )
        explanation = response.choices[0].message.content.strip()
        return explanation if explanation else fallback
    except Exception as e:
        print(f"[SentinelX] Groq error (using fallback): {e}")
        return fallback


# ─── Razorpay ───
razorpay_client = None

def init_razorpay():
    """Initialize Razorpay client for payment links."""
    global razorpay_client
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
        try:
            import razorpay
            razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            print("[SentinelX] Razorpay client initialized (test mode)")
        except Exception as e:
            print(f"[SentinelX] WARNING: Could not initialize Razorpay: {e}")


# ─── Lifespan (startup/shutdown) ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model and initialize services at startup."""
    load_model()
    load_pincode_data()
    load_shap_explainer()
    init_groq()
    init_razorpay()
    
    # Initialize database tables
    if engine:
        init_db()
        seed_metrics_if_empty()
        seed_orders_if_empty()
    
    yield


def seed_metrics_if_empty():
    """Seed model_metrics table from metrics.json if empty."""
    if not metrics_data or not SessionLocal:
        return
    
    db = SessionLocal()
    try:
        existing = db.query(ModelMetrics).first()
        if existing is None:
            mm = ModelMetrics(
                version=metrics_data.get("version", "v1"),
                precision=metrics_data.get("precision"),
                recall=metrics_data.get("recall"),
                f1=metrics_data.get("f1"),
                threshold=metrics_data.get("threshold"),
                pr_curve=metrics_data.get("pr_curve"),
                confusion_matrix=metrics_data.get("confusion_matrix"),
                per_tier_breakdown=metrics_data.get("per_tier_breakdown"),
                feature_importance=metrics_data.get("feature_importance"),
                trained_at=datetime.fromisoformat(metrics_data["trained_at"]) if "trained_at" in metrics_data else datetime.now(IST),
            )
            db.add(mm)
            db.commit()
            print("[SentinelX] Metrics seeded into database")
    except Exception as e:
        print(f"[SentinelX] WARNING: Could not seed metrics: {e}")
        db.rollback()
    finally:
        db.close()


def seed_orders_if_empty():
    """Seed sample orders into database from synthetic dataset if orders table is empty."""
    if not SessionLocal or model is None:
        return
    
    orders_csv = os.path.join(os.path.dirname(__file__), "data", "orders_synthetic.csv")
    if not os.path.exists(orders_csv):
        orders_csv = os.path.join(os.path.dirname(__file__), "..", "data", "orders_synthetic.csv")
    if not os.path.exists(orders_csv):
        return
    
    db = SessionLocal()
    try:
        count = db.query(Order).count()
        if count > 0:
            return
        
        df = pd.read_csv(orders_csv, nrows=35)
        print(f"[SentinelX] Seeding {len(df)} initial orders into database...")
        
        seeded_high_risk = []
        for _, row in df.iterrows():
            order_dict = {
                "pincode": str(row["pincode"]),
                "payment_mode": row["payment_mode"],
                "order_value": float(row["order_value"]),
                "is_first_order": bool(row["is_first_order"]),
                "device_type": row["device_type"],
                "product_category": row["product_category"],
                "order_hour": int(row["order_hour"]),
                "city_tier": int(row["city_tier"]),
                "state": row["state"],
                "zone_complexity": row["zone_complexity"],
                "address_char_length": int(row["address_char_length"]),
                "has_landmark_keyword": bool(row["has_landmark_keyword"]),
                "estimated_delivery_days": int(row["estimated_delivery_days"]),
            }
            features = order_to_feature_vector(order_dict)
            feature_df = pd.DataFrame([features], columns=MODEL_FEATURE_COLUMNS)
            risk_score = float(model.predict_proba(feature_df)[:, 1][0])
            risk_band = get_risk_band(risk_score)
            
            top_factors = []
            if shap_explainer is not None:
                try:
                    shap_vals = shap_explainer.shap_values(feature_df)
                    for i, feat_name in enumerate(MODEL_FEATURE_COLUMNS):
                        top_factors.append({"feature": feat_name, "impact": round(float(shap_vals[0][i]), 4)})
                    top_factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
                    top_factors = top_factors[:4]
                except Exception:
                    pass
            if not top_factors:
                top_factors = [
                    {"feature": "payment_mode_cod", "impact": 0.8 if row["payment_mode"] == "COD" else -0.3},
                    {"feature": "order_value", "impact": 0.35 if row["order_value"] < 1000 else 0.1},
                    {"feature": "address_char_length", "impact": 0.2 if row["address_char_length"] < 40 else -0.15},
                ]
            
            factor_names = [f["feature"].replace("_", " ") for f in top_factors[:3]]
            explanation = f"Flagged mainly due to: {', '.join(factor_names)}."
            
            pincode_info = pincode_lookup.get(str(row["pincode"]), {})
            district = pincode_info.get("district", row.get("district", "Unknown"))
            
            order_id = generate_uuid()
            order = Order(
                id=order_id,
                pincode=str(row["pincode"]),
                district=district,
                state=row["state"],
                city_tier=int(row["city_tier"]),
                payment_mode=row["payment_mode"],
                order_value=float(row["order_value"]),
                product_category=row["product_category"],
                is_first_order=bool(row["is_first_order"]),
                device_type=row["device_type"],
                order_hour=int(row["order_hour"]),
                address_char_length=int(row["address_char_length"]),
                has_landmark_keyword=bool(row["has_landmark_keyword"]),
                estimated_delivery_days=int(row["estimated_delivery_days"]),
                zone_complexity=row["zone_complexity"],
                risk_score=round(risk_score, 4),
                risk_band=risk_band,
                explanation=explanation,
                top_factors=top_factors,
                status="pending",
                created_at=datetime.now(IST) - timedelta(hours=len(df) - int(row.name)),
            )
            db.add(order)
            
            log_audit(db, order_id, "order_scored", {
                "risk_score": round(risk_score, 4),
                "risk_band": risk_band,
                "threshold": model_threshold,
                "above_threshold": risk_score >= model_threshold,
            })
            
            if risk_score >= model_threshold:
                seeded_high_risk.append(order)
        
        db.commit()
        
        # Add sample nudge and converted payment for demo realism
        if seeded_high_risk:
            o1 = seeded_high_risk[0]
            n1 = Nudge(
                id=generate_uuid(),
                order_id=o1.id,
                payment_link_id=f"plink_demo_{o1.id[:8]}",
                payment_link_url=f"https://rzp.io/i/demo_{o1.id[:8]}",
                discount_percent=5,
                channel="web",
                sent_at=o1.created_at + timedelta(minutes=1),
            )
            db.add(n1)
            p1 = Payment(
                id=generate_uuid(),
                nudge_id=n1.id,
                razorpay_payment_id=f"pay_demo_{o1.id[:8]}",
                status="paid",
                amount=round(float(o1.order_value) * 0.95, 2),
                paid_at=o1.created_at + timedelta(minutes=4),
            )
            db.add(p1)
            o1.status = "converted_prepaid"
            log_audit(db, o1.id, "nudge_sent", {"nudge_id": n1.id, "discount_percent": 5})
            log_audit(db, o1.id, "payment_status_changed", {"new_status": "paid", "event": "payment_link.paid"})
            
            if len(seeded_high_risk) > 1:
                o2 = seeded_high_risk[1]
                n2 = Nudge(
                    id=generate_uuid(),
                    order_id=o2.id,
                    payment_link_id=f"plink_demo_{o2.id[:8]}",
                    payment_link_url=f"https://rzp.io/i/demo_{o2.id[:8]}",
                    discount_percent=5,
                    channel="web",
                    sent_at=o2.created_at + timedelta(minutes=2),
                )
                db.add(n2)
                p2 = Payment(
                    id=generate_uuid(),
                    nudge_id=n2.id,
                    status="created",
                    amount=round(float(o2.order_value) * 0.95, 2),
                )
                db.add(p2)
                o2.status = "nudged"
                log_audit(db, o2.id, "nudge_sent", {"nudge_id": n2.id, "discount_percent": 5})
            
            db.commit()
        print(f"[SentinelX] Successfully seeded {len(df)} orders and audit trail.")
    except Exception as e:
        print(f"[SentinelX] WARNING: Error seeding orders: {e}")
        db.rollback()
    finally:
        db.close()


# ─── FastAPI app ───
app = FastAPI(
    title="SentinelX API",
    description="Defense-only RTO risk scoring for Indian COD e-commerce",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all Vercel frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth helper ───
def verify_api_key(x_sentinelx_key: Optional[str] = Header(None)):
    """Verify shared secret for write endpoints. Per 05_backend_api_spec.md."""
    if x_sentinelx_key != SENTINELX_API_KEY:
        raise HTTPException(status_code=401, detail={"error": "Invalid API key", "code": "unauthorized"})


# ─── Pydantic models ───
class OrderCreate(BaseModel):
    pincode: str
    payment_mode: str  # COD / prepaid
    order_value: float
    is_first_order: bool = False
    device_type: str = "mobile"
    product_category: str = "other"
    order_hour: Optional[int] = None
    address: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    risk_score: float
    risk_band: str
    explanation: str
    top_factors: list


class NudgeResponse(BaseModel):
    nudge_id: str
    payment_link_url: str
    discount_percent: float
    status: str


class NudgeCreate(BaseModel):
    discount_percent: Optional[float] = 5.0
    channel: Optional[str] = "web"


# ─── Helper functions ───
def get_risk_band(score: float) -> str:
    """Per 03_sitemap_and_pages.md: green <40%, amber 40-75%, red >75%."""
    if score < 0.40:
        return "low"
    elif score <= 0.75:
        return "medium"
    else:
        return "high"


def log_audit(db: Session, order_id: Optional[str], event_type: str, payload: dict):
    """Insert an audit log entry. Per 05_backend_api_spec.md: every decision logged."""
    entry = AuditLog(
        id=generate_uuid(),
        order_id=order_id,
        event_type=event_type,
        event_payload=payload,
        created_at=datetime.now(IST),
    )
    db.add(entry)
    db.commit()


# ─── Endpoints ───

@app.get("/health")
async def health():
    """Liveness check. Used by Render health checks and GitHub Actions keep-warm."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "timestamp": datetime.now(IST).isoformat(),
    }


@app.post("/orders")
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    x_sentinelx_key: str = Header(None),
):
    """
    Create + score a new order. Per 05_backend_api_spec.md.
    Used by the Simulate Order modal.
    """
    verify_api_key(x_sentinelx_key)
    
    if model is None:
        raise HTTPException(status_code=503, detail={"error": "Model not loaded", "code": "model_unavailable"})
    
    # Look up pincode data
    pincode_info = pincode_lookup.get(order_data.pincode, {})
    district = pincode_info.get("district", "Unknown")
    state = pincode_info.get("state", "Unknown")
    
    # Build the order dict for feature engineering
    order_hour = order_data.order_hour if order_data.order_hour is not None else datetime.now(IST).hour
    address = order_data.address or ""
    
    city_tier = get_city_tier(order_data.pincode)
    zone = get_zone_complexity(state)
    
    # Estimate delivery days based on tier
    if city_tier == 1:
        est_days = 2
    elif city_tier == 2:
        est_days = 4
    else:
        est_days = 6
    
    order_dict = {
        "pincode": order_data.pincode,
        "payment_mode": order_data.payment_mode,
        "order_value": order_data.order_value,
        "is_first_order": order_data.is_first_order,
        "device_type": order_data.device_type,
        "product_category": order_data.product_category,
        "order_hour": order_hour,
        "city_tier": city_tier,
        "state": state,
        "zone_complexity": zone,
        "address_char_length": len(address),
        "has_landmark_keyword": has_landmark_keyword(address),
        "estimated_delivery_days": est_days,
    }
    
    # Feature vector
    features = order_to_feature_vector(order_dict)
    feature_df = pd.DataFrame([features], columns=MODEL_FEATURE_COLUMNS)
    
    # Score
    risk_score = float(model.predict_proba(feature_df)[:, 1][0])
    risk_band = get_risk_band(risk_score)
    
    # SHAP explanation
    top_factors = []
    if shap_explainer is not None:
        try:
            shap_values = shap_explainer.shap_values(feature_df)
            for i, feat_name in enumerate(MODEL_FEATURE_COLUMNS):
                top_factors.append({
                    "feature": feat_name,
                    "impact": round(float(shap_values[0][i]), 4),
                })
            top_factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
            top_factors = top_factors[:5]  # top 5 factors
        except Exception as e:
            print(f"[SentinelX] SHAP error: {e}")
    
    if not top_factors:
        # Fallback: use model feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            for i, feat_name in enumerate(MODEL_FEATURE_COLUMNS):
                top_factors.append({"feature": feat_name, "impact": round(float(importances[i]), 4)})
            top_factors.sort(key=lambda x: abs(x["impact"]), reverse=True)
            top_factors = top_factors[:5]
    
    # Generate explanation text
    explanation = await generate_explanation(top_factors)
    
    # Save to database
    order_id = generate_uuid()
    db_order = Order(
        id=order_id,
        pincode=order_data.pincode,
        district=district,
        state=state,
        city_tier=city_tier,
        payment_mode=order_data.payment_mode,
        order_value=order_data.order_value,
        product_category=order_data.product_category,
        is_first_order=order_data.is_first_order,
        device_type=order_data.device_type,
        order_hour=order_hour,
        address_char_length=len(address),
        has_landmark_keyword=has_landmark_keyword(address),
        estimated_delivery_days=est_days,
        zone_complexity=zone,
        risk_score=risk_score,
        risk_band=risk_band,
        explanation=explanation,
        top_factors=top_factors,
        status="pending",
        created_at=datetime.now(IST),
    )
    db.add(db_order)
    db.commit()
    
    # Audit log
    log_audit(db, order_id, "order_scored", {
        "risk_score": round(risk_score, 4),
        "risk_band": risk_band,
        "threshold": model_threshold,
        "above_threshold": risk_score >= model_threshold,
    })
    
    # Also log threshold check
    log_audit(db, order_id, "threshold_checked", {
        "risk_score": round(risk_score, 4),
        "threshold": model_threshold,
        "result": "above" if risk_score >= model_threshold else "below",
    })
    
    return {
        "id": order_id,
        "risk_score": round(risk_score, 4),
        "risk_band": risk_band,
        "explanation": explanation,
        "top_factors": top_factors,
    }


@app.get("/orders")
async def list_orders(
    tier: Optional[int] = None,
    payment_mode: Optional[str] = None,
    risk_band: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List orders with optional filters. Per 05_backend_api_spec.md."""
    query = db.query(Order)
    
    if tier is not None:
        query = query.filter(Order.city_tier == tier)
    if payment_mode:
        query = query.filter(Order.payment_mode == payment_mode)
    if risk_band:
        query = query.filter(Order.risk_band == risk_band)
    if status:
        query = query.filter(Order.status == status)
    
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "orders": [
            {
                "id": o.id,
                "pincode": o.pincode,
                "district": o.district,
                "city_tier": o.city_tier,
                "payment_mode": o.payment_mode,
                "order_value": float(o.order_value) if o.order_value else 0,
                "risk_score": float(o.risk_score) if o.risk_score else 0,
                "risk_band": o.risk_band,
                "status": o.status,
                "is_first_order": o.is_first_order,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ],
    }


@app.get("/orders/{order_id}")
async def get_order(order_id: str, db: Session = Depends(get_db)):
    """Order detail with explanation + nudge/payment history. Per 05_backend_api_spec.md."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail={"error": "Order not found", "code": "not_found"})
    
    # Get nudge history
    nudges = db.query(Nudge).filter(Nudge.order_id == order_id).all()
    nudge_data = []
    for n in nudges:
        payments = db.query(Payment).filter(Payment.nudge_id == n.id).all()
        nudge_data.append({
            "id": n.id,
            "payment_link_id": n.payment_link_id,
            "payment_link_url": n.payment_link_url,
            "discount_percent": float(n.discount_percent) if n.discount_percent else 5,
            "channel": n.channel,
            "sent_at": n.sent_at.isoformat() if n.sent_at else None,
            "payments": [
                {
                    "id": p.id,
                    "razorpay_payment_id": p.razorpay_payment_id,
                    "status": p.status,
                    "amount": float(p.amount) if p.amount else 0,
                    "paid_at": p.paid_at.isoformat() if p.paid_at else None,
                }
                for p in payments
            ],
        })
    
    # Get audit trail for this order
    audit_entries = db.query(AuditLog).filter(
        AuditLog.order_id == order_id
    ).order_by(AuditLog.created_at).all()
    
    return {
        "id": order.id,
        "pincode": order.pincode,
        "district": order.district,
        "state": order.state,
        "city_tier": order.city_tier,
        "payment_mode": order.payment_mode,
        "order_value": float(order.order_value) if order.order_value else 0,
        "product_category": order.product_category,
        "is_first_order": order.is_first_order,
        "device_type": order.device_type,
        "order_hour": order.order_hour,
        "address_char_length": order.address_char_length,
        "has_landmark_keyword": order.has_landmark_keyword,
        "estimated_delivery_days": order.estimated_delivery_days,
        "zone_complexity": order.zone_complexity,
        "risk_score": float(order.risk_score) if order.risk_score else 0,
        "risk_band": order.risk_band,
        "explanation": order.explanation,
        "top_factors": order.top_factors or [],
        "status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "nudges": nudge_data,
        "audit_trail": [
            {
                "id": a.id,
                "event_type": a.event_type,
                "event_payload": a.event_payload,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in audit_entries
        ],
    }


@app.post("/orders/{order_id}/nudge")
async def send_nudge(
    order_id: str,
    nudge_data: Optional[NudgeCreate] = None,
    db: Session = Depends(get_db),
    x_sentinelx_key: str = Header(None),
):
    """
    Create a Razorpay test-mode payment link for a high-risk order.
    Per 05_backend_api_spec.md.
    """
    verify_api_key(x_sentinelx_key)
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail={"error": "Order not found", "code": "not_found"})
    
    # Defense-only rule: only nudge if risk > threshold
    if float(order.risk_score or 0) < model_threshold:
        raise HTTPException(status_code=400, detail={
            "error": "Order risk score is below threshold. Defense-only: cannot nudge low-risk orders.",
            "code": "below_threshold"
        })
    
    # Check for existing un-expired nudge (per spec: never nudge twice simultaneously)
    existing_nudge = db.query(Nudge).filter(Nudge.order_id == order_id).first()
    if existing_nudge:
        # Check if it has an expired payment
        existing_payment = db.query(Payment).filter(
            Payment.nudge_id == existing_nudge.id,
            Payment.status != "expired"
        ).first()
        if existing_payment:
            raise HTTPException(status_code=400, detail={
                "error": "An active nudge already exists for this order.",
                "code": "nudge_exists"
            })
    
    # Calculate discounted amount from variable request (default 5%)
    discount_percent = float(nudge_data.discount_percent if (nudge_data and nudge_data.discount_percent is not None) else 5.0)
    discount_percent = max(1.0, min(30.0, discount_percent))
    channel = nudge_data.channel if (nudge_data and nudge_data.channel) else "web"
    
    original_amount = float(order.order_value)
    discounted_amount = round(original_amount * (1 - discount_percent / 100), 2)
    amount_paise = int(discounted_amount * 100)
    
    # Create Razorpay payment link (test mode)
    payment_link_id = None
    payment_link_url = None
    
    if razorpay_client:
        try:
            link_data = razorpay_client.payment_link.create({
                "amount": amount_paise,
                "currency": "INR",
                "description": f"SentinelX: Prepaid discount for order {order_id[:8]}",
                "customer": {
                    "name": "Test Customer",
                    "email": "test@sentinelx.demo",
                },
                "notify": {"sms": False, "email": False},
                "callback_url": "",
                "callback_method": "",
            })
            payment_link_id = link_data.get("id")
            payment_link_url = link_data.get("short_url")
        except Exception as e:
            print(f"[SentinelX] Razorpay error: {e}")
            log_audit(db, order_id, "error", {
                "source": "razorpay",
                "error": str(e),
            })
            # Still create the nudge record with simulated data
            payment_link_id = f"plink_sim_{generate_uuid()[:8]}"
            payment_link_url = f"https://rzp.io/i/test_{order_id[:8]}"
    else:
        # Simulated payment link (when Razorpay keys not configured)
        payment_link_id = f"plink_sim_{generate_uuid()[:8]}"
        payment_link_url = f"https://rzp.io/i/test_{order_id[:8]}"
    
    # Create nudge record
    nudge_id = generate_uuid()
    nudge = Nudge(
        id=nudge_id,
        order_id=order_id,
        payment_link_id=payment_link_id,
        payment_link_url=payment_link_url,
        discount_percent=discount_percent,
        channel=channel,
        sent_at=datetime.now(IST),
    )
    db.add(nudge)
    
    # Create payment record
    payment = Payment(
        id=generate_uuid(),
        nudge_id=nudge_id,
        razorpay_payment_id=None,
        status="created",
        amount=discounted_amount,
    )
    db.add(payment)
    
    # Update order status
    order.status = "nudged"
    db.commit()
    
    # Audit
    log_audit(db, order_id, "nudge_sent", {
        "nudge_id": nudge_id,
        "payment_link_id": payment_link_id,
        "discount_percent": discount_percent,
        "original_amount": original_amount,
        "discounted_amount": discounted_amount,
    })
    
    return {
        "nudge_id": nudge_id,
        "payment_link_url": payment_link_url,
        "discount_percent": discount_percent,
        "status": "created",
    }


@app.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Receive Razorpay webhook callbacks for payment link events.
    Per 05_backend_api_spec.md: verify signature (HMAC), update status, audit log.
    """
    body = await request.body()
    
    # Verify signature if webhook secret is configured
    if RAZORPAY_WEBHOOK_SECRET:
        signature = request.headers.get("x-razorpay-signature", "")
        expected = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=400, detail={"error": "Invalid webhook signature", "code": "invalid_signature"})
    
    payload = json.loads(body)
    event = payload.get("event", "")
    
    if event in ("payment_link.paid", "payment_link.expired"):
        pl_entity = payload.get("payload", {}).get("payment_link", {}).get("entity", {})
        payment_link_id = pl_entity.get("id")
        
        if payment_link_id:
            nudge = db.query(Nudge).filter(Nudge.payment_link_id == payment_link_id).first()
            if nudge:
                payment = db.query(Payment).filter(Payment.nudge_id == nudge.id).first()
                if payment:
                    if event == "payment_link.paid":
                        payment.status = "paid"
                        payment.paid_at = datetime.now(IST)
                        payment.razorpay_payment_id = pl_entity.get("payments", [{}])[0].get("payment_id") if pl_entity.get("payments") else None
                        
                        # Update order status
                        order = db.query(Order).filter(Order.id == nudge.order_id).first()
                        if order:
                            order.status = "converted_prepaid"
                    
                    elif event == "payment_link.expired":
                        payment.status = "expired"
                        
                        order = db.query(Order).filter(Order.id == nudge.order_id).first()
                        if order:
                            order.status = "cod_confirmed"
                    
                    db.commit()
                    
                    log_audit(db, nudge.order_id, "payment_status_changed", {
                        "payment_link_id": payment_link_id,
                        "new_status": payment.status,
                        "event": event,
                    })
    
    return {"status": "ok"}


@app.get("/metrics")
async def get_metrics(db: Session = Depends(get_db)):
    """Return the latest model_metrics. Per 05_backend_api_spec.md."""
    mm = db.query(ModelMetrics).first()
    if mm:
        return {
            "version": mm.version,
            "precision": float(mm.precision) if mm.precision else None,
            "recall": float(mm.recall) if mm.recall else None,
            "f1": float(mm.f1) if mm.f1 else None,
            "threshold": float(mm.threshold) if mm.threshold else None,
            "pr_curve": mm.pr_curve,
            "confusion_matrix": mm.confusion_matrix,
            "per_tier_breakdown": mm.per_tier_breakdown,
            "feature_importance": mm.feature_importance,
            "trained_at": mm.trained_at.isoformat() if mm.trained_at else None,
        }
    
    # Fallback to metrics.json file
    if metrics_data:
        return metrics_data
    
    raise HTTPException(status_code=404, detail={"error": "No metrics available", "code": "no_metrics"})


@app.get("/audit")
async def list_audit(
    order_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List audit log entries with filters. Per 05_backend_api_spec.md."""
    query = db.query(AuditLog)
    
    if order_id:
        query = query.filter(AuditLog.order_id == order_id)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    
    total = query.count()
    entries = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "entries": [
            {
                "id": e.id,
                "order_id": e.order_id,
                "event_type": e.event_type,
                "event_payload": e.event_payload,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in entries
        ],
    }


@app.get("/kpis")
async def get_kpis(db: Session = Depends(get_db)):
    """Dashboard KPI aggregates. Per 05_backend_api_spec.md."""
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    high_risk_count = db.query(func.count(Order.id)).filter(Order.risk_band == "high").scalar() or 0
    converted_count = db.query(func.count(Order.id)).filter(Order.status == "converted_prepaid").scalar() or 0
    
    # Revenue saved = sum of order values for converted orders * discount %
    converted_orders = db.query(Order).filter(Order.status == "converted_prepaid").all()
    revenue_saved = sum(
        float(o.order_value or 0) * 0.30  # estimated COD RTO cost savings (~30% of order value)
        for o in converted_orders
    )
    
    # Get latest metrics for precision/recall
    mm = db.query(ModelMetrics).first()
    
    return {
        "total_orders": total_orders,
        "high_risk_orders": high_risk_count,
        "high_risk_percent": round(high_risk_count / max(total_orders, 1) * 100, 1),
        "converted_prepaid": converted_count,
        "revenue_saved": round(revenue_saved, 2),
        "precision": float(mm.precision) if mm and mm.precision else None,
        "recall": float(mm.recall) if mm and mm.recall else None,
    }


# Simulated payment completion endpoint (for demo purposes when Razorpay test mode
# can't easily be triggered in a live demo — allows judges to see the full flow)
@app.post("/orders/{order_id}/simulate-payment")
async def simulate_payment(
    order_id: str,
    db: Session = Depends(get_db),
    x_sentinelx_key: str = Header(None),
):
    """Simulate a payment completion for demo purposes."""
    verify_api_key(x_sentinelx_key)
    
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail={"error": "Order not found", "code": "not_found"})
    
    nudge = db.query(Nudge).filter(Nudge.order_id == order_id).first()
    if not nudge:
        raise HTTPException(status_code=400, detail={"error": "No nudge exists for this order", "code": "no_nudge"})
    
    payment = db.query(Payment).filter(Payment.nudge_id == nudge.id).first()
    if not payment:
        raise HTTPException(status_code=400, detail={"error": "No payment record found", "code": "no_payment"})
    
    payment.status = "paid"
    payment.paid_at = datetime.now(IST)
    payment.razorpay_payment_id = f"pay_sim_{generate_uuid()[:8]}"
    
    order.status = "converted_prepaid"
    db.commit()
    
    log_audit(db, order_id, "payment_status_changed", {
        "payment_link_id": nudge.payment_link_id,
        "new_status": "paid",
        "event": "simulated_payment",
    })
    
    return {"status": "paid", "order_status": "converted_prepaid"}
