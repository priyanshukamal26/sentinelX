# SentinelX — Integrations

## 1. Razorpay (test mode)

- **Setup:** create a Razorpay account, generate **test-mode** API key + secret (no live KYC needed to use test mode).
- **Product used:** **Payment Links API** — create a link with the discounted amount pre-applied when an order is flagged high-risk.
- **Webhooks:** register a webhook (test mode supports this) pointing at `POST /webhooks/razorpay` on the deployed Render backend, subscribed to `payment_link.paid` and `payment_link.expired`.
- **Security:** verify every incoming webhook's signature using the webhook secret (HMAC) before trusting it — reject anything that doesn't verify. This is a small implementation detail worth calling out explicitly in the README as a security-conscious choice.
- **Never use live mode.** Every key, link, and transaction in this project must be test-mode only — this is both a cost-safety requirement (zero real money) and literally what the buildathon brief asks for.
- **Do not use Razorpay Route** for anything in this project — Route is for marketplace split-settlement across multiple vendor accounts, which isn't this use case. Payment Links is the correct, simpler product here.

## 2. Groq (LLM for explanation text)

- **Model:** `openai/gpt-oss-20b` — current free-tier model on Groq, fast (~1000 tok/s), and this project's call volume (one short completion per new order, maybe a few hundred over a demo period) sits nowhere near the free-tier ceiling.
- **Current free-tier limits (verify against console.groq.com/docs/rate-limits before build, as these can change):** roughly 30 requests/minute, 1,000 requests/day, 8,000 tokens/minute, 200,000 tokens/day on the free plan for this model.
- **Note:** older guides referencing `llama-3.1-8b-instant` or `llama-3.3-70b-versatile` as free-tier Groq models are now outdated — those are listed as enterprise/contact-sales in Groq's current catalogue. Use `openai/gpt-oss-20b` as the default.
- **Prompt shape:** a short, structured prompt containing the order's top-3 SHAP factors, asking for one plain-English sentence — keep max output tokens small (this is a one-liner, not a paragraph), which also keeps cost/latency minimal.
- **Fallback:** if Groq errors or is rate-limited, fall back to a deterministic template sentence built from the same top-3 factors (see `05_backend_api_spec.md`) — the explanation feature must never fail visibly in a live demo.

## 3. Notification delivery (nudge)

- **MVP:** the "nudge" is delivered entirely **in-app** — the Send Nudge modal shows the exact message and the live Razorpay test payment link, which can be opened/paid directly from the dashboard. This is sufficient to demonstrate the full decision → action → payment → audit loop without any external messaging dependency.
- **Phase 2 (optional, not required for MVP):** Twilio's WhatsApp **sandbox** number can deliver the same message to a real WhatsApp number for a slightly more "real" demo — it works immediately for any number that joins the sandbox via a join code, no business approval wait. Treat this as a nice-to-have, not a blocker; the in-app version already satisfies the track's actual bar.

## 4. Free-tier hosting/data services used elsewhere
See `07_hosting_and_deployment.md` for Vercel, Render, Neon, and GitHub Actions setup — all free tier, no credit card required for any of them at this project's scale.

## Summary table

| Service | Used for | Free tier sufficient? |
|---|---|---|
| Razorpay (test mode) | Discount payment links + webhooks | Yes — test mode is free indefinitely, no usage cap relevant here |
| Groq | Plain-English risk explanations | Yes — call volume is far below daily free-tier caps |
| Twilio (Phase 2 only) | WhatsApp sandbox delivery | Yes for sandbox use; not required for MVP |
