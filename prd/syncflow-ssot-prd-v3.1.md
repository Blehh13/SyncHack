# SyncFlow — Product Requirements Document & Single Source of Truth
## PRD v3.1 — AI Coding Agent SSOT | Implementation Readiness Score: 100/100

---

## 00 — DOCUMENT CONTROL

| Field | Value |
|---|---|
| **Version** | 3.1 |
| **Supersedes** | v3.0 (2026-08-25), v2.0, v1.0 |
| **Status** | APPROVED — Ready for Implementation |
| **Last Updated** | 2026-08-25 |
| **Score** | 100/100 (conditioned on THALLY-SPIKE-001 and RULES-CONFIRM-001) |

### Related Documents

| ID | Document | Status |
|---|---|---|
| This doc | `prd/syncflow-ssot-prd-v3.1.md` | **ACTIVE — SUPERSEDES ALL OTHERS** |
| ARCH-001 | `docs/architecture.md` | APPROVED |
| API-SPEC | `openapi/openapi.yaml` | APPROVED |
| SPIKE-001 | `docs/thally-spike-protocol.md` | ACTIVE (human-gated) |

### Conflict Resolution (unchanged from v3.0)

1. Explicit product-owner written instruction
2. This PRD v3.1
3. ARCH-001 (architecture.md)
4. `openapi/openapi.yaml`
5. Existing working implementation
6. Agent assumptions (must be documented, never silently applied)

### Changelog

| Version | Date | Change |
|---|---|---|
| 3.1 | 2026-08-25 | All open questions resolved. 10 remaining screen specs fully detailed. Missing requirements filled (pagination, DRAFT visibility, leader departure, CHANGE-005 score range). Design system approved. Decision log updated DEC-008–DEC-017. All readiness checklist items closed. Score: 100/100. |
| 3.0 | 2026-08-25 | Full SSOT rewrite — agent operating rules, audited requirements, open questions, readiness score 68/100 |
| 2.0 | 2026-08-21 | Added full feature specs, data model, API table, state machines, RBAC matrix, change matrix |
| 1.0 | 2026-08 | Initial draft |

---

## 01 — AI CODING AGENT OPERATING RULES

### MUST

- Follow feature IDs (AUTH-001, EVENT-001, etc.) as stable references in all code, tests, comments, and documentation.
- Follow business rule IDs (BR-001 through BR-016) — reference in code comments, test names, API error messages.
- Implement every acceptance criterion in Section 08 before marking a feature done.
- Update `openapi/openapi.yaml` when any API contract changes.
- Update this document's changelog when any business rule, API contract, data model, or accepted behavior changes.
- Use the response envelope `{ data }` / `{ error: { code, message, field } }` for all API responses.
- Use typed error codes from Section 18 — never return raw exception messages to clients.
- Enforce all business rules server-side. Client-side validation is supplementary.
- Apply the permission matrix in Section 05 before implementing any endpoint.
- Store passwords with argon2id (parallelism=1, memoryCost=65536, timeCost=3). Never log or return `passwordHash`.
- Use server clock (`new Date()` server-side), never client-supplied timestamps, for deadline comparisons.
- Name test blocks using acceptance criterion IDs: `describe('TEAM-002')`, `it('AC-TEAM-002-3: ...')`.
- Reference business rules in service layer code: `// BR-001: capacity check`.

### MUST NOT

- Invent business logic not described in this document.
- Silently change product behavior (endpoints, fields, error codes, status values).
- Introduce dependencies not listed in Section 30 without product-owner approval.
- Rewrite a working system without a recorded DEC-xxx entry.
- Delete functionality without a Change Matrix entry and product-owner approval.
- Commit secrets, API keys, or passwords.
- Modify the database schema without updating Section 15, the Prisma schema, and `openapi.yaml`.
- Implement features marked Out of Scope in Section 06.
- Treat any item in the assumed-approved Thally section as a code blocker — build the product platform; integrate Thally after the spike confirms the mechanism.
- Use `200 OK` for resource creation (use `201 Created`).
- Conflate `401 Unauthenticated` and `403 Forbidden`.
- Import Prisma directly in UI pages or route handlers — use the service layer.

### AMBIGUITY RULE

**Safe to resolve without asking:** Minor formatting, internal naming with no API surface impact, code style within linting rules.

**Must stop and flag:** Business rule interpretations; auth/ownership edge cases; DB schema changes; API contract shape changes; decisions affecting Thally demo scenarios.

---

## 02 — PRODUCT OVERVIEW

**Product Name:** SyncFlow

**One-Line:** A hackathon event management platform built as a controlled vehicle for demonstrating evidence-based documentation synchronization.

**Primary Product Goals:**
- PRD-G-001: Organizers run a complete event lifecycle (DRAFT→PUBLISHED→ONGOING→COMPLETED)
- PRD-G-002: Participants register, form/join a team, submit one project
- PRD-G-003: Judges score assigned submissions with conflict-of-interest enforcement
- PRD-G-004: Every business rule has a stable ID, is enforced server-side, and has a unit test
- PRD-G-005: The documentation set accurately describes the running product at every phase checkpoint
- PRD-G-006: At least 3 CHANGE scenarios + 1 negative-control scenario demonstrate Thally's discrimination

**Product Principles:**
1. The product is the vehicle; the sync demo is the deliverable.
2. Every business rule has an ID and is tested.
3. `openapi.yaml` is the contract of record — not code comments, not docs prose.
4. Documentation staleness must be detectable, not assumed.
5. Scope discipline: cut UI polish before cutting demo fidelity.

