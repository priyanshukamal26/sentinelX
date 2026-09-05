# SentinelX — MVP Scope & Roadmap

## MVP (Phase 1) — must-have, build this first, in this order

1. **Dataset + model** (`02_dataset_spec.md`) — generated, validated, trained, honest held-out metrics computed, artifacts committed to repo.
2. **Backend deployed on Render**, connected to **Neon**, all core endpoints from `05_backend_api_spec.md` working, verified live (not local).
3. **Frontend deployed on Vercel**: `/dashboard` (order table + KPI strip + Simulate Order modal), `/dashboard/orders/[id]` (detail + why-flagged + Send Nudge modal), `/metrics` (real numbers, PR curve, false-positive-cost callout), `/audit` (full log).
4. **Razorpay test-mode nudge flow** working end-to-end live: high-risk order → Send Nudge → payment link → webhook → status update → audit entry.
5. **Groq explanation** wired with working fallback template.
6. **Keep-warm GitHub Action** running.
7. **`docs/project_track.md`** created and actively maintained per `09_project_tracking_spec.md` throughout all of the above — this isn't a "later" item, it starts on day one.

## Definition of done for MVP
A judge (or anyone) can, with zero setup on their end:
- Open the live Vercel URL cold
- See real orders with real risk scores on `/dashboard`
- Simulate a new high-risk order and trigger a real (test-mode) payment link
- Check `/metrics` and see honestly-computed precision/recall/PR-curve, not placeholder numbers
- Check `/audit` and see every step of what they just did, logged with timestamps

## Phase 2 (explicitly deferred — do not start until MVP's definition of done is met)

- `/` Landing page polish (beyond a basic version) and `/about` page detail
- Dark mode toggle
- WhatsApp sandbox delivery (Twilio) as an alternative nudge channel
- RandomForest comparison model shown alongside XGBoost
- SHAP force-plot detail view (beyond the top-3-factor summary already in MVP)
- Per-tier drill-down filtering on `/metrics`
- Any authentication beyond the single shared-secret header

## If time runs short — cut list, in this exact order (drop from the top first)

1. Landing page polish → ship the bare-minimum version from MVP scope, nothing fancier
2. `/about` page → a plain markdown-rendered page is fine, skip custom design
3. Toast notifications → console/inline confirmation messages are an acceptable substitute
4. Filters on `/dashboard` and `/audit` → ship the unfiltered table if needed
5. **Never cut:** held-out precision/recall reporting on `/metrics`, the audit trail, the false-positive-cost callout, or the live Razorpay test-mode nudge flow — these four are what directly satisfy Track 02's stated bar and are non-negotiable even under severe time pressure.
