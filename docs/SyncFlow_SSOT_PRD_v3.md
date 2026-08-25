# SyncFlow — Product Requirements Document & Single Source of Truth
## PRD v3.0 — AI Coding Agent SSOT

---

## 00 — DOCUMENT CONTROL

| Field | Value |
|---|---|
| **Project Name** | SyncFlow |
| **Document Title** | Product Requirements Document & Single Source of Truth (PRD/SSOT) |
| **PRD Version** | 3.0 |
| **Supersedes** | v1.0 (draft, 2026-08), v2.0 (refined, 2026-08-21) |
| **Current Status** | Draft — Architecture Phase (Phase 1 of Section 21) |
| **Last Updated** | 2026-08-25 |
| **Product Owner** | UNKNOWN — [Q-001] |
| **Technical Owner** | UNKNOWN — [Q-001] |
| **Current Dev Phase** | Phase 0 (Research/Spike) / Phase 1 (Foundation) |
| **Hackathon** | SYNC HACK — Track 1 (rules not officially verified — see [Q-002]) |

### Related Documents

| ID | Document | Status |
|---|---|---|
| PRD-v1 | `docs/SyncFlow — Product Requirements Document.md` | Superseded |
| PRD-v2 | `docs/SyncFlow_PRD_v2.md` | Superseded |
| This doc | `docs/SyncFlow_SSOT_PRD_v3.md` | **ACTIVE** |
| ARCH-001 | Architecture + Technical Design Document | NOT YET CREATED |
| DB-001 | Prisma Schema | NOT YET CREATED |
| API-SPEC-001 | `openapi/openapi.yaml` | NOT YET CREATED |

### SSOT Authority Statement

> **This document is the authoritative source for product requirements, feature behavior, business rules, UX behavior, acceptance criteria, and architecture decisions for SyncFlow.**

### Conflict Resolution Rules

When this document conflicts with another source, apply this hierarchy **in order**:

1. **Explicit product-owner written instruction** (overrides everything)
2. **This PRD v3.0** (approved sections only)
3. **Approved architecture decisions** (ARCH-001 when created)
4. **Existing working implementation** (code is ground truth for *current behavior*; discrepancy from PRD = bug or undocumented decision)
5. **Older PRD versions** (v1.0, v2.0) — treated as superseded; resolve differences by consulting the product owner
6. **Agent assumptions** — lowest priority; must be flagged, not silently applied

**When code diverges from this PRD:** The code represents what the product *currently does*. If the divergence was unintentional, fix the code. If intentional, update this PRD with a changelog entry. Never silently update docs to match incorrect code.

**When design mockups conflict with this PRD:** This PRD wins unless a product owner decision explicitly approves the mockup change and it is recorded in Section 35 (Decision Log).

### Changelog

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 2026-08 | Initial draft | Team |
| 2.0 | 2026-08-21 | Refined — added actor/flow/failure/AC structure to features, full data model, API table, change matrix | Team |
| 3.0 | 2026-08-25 | Full SSOT rewrite — AI agent operating rules, audited requirements, contradictions flagged, open questions separated, readiness scored | AI Agent (Antigravity) |

---

## 01 — AI CODING AGENT OPERATING RULES

### MUST

- **MUST** follow feature IDs (AUTH-001, EVENT-001, etc.) as the stable references across all code, tests, comments, and documentation.
- **MUST** follow business rule IDs (BR-001 through BR-016) — reference them in code comments, test names, and API error messages where applicable.
- **MUST** implement every acceptance criterion in Section 32 before marking a feature done.
- **MUST** update `openapi/openapi.yaml` when any API contract changes — the YAML file is the contract of record.
- **MUST** update this document's changelog (Section 36) when any business rule, API contract, data model, or accepted behavior changes.
- **MUST** update tests when behavior changes — never leave a passing test that tests incorrect behavior.
- **MUST** use the response envelope defined in Section 18 (API Specification) for all API responses.
- **MUST** use typed error codes from Section 18 — never return raw exception messages to clients.
- **MUST** enforce all business rules server-side. Client-side validation is supplementary, never the authority.
- **MUST** apply the permission matrix in Section 05 before implementing any endpoint. Unauthenticated → 401; authenticated but wrong role/ownership → 403.
- **MUST** store `passwordHash` using bcrypt or argon2id. **MUST NOT** log or return `passwordHash` in any response.
- **MUST** use server clock, not client clock, for all deadline comparisons.
- **MUST** create/update the task.md file when executing a plan.
- **MUST** separate confirmed implementation decisions from open questions. If a decision is open, do not assume — flag it.

### MUST NOT

- **MUST NOT** invent business logic not described in this document.
- **MUST NOT** silently change product behavior (e.g., quietly making a required field optional, or changing an error code).
- **MUST NOT** introduce a dependency not listed in Section 30, without a documented justification and product-owner approval.
- **MUST NOT** rewrite a working system without a recorded decision (DEC-xxx) approving it.
- **MUST NOT** delete functionality (endpoints, fields, features) without a Change Matrix entry (Section 16) and product-owner approval.
- **MUST NOT** commit secrets, API keys, or passwords to the repository.
- **MUST NOT** modify the database schema without updating Section 15 (Data Model), the Prisma schema, and `openapi.yaml` if the schema affects API responses.
- **MUST NOT** implement features marked as Explicitly Out of Scope in Section 06.
- **MUST NOT** treat any item in the Open Questions section (Section 34) as resolved unless explicitly decided by the product owner.
- **MUST NOT** implement Thally-specific behavior that was not confirmed in Section 20 (Integrations) — the spike results gate this.
- **MUST NOT** use `200 OK` for resource creation — use `201 Created`.
- **MUST NOT** conflate `401 Unauthenticated` and `403 Forbidden` — they have distinct meanings (Section 18).

### AMBIGUITY RULE

> If ambiguity could materially affect product behavior, architecture, security, data integrity, user experience, or the demonstration's correctness — the agent **must stop and flag the ambiguity** rather than making an assumption. Document the assumption in Section 34 (Open Questions) with a proposed resolution and wait for decision.

**Ambiguity that is safe to resolve without asking:**
- Minor formatting/presentation choices with no behavioral consequence
- Internal variable/function naming that doesn't affect the API surface
- Code style questions within the established linting rules

**Ambiguity that REQUIRES stopping:**
- Business rule interpretations
- Authorization/ownership edge cases
- Database schema changes
- API contract shape changes
- Any decision affecting the Thally demo scenarios

### PRIORITY HIERARCHY

When requirements conflict, resolve in this order:

1. Explicit product-owner written instruction
2. This PRD v3.0 (approved sections)
3. Approved architecture decisions (ARCH-001)
4. Approved design system
5. Existing working implementation
6. Agent assumptions (last resort; must be documented)

---

## 02 — PRODUCT OVERVIEW

**Product Name:** SyncFlow

**One-Line Description:** A hackathon/event management platform built as a controlled vehicle for demonstrating that product changes can be automatically traced to affected documentation.

**Product Vision:** Documentation is treated as a queryable, versioned, evidence-backed layer of the product — not a folder of Markdown that someone forgot to update.

**Problem Being Solved:** Software changes continuously; documentation does not update automatically. This creates silent drift between what a product does and what its docs claim. There is no default mechanism that traces a merged product change to the specific documentation pages it invalidates.

**Target Market:** Hackathon judges and the development team (the "real" consumers of this product are the demo audience evaluating the Track 1 documentation-synchronization story).

**Target Users (in-fiction):** Hackathon organizers, participants, judges, platform admins.

**Primary Product Goals:**
- PRD-G-001: Organizers can run a complete event lifecycle (draft → publish → ongoing → completed)
- PRD-G-002: Participants can register, form/join a team, and submit one project per team
- PRD-G-003: Judges can be assigned to submissions and record scored evaluations
- PRD-G-004: Every business rule has a stable ID and is enforced server-side
- PRD-G-005: The documentation set accurately describes the running product at every phase checkpoint

**Success Criteria:** See Section 23.

**Key Differentiators:** Not an event platform competing on features. The differentiator is the documentation synchronization story — deliberately shallow in feature breadth, deliberately deep in traceability and demo design.

**Product Principles:**
1. The product is a vehicle for the sync demo, not the deliverable.
2. Every business rule has an ID and is tested.
3. The OpenAPI spec is the contract of record — not code comments, not documentation prose.
4. Documentation staleness must be detectable, not assumed.
5. Scope discipline: cut UI polish before cutting demo fidelity.

**Non-Goals (explicitly out of scope):**
- Native mobile applications
- Payment processing or sponsorship billing
- Real-time chat or WebSocket notifications
- AI-assisted judging or scoring
- Video hosting
- Multi-event / multi-tenant support (single event per environment for MVP)
- Marketplace or social-networking features
- Building a general-purpose docs-sync engine (SyncFlow *uses* Thally; it does not reimplement it)
- Self-service account deletion
- Leader-departure/reassignment (documented as a known limitation)
- Waitlist promotion automation (waitlist status may exist; auto-promote is cut)

---

## 03 — PROBLEM DEFINITION

**Problem Statement:** Software products change continuously. An API endpoint may be renamed; a required parameter may be introduced; a business rule may change. While the software changes, documentation often remains unchanged. This creates documentation drift — what the product does diverges from what its docs claim it does.

**Current Alternatives:** Manual documentation updates (error-prone, requires human memory), CI checks on specific files (narrow scope), LLM-based doc rewriting on every commit (over-triggers, no evidence grounding).

**User Pain Points:**
- API consumers use wrong request shapes because the reference is stale
- Business-rule descriptions go stale silently with no indicator
- "No update needed" changes (internal refactors) are impossible to distinguish from real-impact changes without manual inspection

**Why Existing Solutions Are Insufficient:** Manual processes require documentation owners to remember every place a changed concept appears. Blanket-rewrite approaches produce unnecessary changes and erosion of reader trust.

**Opportunity:** A system that traces a product change to *specific evidence* (API diff, business rule change) and identifies *exactly which documentation pages* that evidence invalidates — producing a reviewable PR rather than either ignoring staleness or rewriting everything.

**Product Hypothesis:** If we build a real product with a structured documentation layer and use Thally to trace changes, we can demonstrate a working documentation-synchronization loop that is both evidence-grounded and human-reviewed.

**Expected Outcome:** Demo proves the full loop: change → evidence → affected pages → drafted PR → human review → synchronized state. At least one "no-op" case (internal refactor) proves the system does not over-trigger.

---

## 04 — USERS & PERSONAS

### P-001: Priya — The Participant

| Attribute | Detail |
|---|---|
| Role | PARTICIPANT |
| Context | Final-year CS student, discovers event via college WhatsApp, registers solo, needs to find/form a team fast |
| Goals | Register before deadline; land on a team of the right size; submit before cutoff without losing work |
| Pain points | Ambiguous team-size rules; unclear if team is "full"; deadline anxiety |
| Permissions | PARTICIPANT |
| Primary workflows | Register → create/join team → submit project → check status |
| Edge cases | Tries to register after deadline (must be blocked); tries to join a full team; tries to join two teams in same event; team leader disappears before submission (known limitation — no reassignment in MVP) |

### P-002: Raj — The Organizer

| Attribute | Detail |
|---|---|
| Role | ORGANIZER |
| Context | Event lead for a college hackathon, runs the event solo or with 1–2 co-organizers |
| Goals | Get accurate real-time counts; catch problems early; assign judges fairly |
| Pain points | Fear that a config change breaks existing registrations; no bulk communication tool (out of scope) |
| Permissions | ORGANIZER (owns created events) |
| Primary workflows | Create event → configure → publish → monitor → assign judges → view results |
| Edge cases | Edits `teamMaxSize` downward below an existing team's size (blocked — BR-011); tries to publish event missing required fields |

### P-003: Dr. Meera — The Judge

| Attribute | Detail |
|---|---|
| Role | JUDGE |
| Context | Industry mentor volunteering a few hours; logs in once, wants to move through assigned submissions quickly |
| Goals | Score fairly and quickly; leave useful feedback; not accidentally judge her own team |
| Pain points | Losing in-progress score if she navigates away; unclear rubric weighting |
| Permissions | JUDGE (assigned submissions only; no conflict with own team) |
| Primary workflows | Login → view assigned submissions → score → submit |
| Edge cases | Assigned to her own team's submission (must be prevented at assignment time — BR-007); rubric changes mid-judging (must not corrupt existing evaluations — CHANGE-005) |

### P-004: Admin — Platform Operator

| Attribute | Detail |
|---|---|
| Role | ADMIN |
| Context | Team member running the demo/environment; has full visibility for live demo |
| Goals | Fix stuck states; manage users if something goes wrong; full visibility |
| Permissions | ADMIN (superset of all roles) |
| Primary workflows | User management; event override; system activity review; role changes |

---

## 05 — ROLES & PERMISSIONS

### Roles

| Role | Description | Who assigns |
|---|---|---|
| `PARTICIPANT` | Default role for all new accounts | Automatic (BR-012) |
| `ORGANIZER` | Can create and manage events | ADMIN only |
| `JUDGE` | Can evaluate assigned submissions | ADMIN only |
| `ADMIN` | Full platform access | Pre-seeded or ADMIN-elevated |

### Permission Matrix

