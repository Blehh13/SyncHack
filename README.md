# SyncHack Core Engine
## Track 1: Documentation Synchronization (SYNC HACK)

> **The Engine that keeps your docs in sync with your code.**

SyncHack Core is a GitHub-integrated platform that acts like a CI/CD pipeline for documentation. You connect a repository, and whenever code is pushed to the default branch, the engine analyzes the changes using the Gemini AI. If the code invalidates any documentation, SyncHack Core automatically rewrites the affected markdown files and opens a Pull Request (or directly commits to the branch) so your docs are never out of date.

---

## What This Repo Contains

| Path | Purpose |
|---|---|
| `prd/synchack-core-prd-v1.0.md` | **Product Requirements Document** — product spec, user flows, and architecture for the Sync Engine. |

---

## Architecture Overview

- **Frontend & API:** Next.js 14 App Router
- **Database:** PostgreSQL (Prisma)
- **AI Integration:** Google Gemini API (Free Tier)
- **GitHub Integration:** GitHub App for OAuth, Webhooks, and PR creation.

## Implementation Phases

| Phase | Name | Focus |
|---|---|---|
| 1 | Foundation | Next.js setup, Prisma schema, GitHub OAuth login |
| 2 | Dashboard | Listing connected repositories and configuring project settings (PR vs Direct Commit) |
| 3 | Webhooks & GitHub API | Webhook listener for `push` events, fetching diffs, and fetching doc context |
| 4 | AI Pipeline | Prompting Gemini to analyze diffs and rewrite markdown |
| 5 | Output | Committing files and creating Pull Requests via GitHub API |

---

## Core Pipeline Flow

1. **Trigger:** `push` event received via GitHub Webhook.
2. **Fetch:** Get commit diff and existing markdown docs from GitHub.
3. **Analyze:** Gemini determines if code invalidates docs.
4. **Action:** If changed, open a PR with the updated markdown files (or directly commit based on settings).