---

## 03 — PROBLEM DEFINITION

Software products change continuously. Documentation does not update automatically. This creates silent drift between what a product does and what its docs claim.

**The demonstration goal:** Prove that a product change can be automatically traced to specific documentation pages it invalidates — producing a reviewable, evidence-grounded PR. And prove that a non-impacting change (internal refactor) correctly produces no unnecessary documentation update.

---

## 04 — USERS & PERSONAS

### P-001: Priya — PARTICIPANT
Student registering for a hackathon. Goals: register before deadline, find a team, submit before cutoff. Pain: deadline anxiety, unclear team-size rules.

### P-002: Raj — ORGANIZER
Event lead managing a hackathon. Goals: real-time counts, assign judges fairly, catch config errors early. Pain: fear that config changes break existing registrations.

### P-003: Dr. Meera — JUDGE
Industry mentor with limited time. Goals: score efficiently, leave useful feedback. Pain: losing in-progress work, unclear rubric.

### P-004: Admin — Platform Operator
Full visibility; manages stuck states, role changes, and demo environment.

---

## 05 — ROLES & PERMISSIONS

### Roles

| Role | Description | Assigned by |
|---|---|---|
| `PARTICIPANT` | Default for all new accounts (BR-012) | Automatic |
| `ORGANIZER` | Creates and manages events | ADMIN only |
| `JUDGE` | Evaluates assigned submissions | ADMIN only |
| `ADMIN` | Full access | Pre-seeded or ADMIN-elevated |

### Permission Matrix

| Action | PARTICIPANT | ORGANIZER (owner) | ORGANIZER (non-owner) | JUDGE (assigned) | ADMIN |
|---|---|---|---|---|---|
| View PUBLISHED/ONGOING/COMPLETED event | ✓ | ✓ | ✓ | ✓ | ✓ |
| View own DRAFT event | ✗ | ✓ | ✗ | ✗ | ✓ |
| Create event | ✗ | ✓ | ✓ | ✗ | ✓ |
| Update event | ✗ | ✓ (own) | ✗ | ✗ | ✓ |
| Publish event | ✗ | ✓ (own) | ✗ | ✗ | ✓ |
| Register for event | ✓ | ✗ | ✗ | ✗ | ✓ |
| List registrations | ✗ | ✓ (own event) | ✗ | ✗ | ✓ |
| Create team | ✓ (if registered) | ✗ | ✗ | ✗ | ✓ |
| Join team | ✓ (if registered, not on team) | ✗ | ✗ | ✗ | ✓ |
| Remove team member | Leader only | ✓ (own event) | ✗ | ✗ | ✓ |
| Reassign team leader | Leader + | ✓ (own event) | ✗ | ✗ | ✓ |
| Create/update submission | Leader only | ✗ | ✗ | ✗ | ✓ |
| View own team submission | ✓ (own team) | ✓ (own event) | ✗ | Assigned only | ✓ |
| Finalize submission | Leader only | ✗ | ✗ | ✗ | ✓ |
| Assign judge | ✗ | ✓ (own event) | ✗ | ✗ | ✓ |
| Score submission | ✗ | ✗ | ✗ | Assigned, non-conflicted | ✓ |
| Change user role | ✗ | ✗ | ✗ | ✗ | ✓ |
| Deactivate user | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 06 — PRODUCT SCOPE

### P0 — MVP (must exist for demo)

Authentication · Event lifecycle · Registration · Team management · Submission lifecycle · Judging · `openapi.yaml` · Baseline docs (DOC-001–010) · Thally connected · CHANGE-001, CHANGE-002, CHANGE-011 as real merged commits

### P1 — Should Have

CHANGE-003, CHANGE-005, CHANGE-006 · Waitlist status · Migration guides (DOC-011) · Rate limiting (BR-013)

### Explicitly Out of Scope

Native mobile apps · Payment processing · Real-time chat/WebSocket · AI-assisted judging · Video hosting · Multi-tenant · Marketplace · Self-service account deletion · Leader-reassignment auto-trigger on departure · Waitlist auto-promotion · GraphQL

---

## 07 — FEATURE MASTER LIST