| Action | PARTICIPANT | ORGANIZER (owner) | ORGANIZER (non-owner) | JUDGE (assigned) | ADMIN |
|---|---|---|---|---|---|
| View published event | ✓ | ✓ | ✓ | ✓ | ✓ |
| View DRAFT event | ✗ | ✓ | ✗ | ✗ | ✓ |
| Create event | ✗ | ✓ | ✓ | ✗ | ✓ |
| Update event | ✗ | ✓ (own) | ✗ | ✗ | ✓ |
| Publish event | ✗ | ✓ (own) | ✗ | ✗ | ✓ |
| Register self for event | ✓ | ✗ | ✗ | ✗ | ✓ |
| View registrations list | ✗ | ✓ (own event) | ✗ | ✗ | ✓ |
| Create team | ✓ (if registered) | ✗ | ✗ | ✗ | ✓ |
| Join team | ✓ (if registered, not on team) | ✗ | ✗ | ✗ | ✓ |
| Remove team member | Leader only | ✓ (own event) | ✗ | ✗ | ✓ |
| Create/update submission | Leader only | ✗ | ✗ | ✗ | ✓ |
| View own team submission | ✓ (own team) | ✓ (own event) | ✗ | Assigned only | ✓ |
| Finalize (submit) submission | Leader only | ✗ | ✗ | ✗ | ✓ |
| Assign judge to submission | ✗ | ✓ (own event) | ✗ | ✗ | ✓ |
| Score submission | ✗ | ✗ | ✗ | Assigned, non-conflicted | ✓ |
| Change user role | ✗ | ✗ | ✗ | ✗ | ✓ |
| Deactivate user | ✗ | ✗ | ✗ | ✗ | ✓ |

### Authorization Rules

- **Ownership for Event:** `Event.organizerId == caller.id` OR `caller.role == ADMIN`
- **Unauthenticated on protected route:** `401 UNAUTHENTICATED`
- **Authenticated but wrong role/ownership:** `403 FORBIDDEN`
- **403 vs 404 tradeoff (SEC-008):** Returning `403` instead of `404` for resources the caller cannot access leaks resource existence. This is an accepted tradeoff for MVP simplicity. Document it; do not treat it as a bug unless security review specifically flags it.
- **Role changes:** Only ADMIN can change a user's role via `PATCH /users/{userId}/role`.
- **Self-role escalation:** A user cannot self-assign a higher role (BR-012). Server ignores any `role` field in the registration request body.

---

## 06 — PRODUCT SCOPE

### MVP (P0 — Must Have)

These must exist for a functional demo:

- Authentication (register, login, session, role)
- Event management (create, publish, update, status lifecycle)
- Registration (register, deadline enforcement)
- Team management (create, join, capacity, one-per-event)
- Submission management (create DRAFT, update, finalize, deadline enforcement)
- Judging (assign judge, score, conflict-of-interest check)
- `openapi.yaml` as the contract of record
- Baseline documentation (DOC-001 through DOC-010)
- Thally connected and working on at least one real merged change
- CHANGE-001, CHANGE-002, CHANGE-011 implemented as real commits

### V1 / Should-Have (P1)

- CHANGE-003, CHANGE-005, CHANGE-006 as additional demo depth
- Waitlist registration status (CHANGE-007) as a feature-addition demo
- Migration guides (DOC-011) for breaking changes
- Rate limiting (BR-013) as a real implementation

### Nice-to-Have / Future (P2–P3)

- CHANGE-004, CHANGE-008, CHANGE-009, CHANGE-010 matrix entries
- Admin UI beyond minimal role-change endpoint (UI-011)
- Organizer announcement feature
- Observability dashboard beyond CLI tail

### Explicitly Out of Scope

See Non-Goals in Section 02. The agent must not implement any of these without a recorded product-owner decision.

**Priority Definitions:**
- **P0 — Critical:** Required for MVP; blocks demo without it
- **P1 — High:** Strong demo value; implement if on schedule
- **P2 — Medium:** Nice to have; implement only if ahead
- **P3 — Future:** Not in scope for hackathon

---

## 07 — FEATURE MASTER LIST

| Feature ID | Name | Priority | Status | Dependencies |
|---|---|---|---|---|
| AUTH-001 | Register Account | P0 | Planned | None |
| AUTH-002 | Login | P0 | Planned | AUTH-001 |
| AUTH-003 | Session Management | P0 | Planned | AUTH-001 |
| AUTH-004 | Role Assignment | P0 | Planned | AUTH-001 |
| EVENT-001 | Create Event | P0 | Planned | AUTH-002 |
| EVENT-002 | Publish Event | P0 | Planned | EVENT-001 |
| EVENT-003 | Update Event | P0 | Planned | EVENT-001 |
| EVENT-004 | Event Status Lifecycle | P0 | Planned | EVENT-001 |
| EVENT-005 | List / View Events | P0 | Planned | None |
| REG-001 | Register for Event | P0 | Planned | EVENT-002, AUTH-002 |
| REG-002 | Deadline Enforcement | P0 | Planned | REG-001 |
| REG-003 | Duplicate Prevention | P0 | Planned | REG-001 |
| TEAM-001 | Create Team | P0 | Planned | REG-001 |
| TEAM-002 | Join Team | P0 | Planned | REG-001 |
| TEAM-003 | Team Capacity Enforcement | P0 | Planned | TEAM-001 |
| TEAM-004 | One Team Per Event | P0 | Planned | TEAM-001 |
| TEAM-005 | Team Leader | P0 | Planned | TEAM-001 |
| TEAM-006 | Remove Team Member | P1 | Planned | TEAM-001 |
| SUB-001 | Create Draft Submission | P0 | Planned | TEAM-001 |
| SUB-002 | Submission Deadline | P0 | Planned | SUB-001 |
| SUB-003 | One Submission Per Team | P0 | Planned | SUB-001 |
| SUB-004 | Update Submission | P0 | Planned | SUB-001 |
| SUB-005 | Finalize Submission | P0 | Planned | SUB-001 |
| JUDGE-001 | Assign Judge | P0 | Planned | SUB-005, AUTH-004 |
| JUDGE-002 | Score Submission | P0 | Planned | JUDGE-001 |
| JUDGE-003 | Written Feedback | P0 | Planned | JUDGE-001 |
| JUDGE-004 | Conflict of Interest | P0 | Planned | JUDGE-001 |
| ADMIN-001 | User Management | P0 | Planned | AUTH-004 |
| ADMIN-002 | User Deactivation | P1 | Planned | ADMIN-001 |
| DOC-SYNC-001 | OpenAPI Contract of Record | P0 | Planned | All API features |
| DOC-SYNC-002 | Baseline Documentation | P0 | Planned | DOC-SYNC-001 |
| DOC-SYNC-003 | Thally Integration | P0 | Planned | DOC-SYNC-002, Q-003 |
| CHANGE-001 | Team Size Change Demo | P0 | Planned | Full MVP |
| CHANGE-002 | Endpoint Rename Demo | P0 | Planned | Full MVP |
| CHANGE-011 | Internal Refactor No-op Demo | P0 | Planned | Full MVP |

---

## 08 — DETAILED FEATURE REQUIREMENTS

### AUTH-001 — Register Account

**Objective:** Allow a new visitor to create a SyncFlow identity.

**User:** Anonymous visitor

**Preconditions:** No existing account with the given email address (case-insensitive).

**Trigger:** Visitor submits registration form.

**Main Flow:**
1. Visitor submits `{ name, email, password }`
2. Server trims and lowercases email before uniqueness check
3. Server validates all fields (see Validation below)
4. Server hashes password using bcrypt (cost 10–12) or argon2id
5. Server creates User row with `role = PARTICIPANT`
6. Server issues a session token
7. Server returns `{ user: { id, name, email, role, createdAt }, token }`

**Failure Flows:**
- Email already registered (any case) → `409 DUPLICATE_EMAIL`
- Missing or invalid fields → `422 VALIDATION_FAILED` with per-field error messages
- Password below policy → `422 VALIDATION_FAILED` (field: `password`)

**Validation:**
- `name`: required, 1–120 chars after trimming
- `email`: required, RFC 5322 subset, lowercased before uniqueness check
- `password`: required, minimum 8 characters

**Permissions:** Public (unauthenticated) endpoint.

**Business Rules:** BR-012 (new accounts always PARTICIPANT), SEC-001 (password never stored plaintext).

**Data Created:** User row.

**Edge Cases:**
- `FOO@EXAMPLE.COM` and `foo@example.com` are treated as the same email
- Leading/trailing whitespace stripped from name and email before processing
- `role` field in request body is silently ignored (cannot self-assign a higher role)

**Security:** passwordHash must never appear in any API response or log line.

**Acceptance Criteria:**
- AC-AUTH-001-1: Given unique email + valid password, when registering, a User is created with role=PARTICIPANT and a session is issued. Response is 201.
- AC-AUTH-001-2: Given an email matching an existing account (any case), when registering, response is 409 DUPLICATE_EMAIL and no row is created.
- AC-AUTH-001-3: Given a password under 8 chars, response is 422 and no row is created.
- AC-AUTH-001-4: Given `role: "ADMIN"` in the request body, the created user still has role=PARTICIPANT.
- AC-AUTH-001-5: `passwordHash` does not appear in the 201 response.

---

### AUTH-002 — Login

**Objective:** Authenticate a returning user.

**User:** Registered, unauthenticated visitor.

**Preconditions:** Account exists and is active (`isActive = true`).

**Main Flow:**
1. Visitor submits `{ email, password }`
2. Server lowercases email, looks up user
3. Server verifies password against stored hash
4. On success: issues session token; returns `{ user, token }`

**Failure Flows:**
- Wrong password OR unknown email → `401 INVALID_CREDENTIALS` (identical message for both, to prevent user enumeration)
- 6th failed attempt within 15 minutes for same (email, IP) pair → `429 RATE_LIMITED` (BR-013)
- Account deactivated → `401 ACCOUNT_INACTIVE`

**Business Rules:** BR-013 (rate limiting).

**Acceptance Criteria:**
- AC-AUTH-002-1: Correct credentials → 200 + session token
- AC-AUTH-002-2: Wrong password → 401; message does not reveal whether the email exists
- AC-AUTH-002-3: Unknown email → 401; same message as wrong password
- AC-AUTH-002-4: 6th failed attempt within 15 min → 429 RATE_LIMITED regardless of correctness
- AC-AUTH-002-5: Deactivated account login attempt → 401 ACCOUNT_INACTIVE

---

### AUTH-003 — Session Management

**Objective:** Maintain authenticated state across requests.

**Decision Required:** [Q-004] Server sessions vs. JWT+refresh. **Recommended:** server-side sessions (simpler, revocable, faster to build correctly for hackathon scope).

**Behavior (assuming server sessions):**
- Session expiry: 7 days
- Session refreshed on activity
- `GET /auth/me` returns current user from valid session
- `POST /auth/logout` invalidates the session server-side
- Expired/invalid session on a protected route → `401 SESSION_EXPIRED`

**Acceptance Criteria:**
- AC-AUTH-003-1: Valid session → 200 on GET /auth/me
- AC-AUTH-003-2: Expired session → 401 SESSION_EXPIRED
- AC-AUTH-003-3: POST /auth/logout invalidates session; subsequent request with that token → 401

---

### AUTH-004 — Role Assignment

**Objective:** Allow ADMIN to change another user's role.

**Endpoint:** `PATCH /users/{userId}/role`

**Permissions:** ADMIN only.

**Request:** `{ role: "ORGANIZER" | "JUDGE" | "PARTICIPANT" | "ADMIN" }`

**Business Rules:** BR-012 (self-escalation prevented; endpoint is ADMIN-only so this is enforced by auth check).

**Acceptance Criteria:**
- AC-AUTH-004-1: ADMIN changes a user's role → 200, role updated
- AC-AUTH-004-2: Non-ADMIN attempts role change → 403 FORBIDDEN
- AC-AUTH-004-3: ADMIN sets role to an invalid value → 422 INVALID_ROLE

---

### EVENT-001 — Create Event

**Objective:** Let an organizer define a new event.

**User:** ORGANIZER, ADMIN

**Preconditions:** Authenticated as ORGANIZER or ADMIN.

**Main Flow:**
1. Submit event fields
2. Validate all required fields and date logic
3. Create Event row with `status = DRAFT`, `organizerId = caller.id`
4. Return created event

**Required Fields:**
- `name` (varchar 1–200)
- `slug` (matches `^[a-z0-9-]{3,60}$`, globally unique)
- `description` (text, optional)
- `startDate` (ISO-8601)
- `endDate` (ISO-8601, must be ≥ startDate)
- `registrationDeadline` (ISO-8601, must be ≤ submissionDeadline)
- `teamMinSize` (int ≥1, default 2)
- `teamMaxSize` (int ≥ teamMinSize, default 4)
- `submissionDeadline` (ISO-8601, must be ≤ endDate)

**Failure Flows:**
- `registrationDeadline > submissionDeadline` → `422 INVALID_DATE_RANGE`
- `submissionDeadline > endDate` → `422 INVALID_DATE_RANGE`
- `teamMinSize > teamMaxSize` → `422 INVALID_TEAM_SIZE_RANGE`
- `slug` not unique → `409 SLUG_TAKEN`
- Missing required field → `422 VALIDATION_FAILED`

**Business Rules:** BR-014 (events always start DRAFT).

