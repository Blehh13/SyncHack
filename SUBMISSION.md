# SyncHack — Track 1 Submission

## 1. Track
Track 1.

## 2. Team members
<!-- FILL: full names of every team member -->

## 3. Live documentation URL
<!-- FILL: deployed URL -->

## 4. Repository, commits, pull requests
- Repository: https://github.com/Blehh13/SyncHack
- Pull request: https://github.com/Blehh13/SyncHack/pull/1 — took the project from "does not compile" to a clean build

## 5. Connected product repositories
<!-- FILL: the repo the GitHub App was installed on for the demo -->

## 6. Demo video
<!-- FILL: link, max 5 minutes -->

## 7. Public post
<!-- FILL: X or LinkedIn URL -->

---

## 8. Written reflection

### What did you accomplish?

We built **SyncHack Core**, a CI/CD pipeline for documentation. A GitHub App webhook fires on
push; the request verifies its HMAC signature, records a `SyncLog` row, and hands off to an
Inngest job so GitHub gets an immediate 200. The job fetches the commit diff and repository
tree, asks Gemini — constrained to a Zod-derived JSON schema — which markdown files the change
invalidated and why, regenerates each affected file in full, commits to a
`synchack/docs-update-*` branch, and opens a pull request against the repository's real default
branch. In `DIRECT` mode it squash-merges instead.

The deliberate design decision worth calling out is the `NO_CHANGES` path: when the model
concludes a diff doesn't affect any documentation, the run terminates early and records that
outcome rather than opening a PR. A tool in this category dies the moment it starts producing
noise, so choosing *not* to act is a first-class result.

### When did Thally first become useful?

<!-- FILL — answer only from what you actually observed. Do not generalise.
     Name the specific moment: which repo, which commit, what Thally did that
     you would otherwise have done by hand. If it never became useful inside
     your timebox, say that plainly — that is a legitimate finding and a more
     credible answer than a vague positive one. -->

### What took more manual work than expected?

Getting the project to build at all. The codebase had been written end to end but never
installed or executed once, which hid six independent breakages: `@prisma/client` was never
added as a dependency; a `prisma7.config.ts` was silently ignored because Prisma looks for
`prisma.config.ts`; the Inngest call used the v3 three-argument signature against v4;
`zod-to-json-schema` cannot type a Zod 4 schema; `session.user.id` was undefined under the JWT
strategy so every settings write returned 401; and pull requests were opened against a
hardcoded `"main"`, which fails on any repository with a different default branch.

Every one of those is the kind of error that only surfaces when code is actually run. Generated
code that has never been executed is a draft, not an implementation.

<!-- FILL: add what was manual specifically in the *Thally* workflow, e.g. connecting
     repositories, scoping what it watches, reviewing or correcting its drafts. -->

### What result did you trust least?

<!-- FILL — pick one concrete output. Candidates, if they match what you saw:
     - a Thally-proposed doc edit that was fluent but factually wrong about the code
     - a "no change needed" verdict on a commit that did change documented behaviour
     - our own Gemini analysis claiming a file needed updating when it did not
     Name the actual artifact, not the category. -->

### How did you verify that result?

<!-- FILL — describe the check you actually ran, not the check one could run.
     e.g. "read the diff against the source file and confirmed the claimed
     parameter did not exist", or "re-ran the same commit and compared verdicts". -->

### Would you use Thally for your next real release? Why or why not?

<!-- FILL — a conditional answer is fine and usually more honest:
     under what circumstances yes, under what circumstances no. -->

---

## 9. Disclosure of material AI assistance and third-party assets

### AI assistance

This project used AI assistance materially and throughout. Specifically:

**Claude (Claude Code)** was used for:
- The initial implementation of the application — Next.js routes, the Inngest pipeline, the
  Prisma schema, the GitHub App integration layer, and the dashboard UI. This was generated
  code, and, as noted above, it did not compile on first execution.
- Diagnosing and fixing the six build-blocking defects listed in PR #1, including identifying
  the Inngest v3→v4 signature change and the Zod 3→4 incompatibility by reading the installed
  type definitions.
- Writing the landing page, the README, and the scaffold of this submission document.

Verification performed: `npx tsc --noEmit` and `npm run build` both pass. <!-- FILL: add
whether the pipeline was exercised end to end against live credentials, and what you observed. -->

**Google Gemini** is a runtime component of the product itself, not an authoring tool — it
performs the diff analysis and markdown regeneration described above.

**Thally** — see the reflection section above and
[`docs/thally-spike-protocol.md`](docs/thally-spike-protocol.md) for the evaluation protocol.

### Third-party assets

| Asset | License / source |
|---|---|
| Next.js, React, Tailwind CSS | MIT |
| shadcn/ui + Base UI components | MIT |
| Prisma ORM | Apache-2.0 |
| Inngest SDK | Apache-2.0 |
| NextAuth.js (Auth.js) | ISC |
| Lucide icons | ISC |
| Geist / Geist Mono typefaces | SIL Open Font License 1.1 |

No third-party images, audio, or copyrighted media are included.