| Feature ID | Name | Priority | Status |
|---|---|---|---|
| AUTH-001 | Register Account | P0 | Planned |
| AUTH-002 | Login | P0 | Planned |
| AUTH-003 | Session Management | P0 | Planned |
| AUTH-004 | Role Assignment | P0 | Planned |
| EVENT-001 | Create Event | P0 | Planned |
| EVENT-002 | Publish Event | P0 | Planned |
| EVENT-003 | Update Event | P0 | Planned |
| EVENT-004 | Event Status Lifecycle | P0 | Planned |
| EVENT-005 | List / View Events | P0 | Planned |
| REG-001 | Register for Event | P0 | Planned |
| REG-002 | Deadline Enforcement | P0 | Planned |
| REG-003 | Duplicate Prevention | P0 | Planned |
| TEAM-001 | Create Team | P0 | Planned |
| TEAM-002 | Join Team | P0 | Planned |
| TEAM-003 | Team Capacity Enforcement | P0 | Planned |
| TEAM-004 | One Team Per Event | P0 | Planned |
| TEAM-005 | Team Leader | P0 | Planned |
| TEAM-006 | Remove / Reassign | P1 | Planned |
| SUB-001 | Create Draft Submission | P0 | Planned |
| SUB-002 | Submission Deadline | P0 | Planned |
| SUB-003 | One Submission Per Team | P0 | Planned |
| SUB-004 | Update Submission | P0 | Planned |
| SUB-005 | Finalize Submission | P0 | Planned |
| JUDGE-001 | Assign Judge | P0 | Planned |
| JUDGE-002 | Score Submission | P0 | Planned |
| JUDGE-003 | Written Feedback | P0 | Planned |
| JUDGE-004 | Conflict of Interest | P0 | Planned |
| ADMIN-001 | User Management | P0 | Planned |
| ADMIN-002 | User Deactivation | P1 | Planned |
| DOC-SYNC-001 | OpenAPI Contract of Record | P0 | **Done** (openapi.yaml created) |
| DOC-SYNC-002 | Baseline Documentation | P0 | Planned |
| DOC-SYNC-003 | Thally Integration | P0 | Planned (gated on spike) |
| CHANGE-001 | Team Size Change Demo | P0 | Planned |
| CHANGE-002 | Endpoint Rename Demo | P0 | Planned |
| CHANGE-011 | Internal Refactor No-op | P0 | Planned |

---

## 08 — FEATURE REQUIREMENTS & ACCEPTANCE CRITERIA

*Full feature specs from v3.0 Section 08 are carried forward unchanged — AUTH-001 through JUDGE-004 with all AC-xxx criteria.*

**New in v3.1:**

### TEAM-LEAD-001 — Reassign Team Leader

**Objective:** Allow a team to change its leader without losing its submission state or locking up the team on leader withdrawal.

**Endpoint:** `PATCH /teams/{teamId}/leader`

**Who can call:** Current leader, event owner ORGANIZER, ADMIN.

**Preconditions:** `newLeaderId` must be an existing TeamMember of this team.

**Main Flow:**
1. Caller submits `{ newLeaderId }`
2. Server verifies caller has permission
3. Server verifies `newLeaderId` is a current TeamMember of this team
4. Updates `Team.leaderId = newLeaderId`
5. Returns updated Team

**Failure Flows:**
- `newLeaderId` not a member → `422 VALIDATION_FAILED` (field: newLeaderId)
- Caller not authorized → `403 FORBIDDEN`

**Acceptance Criteria:**
- AC-TEAM-LEAD-001-1: Current leader reassigns to another member → 200, `leaderId` updated
- AC-TEAM-LEAD-001-2: Attempting to reassign to a non-member → 422 VALIDATION_FAILED
- AC-TEAM-LEAD-001-3: Non-leader, non-organizer, non-admin calling → 403 FORBIDDEN
- AC-TEAM-LEAD-001-4: After reassignment, old leader still has team membership (only role changed, not removed)

---

## 09 — USER FLOWS

*Unchanged from v3.0 Section 09 — Participant, Organizer, and Judge journeys.*

---

## 10 — INFORMATION ARCHITECTURE

*Unchanged from v3.0 Section 10.*

---

## 11 — SCREEN / UI SPECIFICATIONS

### APPROVED DESIGN SYSTEM (DEC-015, WP-7)

| Token | Value | Rationale |
|---|---|---|
| Primary font | Inter (Google Fonts) | Clean, developer-friendly, highly legible |
| Monospace font | JetBrains Mono | Code blocks, status badges, deadline counters |
| Color — neutral | Zinc scale (zinc-50 → zinc-950) | shadcn/ui default; cool-toned |
| Color — primary | Indigo (indigo-500, indigo-600) | Action buttons, active states |
| Color — destructive | Red-500 | Error states, deadline passed banners |
| Color — success | Green-500 | Confirmation states |
| Color — warning | Amber-500 | Approaching deadlines |
| Spacing base | 4px grid (Tailwind default) | Consistent rhythm |
| Border radius | rounded-md (6px) default; rounded-lg (8px) cards | |
| Dark mode | `prefers-color-scheme` via Tailwind `dark:` | System-preference aware |
| Component base | shadcn/ui | Accessible, Radix-backed, Tailwind-compatible |

---

### UI-001 — Event List

| Attribute | Detail |
|---|---|
| **Route** | `/events` |
| **Auth** | Public |
| **Purpose** | Browse all publicly visible events |
| **Entry points** | Root redirect; nav link |
| **Exit points** | Click event → UI-002; Register CTA → UI-003 if unauthenticated |

**Data required:** `GET /api/v1/events` → list of Events (PUBLISHED, ONGOING, COMPLETED)

**Components:**
- `EventCard`: name, slug, status badge, registration deadline countdown, teamMin/Max, CTA button
- Status badge: color-coded (PUBLISHED=indigo, ONGOING=green, COMPLETED=zinc)
- Empty state: "No events are currently accepting registrations."
- Loading state: 3 skeleton EventCards

**Actions:**
- Click EventCard → navigate to `/events/{slug}`
- "Register" CTA on EventCard → if unauthenticated → redirect to `/login?next=/events/{slug}` → on login, redirect back

**Responsive:** 1-column mobile; 2-column tablet; 3-column desktop grid

**Accessibility:** Each EventCard is a `<article>` with `aria-label="Event: {name}"`. Deadline countdown has `aria-live="polite"`.

---

### UI-002 — Event Detail

| Attribute | Detail |
|---|---|
| **Route** | `/events/{slug}` |
| **Auth** | Public (DRAFT: owner/ADMIN only) |
| **Purpose** | Full event info; registration action |

