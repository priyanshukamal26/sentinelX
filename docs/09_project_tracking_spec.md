# SentinelX — Required Format for `docs/project_track.md`

This file does not create `project_track.md` itself — it specifies exactly what that file must contain and how it must be maintained. **The build agent must create `docs/project_track.md` at the very start of work**, following this structure exactly, and keep it updated continuously for the entire project lifetime.

## Required structure of `docs/project_track.md`

```markdown
# SentinelX — Project Track

Last updated: <ISO 8601 timestamp with timezone>

## 1. Status Summary
A short (3-6 sentence) plain-English snapshot of where the project currently stands,
rewritten (not appended) each time it materially changes.

## 2. Task Checklist
Grouped by the phases/modules defined in 08_mvp_scope_and_roadmap.md.
Every task is a markdown checkbox. Check items off as completed — never delete a
checked-off item, even if scope later changes (see Change Log for how to record that).

### Phase 1: Data & Model
- [ ] Pincode directory sourced and cleaned
- [ ] Tier lookup table built
- [ ] Dataset generator written and validated against §Step 7 checks in 02_dataset_spec.md
- [ ] 10,000-row synthetic dataset generated
- [ ] XGBoost model trained, threshold selected and justified
- [ ] SHAP explainability artifacts generated
- [ ] Held-out precision/recall/F1/confusion matrix/per-tier breakdown computed
- [ ] Model artifacts committed to repo

### Phase 2: Backend
- [ ] ... (one checkbox per endpoint/table from 05_backend_api_spec.md)

### Phase 3: Frontend
- [ ] ... (one checkbox per page/modal from 03_sitemap_and_pages.md)

### Phase 4: Integrations
- [ ] ... (Razorpay, Groq, webhook signature verification, etc.)

### Phase 5: Hosting & Deployment
- [ ] ... (one checkbox per item in the 07_hosting_and_deployment.md deployment checklist)

### Phase 6: MVP Definition-of-Done Verification
- [ ] Each bullet from 08_mvp_scope_and_roadmap.md's "Definition of done" section,
      verified live (not locally) before being checked off.

## 3. Change Log (append-only — never edit or delete past entries)
Every entry: `- [YYYY-MM-DDTHH:MM:SS+05:30] <what changed, and why, in one or two sentences>`
Log every: completed task, deployment, dataset regeneration, model retrain, doc update,
scope change, or bug fix. This is the permanent history of the project.

Example:
- [2026-01-15T14:32:00+05:30] Generated initial 10,000-row synthetic dataset. Validation
  checks in 02_dataset_spec.md §Step 7 all passed (COD RTO 31%, prepaid RTO 6%, Tier 2/3
  exceeded Tier 1 as expected).

## 4. Decisions Log (append-only)
Any point where the build deviates from what a docs/ file specifies — record what was
specified, what was actually done instead, and why. This keeps the docs/ files and the
actual repo from silently drifting apart.

Example:
- [2026-01-16T09:10:00+05:30] 02_dataset_spec.md specifies data.gov.in as the pincode
  source. Site was unresponsive; used the Kaggle mirror instead (same underlying public
  data). No change to schema or downstream logic.

## 5. Blockers & Hurdles Encountered
For each: what blocked progress, how long it took, and what resolved it (or, if still
open, what the current plan is). Append-only; mark resolved items rather than deleting.

## 6. Next Steps
A short, current list of the immediate next 3-5 actions — this section IS overwritten
each update (unlike the logs above), since it's meant to always reflect "what's next now."
```

## Rules the build agent must follow

1. **Read `docs/project_track.md` in full before starting any work session** — it is the source of truth for what has and hasn't been done, more current than memory of past instructions.
2. **Update it continuously, not in a single batch at the end** — check off tasks and append changelog entries as each one is actually completed, with a real timestamp at time of completion.
3. **Timestamps are ISO 8601 with the `+05:30` (IST) offset**, since this project is India-specific and all stated statistics/deadlines are IST-relevant.
4. **Never delete or rewrite Change Log, Decisions Log, or Blockers entries** — these sections are permanent history. Only §1 (Status Summary) and §6 (Next Steps) are meant to be overwritten as they go stale.
5. **If a decision deviates from any `docs/*.md` file**, record it in the Decisions Log AND update the relevant spec doc itself to match reality, so the docs folder never silently becomes outdated — note the doc edit in the same changelog entry.
6. **Before marking anything in Phase 6 (MVP Definition-of-Done) as complete, verify it on the live hosted URL**, not a local build — consistent with the no-local-build principle in `07_hosting_and_deployment.md`.
