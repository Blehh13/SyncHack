# Feature decision: which product change to carry through Track

**Honesty note:** the change (scoping sync runs to `docsDirectory`) was chosen
during initial planning on 2026-09-15 from the product's own documented
limitations. This comparison was written afterward, before the change was
merged, to check that choice against the realistic alternatives.

All candidates come from real gaps in SyncHack Core's code, each already listed
on the live [Known limitations](https://synchack.thally.app/known-limitations) page.

## Scoring

Weights: user value 20, technical depth 15, documentation impact 25, Track
suitability 20, testability 10, demo clarity 10.

| Candidate | Value | Depth | Doc impact | Track fit | Test | Demo | **Total** |
|---|---|---|---|---|---|---|---|
| **A. Scope sync runs to the docs path** | 18 | 10 | 23 | 18 | 9 | 8 | **86** |
| B. Mark failed runs `FAILED` and store the error | 14 | 8 | 17 | 15 | 7 | 6 | 67 |
| C. Analyze every commit in a push, not only the head | 15 | 11 | 14 | 14 | 6 | 6 | 66 |
| D. Process pushes to the default branch only | 14 | 6 | 16 | 15 | 8 | 7 | 66 |
| E. Run history page in the dashboard | 15 | 12 | 13 | 11 | 5 | 9 | 65 |

## Why A

- **User value.** Before the change, a setting called "Docs Path" did nothing,
  and a language model could propose rewriting any file in the repository,
  including source code. Scoping closes a real safety gap and makes the setting
  mean what its label says.
- **Documentation impact.** Eight published surfaces state the old behavior
  (see `02-IMPACT_MAP.md`), across a guide, a reference page, two concept
  pages, troubleshooting, limitations, the quickstart, and the OpenAPI spec.
- **Track suitability.** Most impacts are findable by matching `docsDirectory`,
  but one (the quickstart relying on a root `README.md` with default settings)
  requires reasoning about a default value. That separates shallow matching
  from real impact analysis.
- **Testability.** Pure functions with unit tests (21 cases in
  `src/lib/docs-scope.test.ts`).
- **Plausible review outcomes.** Accurate updates to accept, likely over-broad
  wording to edit ("SyncHack only reads the docs folder" is wrong, because the
  code diff is still sent in full), and pages that should not change to reject.

## Why not the others

- **B** is valuable, but it needs Inngest failure handlers, and it touches mostly
  troubleshooting text.
- **C** changes analysis cost and context size in ways that are hard to verify in a
  hackathon timeframe.
- **D** is a small conditional with a narrow documentation footprint.
- **E** is mostly UI, and it barely changes documented behavior.