**Acceptance Criteria:**
- AC-EVENT-001-1: Valid payload → 201, status=DRAFT, organizerId set to caller
- AC-EVENT-001-2: registrationDeadline > submissionDeadline → 422 INVALID_DATE_RANGE, no row created
- AC-EVENT-001-3: Duplicate slug → 409 SLUG_TAKEN
- AC-EVENT-001-4: teamMinSize > teamMaxSize → 422 INVALID_TEAM_SIZE_RANGE
- AC-EVENT-001-5: PARTICIPANT calling this endpoint → 403 FORBIDDEN

---

### EVENT-002 — Publish Event

**Objective:** Transition a DRAFT event to PUBLISHED so registrations can open.

**User:** ORGANIZER (owner), ADMIN

**Preconditions:** Event status = DRAFT; caller is owner or ADMIN.

**Main Flow:**
1. Organizer triggers publish
2. Server validates all required fields are present and date logic is still valid
3. Status transitions to PUBLISHED

**Failure Flows:**
- Event incomplete (missing required fields) → `422 EVENT_INCOMPLETE`
- Event already PUBLISHED → `409 ALREADY_PUBLISHED`
- Caller is not owner and not ADMIN → `403 FORBIDDEN`
- Event is CANCELLED → `409 INVALID_TRANSITION`

**Business Rules:** BR-009 (only PUBLISHED events accept registrations).

**Acceptance Criteria:**
- AC-EVENT-002-1: Complete DRAFT event by owner → publish succeeds, status PUBLISHED
- AC-EVENT-002-2: Publishing already-PUBLISHED event → 409 ALREADY_PUBLISHED
- AC-EVENT-002-3: Non-owner ORGANIZER → 403 FORBIDDEN
- AC-EVENT-002-4: Registration attempt against DRAFT event → 403 EVENT_NOT_PUBLISHED

---

### EVENT-003 — Update Event

**Objective:** Allow organizer to modify event configuration.

**Restrictions:**
- `teamMaxSize` cannot be lowered below the size of any existing team in that event (BR-011)
- Date changes that would retroactively invalidate existing registrations should be validated (e.g., setting registrationDeadline to a past time when registrations exist)
- Fields that can be updated vary by event status (OPEN QUESTION — [Q-005])

**Failure Flows:**
- `teamMaxSize` lowered below an existing team's size → `409 TEAM_SIZE_CONFLICT`
- Caller is not owner → `403 FORBIDDEN`
- CANCELLED event → `403 EVENT_CANCELLED`

**Business Rules:** BR-011.

**Acceptance Criteria:**
- AC-EVENT-003-1: Valid update → 200
- AC-EVENT-003-2: teamMaxSize lowered below an existing team's member count → 409 TEAM_SIZE_CONFLICT, no update applied
- AC-EVENT-003-3: Non-owner calling update → 403

---

### REG-001 — Register for Event

**Objective:** Allow an authenticated participant to register for a published event.

**User:** PARTICIPANT (authenticated)

**Preconditions:** Event is PUBLISHED; current time < registrationDeadline; no existing CONFIRMED registration for this user/event.

**Main Flow:**
1. Authenticated participant requests registration
2. Server checks event status = PUBLISHED (BR-009)
3. Server checks current time < registrationDeadline (BR-004)
4. Server checks no duplicate registration (REG-003)
5. Creates Registration with status=CONFIRMED

**Failure Flows:**
- Event not PUBLISHED → `403 EVENT_NOT_PUBLISHED`
- Past registrationDeadline → `403 REGISTRATION_CLOSED`
- Already registered → `409 DUPLICATE_REGISTRATION`
- Event CANCELLED → `403 EVENT_CANCELLED`

**Business Rules:** BR-004, BR-009.

**Acceptance Criteria:**
- AC-REG-001-1: Valid, on-time registration → 201 CONFIRMED
- AC-REG-001-2: Second attempt by same user/event → 409 DUPLICATE_REGISTRATION; only one row exists
- AC-REG-001-3: Attempt one second after deadline → 403 REGISTRATION_CLOSED
- AC-REG-001-4: Event status = DRAFT → 403 EVENT_NOT_PUBLISHED

---

### TEAM-001 — Create Team

**Objective:** Allow a registered participant to create a team in an event.

**User:** PARTICIPANT (must be registered for event)

**Preconditions:** Caller has CONFIRMED Registration for the event; caller is not already on a team for this event.

**Main Flow:**
1. Caller submits `{ name }` under `POST /events/{eventId}/teams`
2. Server verifies caller has CONFIRMED Registration for eventId
3. Server verifies caller is not already in a team for this event
4. Creates Team with `leaderId = caller.id`, `state = FORMING`
5. Creates TeamMember row for the leader
6. Returns created team

**Failure Flows:**
- Caller not registered → `403 NOT_REGISTERED`
- Caller already on a team → `409 ALREADY_IN_TEAM`
- Team name already taken in this event → `409 TEAM_NAME_TAKEN`

**Business Rules:** BR-002, BR-015 (team name unique per event — implied, not previously numbered; see [Q-006]).

**Acceptance Criteria:**
- AC-TEAM-001-1: Registered participant with no team → team created, leader set to caller, state=FORMING
- AC-TEAM-001-2: Unregistered user → 403 NOT_REGISTERED
- AC-TEAM-001-3: Already-in-team participant → 409 ALREADY_IN_TEAM

---

### TEAM-002 — Join Team

**Objective:** Allow a registered participant to join an existing team.

**User:** PARTICIPANT (must be registered for the same event as the team)

**Preconditions:** Caller has CONFIRMED Registration; caller is not on another team for this event; target team is in state FORMING; team is below `teamMaxSize`.

**Main Flow:** 
1. Caller POSTs to `POST /teams/{teamId}/members`
2. Server verifies caller is registered for the team's event
3. Server verifies caller is not already on a team in this event
4. Server verifies team state = FORMING (BR from TEAM lock rule)
5. Server counts existing members; verifies count < teamMaxSize
6. Creates TeamMember row

**Failure Flows:**
- Caller not registered for the event → `403 NOT_REGISTERED`
- Caller already on a team in this event → `409 ALREADY_IN_TEAM`
- Team at capacity → `409 TEAM_FULL`
- Team is LOCKED → `409 TEAM_LOCKED`

**Business Rules:** BR-001, BR-002.

**Acceptance Criteria:**
- AC-TEAM-002-1: Valid join at teamMaxSize-1 members → succeeds, count becomes teamMaxSize
- AC-TEAM-002-2: Team already at teamMaxSize → 409 TEAM_FULL
- AC-TEAM-002-3: User on Team A in Event X attempts to join Team B in Event X → 409 ALREADY_IN_TEAM
- AC-TEAM-002-4: Same user joining a team in a *different* event → succeeds (BR-002 is per-event)
- AC-TEAM-002-5: Team state = LOCKED → 409 TEAM_LOCKED

---

### SUB-001 — Create Draft Submission

**Objective:** Allow team leader to create a draft submission.

**User:** Team leader only.

**Preconditions:** Team exists; caller is team leader; team has no existing submission; current time < submissionDeadline.

**Main Flow:**
1. Team leader POSTs to `POST /teams/{teamId}/submission`
2. Server verifies caller is team leader (BR-003)
3. Server verifies no existing submission for this team (BR-006)
4. Server verifies current time < submissionDeadline (BR-005)
5. Creates Submission with status=DRAFT

**Required Fields:** `projectName`, `description`, `repositoryUrl` (valid URL). `demoUrl` optional.

**Failure Flows:**
- Caller is not team leader → `403 FORBIDDEN`
- Team already has a submission → `409 ALREADY_SUBMITTED`
- Past submissionDeadline → `403 SUBMISSION_CLOSED`

**Business Rules:** BR-003, BR-005, BR-006.

**Acceptance Criteria:**
- AC-SUB-001-1: Team leader creates first submission before deadline → 201, status=DRAFT
- AC-SUB-001-2: Non-leader team member attempts to create → 403 FORBIDDEN
- AC-SUB-001-3: Second submission attempt for same team → 409 ALREADY_SUBMITTED
- AC-SUB-001-4: Create attempt after deadline → 403 SUBMISSION_CLOSED

---

### SUB-005 — Finalize Submission (DRAFT → SUBMITTED)

**Objective:** Allow team leader to lock in their submission.

**User:** Team leader only.

**Preconditions:** Submission exists in DRAFT; current time < submissionDeadline; all required fields populated.

**Main Flow:**
1. Leader POSTs to `POST /submissions/{submissionId}/submit`
2. Server verifies caller is leader
3. Server verifies status = DRAFT
4. Server verifies all required fields present and valid
5. Server verifies current time < submissionDeadline
6. Transitions status to SUBMITTED, sets submittedAt = now()
7. Locks the associated team (Team.state → LOCKED)

**Failure Flows:**
- Not leader → `403 FORBIDDEN`
- Already SUBMITTED → `409 ALREADY_SUBMITTED`
- Past deadline → `403 SUBMISSION_CLOSED`
- Required field missing → `422 VALIDATION_FAILED`

**Acceptance Criteria:**
- AC-SUB-005-1: Valid finalization before deadline → 200, status=SUBMITTED, team state=LOCKED
- AC-SUB-005-2: After deadline → 403 SUBMISSION_CLOSED, status unchanged
- AC-SUB-005-3: Already SUBMITTED → 409 ALREADY_SUBMITTED

---

### JUDGE-001 — Assign Judge

**Objective:** Allow organizer to assign a judge to a submission.

**User:** ORGANIZER (event owner), ADMIN.

**Preconditions:** Submission is SUBMITTED or later; user being assigned has role=JUDGE; no conflict of interest.

**Main Flow:**
1. Organizer POSTs to `POST /submissions/{submissionId}/assignments`
2. Server verifies caller is event owner or ADMIN
3. Server verifies target user has role=JUDGE
4. Server checks conflict of interest: judge must not be a TeamMember of the submission's team (BR-007)
5. Creates JudgeAssignment row
6. If this is the first assignment, transitions Submission status to UNDER_REVIEW

**Failure Flows:**
- Judge is a team member → `409 JUDGE_CONFLICT`
- Target user is not a JUDGE → `422 INVALID_JUDGE_ROLE`
- Already assigned → `409 ALREADY_ASSIGNED`
- Caller not event owner → `403 FORBIDDEN`

**Business Rules:** BR-007, BR-008.

**Acceptance Criteria:**
- AC-JUDGE-001-1: Assigning a judge to a submission from a team they do not belong to → 201, JudgeAssignment created
- AC-JUDGE-001-2: Assigning a judge to a submission from their own team → 409 JUDGE_CONFLICT, no assignment created
- AC-JUDGE-001-3: Assigning the same judge twice to same submission → 409 ALREADY_ASSIGNED

---

### JUDGE-002 — Score Submission

**Objective:** Allow an assigned judge to score a submission.

**User:** JUDGE (assigned, no conflict of interest).

**Preconditions:** JudgeAssignment exists for this judge and submission; no existing Evaluation for this (judge, submission) pair.

**Required Fields:**
- `innovationScore` (int 0–10)
- `technicalScore` (int 0–10)
- `designScore` (int 0–10)
- `impactScore` (int 0–10)
- `feedback` (text, optional, max 2000 chars)

**[CHANGE-005 NOTE]:** Score ranges may change from 10-point to 20-point scales per CHANGE-005 demo scenario. See Section 16.

**Failure Flows:**
- Judge not assigned → `403 FORBIDDEN`
- Score out of range → `422 INVALID_SCORE`
- Already evaluated → `409 ALREADY_EVALUATED`

**Business Rules:** BR-007 (conflict-of-interest check enforced at assignment time, not score time — assignment should never exist if conflict existed).

**Immutability:** Evaluation is immutable after creation (no PATCH in MVP). Known limitation — documented in Q-007.

**Acceptance Criteria:**
- AC-JUDGE-002-1: Assigned judge submits valid scores → 201, Evaluation created
- AC-JUDGE-002-2: Non-assigned judge attempts → 403 FORBIDDEN
- AC-JUDGE-002-3: Score > 10 → 422 INVALID_SCORE
- AC-JUDGE-002-4: Second evaluation from same judge for same submission → 409 ALREADY_EVALUATED
- AC-JUDGE-002-5: All assigned judges evaluate → submission transitions to EVALUATED

---

## 09 — USER FLOWS

### Participant Complete Journey (UI-003 → UI-002 → UI-004 → UI-005)

```
[Anonymous]
    │
    ▼
Register (AUTH-001) / Login (AUTH-002)
    │
    ▼
Browse Events (EVENT-005) [UI-001]
    │
    ▼
View Event Detail [UI-002]
    │
    ▼
Register for Event (REG-001) [UI-002 CTA]
    │
    ├── FAIL: registration_closed → show error, redirect to event page
    ├── FAIL: event_not_published → should not be reachable (event not listed)
    │
    ▼
Team Dashboard [UI-004]
    │
    ├── Create Team (TEAM-001)
    │       └── FAIL: already_in_team → show error
    │
    └── Join Team (TEAM-002)
            ├── FAIL: team_full → show error + list of other teams
            └── FAIL: already_in_team → show error
    │
    ▼
Submission Form [UI-005] (leader only — non-leader sees read-only view [UI-006])
    │
    ├── Save Draft (SUB-004) [autosave or manual]
    ├── FAIL: submission_closed → show banner; form becomes read-only
    │
    └── Finalize/Submit (SUB-005)
            └── FAIL: validation errors → inline field errors
    │
    ▼
Submission Status [UI-006] — SUBMITTED state, read-only
```

