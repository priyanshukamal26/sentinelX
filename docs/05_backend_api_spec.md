# SentinelX — Backend API & Database Spec

## Stack
FastAPI (Python 3.11+), served on Render as a free web service. Model loaded once at startup from `models/rto_model.joblib`.

## Database schema (Neon Postgres)

### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `pincode` | text | |
| `district` | text | |
| `state` | text | |
| `city_tier` | int | 1/2/3 |
| `payment_mode` | text | `COD` / `prepaid` |
| `order_value` | numeric | |
| `product_category` | text | |
| `is_first_order` | boolean | |
| `device_type` | text | |
| `order_hour` | int | |
| `address_char_length` | int | |
| `has_landmark_keyword` | boolean | |
| `estimated_delivery_days` | int | |
| `zone_complexity` | text | |
| `risk_score` | numeric | model output, 0–1 |
| `risk_band` | text | `low` / `medium` / `high`, derived from `risk_score` |
| `status` | text | `pending`, `nudged`, `converted_prepaid`, `cod_confirmed` |
| `created_at` | timestamptz | |

### `nudges`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `order_id` | uuid, FK → orders.id | |
| `payment_link_id` | text | Razorpay test-mode link ID |
| `payment_link_url` | text | |
| `discount_percent` | numeric | default 5 |
| `channel` | text | `web` / `whatsapp_sim` |
| `sent_at` | timestamptz | |

### `payments`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `nudge_id` | uuid, FK → nudges.id | |
| `razorpay_payment_id` | text | |
| `status` | text | `created`, `paid`, `expired` |
| `amount` | numeric | |
| `paid_at` | timestamptz, nullable | |

### `audit_log`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `order_id` | uuid, FK → orders.id, nullable | |
| `event_type` | text | e.g. `order_scored`, `threshold_checked`, `nudge_sent`, `payment_status_changed` |
| `event_payload` | jsonb | keep concise — essential fields only, not full raw request/response bodies |
| `created_at` | timestamptz | |

### `model_metrics`
| Column | Type | Notes |
|---|---|---|
| `version` | text, PK | e.g. `v1` |
| `precision` | numeric | |
| `recall` | numeric | |
| `f1` | numeric | |
| `threshold` | numeric | |
| `pr_curve` | jsonb | array of {threshold, precision, recall} points |
| `confusion_matrix` | jsonb | {tp, fp, tn, fn} |
| `per_tier_breakdown` | jsonb | precision/recall per city_tier |
| `trained_at` | timestamptz | |

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | liveness check (also used by the GitHub Actions keep-warm ping) |
| `POST` | `/orders` | create + score a new order (used by the Simulate Order modal) |
| `GET` | `/orders` | list orders, supports `?tier=`, `?payment_mode=`, `?risk_band=`, `?status=` filters |
| `GET` | `/orders/{id}` | order detail, includes SHAP-derived explanation + nudge/payment history |
| `POST` | `/orders/{id}/nudge` | create a Razorpay test-mode payment link, log a `nudges` row, log audit event |
| `POST` | `/webhooks/razorpay` | receive `payment_link.paid` / `payment_link.expired` events (signature-verified) |
| `GET` | `/metrics` | return the latest `model_metrics` row |
| `GET` | `/audit` | list audit log entries, supports `?order_id=`, `?event_type=`, date range filters |
| `GET` | `/kpis` | aggregate numbers for the dashboard KPI strip (total orders, % high risk, revenue saved) |

### `POST /orders` — request/response sketch
```json
// request
{
  "pincode": "560001",
  "payment_mode": "COD",
  "order_value": 720,
  "is_first_order": true,
  "device_type": "mobile"
}
// response
{
  "id": "uuid",
  "risk_score": 0.82,
  "risk_band": "high",
  "explanation": "Flagged mainly due to: Tier-3 pincode, first-time buyer, order value in the high-risk ₹500-1000 range.",
  "top_factors": [
    {"feature": "city_tier", "impact": 0.31},
    {"feature": "is_first_order", "impact": 0.22},
    {"feature": "order_value_zone", "impact": 0.18}
  ]
}
```

### `POST /orders/{id}/nudge` — behavior
1. Verify `risk_score > threshold` and no existing un-expired nudge (defense-only rule: never nudge twice simultaneously).
2. Call Razorpay test-mode Payment Links API with the discounted amount.
3. Insert into `nudges`, insert `audit_log` event `nudge_sent`.
4. Return the payment link URL to the frontend for the modal to display.

### `POST /webhooks/razorpay` — behavior
1. Verify the Razorpay webhook signature (HMAC using the webhook secret) — reject unsigned/invalid requests.
2. Update `payments.status` and `orders.status` accordingly.
3. Insert `audit_log` event `payment_status_changed`.

## Model serving
- Load `models/rto_model.joblib` and `models/metrics.json` once at process startup (not per-request).
- Feature engineering for an incoming order (pincode → tier lookup, address length, landmark regex, etc.) happens in a single shared function used both by the training notebook and the live API, so training-time and serving-time feature logic never drift apart — implement this as a small shared Python module (`shared/features.py`) imported by both.

## Explanation generation (Groq)
- On each `POST /orders` call, after scoring, compute SHAP values for that single prediction, take the top 3 features by absolute impact, and send a short structured prompt to Groq (`openai/gpt-oss-20b`) asking for a one-sentence plain-English explanation using those factors.
- **Fallback if Groq is rate-limited or errors:** fall back to a simple template string built directly from the top factors (e.g., `f"Flagged mainly due to: {factor_1}, {factor_2}, {factor_3}."`) — the UI must never show a blank or broken explanation field.

## Minimal auth for MVP
No user accounts needed for a single-merchant hackathon demo, but add one simple safeguard: require a shared secret header (e.g., `X-SentinelX-Key`) on all write endpoints (`POST /orders`, `POST /orders/{id}/nudge`) so the public free-tier backend isn't left open to arbitrary internet traffic once the URL is public. Read endpoints (`GET`) can remain open since the dashboard needs to be viewable by judges without any login.

## Error handling conventions
- All error responses: `{"error": "human-readable message", "code": "machine_readable_code"}`, appropriate HTTP status.
- Every failure path (Razorpay API error, Groq timeout, DB error) still gets logged to `audit_log` with `event_type = "error"` — an honest audit trail includes failures, not just successes.