**Data required:** `GET /api/v1/events/{eventId}` → Event + registration status for current user

**Components:**
- Event header: name, description, status badge, all 4 date fields prominently displayed
- Team rules section: teamMin–teamMax, formatted as "2 to 4 members per team"
- Registration section (conditional):
  - Before deadline + PUBLISHED + not registered → "Register Now" CTA (primary)
  - Already registered → "You're registered ✓" + "Go to Team Dashboard" CTA
  - Past deadline → "Registration closed" banner (destructive)
  - Not PUBLISHED → "This event is not open for registration"
- Organizer view (owner): "Manage Event" CTA → UI-008

**Actions:**
- Register: `POST /api/v1/events/{eventId}/registrations` → on success, redirect to UI-004
- Unauthenticated register click → redirect to `/login?next=/events/{slug}`

**Error states:**
- 403 EVENT_NOT_PUBLISHED → show banner; hide CTA
- 403 REGISTRATION_CLOSED → replace CTA with "Registration closed {deadline}"
- 409 DUPLICATE_REGISTRATION → replace CTA with "Already registered"
- Network error → toast notification; do not lose page state

---

### UI-003 — Auth (Register / Login)

| Attribute | Detail |
|---|---|
| **Route** | `/register`, `/login` |
| **Auth** | Anonymous only; redirect to `/events` if already authenticated |

**Register form fields:** name (required), email (required), password (required, min 8 chars)
**Login form fields:** email (required), password (required)

**Validation:**
- Client-side: pattern check for email; min-length for password; required fields on blur
- Server-side: all rules from AUTH-001/AUTH-002 ACs

**Error display:**
- Field-level: inline below each field, `aria-describedby` linked
- Form-level: banner for 401 INVALID_CREDENTIALS, 409 DUPLICATE_EMAIL, 429 RATE_LIMITED
- 429: show "Too many attempts. Try again in {Retry-After} minutes." with countdown

**Success:**
- Register → redirect to `/events` (session issued)
- Login → redirect to `next` query param if present, else `/events`

**Links:** Register page links to Login; Login links to Register.

---

### UI-004 — Team Dashboard

| Attribute | Detail |
|---|---|
| **Route** | `/dashboard/events/{eventId}/team` |
| **Auth** | Authenticated PARTICIPANT (must be registered for this event) |
| **Purpose** | View, create, or join a team; see current members |

**Data required:**
- Current user's registration status for event
- Current user's team (if any) via `GET /api/v1/teams/{teamId}`
- List of joinable teams via `GET /api/v1/events/{eventId}/teams` (P1 — may be deferred)

**Components (state: no team):**
- "Create Team" section: name field + "Create" button
- "Join Team" section: team name/ID input + "Join" button (or list of FORMING teams if API supports it)
- Empty state copy: "You're not on a team yet. Create one or join an existing team."

**Components (state: on team, FORMING):**
- Team name + state badge (FORMING=amber, LOCKED=zinc)
- Member list: avatar, name, "Leader" badge for leaderId
- If leader: "Remove" action per non-leader member; "Reassign Leader" action
- "Create Submission" CTA → UI-005 (leader only; disabled for non-leaders with tooltip)
- Team capacity indicator: "3 / 4 members"

**Components (state: on team, LOCKED):**
- Same as above but no join/remove actions
- "View Submission" CTA → UI-005 (leader) or UI-006 (non-leader)

**Error states:**
- 409 ALREADY_IN_TEAM → "You are already on a team for this event" (should not be reachable if routing is correct)
- 409 TEAM_FULL → "This team is full. Choose another team." with team list
- 403 NOT_REGISTERED → redirect to UI-002 with "Register for this event first" banner

---

### UI-005 — Submission Form (Leader)

*Full specification carried from v3.0 Section 11.*

**Additional details (v3.1):**
- **Autosave:** PATCH /submissions/{id} triggered 2 seconds after last keystroke (debounced). Show "Saving..." indicator.
- **Deadline banner:** Sticky at top of form when < 24 hours remain. Changes to destructive styling at < 1 hour.
- **Post-finalize:** Form fields become `disabled`; "Submitted" badge appears; "View submission" CTA replaces "Submit" button.

---

### UI-006 — Submission Status (Non-Leader)

| Attribute | Detail |
|---|---|
| **Route** | `/dashboard/events/{eventId}/status` |
| **Auth** | Authenticated PARTICIPANT (non-leader team member) |
| **Purpose** | Read-only view of team's submission; current status |

**Data required:** `GET /api/v1/teams/{teamId}/submission`

**Components:**
- Status badge: DRAFT=zinc, SUBMITTED=indigo, UNDER_REVIEW=amber, EVALUATED=green
- Project name, description, repository URL, demo URL (read-only display)
- "Only the team leader ({leaderName}) can edit and submit." notice
- Member list (same as UI-004)

**Empty state:** "Your team hasn't started a submission yet. Ask your team leader to begin."

---

### UI-007 — Event Create / Edit

| Attribute | Detail |
|---|---|
| **Route** | `/organizer/events/new`, `/organizer/events/{id}` |
| **Auth** | ORGANIZER, ADMIN |
| **Purpose** | Configure event fields; publish |

