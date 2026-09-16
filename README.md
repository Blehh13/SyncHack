# SyncHack Core

**CI/CD for documentation.** SyncHack watches a GitHub repository, reads every commit diff, works out which markdown files the change invalidated, rewrites them, and opens a pull request — with no manual trigger and no context switching.

---

## SYNC HACK Track 1

| | |
|---|---|
| **Live documentation** | https://synchack.thally.app — 16 pages, [100/100 Agent Readiness](https://synchack.thally.app/api/agent-readiness) |
| **Submission write-up** | [`SUBMISSION.md`](SUBMISSION.md) |
| **Evidence pack** | [`evidence/`](evidence/README.md) — baseline, pre-registered prediction, Track screenshots, drift capture |
| **The product change** | [#2](https://github.com/Blehh13/SyncHack/pull/2), merged `649991f` — the docs path is now enforced |
| **Demo** | [Loom](https://www.loom.com/share/b8595441d1b040b483670dda1f8cc754) |

Thally Track detected both merges. On [#3](https://github.com/Blehh13/SyncHack/pull/3) (CI only) it correctly returned **no update needed**. On [#2](https://github.com/Blehh13/SyncHack/pull/2) it analysed the change and then stopped while writing the update (reference `1eead82e-1e15-42ce-9fa0-a71a8b6e9947`), so no documentation pull request was produced. We did not hand-write that update and attribute it to Track, so the published docs still describe the old behaviour: see [`evidence/05-drift-still-live-after-merge.md`](evidence/05-drift-still-live-after-merge.md).

---

## The problem

Documentation goes stale the moment code is pushed. Linters and PR templates only complain that docs are missing; they don't write them. Developers either context-switch to fix docs or, more often, let them rot until nobody trusts the README.

## How it works

```
push → webhook → Inngest job → Gemini analysis → markdown rewrite → branch → pull request
```

1. **Webhook.** A GitHub App fires a `push` event at `/api/webhooks/github`. The payload signature is verified with HMAC-SHA256 before anything else happens.
2. **Queue.** The request creates a `SyncLog` row and hands off to Inngest immediately, so GitHub gets a fast 200 and the slow work runs durably in the background.
3. **Analysis.** The job fetches the commit diff and the files inside the repository's docs path, then asks Gemini — constrained to a Zod-derived JSON schema — which docs need updating and *why*. Any proposed file outside the docs path is dropped and recorded as skipped.
4. **Rewrite.** Each affected file is fetched and regenerated in full against that instruction, rather than patched blindly.
5. **Ship.** Changes are committed to a `synchack/docs-update-*` branch and opened as a PR against the repository's actual default branch. In `DIRECT` mode the PR is squash-merged automatically.

If the analysis concludes nothing needs to change, the run terminates early and is recorded as `NO_CHANGES`. That path matters: the fastest way to lose a developer's trust is a stream of pointless PRs.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth v5 with the GitHub provider |
| Database | PostgreSQL via Prisma |
| Background jobs | Inngest |
| AI | Google Gemini with structured (schema-constrained) output |
| UI | Tailwind CSS + shadcn/ui |

## Running locally

```bash
npm install
cp .env.example .env     # then fill it in — see below
npx prisma migrate dev   # create the schema
npm run dev              # http://localhost:3000
```

In a second terminal, run the Inngest dev server so background jobs execute:

```bash
npx inngest-cli@latest dev
```

Run the unit tests with `npm test`.

Check the published documentation against this code with `npm run verify:docs`. It
fetches each page's Markdown from the live site and compares 15 documented claims
with the source that implements them. It currently exits non-zero: the docs are
stale because Thally Track's run on the change that made them stale did not
complete, and we did not hand-write that update. See
[`evidence/07-docs-claim-check.txt`](evidence/07-docs-claim-check.txt).

### Environment

| Variable | What it's for |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth session signing key (`npx auth secret`) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | OAuth credentials **from the GitHub App** |
| `GITHUB_APP_ID` | Numeric GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | App private key (PEM, newlines escaped as `\n`) |
| `GITHUB_WEBHOOK_SECRET` | Shared secret for webhook signature verification |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | Optional; defaults to `gemini-3.6-flash` |
| `MOCK_GITHUB` | Set to `true` to exercise the pipeline without hitting GitHub |

### GitHub App setup

The OAuth credentials must come from the **GitHub App**, not a standalone OAuth App — the dashboard calls `/user/installations`, which only accepts user-to-server tokens.

- **Webhook URL:** `<your-domain>/api/webhooks/github`
- **Subscribed events:** `push`
- **Repository permissions:** Contents (read & write), Pull requests (read & write), Metadata (read)

## Data model

`User` → `Repository` → `SyncLog`. Each repository carries its own `docsDirectory` and an `updateMode` of `PR` or `DIRECT`. Every webhook delivery produces a `SyncLog` row that moves through `PENDING → PROCESSING → SUCCESS | NO_CHANGES | FAILED`, keeping the full analysis JSON for inspection. A run that exhausts its retries is recorded as `FAILED`, with the error message, timestamp and Inngest run id stored in `details`.

## Project status

Built during the SyncHack hackathon (Track 1). The pipeline is implemented end to end. See [`prd/synchack-core-prd-ssot.md`](prd/synchack-core-prd-ssot.md) for the full product spec.

### Known limitations

- No retry or backoff strategy beyond Inngest's defaults.
- Very large diffs are sent to the model unsummarised and can exceed the context window.
