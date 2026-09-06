# SentinelX — Enterprise Defense-Only RTO Risk Engine for Indian COD E-Commerce

[![Track](https://img.shields.io/badge/Razorpay%20AI%20Buildathon-Track%2002%3A%20AI%20Risk%20Manager-blue.svg)](https://razorpay.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20App%20Router-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688.svg)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost%20%2B%20SHAP-orange.svg)](https://xgboost.readthedocs.io/)
[![Database](https://img.shields.io/badge/Database-Neon%20Serverless%20Postgres-00E599.svg)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

> **Architected & Engineered by [Priyanshu Kamal](https://www.linkedin.com/in/priyanshukamal/)**  
> **GitHub**: [@priyanshukamal26](https://github.com/priyanshukamal26/) · **Repository**: [github.com/priyanshukamal26/sentinelX](https://github.com/priyanshukamal26/sentinelX)  
> **Live Production App**: [https://sentinel-x-eta.vercel.app](https://sentinel-x-eta.vercel.app)  
> **Live Backend API**: [https://sentinelx-odxl.onrender.com/health](https://sentinelx-odxl.onrender.com/health)

---

## 1. Executive Summary & Problem Statement

In the Indian e-commerce landscape, **Cash on Delivery (COD)** represents over 60% of total order volume. However, COD suffers from a crippling **28% to 35% Return-to-Origin (RTO)** rate, compared to just 4% to 8% for prepaid UPI/Card orders. Failed deliveries inflict severe financial damage on direct-to-consumer (D2C) brands through forward shipping fees, return reverse logistics, inventory lockup, and product depreciation.

Traditional fraud prevention engines rely on blunt blacklisting: they block or reject orders from Tier-2/Tier-3 towns or unverified phone numbers. This creates massive cart abandonment and penalizes honest buyers.

**SentinelX fundamentally reframes the problem with a Defense-Only Asymmetric Incentive Engine:**
- **Zero Order Rejections**: SentinelX *never* blocks, cancels, or refuses COD orders.
- **Explainable ML Inference**: Real-time XGBoost risk scoring combined with SHAP TreeExplainer feature attributions for every incoming order.
- **Dynamic Prepaid Conversion Nudges**: When risk crosses a merchant's threshold, SentinelX automatically dispatches a gamified Razorpay payment link with a variable incentive discount (5%–15% off) via WhatsApp/SMS to convert volatile COD into guaranteed prepaid cash flow.
- **Multi-Tenant Architecture**: Tailored store profiles with independent risk thresholds, alongside an all-store **Hackathon Judge Master Console**.
- **Immutable Cryptographic Auditability**: Every score, threshold comparison, nudge dispatch, and webhook callback is cryptographically verified and recorded in an append-only audit trail.

---

## 2. Track 02 Judging Criteria Alignment

| Evaluation Bar | Implementation in SentinelX | Verification Path |
| :--- | :--- | :--- |
| **1. Rigorous Held-Out Evaluation** | Evaluated on 2,000 completely unseen held-out orders. **Precision: 26.1%**, **Recall: 58.1%**, **F1: 0.360** at threshold `0.4467`. Honest metrics, no data leakage. | Live at `/metrics` with confusion matrix & PR curve |
| **2. Honest False-Positive Accounting** | A false positive is a non-destructive commercial incentive: an honest buyer gets a 5%–10% prepaid discount. If taken, merchant gains guaranteed cash; if ignored, COD proceeds normally. | Quantified cost analysis at `/metrics` |
| **3. Strictly Defense-Only Operation** | System architecture enforces zero order cancellation capability. The only available action on high risk is offering an incentive to switch payment modes. | Verified via API schema & UI flow |
| **4. End-to-End Cryptographic Auditability** | Every inference, nudge creation, and Razorpay webhook callback is recorded in `audit_log` with raw JSON event payloads. | Live queryable log at `/audit` |

---

## 3. Core System Architecture

```
                                  [ CUSTOMER / CLIENT ]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          [ D2C Merchant Storefront ]                 [ Direct Link / WhatsApp ]
           (Shopify / WooCommerce / Custom)            (Prepaid Nudge Checkout)
                       │                                           │
                       │ POST /orders                              │ GET /nudge/[id]
                       ▼                                           ▼
       ┌────────────────────────────────────────────────────────────────────────┐
       │                     VERCEL EDGE PLATFORM (Next.js 16)                  │
       │  • "Operational Black" Glassmorphic Design System                      │
       │  • Public Interactive Landing Page (ROI Calculator + Hero Scorer)      │
       │  • Multi-Tenant Merchant Portal (Urban Vogue, KicksIndia, Aura)       │
       │  • Hackathon Judge Master View (Cross-Account Unified Stream)          │
       │  • Regional Risk Analytics & Pincode Heatmap (/analytics)              │
       └───────────────────────────────────┬────────────────────────────────────┘
                                           │ HTTPS / JSON (X-SentinelX-Key)
                                           ▼
       ┌────────────────────────────────────────────────────────────────────────┐
       │                     RENDER CLOUD API (FastAPI / Uvicorn)               │
       │  • Pincode Directory & City-Tier Geocoding (2,277 Postal Zones)        │
       │  • Feature Engineering Pipeline (features.py — 10 Behavioral Signals)  │
       │  • XGBoost Risk Classifier (Joblib In-Memory Inference)               │
       │  • SHAP TreeExplainer (Exact Per-Feature Margin Attributions)          │
       │  • Groq LLM Plain-English Explainability Synthesizer                   │
       │  • Razorpay Payment Links API Integration (Test Mode)                  │
       │  • HMAC-SHA256 Webhook Verification Engine                             │
       └──────────────────────┬───────────────────────────┬─────────────────────┘
                              │                           │
                              ▼                           ▼
       ┌──────────────────────────────┐        ┌────────────────────────────────┐
       │   NEON SERVERLESS POSTGRES   │        │     RAZORPAY PAYMENT GATEWAY   │
       │  • orders                    │        │  • Payment Links API           │
       │  • nudges                    │◄───────┤  • Standard Checkout           │
       │  • payments                  │ Webhook│  • Webhook Dispatcher          │
       │  • audit_log                 │        │    (payment.link.paid)         │
       │  • model_metrics             │        └────────────────────────────────┘
       └──────────────────────────────┘
```

---

## 4. Key Functional Capabilities

### A. Dynamic Nudge Offers with Variable Incentives
Merchants can dispatch custom discount tiers on high-risk COD orders:
- **Preset Chips**: 5% (Standard), 8% (Tier 2/3 Recommended), 10% (High Urgency), 15% (Max Recovery).
- **Custom Slider**: 3% to 20% discount range with instant price recalculation.
- **Conversion Lift Analytics**: Live estimated conversion uplift badges based on incentive depth.

### B. Customer Nudge Experience (`/nudge/[id]`)
- Customer-facing responsive mobile checkout.
- Live **10-minute discount countdown timer** creating natural urgency.
- Real-time Razorpay test-mode modal checkout supporting UPI, Cards, and Netbanking.
- Instant fallback simulation button for live pitch presentations.

### C. Multi-Tenant Merchant Profiles & Judge Master View
- **👗 Urban Vogue India** (Fashion & Apparel | Threshold: `0.42` | 5% Discount)
- **👟 KicksIndia Footwear** (Streetwear & Sneakers | Threshold: `0.38` | 8% Discount)
- **⚡ Aura Electronics** (Consumer Gadgets | Threshold: `0.48` | 5% Discount)
- **⚖️ Hackathon Judge Master View**: Unified view displaying all orders across stores, adding a Store badge column, a store filter selector, and cross-account benchmark comparisons against the baseline F1 cutoff (`0.4467`).

### D. Interactive ROI & Revenue Recovery Calculator
Available directly on the landing page (`/`):
- Dynamic sliders for **Monthly COD Volume** (1,000 to 50,000 orders) and **Average Order Value** (₹500 to ₹5,000).
- Calculates net margin recovered from averted return logistics costs.

### E. Regional RTO Risk Heatmap (`/analytics`)
- Visual distribution of risk by Indian States and Pincode Tiers (Tier 1 Metro, Tier 2, Tier 3).
- Identifies geographic hotspots driving reverse logistics leakage.

---

## 5. Machine Learning Pipeline & Empirical Grounding

The model is trained on an empirical synthetic dataset (`data/orders_synthetic.csv`) calibrated against published Indian D2C delivery metrics:
- **Pincode & Tier Directory**: 2,277 real Indian pincodes mapped across 31 States and Union Territories.
- **Asymmetric Baseline**: Overall COD RTO calibrated to 26.0%; Prepaid RTO calibrated to 7.2%.
- **City Tier Disparity**: Metro Tier-1 RTO ~18%; Non-Metro Tier-3 RTO ~38%.
- **Impulse Order Window**: Late-night purchases (22:00 to 04:00) in the ₹500–₹1,500 range show a 1.6x surge in return propensity.
- **Address Signal Quality**: Character length extraction and landmark verification (`near`, `behind`, `opposite`, `cross`).

---

## 6. Local Development & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

### 1. Clone Repository
```bash
git clone https://github.com/priyanshukamal26/sentinelX.git
cd sentinelX
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Swagger Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`
- Demo Access: Select any merchant profile or click **Hackathon Judge Master Access** on `/login`.

---

## 7. Cloud Deployment & Automation

- **Frontend**: Deployed on **Vercel** with Next.js 16 Edge optimization and instant cache revalidation.
- **Backend API**: Hosted on **Render** (Python Web Service).
- **Keep-Warm Cron**: Automated via GitHub Actions workflow ([.github/workflows/keep-warm.yml](.github/workflows/keep-warm.yml)) executing a `curl -sf /health` ping every 10 minutes to eliminate free-tier container sleep.
- **Database**: Neon Serverless Postgres with connection pooling (`NullPool`).

---

## 8. Author & Engineering Credits

**Priyanshu Kamal**  
Full-Stack ML & Systems Engineer  
- **LinkedIn**: [https://www.linkedin.com/in/priyanshukamal/](https://www.linkedin.com/in/priyanshukamal/)  
- **GitHub**: [https://github.com/priyanshukamal26/](https://github.com/priyanshukamal26/)  
- **Project Repository**: [https://github.com/priyanshukamal26/sentinelX](https://github.com/priyanshukamal26/sentinelX)

---

## 9. License

Developed for the **Razorpay AI Buildathon 2026 (Track 02: AI Risk Manager)**. Distributed under the Apache 2.0 / MIT Open Source License.