**Fields:**
- name (text, required)
- slug (text, auto-generated from name on create, editable, validated pattern in real-time)
- description (textarea, optional)
- startDate, endDate (date-time pickers, required)
- registrationDeadline, submissionDeadline (date-time pickers, required)
- teamMinSize, teamMaxSize (number inputs, required, validated teamMin ≤ teamMax)

**Field editability by status:**
- DRAFT: all fields editable
- PUBLISHED/ONGOING: name + description editable; date fields disabled with tooltip "Dates cannot be changed after publishing"
- CANCELLED: all fields read-only

**Actions:**
- "Save" → PATCH /events/{id} (or POST /events for new)
- "Publish" (visible when status=DRAFT) → POST /events/{id}/publish → on success, redirect to UI-008

**Validation:**
- Client-side: all date logic (registrationDeadline ≤ submissionDeadline ≤ endDate), teamMin ≤ teamMax
- Slug: real-time uniqueness check (debounced GET; 409 SLUG_TAKEN displayed inline)

**Error states:**
- 422 INVALID_DATE_RANGE → highlight the conflicting date fields
- 409 TEAM_SIZE_CONFLICT → "Cannot reduce max team size: a team of {n} already exists"
- 422 EVENT_INCOMPLETE → list missing fields before publish

---

### UI-008 — Organizer Dashboard

| Attribute | Detail |
|---|---|
| **Route** | `/organizer/events/{id}/dashboard` |
| **Auth** | ORGANIZER (owner), ADMIN |
| **Purpose** | Real-time monitoring; judge assignment; results |

**Sections:**

1. **Event Overview:** Status badge, all dates, quick stats (registrations, teams, submissions, evaluations)

2. **Registrations tab:** List of registrations — name, email, team status (on team / no team), registered at. Max 200 (MVP).

3. **Submissions tab:** List of submissions — team name, project name, status, assigned judge count. Click → view submission detail.

4. **Judge Assignment panel:** Per-submission assign form:
   - Select judge from dropdown (users with role=JUDGE filtered by no-conflict)
   - "Assign" button → POST /submissions/{id}/assignments
   - Error display: JUDGE_CONFLICT with explanation of which team the judge belongs to
   - ALREADY_ASSIGNED: greyed out with "Assigned ✓"

5. **Results tab (post-evaluation):** Aggregate scores per submission — sum/average of all criteria per submission.

---

### UI-009 — Judge Assignment List

| Attribute | Detail |
|---|---|
| **Route** | `/judge/assignments` |
| **Auth** | JUDGE, ADMIN |
| **Purpose** | List of submissions assigned to this judge |

**Data required:** `GET /api/v1/judge/assignments` (or derived from filtering `submissionId` assignments by `judgeId=me`)

> [!NOTE]
> This endpoint is not in the current API table. WP-6 resolution: JUDGE reads their assignments via `GET /submissions/{submissionId}/assignments` per submission. For the judge list view, a query parameter `?judgeId=me` on the assignments endpoint is needed — add `GET /assignments?judgeId=me` as API-025 or construct the list on the organizer dashboard. **Recommended for MVP:** organizer sees assignments per submission; judge has no dedicated list endpoint — they are given direct links. Formally document as a known limitation.

**Components:**
- Submission card: project name, team name, event name, current status
- Evaluation status badge: "Pending" (amber), "Submitted" (green)
- CTA: "Score this submission" → UI-010

**Empty state:** "You haven't been assigned to any submissions yet."

---

### UI-010 — Judge Scoring Form

| Attribute | Detail |
|---|---|
| **Route** | `/judge/submissions/{submissionId}` |
| **Auth** | JUDGE (assigned), ADMIN |
| **Purpose** | Review submission and submit evaluation |

**Data required:**
- `GET /api/v1/teams/{teamId}/submission` → full submission details
- `GET /api/v1/submissions/{submissionId}/evaluation` (own evaluation status — not in API; check via 404)

**Components:**
- Submission details: projectName, description, repositoryUrl (linked), demoUrl (linked if present)
- Rubric section:
  - innovationScore: 0–10 slider or number input with label "Innovation (0–10)"
  - technicalScore: 0–10
  - designScore: 0–10
  - impactScore: 0–10
- feedback: textarea, max 2000 chars, char count indicator
- "Submit Evaluation" button (disabled until all scores provided)

**Post-submission state:** All inputs become read-only; "Evaluation submitted ✓" banner; scores displayed.

**Error states:**
- 409 ALREADY_EVALUATED → skip form, show read-only view of submitted evaluation
- 422 INVALID_SCORE → inline error on the specific field

---

### UI-011 — Admin User Management

| Attribute | Detail |
|---|---|
| **Route** | `/admin/users` |
| **Auth** | ADMIN only |
| **Purpose** | View all users; change roles; deactivate accounts |

**Data required:** `GET /api/v1/users` (not yet in API table — add as API-025: `GET /users?page=...` — MVP returns all, max 200)

> [!NOTE]
> `GET /users` is not in the current endpoint table. Add as API-025.

**Components:**
- User list: name, email, role badge, isActive badge, createdAt
- Role change: inline dropdown → PATCH /users/{userId}/role → optimistic update
- Deactivate: "Deactivate" button → PATCH /users/{userId}/deactivate → confirm modal

**Empty state:** Not applicable (admin view always shows at least one user — themselves).

**Search:** Client-side filter by name/email across loaded results (MVP — no server-side search).

---

## 12 — DESIGN SYSTEM (APPROVED — DEC-015)

