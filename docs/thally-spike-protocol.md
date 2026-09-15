# SyncFlow — Thally Phase 0 Spike Protocol
## Status: ASSUMED-APPROVED [VERIFY BEFORE PHASE 4]

> [!CAUTION]
> **This section contains assumptions that have NOT been confirmed by running Thally.**
> The demo architecture in PRD Section 20 is built on these assumptions.
> If the spike reveals different behavior, Section 20 and ARCH-001 must be updated
> before implementation begins. Do NOT skip this spike.

---

## Why This Spike Exists

The entire Track 1 demo strategy depends on Thally behaving in a specific way:

1. Thally watches a repository (or subset of it)
2. A product change is merged
3. Thally detects the change, identifies *which documentation pages* it affects
4. Thally drafts a PR (or equivalent) with proposed doc updates
5. A human reviews and approves the draft
6. Documentation is synchronized

If any step behaves differently, the demo design needs to change.

**Timebox:** Maximum 2 hours for the spike. If you cannot answer all 4 questions in 2 hours, record what you learned, update the assumptions, and escalate.

---

## Spike Setup (Throwaway Repo)

```bash
# 1. Create a throwaway repo — do NOT use the real SyncFlow repo
mkdir thally-spike && cd thally-spike
git init && git remote add origin https://github.com/<your-org>/thally-spike

# 2. Create two files that simulate SyncFlow's structure:
# openapi/openapi.yaml  — minimal spec with one endpoint + one schema property
# docs/rules.md         — one markdown doc referencing that property

# 3. Connect Thally to this repo (follow Thally onboarding)
# Record: what auth mechanism does Thally require?

# 4. Commit baseline:
git add . && git commit -m "chore: baseline for Thally spike"
git push

# 5. Make a visible change — simulate CHANGE-001 (team size change):
# In openapi.yaml: change teamMaxSize.default from 4 to 5
# In docs/rules.md: intentionally do NOT update the doc (simulate drift)
git commit -am "feat: change teamMaxSize default from 4 to 5"
git push

# 6. Observe Thally output
# Record all findings in the Results section below
```

---

## 4 Questions to Answer

| Q# | Question | Why Critical |
|---|---|---|
| SQ-1 | What does Thally watch? Application repo only? Docs repo only? Both? OpenAPI diff only? | Determines whether SyncFlow needs one repo or two; determines what file changes trigger Track |
| SQ-2 | What constitutes "evidence" for a change? Commit diff? OpenAPI schema diff? PR description? | If Thally only watches docs files, CHANGE-001 (team size) won't trigger unless we update the schema first |
| SQ-3 | Can Track be triggered on-demand (e.g., via API or CLI) rather than only on push/merge? | If yes: live demo can trigger it manually. If no: need pre-merged commits for demo setup |
| SQ-4 | Does Thally produce a meaningful "no change needed" signal on a no-op commit? | Required for CHANGE-011 (internal refactor negative control) — if Thally is silent on no-op, we need a different way to demonstrate the discrimination |

---

## Results Template (fill in during spike)

```markdown
### SQ-1 Result
Thally watches: [APPLICATION REPO | DOCS REPO | BOTH | OPENAPI ONLY]
Evidence: [screenshot / output log]
Impact on architecture: [update ARCH-001 Section X if different from assumed]

### SQ-2 Result
Evidence type: [COMMIT DIFF | OPENAPI SCHEMA DIFF | PR DESCRIPTION | OTHER]
Impact on demo: [which CHANGE scenarios need to be redesigned]

### SQ-3 Result
On-demand trigger: [YES — via CLI command: `___` | NO]
If no: demo setup requires pre-merged commits [confirm demo plan with team]

### SQ-4 Result
No-op behavior: [SILENT | EXPLICIT "nothing changed" SIGNAL | PARTIAL MATCH]
CHANGE-011 plan: [CONFIRMED WORKS AS DESIGNED | NEEDS REDESIGN]
```

---

## Pass Criteria

The spike PASSES if all 4 questions are answered with a concrete observation (not "probably" or "should").

