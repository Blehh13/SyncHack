# Impact map: predicted documentation blast radius

**Written before Track ran.** This is our own prediction, made by reading the
product diff against the published docs. It is not Track output. After Track
runs, each row is scored as *Track found*, *Track missed*, or *Track proposed
something not listed here*.

- Product change: https://github.com/Blehh13/SyncHack/pull/2
  (`feat: scope sync runs to the repository's docs path`), not merged at time of writing
- Docs baseline: `Blehh13/synchack-docs` main @ `16e367d`, live at https://synchack.thally.app
- Baseline capture: `01-baseline-before-product-change.md`

## What changed in behavior

1. Gemini receives only the file tree inside `docsDirectory`, not the whole repository.
2. Proposed files outside `docsDirectory` are dropped after analysis.
3. Dropped paths are recorded as `skippedPaths`, and `docsDirectory` is recorded, in `SyncLog.details` for `SUCCESS` and `NO_CHANGES` runs.
4. A run whose proposals all fall outside `docsDirectory` ends as `NO_CHANGES`.
5. A docs path of `/` keeps whole-repository behavior.
6. The settings dialog explains what the docs path controls.
7. Tests: `npm test` (vitest) now exists.

## Must change: statements that become false

| # | Page | Current statement (baseline) | Why it becomes false |
|---|---|---|---|
| M1 | `guides/configure-a-repository` | Note: "The docs path does not limit what SyncHack reads or edits … can propose changes to files outside the docs path, including `README.md`" | Behaviors 1 and 2 |
| M2 | `reference/repository-settings` | `docsDirectory` effect: "None yet. It is stored and shown …, but a sync run does not read it." | Behaviors 1 and 2 |
| M3 | `concepts/how-it-works` | Step 2: "The file tree: every path in the repository at that commit" and "Gemini sees the full repository tree … any file in the repository can be chosen" | Behavior 1; step 3 also lacks the enforcement (2) and `skippedPaths` (3) |
| M4 | `known-limitations` | "The docs path does not limit the analysis." section | Behaviors 1 and 2; the limitation no longer exists |
| M5 | `troubleshooting` | "The pull request changed files outside my docs folder … This is expected today." | Behavior 2 |
| M6 | `concepts/sync-run-statuses` | `details` for `NO_CHANGES` = "The full analysis JSON"; for `SUCCESS` = "`prUrl`, `merged`, and the analysis"; JSON example has no `docsDirectory` or `skippedPaths` | Behavior 3 |
| M7 | `openapi.yaml` | `RepositorySettingsInput.docsDirectory`: "Stored and displayed, but not yet used to scope sync runs." | Behaviors 1 and 2 |
| M8 | `quickstart` | Prerequisite "a test repository with a `README.md` or `docs/` folder"; step "keep the defaults"; example edits a root `README.md` | **Non-obvious.** With the default `/docs`, a root `README.md` is no longer updated, so the quickstart's promised result no longer happens for a README-only repository |

## Should change: incomplete, not false

| # | Page | Gap |
|---|---|---|
| S1 | `changelog` | No entry for docs path scoping |
| S2 | `introduction` | "Sends the commit diff and the repository file tree to Google Gemini" is now imprecise |
| S3 | `troubleshooting` → "The run ended as NO_CHANGES" | Missing new cause: every proposal was outside the docs path (behavior 4) |

## Should not change: expected rejects if proposed

| Page | Reason |
|---|---|
| `guides/deploy` | No deployment, environment, or infrastructure change |
| `reference/environment-variables` | No variable added, removed, or changed |
| `api/authentication` | Webhook signatures and sessions unchanged |
| `reference/pull-request-format` | Branch, commit, and PR text unchanged |
| `guides/github-app-setup` | App permissions and events unchanged |
| `guides/develop-without-github` | Mock and token paths unchanged. (The mock tree has no `docs/` folder, so mock runs see no docs files, but the page's claims stay true.) |
| `POST /api/webhooks/github` in `openapi.yaml` | Endpoint behavior unchanged |

## Judgment calls to watch

- Whether Track treats the new `npm test` script as documentation-relevant. Contributor docs do not exist, so any proposal here is a scope decision, not a correctness fix.
- Whether Track notices M8, which requires reasoning about the default value, not just matching the word `docsDirectory`.