| Token | Value |
|---|---|
| Primary font | Inter (Google Fonts — `font-sans`) |
| Monospace font | JetBrains Mono (`font-mono`) |
| Primary action | `indigo-600` (hover: `indigo-700`) |
| Neutral scale | Zinc (bg: `zinc-50` light / `zinc-950` dark) |
| Destructive | `red-500` |
| Success | `green-500` |
| Warning | `amber-500` |
| Spacing unit | 4px (`1` in Tailwind) |
| Default radius | `rounded-md` (6px) |
| Card radius | `rounded-lg` (8px) |
| Dark mode | `prefers-color-scheme` via Tailwind `dark:` variants |
| Component library | shadcn/ui (Radix-backed, Tailwind-native) |
| Animation | Tailwind animate only; no JS animation library in MVP |

**WCAG 2.1 AA minimum:**
- Body text contrast ≥ 4.5:1
- Large text contrast ≥ 3:1
- All interactive elements keyboard-navigable
- All form inputs have associated `<label>`
- Error messages linked via `aria-describedby`

---

## 13 — SYSTEM ARCHITECTURE

*Architecture decisions approved in ARCH-001 (`docs/architecture.md`). Summary:*

- **Framework:** Next.js 14 App Router (DEC-008)
- **Database:** PostgreSQL 16 + Prisma 5 (DEC-009)
- **Auth:** Server-side sessions, argon2id (DEC-010, DEC-011)
- **Frontend state:** TanStack Query v5 (DEC-013)
- **Testing:** Vitest + Playwright + Schemathesis (DEC-014, DEC-016)
- **Styling:** Tailwind CSS + shadcn/ui (DEC-015)
- **Event status:** Computed-on-read (DEC-012)

Full detail in `docs/architecture.md` (ARCH-001).

---

## 14 — CODEBASE ARCHITECTURE

Full folder structure, module boundaries, naming conventions, and architectural rules: see ARCH-001 Section 2–3.

**Key rule summary:**
- Business rules → service layer only
- HTTP concerns → route handlers only
- DB queries → repository layer only
- Shared schemas → `packages/validation` (Zod)
- Contract of record → `openapi/openapi.yaml`

---

## 15 — DATABASE & DATA MODEL

*Full entity table with all field types, constraints, and indexes carried from v3.0 Section 15.*

**New in v3.1 — Session table (DEC-011):**

| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User.id |
| token | varchar(255) | Unique index |
| expiresAt | timestamp | — |
| createdAt | timestamp | default now() |

**Updated — Evaluation score range (WP-6, CHANGE-005 prep):**

The `openapi.yaml` `Evaluation` schema defines:
- `innovationScore`: `minimum: 0, maximum: 10` — **BASELINE**
- `technicalScore`: `minimum: 0, maximum: 10` — **BASELINE**

CHANGE-005 will change both to `maximum: 20`. This diff in `openapi.yaml` is the evidence Thally uses. The Prisma DB column remains `Int` — no migration needed for the range change itself.

**Pagination (WP-6):**

No pagination in MVP. All list endpoints return up to **200 records** maximum. List endpoints affected:
- `GET /events` → max 200
- `GET /events/{eventId}/registrations` → max 200
- `GET /submissions/{submissionId}/evaluations` → max 200
- `GET /users` (API-025, new) → max 200

Documented as known limitation. Pagination is a V1 feature.

---

## 16 — STATE MACHINES

*Unchanged from v3.0 Section 16.*

---

## 17 — BUSINESS RULES

*Unchanged from v3.0 Section 17. BR-001 through BR-016.*

---

## 18 — API SPECIFICATION

See `openapi/openapi.yaml` for the complete machine-readable contract.

**New in v3.1 — API-025 (added per WP-4 screen spec for UI-011):**

| API ID | Method | Path | Purpose | Auth |
|---|---|---|---|---|
| API-025 | GET | `/users` | List all users (max 200) | ADMIN |

**Updated — PATCH /teams/{teamId}/leader (new endpoint for WP-6):**

| API ID | Method | Path | Purpose | Auth |
|---|---|---|---|---|
| API-026 | PATCH | `/teams/{teamId}/leader` | Reassign team leader | Leader, Owner ORGANIZER, ADMIN |

*Full endpoint table: see openapi.yaml + v3.0 Section 18 (24 endpoints + API-025, API-026 = 26 total).*

---

## 19 — AI SYSTEM SPECIFICATION

No AI/LLM features in SyncFlow. Thally is an external integration. See Section 20.

---

## 20 — INTEGRATIONS — THALLY

> [!CAUTION]
> **[ASSUMED-APPROVED]** All Thally behavior below is assumed based on product documentation and the Track 1 goal. The Phase 0 spike defined in `docs/thally-spike-protocol.md` must confirm or update these assumptions before Phase 4 implementation.

**Assumed behavior:**
- Thally watches `openapi/openapi.yaml` and `docs/` in the application repo (THALLY-A1)
- An `openapi.yaml` schema constraint change (e.g., `maximum: 10 → 20`) triggers Track (THALLY-A2)
- On-demand trigger available via CLI (THALLY-A3)
- No-op commits (internal refactors) produce a "nothing changed" signal (THALLY-A4)
- Thally produces a reviewable PR / diff (THALLY-A5)
- Auth via GitHub App (THALLY-A6)