The demo architecture is confirmed if:
- Thally watches `openapi/openapi.yaml` (or the app repo) ✓
- An OpenAPI schema diff triggers Track ✓  
- On-demand trigger exists OR pre-merged commits are a viable demo approach ✓
- CHANGE-011 (no-op) either stays silent OR produces a "nothing changed" signal ✓

---

## Fail / Redesign Conditions

| Observation | Required Action |
|---|---|
| Thally only watches docs files, not code | Move "evidence" signals into docs front-matter; redesign CHANGE-001 to include a doc change that Thally monitors |
| No on-demand trigger; push-only | Pre-merge all demo commits in advance; use `git log` to show the sequence live |
| CHANGE-011 always triggers a PR regardless of actual change | Design a manual "scope filter" to exclude internal-only commits; or use a different CHANGE-011 scenario |
| Thally is unavailable during the spike | Escalate to hackathon organizers for Thally credentials/access; document as blocked |

---

## Assumed Behavior (used in PRD v3.1 until spike confirms)

These assumptions are labeled **[ASSUMED-APPROVED]** in the PRD:

| Assumption ID | Assumption |
|---|---|
| THALLY-A1 | Thally watches `openapi/openapi.yaml` and `docs/` in the application repo |
| THALLY-A2 | A change to `openapi.yaml` schema constraints (e.g., `maximum: 10 → 20`) triggers Track |
| THALLY-A3 | Thally can be triggered on-demand via CLI for live demo purposes |
| THALLY-A4 | Thally produces a visible "no documentation change needed" signal for pure internal refactors |
| THALLY-A5 | Thally's Track produces a reviewable PR / diff, not just a notification |
| THALLY-A6 | Thally authenticates via a GitHub App installed on the SyncFlow repo |

---

## Fallback Demo Plan (if Thally is unavailable on demo day)

> [!IMPORTANT]
> **Pre-record ALL 4 demo scenarios before demo day, regardless of whether Thally is working live.**
> A pre-recorded video of the exact Thally flow is acceptable for all scenarios.

### Recording checklist

For each of the 4 selected scenarios, record a video showing:
1. The baseline state (product + docs aligned)
2. The product change (code diff / commit)
3. Thally's detection output (what it identified as affected)
4. The drafted PR / diff
5. Human review (approve / edit)
6. Final synchronized state

| Scenario | Recording name | Status |
|---|---|---|
| CHANGE-001 (team size) | `demo-change-001-team-size.mp4` | ☐ Not recorded |
| CHANGE-002 (endpoint rename) | `demo-change-002-endpoint-rename.mp4` | ☐ Not recorded |
| CHANGE-005 (score range) | `demo-change-005-score-range.mp4` | ☐ Not recorded |
| CHANGE-011 (no-op refactor) | `demo-change-011-noop-refactor.mp4` | ☐ Not recorded |

**Store recordings:** `docs/demo-recordings/` (gitignored for size; back up to shared drive)

---

## Hackathon Rules — [ASSUMED-APPROVED]

The official SYNC HACK Track 1 brief was not obtained during research. The following assumptions are used in the PRD. **Verify against the official brief before demo day.**

| Rule Assumption | Source | Risk |
|---|---|---|
| Track 1 = "Documentation Synchronization" | Inferred from hackathon theme | Medium — if Track 1 has different scoring criteria, demo emphasis may be wrong |
| Demo format = live walkthrough + Q&A | Standard hackathon format | Low |
| Submission format = GitHub repo + deployed demo | Standard hackathon format | Low |
| teamMaxSize default of 2–4 is correct for the platform's own internal teams | Inferred; may conflict with organizer's hackathon rules for real participants | Low — this is the platform config, not the hackathon's own rules |
| CHANGE-001 (team size 4→5) is a compelling enough demo change | Judgment call | Low — alternative scenarios exist in the change matrix |

---

## Action Items (Human-gated)

- [ ] **TEAM LEAD:** Run spike using this protocol within Week 1
- [ ] **TEAM LEAD:** Obtain official SYNC HACK Track 1 rules document
- [ ] **THALLY OWNER:** Record all 4 demo scenarios at least 48 hours before demo day
- [ ] **TEAM LEAD:** Update PRD Section 20 and ARCH-001 Section 1 with confirmed Thally behavior after spike
