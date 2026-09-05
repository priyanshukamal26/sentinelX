# SentinelX — Project Overview

## What this is
SentinelX is a **defense-only RTO (Return-to-Origin) risk-scoring system** for Indian COD (Cash-on-Delivery) e-commerce orders. It scores every incoming order's probability of being returned/refused at delivery, and — for high-risk orders only — offers the customer a small discount to switch to a prepaid UPI payment instead. It never blocks or cancels an order.

Built for: **Razorpay AI Buildathon, Track 02 (AI Risk Manager)**.

## Problem it solves
COD return rates in Indian e-commerce run 28–35%, versus 4–8% for prepaid orders, and disproportionately concentrate in Tier-2/3 pincodes, first-time buyers, and a specific "impulse zone" of order value (₹500–1,000). This directly erodes small-merchant margins through reverse logistics cost. SentinelX gives a merchant a live, explainable, measurable way to nudge the riskiest orders toward prepaid — without ever refusing service to a customer.

## The bar this project is judged against (Track 02, verbatim spirit)
1. A working detector with **measured precision and recall on a held-out test set** — not training-set numbers, not vibes.
2. **Honest metrics including false-positive cost** — say plainly what a wrong call costs.
3. **Strictly defense-only** — never block a user; only ever change the payment route offered.
4. Everything **auditable** — every decision the system makes must be logged and inspectable.

Every doc in this folder is written to make it easy to build directly toward these four points.

## MVP goal (this build phase)
Ship a **fully hosted, live, end-to-end demo** of:
- Synthetic order data generated and validated against real published RTO statistics
- A trained, explainable ML risk model with honestly reported held-out metrics
- A live dashboard where orders can be viewed, a new order can be simulated, and high-risk orders trigger a (test-mode) UPI discount nudge
- A complete, timestamped audit trail of every decision the system makes
- A metrics page showing precision/recall/PR-curve/confusion matrix, not hardcoded numbers

See `08_mvp_scope_and_roadmap.md` for the exact must-have vs later-phase feature split.

## Non-goals for this phase
- No real money moves — everything runs on Razorpay **test mode** only.
- No real WhatsApp delivery required for MVP — an in-app simulated nudge is sufficient (see `06_integrations.md`).
- No user login/multi-tenant merchant accounts — MVP is a single-merchant demo.
- No mobile app — website only (responsive web, works on mobile browsers).

## Hard constraints for this build
- **Zero paid resources anywhere** — every service used must have a genuinely free tier sufficient for this project's scale (see `07_hosting_and_deployment.md` for the exact list).
- **No local build.** The project must be developed and verified entirely through hosted, live URLs from day one — GitHub → Vercel (frontend) / Render (backend) / Neon (database), all auto-deploying on push. Nothing should ever require running a local dev server for the project to "work." Local commands are fine for scripting/training, but the running product must live online at all times.
- Every meaningful build decision and completed task must be tracked with timestamps in `docs/project_track.md` (see `09_project_tracking_spec.md` for the exact required format) — this file is the single source of truth for what has been done, when, and why.

## Name
**SentinelX** — the "X" signals extensibility beyond RTO into other risk types later (fraud, chargebacks, etc.), even though MVP scope is RTO-only.
