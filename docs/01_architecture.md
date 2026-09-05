# SentinelX — System Architecture

## High-level diagram (text form)

```
                         ┌──────────────────────────┐
                         │   GitHub repository        │
                         │  (single source of truth)  │
                         └──────────┬─────────────────┘
                    push to main    │    push to main
              ┌─────────────────────┼─────────────────────┐
              ▼                                            ▼
   ┌────────────────────┐                       ┌────────────────────────┐
   │   Vercel (Frontend) │                       │   Render (Backend)     │
   │   Next.js app        │  ── REST/JSON ──────▶ │   FastAPI + model       │
   │   sentinelx.vercel.app│ ◀───────────────────  │   sentinelx-api.render │
   └────────────────────┘                       └───────────┬────────────┘
                                                              │
                                    ┌─────────────────────────┼───────────────────────┐
                                    ▼                         ▼                       ▼
                          ┌─────────────────┐      ┌──────────────────┐   ┌────────────────────┐
                          │ Neon (Postgres)  │      │ Groq API          │   │ Razorpay (test mode)│
                          │ orders, nudges,  │      │ risk explanation  │   │ Payment Links API   │
                          │ payments, audit  │      │ text generation   │   │ + webhooks           │
                          └─────────────────┘      └──────────────────┘   └────────────────────┘

   ┌──────────────────────────────┐
   │ Google Colab (offline, once)  │
   │ trains XGBoost model → exports│
   │ model.joblib → committed to   │
   │ repo → loaded by Render on    │
   │ startup                       │
   └──────────────────────────────┘

   ┌──────────────────────────────┐
   │ GitHub Actions (scheduled)    │
   │ pings /health every 10 min to │
   │ keep Render free instance warm│
   └──────────────────────────────┘
```

## Components and responsibilities

| Component | Responsibility | Hosted on |
|---|---|---|
| **Frontend** | Dashboard UI, order simulation form, metrics visualizations, nudge trigger UI | Vercel (free) |
| **Backend API** | Feature engineering, model inference, business logic, Razorpay/Groq calls, webhook handling | Render free web service |
| **Database** | Orders, nudges, payments, audit log, model metrics — single source of runtime truth | Neon free Postgres |
| **Model artifact** | Trained XGBoost classifier, bundled into the backend repo/image | Committed to GitHub, loaded by Render at boot |
| **Training notebook** | One-time (or periodic) offline training run, fully reproducible | Google Colab (free T4, not required for this model size but used for a clean shareable notebook) |
| **LLM explanation layer** | Turns model feature-importance output into a one-line plain-English "why flagged" string | Groq API (`openai/gpt-oss-20b`) |
| **Payments** | Test-mode discount payment links + webhook status updates | Razorpay test mode |
| **Uptime helper** | Prevents Render free-tier cold starts from ruining a live demo | GitHub Actions scheduled workflow |

## Cross-connections (who talks to whom, and how)

| From | To | Protocol | Purpose |
|---|---|---|---|
| Frontend (Vercel) | Backend (Render) | HTTPS/REST/JSON | All data fetching and actions |
| Backend (Render) | Neon Postgres | TCP/Postgres wire protocol (via connection string) | All persistent state |
| Backend (Render) | Groq API | HTTPS/REST | Generate "why flagged" explanation text |
| Backend (Render) | Razorpay API | HTTPS/REST | Create test-mode payment links |
| Razorpay | Backend (Render) webhook endpoint | HTTPS/REST (signed) | Payment status callbacks |
| GitHub Actions | Backend (Render) `/health` | HTTPS/GET | Keep-warm ping |
| GitHub (push to main) | Vercel + Render | Git webhook | Auto-deploy on every push |

**Rule:** the frontend never talks directly to Neon, Groq, or Razorpay — everything routes through the backend API. This keeps all API keys server-side only (never exposed to the browser) and keeps the audit trail centralized in one place.

## Tech stack summary

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js (App Router) + TypeScript | Free Vercel-native hosting, fast iteration |
| Styling | Tailwind CSS | Fast to build a clean, consistent UI without a design tool |
| Charts | Recharts | Free, React-native, sufficient for PR curves/bar charts |
| Backend framework | FastAPI (Python) | Natural fit for serving an XGBoost model, async, auto-generated OpenAPI docs |
| ML | XGBoost + scikit-learn + SHAP | Fast tabular training, strong explainability tooling |
| Database | Neon (serverless Postgres, free tier) | Genuinely free, no credit card requirement for the free tier, works well with serverless backends |
| LLM | Groq (`openai/gpt-oss-20b`) | Fast, free-tier limits far exceed this project's call volume |
| Payments | Razorpay test mode | Explicitly what the buildathon asks for |
| CI/CD | GitHub → Vercel/Render auto-deploy | Zero-config, satisfies the "no local build" requirement |

## Environments
Only **one live environment** is needed for MVP: production, always deployed. Optionally, Vercel/Render both support automatic **preview deployments** per pull request — use these instead of any local dev server when testing changes before merging to `main`. Never rely on `localhost` as the definition of "working."