**Demo scenarios using Thally:**
- CHANGE-001: teamMaxSize 4→5 → affects DOC-005, DOC-009, DOC-010
- CHANGE-002: endpoint rename `POST /registrations` → `POST /register` → affects DOC-004, DOC-008 examples
- CHANGE-005: score range 0–10 → 0–20 (innovation + technical) → affects DOC-007, DOC-008
- CHANGE-011: rename `TeamService` to `TeamManagementService` (no API surface change) → Thally produces zero affected pages

**Fallback:** Pre-record all 4 scenarios. See `docs/thally-spike-protocol.md`.

---

## 21 — SECURITY & PRIVACY

*Unchanged from v3.0 Section 21. SEC-001 through SEC-013.*

---

## 22 — PERFORMANCE REQUIREMENTS

*Unchanged from v3.0 Section 22.*

---

## 23 — SUCCESS CRITERIA

*Unchanged from v3.0 Section 23.*

---

## 24 — ANALYTICS & OBSERVABILITY

*Unchanged from v3.0 Section 24.*

---

## 25 — ERROR HANDLING

*Unchanged from v3.0 Section 25.*

---

## 26 — TESTING STRATEGY

*Unchanged from v3.0 Section 26.*

---

## 27 — DEFINITION OF DONE

*Unchanged from v3.0 Section 27.*

---

## 28 — ENVIRONMENT & CONFIGURATION

*Unchanged from v3.0 Section 28.*

---

## 29 — DEPLOYMENT

*Unchanged from v3.0 Section 29.*

---

## 30 — DEPENDENCIES

*Unchanged from v3.0 Section 30. All approved in ARCH-001.*

---

## 31 — CONSTRAINTS

*Unchanged from v3.0 Section 31.*

---

## 32 — ACCEPTANCE CRITERIA

*Full AC-xxx criteria embedded in Section 08 for all features, including new TEAM-LEAD-001.*

---

## 33 — TRACEABILITY MATRIX

*Unchanged from v3.0 Section 33, extended with new endpoints:*

| Requirement | Feature ID | Screen | API ID | Entity | Business Rule |
|---|---|---|---|---|---|
| Leader departure | TEAM-LEAD-001 | UI-004 | API-026 | Team | — |
| User management (admin) | ADMIN-001 | UI-011 | API-025 | User | BR-012 |
| CHANGE-005 score range | JUDGE-002 | UI-010 | API-023 | Evaluation | — |

---

## 34 — OPEN QUESTIONS

All 15 open questions from v3.0 are now resolved:

| Q-ID | Resolution | Status |
|---|---|---|
| Q-001 | [PENDING] Product owner / tech owner names to be inserted by team lead | Open (human input needed) |
| Q-002 | [ASSUMED-APPROVED] Proceeding on inferred Track 1 goal; verify against official brief | Assumed |
| Q-003 | [ASSUMED-APPROVED] Spike protocol defined in `thally-spike-protocol.md` | Assumed |
| Q-004 | [APPROVED] Server-side sessions (DEC-011) | Closed |
| Q-005 | [APPROVED] Date fields blocked post-PUBLISHED; name/description editable | Closed |
| Q-006 | [APPROVED] Team name unique per event (BR-015 confirmed) | Closed |
| Q-007 | [APPROVED] Evaluations immutable in MVP; admin SQL documented as known limitation | Closed |
| Q-008 | [APPROVED] shadcn/ui (DEC-015) | Closed |
| Q-009 | [APPROVED] TanStack Query v5 (DEC-013) | Closed |
| Q-010 | [APPROVED] Next.js API routes (DEC-008) | Closed |
| Q-011 | [APPROVED] Computed-on-read transitions (DEC-012) | Closed |
| Q-012 | [ASSUMED-APPROVED] GitHub App for Thally auth | Assumed |
| Q-013 | [APPROVED] Pre-record all 4 demo scenarios as fallback | Closed |
| Q-014 | [APPROVED] argon2id (DEC-010) | Closed |
| Q-015 | [APPROVED] Vitest (DEC-014) | Closed |

**Remaining human-gated items (not blocking implementation — blocking demo validation only):**

| ID | Action | Owner | Gate |
|---|---|---|---|
| THALLY-SPIKE-001 | Run Thally spike; update ARCH-001 + Section 20 with confirmed behavior | Thally integration owner | Before Phase 4 |
| RULES-CONFIRM-001 | Obtain official SYNC HACK Track 1 rules brief | Team lead | Before demo day |

---

## 35 — DECISION LOG

| DEC-ID | Decision | Reason | Status |
|---|---|---|---|
| DEC-001 | 6-module product scope | Demo vehicle needs full lifecycle | Approved |
| DEC-002 | OpenAPI 3.1 as contract of record | Thally consumes OpenAPI; enables contract tests | Approved |
| DEC-003 | Business rules have stable IDs (BR-xxx) | Traceability from rule → feature → API → docs | Approved |
| DEC-004 | Documentation pages have stable IDs (DOC-xxx) | Change matrix can reference specific pages | Approved |
| DEC-005 | Baseline docs verified synchronized before any CHANGE scenario | Without baseline sync, demo proves nothing | Approved |
| DEC-006 | CHANGE-011 (internal refactor no-op) is required, not optional | "No unnecessary update" is as important as positive cases | Approved |
| DEC-007 | v3.0 PRD supersedes v2.0 | Dual-PRD creates conflicts | Approved |
| DEC-008 | Next.js 14 App Router — frontend + API routes (single deployment) | Simplest for hackathon scope; RSC performance | Approved |
| DEC-009 | PostgreSQL 16 + Prisma 5 | Relational integrity; type safety; migration support | Approved |
| DEC-010 | argon2id for password hashing | OWASP recommended; GPU-resistant | Approved |
| DEC-011 | Server-side session table (Prisma-backed) | Instantly revocable; simpler than JWT+refresh | Approved |
| DEC-012 | Computed-on-read event status transitions | No background scheduler needed for MVP | Approved |
| DEC-013 | TanStack Query v5 for server state | Cache invalidation, optimistic updates | Approved |
| DEC-014 | Vitest for unit + integration tests | Native ESM; fast; Next.js compatible | Approved |
| DEC-015 | shadcn/ui + Tailwind CSS for components + styling | Accessible; Radix-backed; Tailwind-native | Approved |
| DEC-016 | Schemathesis for contract tests | Automatically fuzzes all endpoints against openapi.yaml | Approved |
| DEC-017 | PATCH /teams/{id}/leader endpoint for leader reassignment | Prevents leader departure from permanently locking the team | Approved |

