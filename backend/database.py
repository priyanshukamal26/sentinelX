"""
SentinelX Backend — Database models and connection setup.
Uses SQLAlchemy with async PostgreSQL (Neon).
Schema per 05_backend_api_spec.md.
"""

import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, Text, DateTime,
    ForeignKey, JSON, create_engine, text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.pool import NullPool

IST = timezone(timedelta(hours=5, minutes=30))

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./sentinelx.db")

# For Neon serverless, use NullPool to avoid connection pool issues.
# For local dev/testing with SQLite, use check_same_thread=False.
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    # Ensure postgresql:// scheme (some providers use postgres://)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        poolclass=NullPool,
    )

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
JSONType = JSON().with_variant(JSONB, "postgresql")


def get_db():
    """FastAPI dependency for database sessions."""
    if not SessionLocal:
        raise RuntimeError("Database not configured. Set DATABASE_URL environment variable.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def generate_uuid():
    return str(uuid.uuid4())


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=generate_uuid)
    pincode = Column(Text, nullable=False)
    district = Column(Text)
    state = Column(Text)
    city_tier = Column(Integer)
    payment_mode = Column(Text, nullable=False)  # COD / prepaid
    order_value = Column(Numeric, nullable=False)
    product_category = Column(Text)
    is_first_order = Column(Boolean, default=False)
    device_type = Column(Text)
    order_hour = Column(Integer)
    address_char_length = Column(Integer)
    has_landmark_keyword = Column(Boolean, default=False)
    estimated_delivery_days = Column(Integer)
    zone_complexity = Column(Text)
    risk_score = Column(Numeric)  # model output, 0-1
    risk_band = Column(Text)  # low / medium / high
    explanation = Column(Text)  # plain-English "why flagged" text
    top_factors = Column(JSONType)  # [{feature, impact}, ...]
    status = Column(Text, default="pending")  # pending, nudged, converted_prepaid, cod_confirmed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))

    nudges = relationship("Nudge", back_populates="order")
    audit_entries = relationship("AuditLog", back_populates="order")


class Nudge(Base):
    __tablename__ = "nudges"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    payment_link_id = Column(Text)
    payment_link_url = Column(Text)
    discount_percent = Column(Numeric, default=5)
    channel = Column(Text, default="web")  # web / whatsapp_sim
    sent_at = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))

    order = relationship("Order", back_populates="nudges")
    payments = relationship("Payment", back_populates="nudge")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    nudge_id = Column(String, ForeignKey("nudges.id"), nullable=False)
    razorpay_payment_id = Column(Text)
    status = Column(Text, default="created")  # created, paid, expired
    amount = Column(Numeric)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    nudge = relationship("Nudge", back_populates="payments")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=True)
    event_type = Column(Text, nullable=False)
    event_payload = Column(JSONType)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(IST))

    order = relationship("Order", back_populates="audit_entries")


class ModelMetrics(Base):
    __tablename__ = "model_metrics"

    version = Column(Text, primary_key=True)
    precision = Column(Numeric)
    recall = Column(Numeric)
    f1 = Column(Numeric)
    threshold = Column(Numeric)
    pr_curve = Column(JSONType)
    confusion_matrix = Column(JSONType)
    per_tier_breakdown = Column(JSONType)
    feature_importance = Column(JSONType)
    trained_at = Column(DateTime(timezone=True))


def init_db():
    """Create all tables if they don't exist."""
    if engine:
        Base.metadata.create_all(bind=engine)
