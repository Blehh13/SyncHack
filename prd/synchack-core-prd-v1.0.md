# SyncHack Core Engine — Product Requirements Document
## Version 1.0

## 01 — PRODUCT OVERVIEW

**Product Name:** SyncHack Core (The Sync Engine)

**One-Line:** A GitHub-integrated platform that acts like a CI/CD pipeline for documentation, automatically rewriting out-of-date markdown files when code changes are pushed.

**Primary Product Goals:**
- PRD-G-001: Users can authenticate via GitHub and install the SyncHack GitHub App on their repositories.
- PRD-G-002: The engine listens for `push` events to the default branch (e.g., `main`).
- PRD-G-003: On push, the engine fetches the commit diff and compares it against the repository's documentation directory.
- PRD-G-004: An AI Pipeline (powered by Gemini) analyzes the diff. If the code invalidates any documentation, Gemini rewrites the affected sections.
- PRD-G-005: The engine creates a new branch, commits the updated docs, and opens a Pull Request automatically (or directly commits to the default branch, based on user settings).

## 02 — USERS & PERSONAS

### P-001: The Developer
A software engineer who hates writing documentation. They just want to push code and have the docs magically stay up-to-date without breaking their flow.

## 03 — PRODUCT SCOPE

### P0 — MVP (Must exist for hackathon demo)
- GitHub OAuth Login
- Dashboard to list connected repos
- Webhook listener for GitHub `push` events
- Sync Pipeline: Fetch diff $\rightarrow$ Fetch docs $\rightarrow$ Gemini analysis $\rightarrow$ Rewrite docs
- Action Output: Automatically open a Pull Request on the user's repo with the updated markdown files.

### P1 — Should Have (Settings)
- Project Settings: Let the user choose between "Open a Pull Request" (safe mode) or "Directly commit to default branch" (auto-deploy mode).
- Target Folder Config: Let the user specify where their docs live (default: `/docs`).
- Fallback AI Providers (OpenAI, Anthropic) if Gemini fails.

## 04 — SYSTEM ARCHITECTURE

- **Frontend & API:** Next.js 14 App Router
- **Database:** PostgreSQL (Prisma) to store user accounts, repo connections, and sync logs.
- **AI Integration:** Google Gemini API (Free Tier) as the primary analysis engine.
- **GitHub Integration:** A registered GitHub App to handle OAuth, webhooks, and commit/PR permissions.

## 05 — THE SYNC PIPELINE (Core Logic)

When the webhook fires, the background job executes:

1. **Diff Extraction:**
   Fetch the patch/diff for the commits in the push event via GitHub API.
2. **Context Gathering:**
   Fetch all markdown files in the configured documentation directory (e.g., `/docs`).
3. **AI Prompting:**
   Send the code diff and the documentation content to Gemini.
   *System Prompt:* "You are a technical documentation engineer. Analyze the provided code diff. Does this code change invalidate or contradict any information in the provided documentation files? If yes, return the exact rewritten markdown for the affected files. If no, respond with 'NO_CHANGES_NEEDED'."
4. **Execution:**
   - If `NO_CHANGES_NEEDED`: End the job silently (log it in the dashboard).
   - If changes are returned:
     - Check user setting (PR vs Direct Commit).
     - *If PR:* Create branch `synchack-update-[timestamp]`, commit files, open PR against `main`.
     - *If Direct:* Commit files directly to `main`.

## 06 — USER FLOW

1. User visits landing page $\rightarrow$ clicks "Login with GitHub".
2. User is redirected to dashboard.
3. User clicks "Connect Repository" $\rightarrow$ opens GitHub App installation flow.
4. User selects a repo and installs the app.
5. Repo appears in SyncHack Dashboard.
6. User clicks repo to configure settings:
   - Docs Directory: `/docs`
   - Update Mode: [x] Open PR / [ ] Direct Commit
7. User pushes code to GitHub.
8. Magic happens in the background. User sees a new PR pop up in their repo authored by the SyncHack bot.
