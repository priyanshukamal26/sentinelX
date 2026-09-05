# SentinelX — Defense-Only RTO Risk Manager for Indian COD E-Commerce

> **Razorpay AI Buildathon · Track 02: AI Risk Manager**  
> An AI-driven risk scoring engine that protects Indian D2C and e-commerce merchants from Return-to-Origin (RTO) losses — without ever blocking or cancelling a customer order.

---

## 1. Executive Summary

Cash on Delivery (COD) represents over 60% of online retail orders in India, yet suffers from staggering **28–35% Return-to-Origin (RTO) failure rates** (compared to only 4–8% for prepaid UPI orders). Reverse logistics, restocking, and blocked inventory severely erode merchant margins.

Traditional fraud tools act as blunt instruments: they auto-reject orders from Tier-2/Tier-3 towns or unknown buyers, alienating legitimate customers.

**SentinelX introduces a defense-only, asymmetric-incentive architecture:**
1. **Real-Time ML Inference**: Evaluates order risk at checkout using XGBoost trained on 10 grounded behavioral and geographic signals.
2. **SHAP TreeExplainer**: Computes exact mathematical feature attributions for every prediction, translated into plain English via Groq LLM.
3. **Defense-Only Prepaid Nudge**: Low/medium risk orders proceed with zero friction. Only orders exceeding the optimal threshold (0.4467) receive an automated Razorpay test-mode payment link offering a **5% instant discount** to switch to prepaid.
4. **Immutable Audit Trail**: Every score, threshold check, nudge dispatch, and webhook callback is cryptographically verified and permanently logged.

---

## 2. Track 02 Judging Bars Met

| Track 02 Requirement | How SentinelX Delivers |
|---|---|
| **1. Held-Out Evaluation** | Evaluated on 2,000 un-seen held-out orders. **Precision: 26.1%**, **Recall: 58.1%**, **F1: 0.360** at threshold 0.4467. Honest numbers, no training-set leaks. |
| **2. Honest False-Positive Cost** | A false positive is a *low-severity* event: a safe customer receives a 5% discount offer. If accepted, both parties win; if ignored, COD proceeds normally. Zero customers blocked. |
| **3. Strictly Defense-Only** | SentinelX never cancels or blocks an order. It only offers an incentive to convert payment modes. |
| **4. 100% Auditable** | Every decision is timestamped and stored in the `audit_log` table with full event payloads, inspectable live at `/audit`. |

---

## 3. Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────────┐
                     │          Next.js 16 App Router (Vercel)       │
                     │  "Operational Black" Liquid-Glass Design     │
                     └──────────────────────┬───────────────────────┘
                                            │ REST / JSON
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │            FastAPI Backend (Render)          │
                     │  • Shared Feature Extraction (features.py)   │
                     │  • XGBoost Inference Scorer                  │
                     │  • SHAP TreeExplainer (Feature Attribution)  │
                     │  • Groq LLM Plain-English Explanations       │
                     │  • Razorpay Payment Links API                │
                     └──────────────────────┬───────────────────────┘
                                            │ SQLAlchemy / NullPool
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │            Neon Serverless PostgreSQL        │
                     │  orders, nudges, payments, audit_log,        │
                     │  model_metrics                               │
                     └──────────────────────────────────────────────┘
```

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic, SQLAlchemy.
- **Machine Learning**: XGBoost, Scikit-Learn, SHAP TreeExplainer, Joblib, Pandas, NumPy.
- **Integrations**: Razorpay Payment Links API (test mode) + Webhook verification (HMAC-SHA256), Groq API (with fallback template).
- **Database**: Neon Serverless Postgres (with SQLite fallback for local test execution).
- **Keep-Warm Automation**: GitHub Actions workflow (`.github/workflows/keep-warm.yml`) pinging `/health` every 10 minutes.

---

## 4. Grounded Dataset & Model Training

The dataset generation (`scripts/generate_and_train.py`) grounds 10,000 synthetic orders in empirical Indian e-commerce statistics:
- **Pincode & Tier Directory**: 2,277 pincodes across 31 States/UTs mapped to Tier 1, 2, and 3.
- **COD RTO Rate**: Calibrated to 26.0% (target 28–35%).
- **Prepaid RTO Rate**: Calibrated to 7.2% (target 4–8%).
- **Tier Gradient**: Tier 2 & Tier 3 RTO rates strictly exceed Tier 1.
- **Impulse Zone**: Orders in the ₹500–₹1,500 range placed between 22:00–04:00 show marked return spikes.
- **Address Quality**: Features capture character length and presence of landmark keywords (`near`, `opp`, `behind`).

---

## 5. Quick Start (Local Run)

### Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
- App UI: `http://localhost:3000`

---

## 6. Project Documentation Directory

Detailed design specs and documentation are in `docs/`:
- `00_overview.md`: Project vision, judging bar, constraints.
- `01_architecture.md`: System layers, data flow, component design.
- `02_dataset_spec.md`: Mathematical specification and distribution formulas.
- `03_sitemap_and_pages.md`: Sitemap, user flows, and page layout specs.
- `04_design_system.md`: "Operational Black" liquid-glass theme and tokens.
- `05_backend_api_spec.md`: OpenAPI schemas, endpoints, and error handling.
- `06_integrations.md`: Razorpay test-mode API and Groq LLM specifications.
- `07_hosting_and_deployment.md`: 100% free-tier deployment blueprint.
- `08_mvp_scope_and_roadmap.md`: MVP deliverables vs future roadmap.
- `09_project_tracking_spec.md`: Tracking rules and append-only log format.
- `project_track.md`: Active project checklist, decisions log, and status summary.

---

## 7. License

Built for the **Razorpay AI Buildathon (Track 02: AI Risk Manager)**. Apache 2.0 / MIT.
