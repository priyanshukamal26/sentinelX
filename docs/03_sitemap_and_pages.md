# SentinelX — Sitemap, Pages, Popups, and User Flows

## Full sitemap

```
/ (Landing)
├── /dashboard                 (main app — order table + KPI summary)
│    ├── /dashboard/orders/[id]   (order detail page)
│    └── (modal) Simulate Order
│    └── (modal) Send Nudge
├── /metrics                   (model performance page)
├── /audit                     (full audit trail / activity log)
├── /about                     (project, track alignment, tech stack — for judges)
└── 404 (not found)
```

## Page-by-page spec

### `/` — Landing
- **Purpose:** 30-second explainer for anyone (including judges) landing cold — what SentinelX is, the problem, the defense-only promise, a "View Dashboard" CTA.
- **Structure (see `04_design_system.md` §7 for the full spec):** single fixed-viewport hero on desktop (no scroll), full black background with a subtle grain texture, 3-column header (logo · nav pills · header CTA), bottom-aligned hero copy (badge → two-line headline with one italic-serif accent word → lede → two CTA buttons), and a 3-item stats footer. On phones, the viewport lock is dropped and the sections stack normally with scroll.
- **Copy content:** badge "Operational Risk Infrastructure"; headline "Catch *risky orders* before they become returns."; lede naming the real-time scoring + defense-only nudge behavior; primary CTA → `/dashboard`, secondary CTA → `/metrics`. Stats footer content is deliberately **not** vanity traction numbers (see the design system doc's explicit rationale) — it shows a cited industry RTO statistic, a "100% test-mode" disclosure, and a link into `/audit`.
- **MVP:** yes — slightly more build effort than a plain explainer page because of the entrance-motion choreography and fixed-viewport layout, but the content itself stays simple; budget it as ~1.5 days rather than 1.

## Global navigation pattern (applies to every page, not just landing)

A persistent **top header** (not a sidebar — see `04_design_system.md` §6 for the exact spec) appears on every page: logo on the left (links to `/`), a liquid-metal pill nav in the center with four items — **Dashboard · Metrics · Audit · About** — and a "View Dashboard" CTA on the right (hidden on the `/dashboard` page itself, since linking to the current page is redundant). The active page's nav pill stays visually "lit" (persistent hover-state styling) so there's always a clear "you are here" signal. On mobile, this collapses into a full-screen burger menu. This replaces any earlier sidebar-navigation notes — the design system doc is the source of truth for the exact visual treatment.

### `/dashboard` — Main app
- **Purpose:** the core product screen — the table of orders with live risk scores.
- **Key components:**
  - **KPI summary strip** (top): Total Orders, High-Risk Orders (%), Revenue Saved (₹), Live Precision / Recall (small, links to `/metrics` for detail)
  - **Order table:** columns — Order ID, Pincode/Tier, Payment Mode, Order Value, Risk Score (color-coded badge: green <40%, amber 40–75%, red >75%), Status, Action
  - **Filters:** by tier, by payment mode, by risk band, by status
  - **"Simulate New Order" button** → opens the Simulate Order modal
  - **Row click** → navigates to order detail page
- **States to design for:** empty (no orders yet — show "Simulate an order to get started"), loading, populated, error (backend unreachable — show a clear retry message, never a blank white screen)
- **MVP:** yes — this is the centerpiece screen.

### `/dashboard/orders/[id]` — Order detail
- **Purpose:** deep-dive on one order — why it was scored the way it was, and its full history.
- **Key components:**
  - Order summary card (all input features shown plainly)
  - **"Why flagged" panel:** top 3–4 contributing features from SHAP, rendered as a short plain-English sentence (via Groq) plus a small bar-style feature-importance visual
  - **Nudge history:** if a nudge was sent — link status (created/opened/paid/expired), payment link, timestamps
  - **"Send Nudge" button** (only visible/enabled if risk > threshold and no nudge sent yet) → opens Send Nudge modal
  - Mini audit trail scoped to just this order (chronological event list)
- **MVP:** yes.

### `/metrics` — Model performance
- **Purpose:** the credibility page — proves the numbers are real, not decorative.
- **Key components:**
  - Precision / Recall / F1 at the chosen threshold (pulled live from backend `/metrics`, never hardcoded in frontend)
  - Precision-recall curve chart with the chosen threshold marked
  - Confusion matrix (actual counts)
  - Per-tier breakdown table (Tier 1 vs 2 vs 3 precision/recall — proves the model isn't just "always flag Tier 3")
  - **False-positive cost callout box:** a short, explicit written statement of what a false positive costs here (see `00_overview.md` bar #2) — this should be genuinely written into the UI, not just the README, since judges may click through the live site.
  - "What this model doesn't do" honest limitations box
- **MVP:** yes — this page is arguably as important as the dashboard for this specific track.

### `/audit` — Full audit trail
- **Purpose:** every decision the system has made, across all orders, in one chronological, filterable log — proves the "defense-only, fully auditable" claim at a glance.
- **Key components:** searchable/filterable table (by order ID, event type, date range), each row expandable to show full event payload.
- **MVP:** yes, but can be simple (a plain table is enough; no need for fancy visualization).

### `/about` — Project info (for judges)
- **Purpose:** track alignment statement, architecture diagram, tech stack, links to GitHub repo and pitch video, team info.
- **MVP:** yes, low effort, high payoff for judging.

### 404
- Simple, on-brand, link back to `/dashboard`.

## Popups / modals

| Modal | Trigger | Behavior |
|---|---|---|
| **Simulate Order** | "Simulate New Order" button on `/dashboard` | Form: pincode (or tier dropdown for simplicity), payment mode, order value, first-order toggle, device type → submits to backend → shows the resulting risk score inline before closing, with a "View full breakdown" link into the new order's detail page |
| **Send Nudge** | "Send Nudge" button on order detail (only for high-risk, un-nudged orders) | Shows the exact discount message that will be sent + the Razorpay test payment link about to be generated → confirm → shows live status (created → waiting for payment) with a poll/refresh |
| **Confirm action** (generic) | Any destructive or state-changing action beyond the two above, if added later | Simple confirm/cancel |
| **Toast notifications** (not a modal, but part of this system) | Order scored, nudge sent, payment status changed | Small non-blocking toast in the corner, auto-dismiss |

## Core user flows

**Flow A — Browsing existing risk (judge/demo default path):**
`/dashboard` → see KPI strip + table → click a high-risk row → `/dashboard/orders/[id]` → see "why flagged" → `/metrics` to see the numbers are real → `/audit` to see everything logged.

**Flow B — Live simulate-and-score (the "wow" interactive moment):**
`/dashboard` → "Simulate New Order" modal → fill form → submit → see instant risk score → if high-risk, go to order detail → "Send Nudge" → see test-mode Razorpay link generated → (optionally) pay it in test mode → see status flip to "paid" → see it appear in `/audit`.

**Flow C — Judge doing due diligence:**
`/about` → architecture + track alignment → `/metrics` → honest numbers + limitations → back to `/dashboard` to try it live.

The persistent top header nav described above keeps all three flows always one click away from each other — never bury `/metrics` or `/audit` behind a secondary menu, since these are the pages that directly prove the track's bar is met.
