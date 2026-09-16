# Impact map 2: predicted documentation blast radius of the FAILED-status change

**Written before Track ran on this change.** Our own prediction, made by reading the
diff against the published docs. Not Track output.

- Product change: `feat: record failed runs as FAILED` (branch `feat/record-failed-runs`), not merged at time of writing
- Docs baseline: https://synchack.thally.app, unchanged since `16e367d`
- Note: the docs are already stale from the previous change (see `05-drift-still-live-after-merge.md`), because Track's run on SyncHack#2 failed. This change adds a second, independent set of stale statements.

## What changed in behavior

1. When a run exhausts its Inngest retries, its `SyncLog` is now set to `FAILED` instead of being left at `PROCESSING`.
2. The failure is recorded in `details` as JSON: `failedAt`, `error.name`, `error.message` (truncated at 2000 characters, with a `truncated` flag), and `inngestRunId`.
3. The error is therefore readable from the database without opening Inngest.

## Must change: statements that become false

| # | Page | Current statement | Why it becomes false |
|---|---|---|---|
| M1 | `concepts/sync-run-statuses` | Status table: "`FAILED` — Reserved in the schema; no code path sets it today" | Behavior 1 |
| M2 | `concepts/sync-run-statuses` | Warning callout "Failed runs stay in PROCESSING … its `SyncLog` stays at `PROCESSING`" | Behaviors 1 and 2 |
| M3 | `troubleshooting` | Section "A run is stuck in PROCESSING": "SyncHack does not write `FAILED` to the `SyncLog` yet, so a failed run stays at `PROCESSING`" | Behaviors 1 and 2 |
| M4 | `known-limitations` | "**Failed runs are not marked `FAILED`.** A run whose job fails stays in `PROCESSING`. The error is only visible in Inngest." | Behaviors 1, 2 and 3 |

## Should change: incomplete, not false

| # | Page | Gap |
|---|---|---|
| S1 | `concepts/sync-run-statuses` | The `details` column for `FAILED` is "—"; it should describe the new failure JSON |
| S2 | `changelog` | No entry for this change |
| S3 | `guides/configure-a-repository` | The `DIRECT`-mode tip says a blocked merge leaves the run "at `PROCESSING`"; it now ends as `FAILED` |

## Should not change: expected rejects if proposed

| Page | Reason |
|---|---|
| `quickstart` | Setup path unchanged |
| `reference/environment-variables` | No variable added or changed |
| `reference/repository-settings` | No setting changed |
| `reference/pull-request-format` | Branch, commit and PR text unchanged |
| `guides/github-app-setup`, `guides/deploy`, `guides/develop-without-github` | Unaffected |
| `api/*` and `openapi.yaml` | No endpoint behavior changed |

## Judgment call to watch

Whether Track also notices S3, in a different page from the obvious ones, which
requires connecting "run stays at PROCESSING" in a `DIRECT`-mode tip to a change
about retry exhaustion.