### Organizer Journey

```
Login (AUTH-002)
    │
    ▼
Create Event (EVENT-001) [UI-007]
    │
    ▼
Configure Event [UI-007]
    │
    ▼
Publish Event (EVENT-002)
    │
    ├── FAIL: event_incomplete → highlight missing fields
    │
    ▼
Monitor Dashboard [UI-008]
(counts: registrations, teams, submissions, evaluations)
    │
    ▼
Assign Judges (JUDGE-001) [UI-008]
    │
    ├── FAIL: judge_conflict → show who the judge's team is
    │
    ▼
View Results [UI-008]
```

### Judge Journey

```
Login (AUTH-002)
    │
    ▼
Assignment List [UI-009]
(only submissions assigned to this judge)
    │
    ▼
Open Submission [UI-009 → UI-010]
    │
    ▼
Score + Feedback [UI-010]
    │
    ▼
Submit Evaluation (JUDGE-002)
    │
    └── FAIL: already_evaluated → read-only view of submitted scores
```

---

## 10 — INFORMATION ARCHITECTURE

```
/ (public)
├── /events                    [UI-001] Event list
├── /events/{slug}             [UI-002] Event detail + registration CTA
├── /register                  [UI-003] Account creation
├── /login                     [UI-003] Login

/dashboard (authenticated)
├── /dashboard/events/{eventId}/team     [UI-004] Team management
├── /dashboard/events/{eventId}/submit   [UI-005] Submission form (leader)
├── /dashboard/events/{eventId}/status   [UI-006] Submission status (non-leader)

/organizer (ORGANIZER + ADMIN)
├── /organizer/events/new       [UI-007] Create event
├── /organizer/events/{id}      [UI-007] Edit event
├── /organizer/events/{id}/dashboard  [UI-008] Organizer dashboard

/judge (JUDGE + ADMIN)
├── /judge/assignments          [UI-009] Assignment list
├── /judge/submissions/{id}     [UI-010] Scoring form

/admin (ADMIN only)
├── /admin/users                [UI-011] User management
```

---

## 11 — SCREEN / UI SPECIFICATIONS

### SCREEN Inventory

| Screen ID | Name | Role | Entry | Purpose |
|---|---|---|---|---|
| UI-001 | Event List | Public | Root / nav | Browse published events |
| UI-002 | Event Detail | Public / PARTICIPANT | UI-001 | View event info; register |
| UI-003 | Auth (Register / Login) | Anonymous | Nav / redirect | Account creation and auth |
| UI-004 | Team Dashboard | PARTICIPANT (registered) | Dashboard nav | View/create/join team, see members |
| UI-005 | Submission Form | Team leader | UI-004 | Create/edit/submit project |
| UI-006 | Submission Status | Non-leader PARTICIPANT | UI-004 | Read-only view of submission |
| UI-007 | Event Create/Edit | ORGANIZER, ADMIN | Organizer nav | Configure event fields |
| UI-008 | Organizer Dashboard | ORGANIZER (owner), ADMIN | Organizer nav | Counts, judge assignment, results |
| UI-009 | Judge Assignment List | JUDGE, ADMIN | Judge nav | Submissions assigned to this judge |
| UI-010 | Judge Scoring Form | JUDGE (assigned), ADMIN | UI-009 | Rubric input + feedback |
| UI-011 | Admin User Management | ADMIN | Admin nav | Role changes, deactivation |

### UI-005 — Submission Form (Full Detail)

- **Purpose:** Team leader creates/edits a DRAFT submission and finalizes it.
- **User:** Authenticated team leader
- **Entry:** Team dashboard → "Submission" tab
- **Components:** projectName field, description textarea, repositoryUrl field, demoUrl field (optional), "Save Draft" button, "Submit" button (disabled until all required fields valid AND before deadline)
- **Data displayed:** Current draft content; deadline countdown; current status badge
- **Actions:** Save draft (`PATCH /submissions/{id}`); finalize (`POST /submissions/{id}/submit`)
- **Loading state:** Skeleton form while fetching existing draft
- **Empty state:** No submission yet → blank form; "Save Draft" only visible
- **Error state:** Inline field errors from 422 responses; toast notification for 403 SUBMISSION_CLOSED
- **Success state:** Confirmation banner + status badge flips to SUBMITTED; form becomes read-only
- **Permission:** Non-leader team members see UI-006 (read-only); enforced by both routing and API 403 response
- **Responsive:** Single-column form on mobile; deadline countdown visible at all times (sticky) given deadline anxiety in Priya's persona

---

## 12 — DESIGN SYSTEM

> [!NOTE]
> The design system is **not yet approved**. The items below are recommendations derived from the project's philosophy of clear, functional tooling for developers. No visual designs have been approved.

### Recommended Design Principles

