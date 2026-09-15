# SyncHack Core: Track 1 submission

## 1. Track
Track 1: Keep product knowledge current.

## 2. Team members
Banu B B <!-- add any teammates' full names -->

## 3. Live documentation
**https://synchack.thally.app**: 14 pages plus an OpenAPI reference, published by Thally from [`Blehh13/synchack-docs`](https://github.com/Blehh13/synchack-docs).

Agent surfaces, each checked to return current content: [`/llms.txt`](https://synchack.thally.app/llms.txt), [`/llms-full.txt`](https://synchack.thally.app/llms-full.txt), Markdown mirrors (for example [`/known-limitations.md`](https://synchack.thally.app/known-limitations.md)), [`/api/docs-index`](https://synchack.thally.app/api/docs-index), [`/api/search`](https://synchack.thally.app/api/search?q=docsDirectory), and the MCP endpoint at `/api/mcp`.

## 4. Repositories and pull requests

| What | Link |
|---|---|
| Product repository | https://github.com/Blehh13/SyncHack |
| Documentation repository | https://github.com/Blehh13/synchack-docs |
| Docs site built from the code | [synchack-docs#1](https://github.com/Blehh13/synchack-docs/pull/1), merged `16e367d` |
| **The product change** | [SyncHack#2](https://github.com/Blehh13/SyncHack/pull/2): scope sync runs to the docs path, merged `649991f` |
| Pre-merge prediction fingerprints | [comment on SyncHack#2](https://github.com/Blehh13/SyncHack/pull/2#issuecomment-5684886934) |
| Control change (CI only) | [SyncHack#3](https://github.com/Blehh13/SyncHack/pull/3), merged `39d6f35` |
| Evidence pack | [`evidence/`](evidence/README.md) |

## 5. Connected product repository
`Blehh13/SyncHack`, watched by Thally Track on `master`, all files, with the "Merged changes" trigger on ([screenshot](evidence/screenshots/03-track-product-repo-watching-master.png)).

## 6. Demo video
<!-- FILL: link, max 5 minutes -->

## 7. Public post
<!-- FILL: X or LinkedIn URL -->

---

## 8. What happened, step by step

| Track 1 requirement | What we did | Status |
|---|---|---|
| 1. Merge a meaningful, user-visible product change | SyncHack#2: the "Docs Path" setting now limits what the model reads and edits. Before, it was ignored, and the model could rewrite source code. Adds 21 unit tests and a settings hint. | ✅ Done |
| 2. Use Thally to identify affected knowledge | Track detected the merge and analyzed it (1.6K credits) | ✅ Detection; ❌ no impact report produced (see step 3) |
| 3. Review evidence, impact report, task, proposal | Track **stopped while writing the update**: "Track stopped because a service step did not recover automatically", reference `1eead82e-1e15-42ce-9fa0-a71a8b6e9947` ([screenshot](evidence/screenshots/05-track-runs-2-failed-3-no-update-needed.png)) | ❌ Blocked by the Track service |
| 4. Accept, edit, or reject the proposal | No proposal existed. We did **not** hand-write the update and present it as Track's work. | ⏸ Waiting on Thally support |
| 5. Review in a deployment preview | Deploy previews failed on every PR, including a one-word change to the unmodified starter ([screenshot](evidence/screenshots/01-thally-preview-site-not-found.png)). Production deploys worked. | ❌ Previews broken |
| 6. Merge only the version we trust | Nothing to merge for #2. For #3, Track correctly proposed nothing. | ⏸ |
| 7. Confirm published site and agent surfaces | Confirmed the docs, `.md` mirrors, search, `llms-full.txt` and MCP all serve the pre-change text. They are now **provably stale** against `master`. | ✅ Checked ([before](evidence/01-baseline-before-product-change.md), [after](evidence/05-drift-still-live-after-merge.md)) |
| 8. Explain what Thally got right, missed, and what we verified | See the reflection below | ✅ |

### The prediction we recorded before Track ran
Before merging, we wrote down which published statements the change would make false: 8 pages that must change, 3 that should, and 7 that must not ([`02-IMPACT_MAP.md`](evidence/02-IMPACT_MAP.md)). One of the eight is deliberately non-obvious. The quickstart edits a root `README.md` under default settings, and with the default docs path of `/docs` that file is no longer updated.

We posted SHA-256 fingerprints of the prediction on the product PR 17 seconds before merging, so it cannot be quietly edited after seeing Track's output. Verification steps are in [`evidence/README.md`](evidence/README.md).

### The control
SyncHack#3 added only a CI workflow. It changes nothing a user sees. Track analyzed it and concluded **"No update needed"** (413.3 credits). That is the correct answer.

---

## 9. Written reflection

### What did you accomplish?
We built **SyncHack Core**, a GitHub App that reads each pushed commit with Gemini and opens a pull request that fixes the documentation the commit made stale. A webhook with HMAC verification records a `SyncLog` and hands off to an Inngest job. The job asks Gemini, constrained to a JSON schema, which files are stale, rewrites them, and opens a PR against the real default branch. When nothing needs to change, it records `NO_CHANGES` instead of opening a noisy PR.

Its documentation is a Thally site with 14 pages: quickstart, concepts, guides, reference, troubleshooting, known limitations, changelog and an OpenAPI reference. Every page was written by reading the source code, not the README. That is why the docs honestly listed the product's gaps, including the one we then fixed.

The product change, SyncHack#2, closes a real safety gap. A setting labeled "Docs Path" did nothing, and a language model could propose rewriting any file in the repository. Now the model only sees and edits files inside the docs path, anything it proposes outside is dropped and recorded as `skippedPaths`, and 21 unit tests cover path normalization, prefix collisions and path traversal.

### When did Thally first become useful?
Publishing, immediately. One Git-backed source produced HTML, Markdown mirrors, `llms.txt`, a JSON docs index, search and a working MCP endpoint, and we checked each of them with real requests. Track became useful at SyncHack#3: it watched a merge we made no mapping for, read it, and correctly declined to change anything. A tool that always has a suggestion would be noise.

### What took more manual work than expected?
- **Diagnosing the preview failure.** Previews failed on our docs PR with no error on GitHub, and GitHub CI, which runs the same managed Cloudflare build, passed. To separate "our content" from "the platform", we opened a throwaway PR changing one word in the unmodified starter. Its preview failed the same way. The problem was not our content.
- **The Windows CLI.** `thally check` crashes with `'C:\Program' is not recognized`, because the CLI runs the Node path through a shell without quoting it. We ran the underlying `create-thally-docs` checker directly.
- **Making the product build at all.** The codebase had never been run, and it hid six breakages: a missing `@prisma/client`, a misnamed Prisma config, the Inngest v3 signature used against v4, a Zod 4 schema conversion, `session.user.id` undefined under JWT sessions, and a hardcoded `"main"` base branch.

### What result did you trust least?
**Track's run on SyncHack#2**, the one that mattered. It reached the analysis stage, used 1.6K credits, and stopped while writing the update. From the outside we cannot tell how far its analysis got or whether the draft was usable, because no impact report or proposal was saved. The honest result is detection without output.

### How did you verify that result?
- The Track dashboard showed the failure category ("Track service · Stopped while writing the update") and a reference ID. We reported it rather than working around it.
- We confirmed the drift Track should have fixed is still published. [`05-drift-still-live-after-merge.md`](evidence/05-drift-still-live-after-merge.md) quotes six false statements from the live Markdown mirrors, `openapi.yaml` and the MCP search results, next to the lines on `master` that make them false. Anyone can check it: https://synchack.thally.app/known-limitations still says "The docs path does not limit the analysis."
- For the documentation we wrote ourselves, we verified every claim against the source. For example, the docs state that failed runs stay in `PROCESSING` because no code path writes `FAILED`, and that only the head commit of a push is analyzed, because the webhook reads `payload.after`.

### Would you use Thally for your next real release? Why or why not?
**Publishing and agent surfaces: yes, today.** Docs as code, pull-request review, and one source producing every human and agent format is the workflow we want.

**Track: not yet on the critical path.** Detection worked on both merges, and its "no update needed" call on the CI change was right. But on the change that mattered, drafting failed and previews were broken, so we never reached the review step that makes the workflow trustworthy. We would put Track on a release once we have watched it complete a real update end to end. The review-before-merge design is the right one.

---

## 10. Disclosure of material AI assistance and third-party assets

### AI assistance
This project used AI assistance materially and throughout.

**Claude (Claude Code)** was used for:
- The initial implementation of the application: Next.js routes, the Inngest pipeline, the Prisma schema, the GitHub App integration and the dashboard UI. That generated code did not compile on first run.
- Diagnosing and fixing the six build breakages in SyncHack#1.
- Implementing the docs-path scoping change and its tests (SyncHack#2), and the CI workflow (SyncHack#3).
- Writing the 14 documentation pages and the OpenAPI spec (synchack-docs#1) from the source code.
- Diagnosing the Thally preview failure, preparing the impact prediction, and assembling this evidence pack and submission.

Verification performed: `npx tsc --noEmit` and `npm test` (21 tests) pass locally and in GitHub Actions CI. The docs site passes the Thally content check with 0 errors and builds successfully. Agent surfaces were checked with live HTTP requests.

**Google Gemini** is a runtime component of the product, not an authoring tool. It performs the diff analysis and markdown regeneration.

**Thally** hosts the documentation and runs Track, as described above.

### Third-party assets

| Asset | License |
|---|---|
| Next.js, React, Tailwind CSS | MIT |
| shadcn/ui + Base UI components | MIT |
| Prisma ORM | Apache-2.0 |
| Inngest SDK | Apache-2.0 |
| NextAuth.js (Auth.js) | ISC |
| Lucide icons | ISC |
| Vitest | MIT |
| Geist / Geist Mono typefaces | SIL Open Font License 1.1 |
| Thally starter (docs site runtime) | MIT |

No third-party images, audio, or copyrighted media are included.