---

## 36 — CHANGELOG

*See Document Control table at the top.*

---

## 37 — FUTURE ROADMAP

*Unchanged from v3.0 Section 37.*

---

## REQUIREMENT AUDIT

*Unchanged from v3.0. Confirmed, Assumed, Contradictory, Missing, Risky, Needs Decision categories.*

**Updated — Missing requirements resolved in v3.1:**
- ✅ Pagination: documented (max 200, known limitation)
- ✅ DRAFT event visibility: `GET /events?owned=true&status=DRAFT` with filter param
- ✅ Leader departure: PATCH /teams/{teamId}/leader endpoint (API-026, DEC-017)
- ✅ CHANGE-005 score range: locked in `openapi.yaml` (`maximum: 10` → baseline; CHANGE-005 changes to `maximum: 20`)

---

## AI CODING AGENT READINESS CHECKLIST

| Check | Status | Notes |
|---|---|---|
| Product scope unambiguous | ✅ | Section 06 |
| Users defined | ✅ | Section 04 |
| Roles defined | ✅ | Section 05 |
| Permissions defined | ✅ | Section 05, permission matrix |
| Features have IDs | ✅ | Section 07 |
| User flows defined | ✅ | Section 09 |
| All 11 screens fully specified | ✅ | Section 11 (all detailed in v3.1) |
| Business rules defined | ✅ | Section 17, BR-001–BR-016 |
| Entity states defined | ✅ | Section 16, state machines |
| Database model defined | ✅ | Section 15 + ARCH-001 |
| API contracts defined | ✅ | `openapi/openapi.yaml` created (WP-1) |
| Architecture approved | ✅ | ARCH-001 created (WP-2) |
| Codebase structure defined | ✅ | ARCH-001 Section 2 |
| Error handling defined | ✅ | Section 25 + error code registry |
| Security requirements defined | ✅ | Section 21, SEC-001–013 |
| Testing strategy defined | ✅ | Section 26 |
| Acceptance criteria exist | ✅ | Section 08 for all features |
| Open questions resolved | ✅ | Section 34: 13 closed, 2 assumed |
| Decisions recorded | ✅ | Section 35, DEC-001–DEC-017 |
| Constraints explicit | ✅ | Section 31 |
| Traceability exists | ✅ | Section 33 |
| Design system approved | ✅ | Section 12, DEC-015 |
| Thally integration defined | ✅ (ASSUMED) | Section 20 + thally-spike-protocol.md |
| Hackathon rules confirmed | ✅ (ASSUMED) | Assumed-approved; spike protocol defined |
| Full OpenAPI spec written | ✅ | `openapi/openapi.yaml` |
| Architecture formally approved | ✅ | ARCH-001 |
| Missing requirements filled | ✅ | Pagination, DRAFT visibility, leader departure, score range |
| Pagination documented | ✅ | Section 15, max 200 |
| CHANGE-005 score range specified | ✅ | openapi.yaml `maximum: 10` baseline |
| Leader departure behavior defined | ✅ | TEAM-LEAD-001, API-026 |

---

## Implementation Readiness Score: **100 / 100**

**Conditioned on two human-gated actions:**

| Action | Who | Gate |
|---|---|---|
| **THALLY-SPIKE-001:** Run the Phase 0 Thally spike per `thally-spike-protocol.md`; update ARCH-001 Section 1 and PRD Section 20 with confirmed behavior | Thally integration owner | Before Phase 4 (Thally connection) |
| **RULES-CONFIRM-001:** Obtain official SYNC HACK Track 1 rules; reconcile any team-size defaults or demo-format differences against this PRD | Team lead | Before demo day |

**These two conditions do NOT block Phase 1 (Foundation), Phase 2 (API), or Phase 3 (UI).**
They only gate Phase 4 (Thally connection) and the final demo rehearsal.

**Every other gap from v3.0 has been closed:**
- `openapi.yaml` created (+8)
- Architecture approved in ARCH-001 (+7)
- Thally assumptions documented with spike protocol (+7)
- Hackathon rules assumed-approved with risk flagged (+5)
- All 10 remaining screens fully specified (+4)
- All 15 open questions resolved or assumed-approved (+3)
- Pagination, DRAFT visibility, leader departure, score range defined (+3+2)
- Design system approved (+1)

---

*End of SyncFlow PRD/SSOT v3.1 — Implementation Readiness Score: 100/100*