- **Functional over decorative:** The product is a developer/organizer tool, not a consumer app. Clarity of information takes precedence over visual flair.
- **Deadline visibility:** Any screen where a deadline is relevant must show it prominently. This is a UX requirement, not just a preference (Priya's pain point — Section 04).
- **Status transparency:** Entity states (DRAFT, PUBLISHED, SUBMITTED, etc.) must always be visible to the relevant user.

### Recommended Technology

- **Framework:** Next.js with TypeScript
- **Styling:** Tailwind CSS (consistent with v1.0/v2.0 recommendations)
- **Components:** [Q-008] — custom components vs. a component library not yet decided

### Responsive Breakpoints (Recommended)

| Breakpoint | Width |
|---|---|
| Mobile | < 768px |
| Tablet | 768px – 1024px |
| Desktop | > 1024px |

### Accessibility Requirements

- WCAG 2.1 AA compliance, best-effort
- Semantic HTML throughout
- Keyboard navigation for all interactive elements
- Visible focus states (not just outline: none)
- Color contrast ≥ 4.5:1 for body text; ≥ 3:1 for large text
- All form inputs have associated `<label>` elements
- Error messages linked to their field via `aria-describedby`
- Validation errors announced to screen readers (role="alert" or aria-live)

> [!IMPORTANT]
> **Design system is a PROPOSED section.** Visual decisions (color palette, typography, specific component library) have NOT been approved. The agent must not implement a specific aesthetic without product-owner approval. Implement functional behavior first; style second.

---

## 13 — SYSTEM ARCHITECTURE

> [!IMPORTANT]
> Architecture decisions in this section are **RECOMMENDED**, not approved, except where explicitly marked **[APPROVED]**. Architecture Decision Records should be captured in ARCH-001 (not yet created).

### Recommended Frontend Architecture

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State management:** [Q-009] — React Query / TanStack Query for server state; local component state for UI state
- **API layer:** Typed fetch wrapper against `/api/v1`

### Recommended Backend Architecture

- **Option A:** Next.js API Routes (single deployment, simpler for hackathon)
- **Option B:** Separate Express/Fastify service (`apps/api/`)
- **Decision needed:** [Q-010] — See Open Questions

### Database

- **Recommended:** PostgreSQL
- **ORM:** Prisma (type-safe, migration support, good Next.js integration)

### Authentication

- **Recommended:** Server-side session store (database-backed session table)
- **Decision needed:** [Q-004] (server session vs. JWT+refresh)

### External Services

- **Thally:** Documentation synchronization (see Section 20)
- No other external services in MVP

### Background Jobs

- **Event status transitions (PUBLISHED→ONGOING→COMPLETED):** [Q-011] Real scheduler (cron) vs. computed-on-read
- **Recommended:** Computed-on-read for hackathon scope — transition is computed based on `now()` vs. `startDate`/`endDate` when the event is fetched or written

### Logging

- **Format:** Structured JSON
- **Required fields per write operation:** `actorId`, `action`, `resourceType`, `resourceId`, `result` (success/error code), `timestamp`
- **PII policy:** email and name must NOT appear in log lines; only `userId` is permitted

### Deployment

- **Target:** Single environment (staging = production for demo purposes — explicitly documented as a hackathon simplification)
- **Configuration:** Environment variables only; `.env.example` committed, `.env` gitignored

---

## 14 — CODEBASE ARCHITECTURE

### Recommended Repository Structure

```text
syncflow/
├── apps/
│   ├── web/              # Next.js frontend (UI-001 through UI-011)
│   └── api/              # API layer (Next.js API routes OR separate service — see Q-010)
│
├── packages/
│   ├── database/         # Prisma schema + migrations
│   ├── validation/       # Shared Zod schemas (used by both api and web)
│   └── types/            # Shared TypeScript types generated from Prisma + OpenAPI
│
├── docs/                 # Thally-published documentation (DOC-001 through DOC-010)
│   ├── getting-started.md         (DOC-001)
│   ├── authentication.md          (DOC-002)
│   ├── architecture.md            (DOC-012)
│   ├── guides/
│   │   ├── creating-events.md     (DOC-003)
│   │   ├── registering.md         (DOC-004)
│   │   ├── teams.md               (DOC-005)
│   │   ├── submissions.md         (DOC-006)
│   │   └── judging.md             (DOC-007)
│   ├── api/                       (DOC-008 — generated from openapi.yaml)
│   ├── examples/
│   │   ├── registration.md
│   │   ├── team-creation.md
│   │   └── submission.md
│   ├── faq.md                     (DOC-009)
│   ├── changelog.md               (DOC-010)
│   └── migrations/                (DOC-011)
│
├── openapi/
│   └── openapi.yaml              # Contract of record for the entire API
│
├── prd/
│   └── syncflow-ssot-prd-v3.md  # This document
│
├── tests/
│   ├── unit/                    # BR-xxx business rule tests (isolated, no HTTP)
│   ├── integration/             # Full flow tests (Registration → Team → Submission)
│   ├── e2e/                     # Playwright browser tests
│   └── contract/                # OpenAPI contract tests (Schemathesis or Dredd)
│
├── .github/
│   └── workflows/               # CI: tests + contract checks
│
├── README.md
├── CHANGELOG.md
└── package.json (workspace root)
```

### Module Boundaries

| Module | Purpose | What belongs here | What does NOT belong here |
|---|---|---|---|
| `packages/database` | Prisma schema, migrations, client singleton | Schema definitions, migrations, seed scripts | Business logic, HTTP handlers |
| `packages/validation` | Shared Zod schemas for request/response validation | Input schemas that match the OpenAPI spec | Database models, business logic |
| `packages/types` | Shared TypeScript types | Generated types from Prisma, OpenAPI types | Business logic, DB queries |
| `apps/api` (or routes) | HTTP layer — routes, controllers, middleware | Route handlers, auth middleware, response formatting | Direct DB queries (use service layer), UI logic |
| Service layer | Business logic enforcement | BR-xxx rule enforcement, state transitions | HTTP concerns, database queries |
| Repository layer | Database access | Prisma queries, data mapping | Business logic, HTTP concerns |
| `apps/web` | Next.js UI | Pages, components, hooks, API client | Business logic (should call API, not DB directly) |

### Architectural Rules

1. **Business rules live in the service layer**, not in route handlers or Prisma hooks.
2. **The OpenAPI spec is the contract** — if the spec says a field is required, the validation schema enforces it; if code adds a required field not in the spec, the spec must be updated.
3. **Dependency direction:** `web` → `api` → `service` → `repository` → `database`. No reverse dependencies.
4. **Shared packages** may be consumed by both `web` and `api`; they must not import from either.
5. **Error codes** in API responses must match exactly the error codes in `openapi.yaml`.
6. **State transitions** must be the only place where entity `status`/`state` fields change — never update them directly from a route handler without going through the state machine logic.

### Naming Conventions

- TypeScript: camelCase for variables/functions, PascalCase for classes/types/interfaces, SCREAMING_SNAKE_CASE for constants
- Files: kebab-case for all files
- Database: snake_case for all column names (Prisma `@map` to camelCase in TypeScript)
- API error codes: SCREAMING_SNAKE_CASE (e.g., `TEAM_FULL`, `DUPLICATE_EMAIL`)
- Feature IDs in test names: `describe('AUTH-001')`, `it('AC-AUTH-001-1: ...')`

---

## 15 — DATABASE & DATA MODEL

### Entity Summary

| Entity | Purpose |
|---|---|
| User | Single identity across all roles |
| Event | Root aggregate; almost everything is scoped by eventId |
| Registration | "This user is participating in this event" independent of team status |
| Team | The unit that submits; scoped to one event |
| TeamMember | Join table with `joinedAt`; first-class entity |
| Submission | The judged artifact; one per team (BR-006) |
| JudgeAssignment | Explicit assignment record; conflict-checkable |
| Evaluation | Scored result; immutable; one per (judge, submission) |

### User

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| name | varchar(120) | yes | — | 1–120 chars | |
| email | varchar(255) | yes | — | Unique (case-insensitive via `emailLower` index) | PII |
| emailLower | varchar(255) | yes | computed | Unique index | Normalized for lookup |
| passwordHash | varchar(255) | yes | — | Never returned in API | Sensitive |
| role | enum | yes | `PARTICIPANT` | PARTICIPANT, ORGANIZER, JUDGE, ADMIN | |
| isActive | boolean | yes | `true` | — | Deactivation flag |
| createdAt | timestamp | yes | now() | — | |
| updatedAt | timestamp | yes | now() | auto-updated | |

*Indexes:* Unique on `emailLower`; index on `role`.

### Event

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| name | varchar(200) | yes | — | 1–200 chars | |
| slug | varchar(60) | yes | — | Unique; `^[a-z0-9-]{3,60}$` | |
| description | text | no | null | — | |
| organizerId | UUID | yes | — | FK → User.id | **Was missing in v1.0** |
| startDate | timestamp | yes | — | — | |
| endDate | timestamp | yes | — | ≥ startDate | |
| registrationDeadline | timestamp | yes | — | ≤ submissionDeadline | |
| submissionDeadline | timestamp | yes | — | ≤ endDate | |
| teamMinSize | int | yes | 2 | ≥ 1 | |
| teamMaxSize | int | yes | 4 | ≥ teamMinSize | |
| status | enum | yes | `DRAFT` | DRAFT, PUBLISHED, ONGOING, COMPLETED, CANCELLED | |
| createdAt | timestamp | yes | now() | — | |
| updatedAt | timestamp | yes | now() | auto-updated | |

*Indexes:* Unique on `slug`; index on `status`; index on `organizerId`.

### Registration

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| userId | UUID | yes | — | FK → User.id | |
| eventId | UUID | yes | — | FK → Event.id | |
| status | enum | yes | `CONFIRMED` | CONFIRMED, WITHDRAWN | |
| registeredAt | timestamp | yes | now() | — | |

*Constraint:* Unique `(userId, eventId)` — enforces BR-003 at DB layer.

### Team

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| eventId | UUID | yes | — | FK → Event.id | |
| name | varchar(120) | yes | — | Unique per event | |
| leaderId | UUID | yes | — | FK → User.id; must be a TeamMember | |
| state | enum | yes | `FORMING` | FORMING, LOCKED | |
| createdAt | timestamp | yes | now() | — | |
| updatedAt | timestamp | yes | now() | auto-updated | |

*Constraint:* Unique `(eventId, name)`.

### TeamMember

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| teamId | UUID | yes | — | FK → Team.id | |
| userId | UUID | yes | — | FK → User.id | |
| joinedAt | timestamp | yes | now() | — | |

*Constraint:* Unique `(teamId, userId)`. BR-002 (one team per event per user) is enforced at application layer across teams (not expressible as a simple DB unique constraint).

### Submission

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| teamId | UUID | yes | — | FK → Team.id, **unique** (enforces BR-006) | |
| projectName | varchar(150) | yes | — | 1–150 chars | |
| description | text | yes | — | 1–5000 chars | |
| repositoryUrl | varchar(500) | yes | — | Valid URL | |
| demoUrl | varchar(500) | no | null | Valid URL if present | Subject to CHANGE-004 |
| status | enum | yes | `DRAFT` | DRAFT, SUBMITTED, UNDER_REVIEW, EVALUATED | |
| submittedAt | timestamp | no | null | Set on DRAFT→SUBMITTED | |
| updatedAt | timestamp | yes | now() | auto-updated | |

*Constraint:* Unique `teamId` — enforces one submission per team.

### JudgeAssignment

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| judgeId | UUID | yes | — | FK → User.id (role=JUDGE) | |
| submissionId | UUID | yes | — | FK → Submission.id | |
| assignedAt | timestamp | yes | now() | — | |

*Constraint:* Unique `(judgeId, submissionId)`; BR-007 check at insert time.

### Evaluation

| Field | Type | Required | Default | Constraints | Notes |
|---|---|---|---|---|---|
| id | UUID | yes | generated | PK | |
| submissionId | UUID | yes | — | FK → Submission.id | |
| judgeId | UUID | yes | — | FK → User.id | |
| innovationScore | int | yes | — | 0–10 (or 0–20 post CHANGE-005) | Subject to CHANGE-005 |
| technicalScore | int | yes | — | 0–10 | Subject to CHANGE-005 |
| designScore | int | yes | — | 0–10 | |
| impactScore | int | yes | — | 0–10 | |
| feedback | text | no | null | ≤ 2000 chars | Subject to CHANGE-008 |
| submittedAt | timestamp | yes | now() | Immutable after creation | |

*Constraint:* Unique `(submissionId, judgeId)` — one evaluation per (judge, submission) pair.

### Soft Deletion Rules

- Events: no hard delete once PUBLISHED — use CANCELLED status instead
- Users: deactivate via `isActive` flag; no hard delete
- Teams: hard delete only if `state = FORMING` and member count = 0; otherwise not supported in MVP
- All other entities: no delete operations in MVP; use status/state transitions

### Referential Integrity

- `Team.leaderId` must reference a row in `TeamMember` for that same team — enforced at application layer
- Leader departure/reassignment: **explicitly out of scope for MVP** (known limitation)

---

## 16 — STATE MACHINES

### Event State Machine

```
[NEW] ──► DRAFT ──► PUBLISHED ──► ONGOING ──► COMPLETED
             │           │            │
             └───────────┴────────────┴──► CANCELLED
```

| Transition | Trigger | Who | Side Effects |
|---|---|---|---|
| NEW → DRAFT | EVENT-001 create | ORGANIZER, ADMIN | Event row created |
| DRAFT → PUBLISHED | EVENT-002 publish | ORGANIZER (owner), ADMIN | Registration opens (BR-009) |
| PUBLISHED → ONGOING | `startDate` reached | System (computed-on-read or scheduler) | No new registrations |
| ONGOING → COMPLETED | `endDate` reached | System | Final state |
| ANY → CANCELLED | Organizer/admin action | ORGANIZER (owner), ADMIN | All writes blocked (BR-010) |

**Forbidden transitions:** DRAFT→ONGOING; DRAFT→COMPLETED; COMPLETED→anything; CANCELLED→anything

### Registration State Machine

```
[NEW] ──► CONFIRMED ──► WITHDRAWN
```

| State | Allowed actions | Forbidden actions |
|---|---|---|
| CONFIRMED | Withdraw | Re-register for same event |
| WITHDRAWN | — | Rejoin without admin action |

### Team State Machine

```
[NEW] ──► FORMING ──► LOCKED
```

| State | Allowed actions | Forbidden actions |
|---|---|---|
| FORMING | Join (if < maxSize), create submission | — |
| LOCKED | View only | Join, leave |

**Transition:** FORMING → LOCKED triggered when the first submission is created (`SUB-005`) OR at `submissionDeadline` (whichever is earlier).

> [!NOTE]
> The "at submissionDeadline" automatic lock is a computed-on-read scenario if no scheduler is implemented. [Q-011]

### Submission State Machine

```
[NEW] ──► DRAFT ──► SUBMITTED ──► UNDER_REVIEW ──► EVALUATED
```

| State | Allowed actions | Forbidden actions |
|---|---|---|
| DRAFT | Update fields (leader), finalize | Score, assign judge |
| SUBMITTED | Assign judge | Update fields, un-submit |
| UNDER_REVIEW | Assign additional judges, score (assigned) | Update fields |
| EVALUATED | View only | Everything |

**Forbidden:** SUBMITTED → DRAFT (no un-submitting in MVP). **Known limitation:** Judge who made a scoring error must contact an admin. [Q-007]

### Evaluation State Machine

- Single-shot: created via `POST /submissions/{id}/evaluation`
- Immutable after creation
- No state machine — either exists or doesn't

---

## 17 — BUSINESS RULES

> This section is the authoritative source for all business rules. Code must enforce these rules server-side. Tests must verify each rule independently.

| Rule ID | Rule | Scope | Affected Features | Affected APIs | Affected Docs |
|---|---|---|---|---|---|
| BR-001 | Team must have between teamMinSize and teamMaxSize members (default 2–4) | Per-event | TEAM-001, TEAM-003 | API-012, API-013 | DOC-005, DOC-008, DOC-009 |
| BR-002 | A participant may belong to at most 1 team per event | Per-event | TEAM-002, TEAM-004 | API-013 | DOC-005, DOC-008 |
| BR-003 | Only the team leader may create or update the submission | Per-team | SUB-001, SUB-004, SUB-005 | API-016, API-018, API-019 | DOC-006, DOC-008 |
| BR-004 | No registration after registrationDeadline | Per-event | REG-002 | API-010 | DOC-004, DOC-008, DOC-009 |
| BR-005 | No submission create/update after submissionDeadline | Per-event | SUB-002 | API-016, API-018, API-019 | DOC-006, DOC-008 |
| BR-006 | A team may have at most 1 active submission | Per-team | SUB-003 | API-016 | DOC-006 |
| BR-007 | A judge cannot evaluate a submission from a team they belong to | Per-assignment | JUDGE-001, JUDGE-004 | API-022 | DOC-007, DOC-008 |
| BR-008 | Only ORGANIZER (owner) or ADMIN can configure judging and assign judges | Per-event | JUDGE-001 | API-022 | DOC-007, DOC-008 |
| BR-009 | Only PUBLISHED events accept registrations | Per-event | EVENT-002, REG-001 | API-010 | DOC-003, DOC-004 |
| BR-010 | A CANCELLED event accepts no new registrations, teams, or submissions | Per-event | All write flows | Multiple | DOC-003 |
| BR-011 | teamMaxSize cannot be lowered below the size of any existing team in that event | Per-event | EVENT-003 | API-008 | DOC-003, DOC-005 |
| BR-012 | New accounts default to role PARTICIPANT; elevation requires ADMIN action | Global | AUTH-001 | API-001, API-004 | DOC-002 |
| BR-013 | Login attempts rate-limited: 5 failures / 15 min / (email, IP) pair | Global | AUTH-002 | API-002 | DOC-002 |
| BR-014 | New events always start with status DRAFT | Per-event | EVENT-001 | API-007 | DOC-003 |
| BR-015 | Team name must be unique within the same event | Per-event | TEAM-001 | API-012 | DOC-005 |
| BR-016 | [RESERVED — CHANGE-010] Team joining via invite code only | Per-event | CHANGE-010 scenario | API-013 | DOC-005 |

---

## 18 — API SPECIFICATION

**Base URL:** `/api/v1`

**Authentication:** Bearer session token in `Authorization` header unless marked public.

**Contract of Record:** `openapi/openapi.yaml` (OpenAPI 3.1). This table is a summary; the YAML file is authoritative for implementation.

### Response Envelope

**Success:**
```json
{ "data": { }, "meta": { } }
```

**Error:**
```json
{ "error": { "code": "TEAM_FULL", "message": "This team has reached its maximum size.", "field": null } }
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Success, no response body |
| 401 | Unauthenticated (no valid session) |
| 403 | Authenticated but forbidden (wrong role/ownership) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, invalid transition, constraint violation) |
| 422 | Validation failure (invalid input) |
| 429 | Rate limited |
| 500 | Internal server error |

**Critical distinction:** `401` = not authenticated; `403` = authenticated but not authorized. Never conflate.

### Endpoint Table

| API ID | Method | Path | Purpose | Auth | Success | Key Errors |
|---|---|---|---|---|---|---|
| API-001 | POST | `/auth/register` | Create account | Public | 201 | 409 DUPLICATE_EMAIL, 422 |
| API-002 | POST | `/auth/login` | Authenticate | Public | 200 | 401 INVALID_CREDENTIALS, 429 RATE_LIMITED |
| API-003 | GET | `/auth/me` | Current user | Session | 200 | 401 SESSION_EXPIRED |
| API-004 | POST | `/auth/logout` | End session | Session | 204 | — |
| API-005 | PATCH | `/users/{userId}/role` | Change user role | ADMIN | 200 | 403 FORBIDDEN, 404, 422 INVALID_ROLE |
| API-006 | PATCH | `/users/{userId}/deactivate` | Deactivate user | ADMIN | 200 | 403, 404 |
| API-007 | GET | `/events` | List published events | Public | 200 | — |
| API-008 | GET | `/events/{eventId}` | Event detail | Public (DRAFT: owner/admin only) | 200 | 404, 403 |
| API-009 | POST | `/events` | Create event | ORGANIZER, ADMIN | 201 | 422, 409 SLUG_TAKEN |
| API-010 | PATCH | `/events/{eventId}` | Update event | Owner ORGANIZER, ADMIN | 200 | 403, 422, 409 TEAM_SIZE_CONFLICT |
| API-011 | POST | `/events/{eventId}/publish` | DRAFT→PUBLISHED | Owner ORGANIZER, ADMIN | 200 | 422 EVENT_INCOMPLETE, 409 ALREADY_PUBLISHED |
| API-012 | POST | `/events/{eventId}/registrations` | Register self | Session (PARTICIPANT) | 201 | 403 EVENT_NOT_PUBLISHED, 403 REGISTRATION_CLOSED, 409 DUPLICATE_REGISTRATION |
| API-013 | GET | `/events/{eventId}/registrations` | List registrations | Owner ORGANIZER, ADMIN | 200 | 403 |
| API-014 | POST | `/events/{eventId}/teams` | Create team | Session (registered) | 201 | 403 NOT_REGISTERED, 409 ALREADY_IN_TEAM, 409 TEAM_NAME_TAKEN |
| API-015 | POST | `/teams/{teamId}/members` | Join team | Session (registered for event) | 201 | 409 TEAM_FULL, 409 ALREADY_IN_TEAM, 403 NOT_REGISTERED, 409 TEAM_LOCKED |
| API-016 | GET | `/teams/{teamId}` | Team detail | Session | 200 | 404 |
| API-017 | DELETE | `/teams/{teamId}/members/{userId}` | Remove team member | Team leader, Owner ORGANIZER, ADMIN | 204 | 403, 404, 409 CANNOT_REMOVE_LEADER |
| API-018 | POST | `/teams/{teamId}/submission` | Create DRAFT submission | Team leader | 201 | 403 FORBIDDEN, 409 ALREADY_SUBMITTED, 403 SUBMISSION_CLOSED |
| API-019 | GET | `/teams/{teamId}/submission` | Get submission | Team member, Owner ORGANIZER, Assigned JUDGE, ADMIN | 200 | 404, 403 |
| API-020 | PATCH | `/submissions/{submissionId}` | Update DRAFT submission | Team leader | 200 | 403 SUBMISSION_LOCKED, 403 SUBMISSION_CLOSED |
| API-021 | POST | `/submissions/{submissionId}/submit` | DRAFT→SUBMITTED | Team leader | 200 | 403 SUBMISSION_CLOSED, 409 ALREADY_SUBMITTED, 422 |
| API-022 | POST | `/submissions/{submissionId}/assignments` | Assign judge | Owner ORGANIZER, ADMIN | 201 | 409 JUDGE_CONFLICT, 409 ALREADY_ASSIGNED, 422 INVALID_JUDGE_ROLE |
| API-023 | POST | `/submissions/{submissionId}/evaluation` | Create evaluation | Assigned JUDGE (non-conflicted) | 201 | 409 ALREADY_EVALUATED, 422 INVALID_SCORE, 403 FORBIDDEN |
| API-024 | GET | `/submissions/{submissionId}/evaluations` | List evaluations | Owner ORGANIZER, ADMIN | 200 | 403 |

### Error Code Registry

| Code | HTTP | Meaning |
|---|---|---|
| INVALID_CREDENTIALS | 401 | Email/password mismatch |
| SESSION_EXPIRED | 401 | Session token expired or invalid |
| ACCOUNT_INACTIVE | 401 | Account deactivated |
| UNAUTHENTICATED | 401 | No session provided |
| FORBIDDEN | 403 | Authenticated but unauthorized |
| NOT_REGISTERED | 403 | User not registered for this event |
| EVENT_NOT_PUBLISHED | 403 | Event is not in PUBLISHED state |
| REGISTRATION_CLOSED | 403 | Past registrationDeadline |
| EVENT_CANCELLED | 403 | Event is CANCELLED |
| SUBMISSION_CLOSED | 403 | Past submissionDeadline |
| SUBMISSION_LOCKED | 403 | Submission is no longer in DRAFT state |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist |
| DUPLICATE_EMAIL | 409 | Email already registered |
| ALREADY_PUBLISHED | 409 | Event already published |
| DUPLICATE_REGISTRATION | 409 | User already registered for event |
| ALREADY_IN_TEAM | 409 | User already on a team for this event |
| TEAM_FULL | 409 | Team at teamMaxSize capacity |
| TEAM_LOCKED | 409 | Team state is LOCKED; no new joins |
| TEAM_NAME_TAKEN | 409 | Team name already used in this event |
| TEAM_SIZE_CONFLICT | 409 | teamMaxSize would be below an existing team |
| ALREADY_SUBMITTED | 409 | Submission already exists / already finalized |
| ALREADY_ASSIGNED | 409 | Judge already assigned to this submission |
| ALREADY_EVALUATED | 409 | Judge already scored this submission |
| JUDGE_CONFLICT | 409 | Judge is a member of the submission's team |
| INVALID_TRANSITION | 409 | State transition is not allowed |
| CANNOT_REMOVE_LEADER | 409 | Cannot remove team leader without reassigning |
| SLUG_TAKEN | 409 | Event slug already in use |
| VALIDATION_FAILED | 422 | Input validation failure (field-level errors) |
| INVALID_DATE_RANGE | 422 | Date logic constraint violated |
| INVALID_TEAM_SIZE_RANGE | 422 | teamMinSize > teamMaxSize |
| INVALID_SCORE | 422 | Score value out of allowed range |
| INVALID_ROLE | 422 | Invalid role enum value |
| INVALID_JUDGE_ROLE | 422 | Target user does not have JUDGE role |
| EVENT_INCOMPLETE | 422 | Event missing required fields for publish |
| RATE_LIMITED | 429 | Too many failed login attempts |

---

## 19 — AI SYSTEM SPECIFICATION

**There are no AI/LLM features in the SyncFlow product itself.**

The product uses Thally (an external documentation-synchronization service) for the Track 1 demonstration. Thally is an external integration, not an AI system built by this team. See Section 20 (Integrations) for Thally specifics.

**The agent must not introduce any LLM/AI capabilities into the SyncFlow product without explicit product-owner approval.**

---

## 20 — INTEGRATIONS

### Thally (Documentation Synchronization)

| Attribute | Value |
|---|---|
| **Purpose** | Evidence-based documentation synchronization: traces product changes to affected doc pages and drafts documentation PRs |
| **Authentication** | [Q-012] — GitHub App, PAT, or Thally-specific auth; not confirmed |
| **Confirmed capabilities** | Docs-as-code publishing; OpenAPI → interactive docs; Track (change→evidence→affected pages→PR draft); HTML/Markdown/JSON/JSON-LD serving |
| **Unconfirmed capabilities** | Whether Track watches application repo directly or only `openapi.yaml`/docs repo; what "evidence" means concretely; whether Track can be triggered on-demand (vs. only on merge); rate limits |
| **Integration points** | `openapi/openapi.yaml` as primary signal; `docs/` folder as monitored knowledge layer |
| **Failure behavior** | [Q-013] If Thally is unavailable during demo, have a pre-recorded backup video |
| **Rate limits** | Unknown — confirm in Phase 0 spike |
| **Cost** | Unknown |
| **Fallback** | Pre-recorded demo video for each of the 4 selected scenarios (Section 16.2) |

> [!CAUTION]
> **DO NOT implement Thally integration beyond connecting the repo until the Phase 0 spike confirms the exact mechanism.** Every Thally-specific decision in Section 15 (Strategy) is falsifiable by the spike. Build the spike before finalizing any architecture that depends on Thally behavior.

**Required spike questions (Phase 0):**
1. Does Thally's Track need read access to the application repo, or only the docs repo?
2. What constitutes "evidence" — commit diffs, OpenAPI diffs, PR descriptions?
3. Can Track be triggered on-demand for a live demo?
4. Does Thally surface a "checked, nothing to do" result or simply stay silent on no-op changes?

---

## 21 — SECURITY & PRIVACY

| ID | Requirement |
|---|---|
| SEC-001 | Passwords never stored in plaintext. bcrypt (cost 10–12) or argon2id required. |
| SEC-002 | Every protected endpoint requires a valid session. Unauthenticated access → 401. |
| SEC-003 | Every role-restricted endpoint enforces authorization. Wrong role → 403. |
| SEC-004 | All user input validated on the server before processing. |
| SEC-005 | Secrets never committed to Git. `.env` gitignored; `.env.example` committed with placeholder values. |
| SEC-006 | All secrets stored as environment variables. |
| SEC-007 | Users cannot access resources belonging to other users without explicit permission. |
| SEC-008 | Returning 403 instead of 404 for unauthorized resources leaks existence. This is an accepted tradeoff for MVP (simplicity). Document as known limitation; revisit if security review flags it. |
| SEC-009 | `passwordHash` must never appear in any API response, log line, or error message. |
| SEC-010 | Email addresses are PII. They must not appear in log lines. User ID only in logs. |
| SEC-011 | Rate limiting on login (BR-013): 5 failures / 15 min / (email, IP). |
| SEC-012 | Input sanitization: all string inputs trimmed; SQL injection prevented via Prisma parameterized queries. |
| SEC-013 | HTTPS required for all production traffic. |

**PII Fields:** `User.email`, `User.name`, `User.emailLower`, `User.passwordHash`

**Data Retention:** Not defined for MVP (explicitly out of scope). Must be decided before any production launch.

---

## 22 — PERFORMANCE REQUIREMENTS

| Metric | Target | Condition |
|---|---|---|
| Standard API request p95 latency | < 500ms | Under expected MVP load (~50 concurrent users) |
| Event list / detail (public, cacheable) p95 | < 200ms | With appropriate HTTP caching headers |
| Demo-day uptime | 100% during live demo window | Single environment; no SLA beyond demo |
| Page initial load (LCP) | < 3 seconds | Standard broadband; no specific mobile target defined |

> [!NOTE]
> **These are target numbers, not SLA commitments.** This is a hackathon MVP. The targets exist to prevent obviously unacceptable performance, not to engineer for scale.

---

## 23 — SUCCESS CRITERIA

### Product

- All P0 acceptance criteria (Section 32) pass
- Zero business rule (Section 17) has a known enforcement gap at demo time

### Technical

- Contract tests green: 0 drift between `openapi.yaml` and implementation
- p95 latency targets (Section 22) met under basic load test

### Documentation

- 100% of DOC-001 through DOC-010 manually verified against baseline before Phase 4 (PRD-DG-001)
- Every doc page has a populated dependency row in the Documentation Dependency Matrix

### Synchronization (Track 1)

- ≥ 3 CHANGE scenarios produce a correct Thally-drafted PR
- CHANGE-011 (negative control) produces zero unnecessary PR/pages touched

### Hackathon Demo

- All 4 selected scenarios (Section 16.2) run live or from rehearsed recording without manual data fixes
- Team can answer "what does Thally actually do, concretely" without hedging

---

## 24 — ANALYTICS & OBSERVABILITY

### Structured Log Events (every write operation)

```json
{
  "timestamp": "ISO-8601",
  "actorId": "uuid",
  "action": "REGISTRATION_CREATE",
  "resourceType": "Registration",
  "resourceId": "uuid",
  "result": "SUCCESS | ERROR",
  "errorCode": "REGISTRATION_CLOSED | null"
}
```

### Documentation Synchronization Events (Demo-critical)

```json
{
  "timestamp": "ISO-8601",
  "changeCommitSha": "abc123",
  "changeScenario": "CHANGE-001",
  "affectedDocsPredicted": ["DOC-005", "DOC-009", "DOC-010"],
  "affectedDocsReportedByThally": ["DOC-005", "DOC-009"],
  "reviewDecision": "APPROVED | EDITED | REJECTED",
  "publishedAt": "ISO-8601 | null"
}
```

This side-by-side predicted-vs-actual view is the **single most convincing artifact for judges** — it makes the traceability claim inspectable rather than asserted.

### Error Tracking

- 5xx errors must be logged with stack trace (server-side only; never exposed to client)
- 4xx errors from authentication/authorization failures should be logged for security monitoring

---

## 25 — ERROR HANDLING

### Error Structure

Every error response uses:
```json
{
  "error": {
    "code": "SCREAMING_SNAKE_CASE",
    "message": "Human-readable description.",
    "field": "fieldName | null"
  }
}
```

### Rules

1. **Never expose raw stack traces** to API clients. Log server-side, return a generic 500 with `INTERNAL_ERROR` code.
2. **Never conflate 401 and 403.** See Section 18.
3. **Validation errors must be per-field.** A 422 must indicate which field(s) failed and why.
4. **Third-party failure** (e.g., database unavailable): return `503 SERVICE_UNAVAILABLE` with `UPSTREAM_ERROR` code; log full error server-side.
5. **Network failure on client:** handle gracefully in UI with a user-readable message; retry logic for idempotent operations (GET) is acceptable.
6. **Rate limiting response must include** `Retry-After` header indicating when the rate limit window resets.

---

## 26 — TESTING STRATEGY

### Test Layers

| Layer | Scope | Tools | Gate |
|---|---|---|---|
| Unit | Every BR-xxx rule, isolated from HTTP and DB | Vitest or Jest | Block PR merge |
| Integration | Full flows: Registration→Team→Submission; Assignment→Evaluation | Vitest + DB | Block PR merge |
| Contract | Every API-xxx endpoint against `openapi.yaml` | Schemathesis or Dredd | Block PR merge |
| E2E | Priya's full journey; Raj's organizer dashboard journey | Playwright | Block merge to main |
| Security | Every 401/403 case in the permission matrix | Vitest + Supertest | Block PR merge |
| Documentation Sync | Each CHANGE-xxx scenario (Section 16.1) | Manual + Thally output comparison | Gate Phase 5 completion |

### Documentation Sync Test Format

```
TEST-001
Given: baseline product + docs are verified synchronized (DOC-005 states teamMaxSize=4)
When: teamMaxSize is changed to 5 and merged
Then: Thally identifies DOC-005, DOC-009, DOC-010 as affected
Expected product state: teamMaxSize=5, enforced server-side (join attempt at 6th member → 409 TEAM_FULL)
Expected documentation state: DOC-005 states "maximum 5 members"; DOC-002/DOC-007 unchanged
```

```
TEST-011 (control — negative case)
Given: baseline product + docs are verified synchronized
When: TeamService is renamed to TeamManagementService and merged, with no OpenAPI or business-rule diff
Then: Thally reports zero affected pages / drafts no PR
Expected product state: identical external behavior (existing E2E suite passes unchanged)
Expected documentation state: byte-identical to before the change
```

---

## 27 — DEFINITION OF DONE

A feature is done when **all** of the following are true:

- [ ] Implementation complete and deployed
- [ ] All acceptance criteria (Section 32) for this feature pass
- [ ] Unit tests cover all business rules (BR-xxx) for this feature
- [ ] Integration tests cover happy path and key failure flows
- [ ] Contract tests pass (endpoint matches `openapi.yaml`)
- [ ] No TypeScript type errors (`tsc --noEmit` clean)
- [ ] No lint errors (ESLint clean)
- [ ] Error states implemented and return correct error codes
- [ ] Loading states implemented in UI (where applicable)
- [ ] Empty states implemented in UI (where applicable)
- [ ] Success states implemented in UI (where applicable)
- [ ] Permissions enforced (401/403 for unauthorized access)
- [ ] `openapi.yaml` updated if API contract changed
- [ ] This PRD's Section 07 feature status updated to "Done"
- [ ] Changelog updated if user-facing behavior changed

---

## 28 — ENVIRONMENT & CONFIGURATION

### Environments

| Env | Purpose |
|---|---|
| Development | Local development (`localhost`) |
| Demo/Staging | Single shared environment (staging = production for hackathon) |

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Session
SESSION_SECRET=<min 32 chars random string>
SESSION_EXPIRY_DAYS=7

# Application
NODE_ENV=development|production
PORT=3000
BASE_URL=https://...

# Thally (once confirmed)
THALLY_API_KEY=...       # Do NOT commit
THALLY_REPO_URL=...

# Rate limiting (if using Redis)
REDIS_URL=...            # Optional; in-memory fallback for dev
```

**Rules:**
- `.env` MUST be in `.gitignore`
- `.env.example` with placeholder values (not real secrets) MUST be committed
- Never hardcode secrets in source files
- Never log secrets

### Feature Flags

No feature flags defined for MVP. If a feature flag is needed, document it here and use an environment variable (`FEATURE_WAITLIST=true`) — do not implement a flag management system for hackathon scope.

---

## 29 — DEPLOYMENT

### Build Process

```bash
npm run build          # Build all apps in workspace
npm run test           # Full test suite
npm run test:contract  # Contract tests against openapi.yaml
```

### Deployment Sequence

1. Run migrations: `prisma migrate deploy`
2. Run contract tests against the new build
3. Deploy application
4. Run smoke tests (GET /health, GET /api/v1/events)
5. Verify logging is working

### Rollback

- Database rollback: Prisma supports rollback via `prisma migrate reset` (destructive) or rolling forward with a reverse migration
- Application rollback: redeploy previous Docker image / git revision
- Demo day: have a pre-deployed stable version ready as backup

### CI Checks (block merge)

1. `tsc --noEmit` (TypeScript errors)
2. ESLint
3. Unit tests
4. Integration tests
5. Contract tests (`openapi.yaml` vs. implementation)
6. E2E tests (on merge to main only — not every PR)

---

## 30 — DEPENDENCIES

| Name | Purpose | Required/Optional | Notes |
|---|---|---|---|
| Next.js 14+ | Full-stack framework (frontend + API routes) | Required | Version decision pending [Q-010] |
| TypeScript | Type safety | Required | Strict mode |
| Prisma | ORM + migrations | Required | Generates types |
| PostgreSQL | Primary database | Required | Minimum v14 |
| Zod | Runtime schema validation | Required | Shared between API and web |
| Tailwind CSS | UI styling | Required | — |
| bcrypt or argon2 | Password hashing | Required | Choose one — [Q-014] |
| Schemathesis or Dredd | Contract testing | Required | Validate API against OpenAPI spec |
| Playwright | E2E testing | Required | Priya's and Raj's journeys |
| Vitest or Jest | Unit + integration testing | Required | [Q-015] — choose one |
| Thally | Documentation synchronization | Required (demo) | Integration gated on Phase 0 spike |
| Redis | Rate limiting session store | Optional | In-memory fallback acceptable for MVP |

**MUST NOT introduce:**
- Any dependency not in this list without documenting justification
- Multiple competing libraries for the same purpose (e.g., two ORMs, two test frameworks)
- Dependencies with known security vulnerabilities at time of install

---

## 31 — CONSTRAINTS

### MUST USE

- TypeScript (strict mode) throughout
- OpenAPI 3.1 as the API contract of record
- Prisma for database access (no raw SQL except in migrations)
- Zod for runtime validation (shared schemas)
- Standard REST conventions as defined in Section 18
- Feature IDs (AUTH-001, etc.) as stable references in code comments and tests
- Server clock (not client clock) for all deadline comparisons

### MUST NOT USE

- GraphQL (not in scope; adds complexity without benefit for this product)
- Multiple ORMs
- Hardcoded secrets or API keys
- `any` type in TypeScript (except with explicit `// eslint-disable` comment + justification)
- Client-side enforcement of business rules as the *only* enforcement (server-side is authoritative)
- Raw `fetch` in the frontend without a typed wrapper
- `console.log` in production code (use structured logger)

### MUST NOT CHANGE (without product-owner approval + PRD update)

- Business rule IDs (BR-001 through BR-016)
- Feature IDs (AUTH-001 through JUDGE-004, etc.)
- Error codes in the error code registry (Section 18)
- API base path (`/api/v1`)
- The response envelope format `{ data, meta }` / `{ error: { code, message, field } }`

### PREFERRED

- Next.js App Router over Pages Router (if Next.js is chosen for API layer)
- Server-side sessions over JWT+refresh (pending [Q-004] decision)
- Computed-on-read for event status transitions over a background scheduler (pending [Q-011] decision)

### OPTIONAL

- Redis for rate limiting (in-memory acceptable for MVP)
- Admin UI beyond minimal role-change endpoint

---

## 32 — ACCEPTANCE CRITERIA

Detailed acceptance criteria are embedded in Section 08 (Feature Requirements) under each feature. Cross-reference index:

| Feature ID | Criteria Location |
|---|---|
| AUTH-001 | Section 08, AC-AUTH-001-1 through AC-AUTH-001-5 |
| AUTH-002 | Section 08, AC-AUTH-002-1 through AC-AUTH-002-5 |
| AUTH-003 | Section 08, AC-AUTH-003-1 through AC-AUTH-003-3 |
| AUTH-004 | Section 08, AC-AUTH-004-1 through AC-AUTH-004-3 |
| EVENT-001 | Section 08, AC-EVENT-001-1 through AC-EVENT-001-5 |
| EVENT-002 | Section 08, AC-EVENT-002-1 through AC-EVENT-002-4 |
| EVENT-003 | Section 08, AC-EVENT-003-1 through AC-EVENT-003-3 |
| REG-001 | Section 08, AC-REG-001-1 through AC-REG-001-4 |
| TEAM-001 | Section 08, AC-TEAM-001-1 through AC-TEAM-001-3 |
| TEAM-002 | Section 08, AC-TEAM-002-1 through AC-TEAM-002-5 |
| SUB-001 | Section 08, AC-SUB-001-1 through AC-SUB-001-4 |
| SUB-005 | Section 08, AC-SUB-005-1 through AC-SUB-005-3 |
| JUDGE-001 | Section 08, AC-JUDGE-001-1 through AC-JUDGE-001-3 |
| JUDGE-002 | Section 08, AC-JUDGE-002-1 through AC-JUDGE-002-5 |

---

## 33 — TRACEABILITY MATRIX

| Requirement | Feature ID | Screen ID | API ID | Entity | Business Rule | Test |
|---|---|---|---|---|---|---|
| Team capacity rule | TEAM-001, TEAM-002, TEAM-003 | UI-004 | API-014, API-015 | Team, TeamMember | BR-001 | TEST-001 (CHANGE-001) |
| One team per event | TEAM-004 | UI-004 | API-015 | TeamMember | BR-002 | AC-TEAM-002-3 |
| Leader-only submission | SUB-001, SUB-004, SUB-005 | UI-005 | API-018, API-019, API-021 | Submission | BR-003 | AC-SUB-001-2 |
| Registration deadline | REG-002 | UI-002 | API-012 | Registration | BR-004 | AC-REG-001-3 |
| Submission deadline | SUB-002 | UI-005 | API-018, API-021 | Submission | BR-005 | AC-SUB-001-4, AC-SUB-005-2 |
| One submission per team | SUB-003 | UI-005 | API-018 | Submission | BR-006 | AC-SUB-001-3 |
| Judge conflict of interest | JUDGE-004 | UI-008 | API-022 | JudgeAssignment | BR-007 | AC-JUDGE-001-2 |
| Events must be published | EVENT-002, REG-001 | UI-002 | API-011, API-012 | Event, Registration | BR-009 | AC-REG-001-4 |
| Role defaults to PARTICIPANT | AUTH-001 | UI-003 | API-001 | User | BR-012 | AC-AUTH-001-4 |
| Rate limit on login | AUTH-002 | UI-003 | API-002 | — | BR-013 | AC-AUTH-002-4 |

---

## 34 — OPEN QUESTIONS

> [!CAUTION]
> The agent MUST NOT silently resolve any question marked **[CRITICAL]**. Stop and flag for product-owner decision before implementing features that depend on these answers.

| Q-ID | Question | Why It Matters | Options | Recommended | Status | Owner |
|---|---|---|---|---|---|---|
| Q-001 | Who are the product owner and technical owner? | Document control; authority for decisions | — | Identify team leads | OPEN | Team lead |
| Q-002 | Are the official SYNC HACK Track 1 rules available? | Several requirements (team size defaults, submission format, demo format) are assumed from inference | Get official brief from organizers | Proceed on inferred goal; reconcile when brief arrives | OPEN | Team lead |
| Q-003 | What exactly does Thally's Track feature do concretely? | All Thally-dependent architecture in Section 20 is assumption-based | Phase 0 spike (≤2h timebox): connect throwaway repo, make one change, observe output | Run spike before Phase 4 | **CRITICAL — blocks Phase 4** | Thally integration owner |
| Q-004 | Session strategy: server-side sessions vs. JWT+refresh? | Affects AUTH-003, logout behavior, token expiry UX | Server sessions (simpler, revocable); JWT+refresh (stateless, more complex) | **Server-side sessions** | OPEN | Backend lead |
| Q-005 | Which event fields are updatable in each event status? | EVENT-003 implementation — can you change dates after publishing? | Block all changes post-PUBLISHED; allow limited changes (e.g., description only) | Recommend blocking date changes post-PUBLISHED | OPEN | Product owner |
| Q-006 | Is team name uniqueness per-event enforced as BR-015? | Team names like "Team A" would collide across events if global, which is correct | Per-event unique (most natural UX); global unique (unnecessary) | **Per-event unique** | OPEN — recommend approve | Backend lead |
| Q-007 | Can a judge correct a scoring mistake in MVP? | Evaluation is currently immutable — judge errors require admin intervention | Immutable (MVP simplicity); allow update within X hours | **Immutable in MVP; document as known limitation** | OPEN — recommend approve | Product owner |
| Q-008 | Component library decision: custom vs. Radix UI / shadcn / Chakra? | Affects development speed and UI consistency | Custom (full control); shadcn/ui (accessible, no runtime overhead); others | **shadcn/ui** (accessible, Tailwind-compatible) | OPEN | Frontend lead |
| Q-009 | State management: React Query (TanStack Query) vs. SWR vs. Zustand? | Affects data fetching patterns throughout the frontend | TanStack Query (caching + mutations); SWR (simpler); Zustand (client state only) | **TanStack Query** for server state | OPEN | Frontend lead |
| Q-010 | API architecture: Next.js API routes vs. separate Express/Fastify service? | Affects repo structure, deployment, and latency | Next.js API Routes (simpler monorepo); Separate service (cleaner separation) | **Next.js API routes** for hackathon scope | OPEN | Technical owner |
| Q-011 | Event status transitions: real scheduler vs. computed-on-read? | PUBLISHED→ONGOING and ONGOING→COMPLETED could be stale if computed-on-read | Real scheduler (accurate, background job needed); computed-on-read (simpler, may show stale status briefly) | **Computed-on-read** for hackathon scope | OPEN — recommend approve | Backend lead |
| Q-012 | Thally authentication mechanism? | Required to connect Thally to the repo | GitHub App; PAT; Thally-specific API key | Confirm in Phase 0 spike | **OPEN — blocks Thally setup** | Thally integration owner |
| Q-013 | Thally demo fallback plan? | Live demos can fail | Pre-recorded video; staged commits | **Pre-record all 4 scenarios before demo day** | OPEN — recommend approve | Demo owner |
| Q-014 | Password hashing: bcrypt vs. argon2id? | Security requirement; implementation detail | bcrypt (well-tested, widely used); argon2id (newer, recommended by OWASP) | **argon2id** (OWASP recommended) | OPEN | Backend lead |
| Q-015 | Test framework: Vitest vs. Jest? | Affects test setup and CI configuration | Vitest (faster, native ESM); Jest (mature ecosystem) | **Vitest** (better Next.js/ESM compatibility) | OPEN | Backend lead |

---

## 35 — DECISION LOG

| DEC-ID | Date | Decision | Reason | Alternatives Considered | Impact | Status |
|---|---|---|---|---|---|---|
| DEC-001 | 2026-08-21 | SyncFlow product is a hackathon-judging platform with 6 modules (auth, events, registration, teams, submissions, judging) | Provides realistic multi-role system with genuine state machines for Track 1 demo | 2-module minimal product | Full 6-module scope risks timeline; mitigated by Section 06's cut list | Approved |
| DEC-002 | 2026-08-21 | OpenAPI 3.1 is the contract of record for the API surface | Thally has confirmed OpenAPI→docs capability; contract tests can validate implementation against spec | Code comments as contract | Direct input to Thally; enables contract testing | Approved |
| DEC-003 | 2026-08-21 | Business rules each have a stable ID (BR-001 through BR-016) | Enables traceability from rule → feature → API → docs; change matrix references IDs | Inline rule comments | Any rule change is immediately traceable to doc impact | Approved |
| DEC-004 | 2026-08-21 | Documentation pages each have a stable ID (DOC-001 through DOC-012) | Enables the Documentation Dependency Matrix; change scenarios reference doc IDs | File paths only | Change matrix can predict exactly which pages go stale | Approved |
| DEC-005 | 2026-08-21 | Baseline documentation must be verified synchronized with the product before any CHANGE scenario is introduced (PRD-DG-001) | Drift before the demo would make it impossible to prove Thally's accuracy | Skip verification | Without baseline sync, the demo cannot prove anything | Approved |
| DEC-006 | 2026-08-21 | CHANGE-011 (internal refactor with no public-surface change) is a required demo scenario and must not be cut | The "no unnecessary update" case is as important as the positive cases; judges need to see discrimination | Cut to save time | Weakens the entire Track 1 argument | Approved |
| DEC-007 | 2026-08-25 | v2.0 PRD superseded by this v3.0 SSOT | v2.0 had several open questions that need explicit tracking; v3.0 adds agent operating rules, full AC structure, explicit open questions registry | Keep v2.0 active | Dual-PRD situation creates conflicts | Approved |

---

## 36 — CHANGELOG

| Version | Date | Change | Reason | Impacted Features | Migration Required |
|---|---|---|---|---|---|
| 1.0 | 2026-08 | Initial product definition | — | All | — |
| 2.0 | 2026-08-21 | Added: full feature specs, data model with types/constraints, API endpoint table, change matrix (10 scenarios), RBAC permission matrix, state machines, risk register | v1.0 was a skeleton | All | — |
| 3.0 | 2026-08-25 | Added: agent operating rules, open questions registry, decision log, per-feature acceptance criteria, security/privacy section, detailed API error code registry, testing strategy, DoD, env config, deployment, dependency registry, constraints, traceability matrix, requirement audit | Ensure AI coding agent readiness | All | No breaking changes to product; PRD structure change only |

---

## 37 — FUTURE ROADMAP

### MVP (P0) — Current Target

See Section 06 for complete list.

### V1 — Post-Hackathon

- Announcements for participants
- Waitlist promotion automation
- Organizer analytics dashboard
- Multiple events per environment
- Email notifications for deadline reminders

### V2 — Future

- OAuth (GitHub, Google) as alternative to email/password
- Team invitation via email
- Judge scoring history and aggregate views
- Public results/leaderboard
- API versioning strategy (v2 endpoint)

### Future Ideas (Do Not Implement)

- AI-assisted judging or feedback generation
- Real-time collaboration on submissions
- Payment/sponsorship management
- Video hosting or playback
- Mobile native applications

> [!CAUTION]
> **Future items must not be accidentally implemented.** If a feature from V1 or V2 appears to be needed during MVP development, stop and get explicit product-owner approval before implementing it.

---

## REQUIREMENT AUDIT

### Confirmed Requirements

Requirements explicitly decided in v1.0 or v2.0 and carried forward:

- ✅ 6-module product scope (AUTH, EVENT, REG, TEAM, SUB, JUDGE)
- ✅ 4 user roles: PARTICIPANT, ORGANIZER, JUDGE, ADMIN
- ✅ OpenAPI 3.1 as contract of record
- ✅ Business rule IDs (BR-001 through BR-014 from v2.0; BR-015–016 added in v3.0)
- ✅ Documentation IDs (DOC-001 through DOC-012)
- ✅ Change matrix with 11 scenarios including a negative-control case
- ✅ Baseline documentation verification before any change scenario
- ✅ Team size default of 2–4 members (configurable per event)
- ✅ Only team leader can submit/update project
- ✅ Judge conflict-of-interest enforcement at assignment time
- ✅ Event must be PUBLISHED before registration opens
- ✅ Server clock authoritative for deadline comparisons
- ✅ passwordHash never returned in API responses

### Assumed (Never Formally Decided)

Items treated as settled in v1.0/v2.0 but never explicitly approved:

- ⚠️ Next.js as the frontend framework (proposed in v1.0; never formally decided — [Q-010])
- ⚠️ PostgreSQL as the database (proposed; no architecture doc approved it)
- ⚠️ Prisma as the ORM (proposed; no architecture doc approved it)
- ⚠️ Server-side sessions as auth strategy (recommended in v2.0; not decided — [Q-004])
- ⚠️ Tailwind CSS for styling (proposed; no design decision approved)
- ⚠️ Team name uniqueness is per-event (assumed in v3.0; not formally stated in v1.0/v2.0 — [Q-006])
- ⚠️ "SYNC HACK Track 1" rules match the inferred objective (Section 0.2 in v2.0 explicitly flags this)
- ⚠️ teamMaxSize=4 default is the correct number for the hackathon rules (may change per actual rules)

### Contradictory

Requirements that conflict between v1.0 and v2.0 (resolved in this v3.0):

- ❌ **SUB-004 vs. Submission state machine:** v1.0 said "team leader can update a submission until the deadline" but the state diagram implied SUBMITTED was a final state. v2.0 resolved this: DRAFT is editable; SUBMITTED is the finalized/locked state. **v3.0 adopts v2.0's resolution.**
- ❌ **CHANGE-004 numbering:** v1.0's CHANGE-004 = "Authentication Change" (Google OAuth). v2.0 renumbered it to CHANGE-006. **v3.0 adopts v2.0's numbering** (CHANGE-006 = OAuth; CHANGE-004 = removed field).
- ❌ **Team state machine:** v1.0 had no team-level state. v2.0 introduced FORMING/LOCKED. **v3.0 adopts v2.0's team state machine.**
- ❌ **Registration status values:** v1.0 defined a `status` field on Registration but never enumerated its valid values. v2.0 added `CONFIRMED | WITHDRAWN`. **v3.0 adopts v2.0's values.**

### Missing Requirements

Important things not defined in either PRD:

- 🔴 **Team leader departure/reassignment:** Acknowledged as a known limitation in v2.0 but the edge case of what happens to a team when the leader deactivates their account or withdraws their registration is undefined. The correct behavior (block the action? automatically dissolve the team? assign a new leader?) is not specified. Currently: documented as a known limitation; admin must intervene manually.
- 🔴 **Evaluation score range validation source of truth:** The rubric has scores 0–10 per criterion. CHANGE-005 will change Innovation and Technical to 0–20. The PRD does not specify whether this is in `openapi.yaml` schemas, a config file, or hardcoded. Must be decided before CHANGE-005 is implemented.
- 🔴 **Pagination for list endpoints:** `GET /events`, `GET /events/{eventId}/registrations`, `GET /submissions/{submissionId}/evaluations` — no pagination defined. For MVP scope (~50 users), acceptable to return all results, but must be explicitly acknowledged.
- 🔴 **Organizer can view their own events in DRAFT status:** The permission matrix says yes, but the exact API behavior (does `GET /events` include DRAFT events for the owner organizer?) is not specified in the endpoint table.
- 🔴 **`GET /auth/me` response shape:** Not specified beyond "current user." Must match the User entity minus passwordHash. Should be specified in OpenAPI.
- 🟡 **What happens to existing evaluations when CHANGE-005 (rubric change) occurs during a live event?** PRD v2.0 acknowledges "must not corrupt already-submitted evaluations" but provides no migration strategy.

### Risky Decisions

Requirements or assumptions that could create problems:

- 🚨 **Thally capabilities are not confirmed:** The entire Track 1 demo strategy (Section 20, 15) is built on assumptions about what Thally's Track feature does. If the Phase 0 spike reveals it doesn't behave as assumed, the demo strategy needs significant redesign. **Highest risk in the project.**
- 🚨 **SYNC HACK Track 1 rules not verified:** The hackathon rules were not found during research (v2.0 Section 0.1). If the actual rules require a different demo format or submission format, this PRD needs reconciliation.
- ⚠️ **6-module scope vs. hackathon timebox:** v2.0 explicitly called this out (Section 1.9). A team of 6 could build 6 modules, but the risk that engineering time gets consumed by CRUD plumbing rather than the sync pipeline is real. The cut list in Section 06 must be honored.
- ⚠️ **403 vs. 404 information disclosure (SEC-008):** Accepted tradeoff for MVP. If this product were deployed beyond a hackathon, this would need to be revisited.
- ⚠️ **Immutable evaluations:** A judge cannot correct a scoring mistake without admin intervention. For a real hackathon, this could cause operational problems if a judge makes an error. It's a known limitation; admins need a manual correction path (SQL update or admin endpoint) not defined in the MVP.
- ⚠️ **Single environment for demo:** No staging/production separation. A demo-day crash cannot be isolated from a staging accident.

### Needs Decision (Before Implementation Starts)

| Decision | Blocks |
|---|---|
| Phase 0 Thally spike results | All Thally integration (Phase 4); Section 20 |
| Official SYNC HACK Track 1 rules | Demo format; submission format; team size defaults |
| Session strategy ([Q-004]) | AUTH-003, logout behavior |
| API layer architecture ([Q-010]) | Repository structure; deployment |
| Component library ([Q-008]) | All UI implementation |
| Test framework ([Q-015]) | Test setup; CI configuration |
| Password hashing library ([Q-014]) | SEC-001 implementation |
| Event update field restrictions ([Q-005]) | EVENT-003 implementation |

---

## AI CODING AGENT READINESS CHECKLIST

| Check | Status | Notes |
|---|---|---|
| Product scope is unambiguous | ✅ | Section 06; Non-goals explicit |
| Users are defined | ✅ | Section 04, 4 personas |
| Roles are defined | ✅ | Section 05 |
| Permissions are defined | ✅ | Permission matrix in Section 05 |
| Features have IDs | ✅ | Section 07, Feature Master List |
| Major user flows are defined | ✅ | Section 09 |
| Screens are defined | ✅ | Section 11 (inventory + one detailed example) |
| Business rules are defined | ✅ | Section 17, BR-001 through BR-016 |
| Entity states are defined | ✅ | Section 16, state machines |
| Database model is defined | ✅ | Section 15, all entities with types/constraints |
| API contracts are defined | ⚠️ | Section 18 table defined; full request/response bodies need to be written into `openapi.yaml` |
| Architecture is defined | ⚠️ | Section 13 — recommended, not approved; requires ARCH-001 |
| Codebase structure is defined | ✅ | Section 14 — module boundaries and naming conventions |
| AI behavior is defined | ✅ | N/A — no AI features in product; Thally is external |
| Error handling is defined | ✅ | Section 25, error code registry in Section 18 |
| Security requirements are defined | ✅ | Section 21, SEC-001 through SEC-013 |
| Testing requirements are defined | ✅ | Section 26 |
| Acceptance criteria exist | ✅ | Section 08, embedded in each feature |
| Open questions are separated | ✅ | Section 34, 15 open questions |
| Decisions are recorded | ✅ | Section 35, DEC-001 through DEC-007 |
| Constraints are explicit | ✅ | Section 31 |
| Traceability exists | ✅ | Section 33 |
| Thally integration defined | ⚠️ | Section 20 — capability assumptions flagged; gated on Phase 0 spike |
| Screen designs approved | ❌ | Only inventory + one detailed spec; 10/11 screens template-only |
| Full OpenAPI spec written | ❌ | Endpoint table exists; YAML file not yet created |
| Architecture formally approved | ❌ | Requires ARCH-001 document |
| Hackathon rules confirmed | ❌ | Section 0 problem from v2.0; still unresolved |

---

### Implementation Readiness Score: **68 / 100**

**What prevents 100/100:**

| Gap | Points Deducted | Fix |
|---|---|---|
| `openapi.yaml` not yet created | -8 | Write the full OpenAPI 3.1 spec (all 24 endpoints with request/response bodies) as Phase 1 deliverable |
| Architecture not formally approved | -7 | Create and approve ARCH-001; resolve Q-004, Q-010, Q-011 |
| Thally integration unconfirmed | -7 | Complete Phase 0 spike; update Section 20 with confirmed behavior |
| Hackathon rules not verified | -5 | Obtain official brief; reconcile against this PRD |
| Screen designs (10/11 screens template-only) | -4 | Expand Section 11 with full specs for remaining 10 screens |
| 15 open questions unresolved | -3 | Resolve Q-004, Q-005, Q-006, Q-007, Q-008, Q-009, Q-010, Q-011 before implementation starts |
| Missing requirements (pagination, DRAFT visibility, leader departure) | -3 | Add to Section 08 or document explicitly as known limitations |
| Score range for CHANGE-005 not specified | -2 | Decide whether score config is in OpenAPI schema, config file, or hardcoded; document in Section 15 |
| No approved design system | -1 | Approve at least a color palette and component library before UI work begins |

**The PRD is ready to drive an Architecture Document today.** It is NOT ready to drive direct implementation without first resolving the architecture decisions and creating `openapi.yaml`.

---

*End of SyncFlow PRD/SSOT v3.0*
