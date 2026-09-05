# SentinelX — Hosting & Deployment (100% Free, No Local Build)

## The core rule
**The product must live online from the first working version onward.** Development happens by pushing to GitHub, which auto-deploys to Vercel and Render. Verification happens by visiting the live deployed URLs — never by running a local dev server and calling that "done." Local `npm run dev` / `uvicorn` commands may be used transiently while writing code, but nothing is considered complete until it's confirmed working on the live hosted URL.

## Repo structure

```
sentinelX/
├── docs/                  ← this folder, plus project_track.md
├── frontend/               ← Next.js app (deployed to Vercel)
├── backend/                ← FastAPI app (deployed to Render)
│   ├── shared/features.py  ← feature engineering, shared by training + serving
│   ├── models/              ← rto_model.joblib, metrics.json (committed artifacts)
│   └── data/                ← pincode_directory.csv, tier_lookup.csv, orders_synthetic.csv
├── notebooks/               ← 01_generate_dataset.ipynb, 02_train_model.ipynb (Colab-compatible)
├── .github/workflows/       ← keep-warm.yml
└── README.md
```

## 1. GitHub
- Single repo, `main` branch is always deployable.
- Every push to `main` triggers both Vercel and Render deploys automatically once connected (steps below).

## 2. Vercel (frontend)
1. Sign up free (GitHub login), "Import Project," point at the repo, set root directory to `frontend/`.
2. Set environment variable `NEXT_PUBLIC_API_BASE_URL` = the Render backend's live URL.
3. Every push to `main` auto-deploys; pull requests get their own free preview URL — use these instead of local dev for testing in-progress changes.

## 3. Render (backend)
1. Sign up free, "New Web Service," point at the repo, root directory `backend/`.
2. Free tier note: the service **sleeps after ~15 minutes of inactivity** and takes a noticeable few seconds to wake on the next request — mitigated by the keep-warm GitHub Action below.
3. Set environment variables (see the master list further down).
4. Expose `GET /health` returning `{"status": "ok"}` — used both by Render's own health checks and the keep-warm workflow.

## 4. Neon (database)
1. Sign up free, create a project — Neon's free tier gives a serverless Postgres instance with no credit card required.
2. Copy the connection string into the backend's `DATABASE_URL` environment variable (set in Render's dashboard, not committed to the repo).
3. Run schema migrations (see `05_backend_api_spec.md` for table definitions) via a one-time script or a lightweight migration tool (e.g., Alembic) — run this against the live Neon database directly; there is no separate local database to keep in sync.

## 5. Keep-warm GitHub Action
`.github/workflows/keep-warm.yml`:
```yaml
name: keep-warm
on:
  schedule:
    - cron: "*/10 * * * *"
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend health endpoint
        run: curl -sf https://<your-render-service>.onrender.com/health || true
```
This is free (GitHub Actions free tier is generous for a repo this size) and removes the cold-start risk during a live demo/judging window.

## 6. Model training (Colab, offline, once)
- `notebooks/01_generate_dataset.ipynb` and `02_train_model.ipynb` run in Google Colab's free tier (no GPU actually required for this model size, but Colab gives a clean, shareable, reproducible environment).
- Output artifacts (`orders_synthetic.csv`, `rto_model.joblib`, `metrics.json`, SHAP plot images) get downloaded from Colab and committed to the GitHub repo (via a normal `git add`/`git commit`/`git push`, or by connecting the Colab notebook directly to the repo if convenient).
- This is the one part of the workflow that isn't "live" in real time — it's a deliberate, occasional offline step, not a violation of the no-local-build principle, since the *running product* never depends on a local machine being on.

## Environment variables — master list

| Variable | Where set | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Vercel | Frontend → backend base URL |
| `DATABASE_URL` | Render | Neon Postgres connection string |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Render | Test-mode Razorpay API credentials |
| `RAZORPAY_WEBHOOK_SECRET` | Render | Verifies incoming webhook signatures |
| `GROQ_API_KEY` | Render | LLM explanation calls |
| `SENTINELX_API_KEY` | Render (server) + Vercel (as a non-public server-side var, never `NEXT_PUBLIC_`) | Shared secret for write-endpoint auth |

**Never commit any of these to the repo** — set them only in the Vercel/Render dashboards. Add a `.env.example` file with variable names but no values, for documentation purposes.

## Free-tier limits worth knowing (so nothing surprises you mid-build)

| Service | Relevant free-tier limit | Risk to this project |
|---|---|---|
| Render free web service | Sleeps after ~15 min idle; limited monthly free hours | Handled by keep-warm action; monthly hours are generous enough for a single small service |
| Neon free Postgres | Storage cap (generous, comfortably fits this project's scale of a few tens of thousands of rows) | None expected at this scale |
| Vercel free tier | Bandwidth/build-minute caps, generous for a small project | None expected |
| Groq free tier | See `06_integrations.md` | None expected at this call volume |
| GitHub Actions | Free minutes per month on public repos | A 10-minute cron ping uses negligible minutes |

## Deployment checklist (do this once everything above is wired up)
- [ ] Backend deployed on Render, `/health` returns 200
- [ ] Frontend deployed on Vercel, loads `/dashboard` and successfully fetches from the live backend
- [ ] Neon database reachable from Render, tables created
- [ ] Keep-warm GitHub Action running on schedule
- [ ] Razorpay test-mode payment link creation verified end-to-end on the live site (not locally)
- [ ] Groq explanation call verified end-to-end on the live site, fallback template tested by temporarily breaking the API key
