# SyncFlow — Architecture Decision Record
## ARCH-001 | Version 1.0 | 2026-08-25
## Status: APPROVED

This document is the authoritative architecture reference for SyncFlow.
All decisions listed here are **APPROVED** unless explicitly marked **[PROPOSED]**.
Deviations from this document require a new decision entry (DEC-xxx in PRD v3.1 Section 35).

---

## 1. Technology Stack (All APPROVED)

| Layer | Decision | ID | Rationale |
|---|---|---|---|
| Full-stack framework | **Next.js 14 App Router** | DEC-008 | Single deployment; API routes + UI in one repo; App Router gives RSC for faster page loads |
| Language | **TypeScript 5, strict mode** | DEC-008 | Type safety across API contract, Prisma types, and Zod schemas |
| Database | **PostgreSQL 16** | DEC-009 | Relational integrity for team/event/registration relationships; Prisma support |
| ORM | **Prisma 5** | DEC-009 | Type-safe queries; auto-generated types; migration support |
| API style | **REST over `/api/v1`** | DEC-002 | OpenAPI 3.1 contract; Thally consumes OpenAPI; simpler than GraphQL for this scope |
| Auth strategy | **Server-side sessions (Prisma-backed session table)** | DEC-011 | Instantly revocable; no token refresh complexity; simpler for hackathon; 7-day expiry |
| Password hashing | **argon2id** (parallelism=1, memoryCost=65536, timeCost=3) | DEC-010 | OWASP recommended over bcrypt; resistant to GPU cracking |
| Frontend state | **TanStack Query v5** (server state) + React `useState` (UI state) | DEC-013 | Automatic cache invalidation; optimistic updates; avoids prop-drilling |
| Styling | **Tailwind CSS v3 + shadcn/ui** | DEC-015 | Accessible components; Tailwind-native; zero runtime overhead |
| Validation | **Zod** (shared between API + frontend) | — | Single schema source; runtime validation + TypeScript inference |
| Unit/integration tests | **Vitest** | DEC-014 | Native ESM; fast; excellent Next.js compatibility |
| E2E tests | **Playwright** | — | Cross-browser; reliable for form-heavy flows |
| Contract tests | **Schemathesis** | DEC-016 | Fuzzes every endpoint against the OpenAPI spec automatically |
| Event status transitions | **Computed-on-read** | DEC-012 | No background scheduler needed; status is computed from `now()` vs date fields on every read/write |

---

## 2. Repository Structure

```
syncflow/                        ← workspace root
├── apps/
│   └── web/                     ← Next.js 14 app (frontend + API routes)
│       ├── app/
│       │   ├── (public)/        ← unauthenticated routes
│       │   │   ├── page.tsx     ← root → redirect to /events
│       │   │   ├── events/
│       │   │   │   ├── page.tsx                 ← UI-001 Event list
│       │   │   │   └── [slug]/page.tsx           ← UI-002 Event detail
│       │   │   ├── register/page.tsx             ← UI-003
│       │   │   └── login/page.tsx                ← UI-003
│       │   ├── (dashboard)/     ← PARTICIPANT authenticated routes
│       │   │   ├── layout.tsx   ← auth guard
│       │   │   └── events/[eventId]/
│       │   │       ├── team/page.tsx             ← UI-004
│       │   │       ├── submit/page.tsx           ← UI-005
│       │   │       └── status/page.tsx           ← UI-006
│       │   ├── (organizer)/     ← ORGANIZER+ADMIN routes
│       │   │   ├── layout.tsx
│       │   │   └── events/
│       │   │       ├── new/page.tsx              ← UI-007
│       │   │       └── [id]/
│       │   │           ├── page.tsx              ← UI-007 edit
│       │   │           └── dashboard/page.tsx    ← UI-008
│       │   ├── (judge)/         ← JUDGE+ADMIN routes
│       │   │   ├── layout.tsx
│       │   │   └── assignments/
│       │   │       ├── page.tsx                 ← UI-009
│       │   │       └── [submissionId]/page.tsx  ← UI-010
│       │   ├── (admin)/         ← ADMIN-only routes
│       │   │   ├── layout.tsx
│       │   │   └── users/page.tsx               ← UI-011
│       │   └── api/
│       │       └── v1/          ← All API routes — mirrors openapi.yaml paths
│       │           ├── auth/
│       │           │   ├── register/route.ts
│       │           │   ├── login/route.ts
│       │           │   ├── me/route.ts
│       │           │   └── logout/route.ts
│       │           ├── users/[userId]/
│       │           │   ├── role/route.ts
│       │           │   └── deactivate/route.ts
│       │           ├── events/
│       │           │   ├── route.ts
│       │           │   └── [eventId]/
│       │           │       ├── route.ts
│       │           │       ├── publish/route.ts
│       │           │       ├── registrations/route.ts
│       │           │       └── teams/route.ts
│       │           ├── teams/[teamId]/
│       │           │   ├── route.ts
│       │           │   ├── members/route.ts
│       │           │   ├── members/[userId]/route.ts
│       │           │   ├── leader/route.ts
│       │           │   └── submission/route.ts
│       │           └── submissions/[submissionId]/
│       │               ├── route.ts
│       │               ├── submit/route.ts
│       │               ├── assignments/route.ts
│       │               ├── evaluation/route.ts
│       │               └── evaluations/route.ts
│       ├── components/
│       │   ├── ui/              ← shadcn/ui generated components (do not hand-edit)
│       │   ├── auth/            ← RegisterForm, LoginForm
│       │   ├── events/          ← EventCard, EventDetail, EventForm
│       │   ├── teams/           ← TeamDashboard, MemberList, JoinForm
│       │   ├── submissions/     ← SubmissionForm, SubmissionStatus
│       │   └── judging/         ← AssignmentList, ScoringForm
│       ├── lib/
│       │   ├── api-client.ts    ← typed fetch wrapper for API routes
│       │   ├── auth.ts          ← session helpers (getSession, requireSession)
│       │   └── query-client.ts  ← TanStack Query client configuration
│       └── middleware.ts        ← route protection (redirect to /login if no session)
│
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma    ← single source of truth for DB schema
│   │   │   ├── migrations/      ← never manually edit; use `prisma migrate dev`
│   │   │   └── seed.ts          ← demo seed data for Thally scenarios
│   │   └── index.ts             ← PrismaClient singleton export
│   ├── validation/
│   │   ├── auth.ts              ← RegisterRequest, LoginRequest Zod schemas
│   │   ├── events.ts            ← CreateEventRequest, UpdateEventRequest schemas
│   │   ├── teams.ts             ← CreateTeamRequest schemas
│   │   ├── submissions.ts       ← CreateSubmission, UpdateSubmission schemas
│   │   └── judging.ts           ← AssignJudge, CreateEvaluation schemas
│   └── types/
│       └── index.ts             ← Re-exports Prisma types + any supplemental types
│
├── docs/                        ← Thally-monitored documentation
│   ├── getting-started.md       ← DOC-001
│   ├── authentication.md        ← DOC-002
│   ├── architecture.md          ← DOC-012 (this file, published to docs)
│   ├── guides/
│   │   ├── creating-events.md   ← DOC-003
│   │   ├── registering.md       ← DOC-004
│   │   ├── teams.md             ← DOC-005
│   │   ├── submissions.md       ← DOC-006
│   │   └── judging.md           ← DOC-007
│   ├── api/                     ← DOC-008 (generated from openapi.yaml by Thally)
│   ├── examples/
│   │   ├── registration.md
│   │   ├── team-creation.md
│   │   └── submission.md
│   ├── faq.md                   ← DOC-009
│   ├── changelog.md             ← DOC-010
│   └── migrations/              ← DOC-011 (breaking change guides)
│
├── openapi/
│   └── openapi.yaml             ← Contract of record (WP-1)
│
├── prd/
│   └── syncflow-ssot-prd-v3.1.md  ← Active SSOT (WP-8)
│
├── tests/
│   ├── unit/                    ← BR-xxx rule tests (no HTTP, no DB)
│   │   └── business-rules/
│   │       ├── br-001.test.ts   ← Team capacity
│   │       ├── br-002.test.ts   ← One team per event per user
│   │       ├── br-003.test.ts   ← Leader-only submission
│   │       └── ...
│   ├── integration/             ← Full flow tests (DB + service layer)
│   │   ├── auth.test.ts
│   │   ├── registration-flow.test.ts
│   │   ├── team-submission-flow.test.ts
│   │   └── judging-flow.test.ts
│   ├── contract/                ← Schemathesis against openapi.yaml
│   │   └── schemathesis.config.yaml
│   └── e2e/                     ← Playwright browser tests
│       ├── participant-journey.spec.ts   ← Priya's full flow
│       └── organizer-journey.spec.ts     ← Raj's organizer flow
│
├── .github/
│   └── workflows/
│       ├── ci.yml               ← PR gate: tsc, lint, unit, integration, contract
│       └── e2e.yml              ← Merge to main: E2E tests
│
├── .env.example                 ← Committed; placeholder values only
├── .env                         ← GITIGNORED; real secrets
├── .gitignore
├── package.json                 ← workspace root
├── turbo.json                   ← Turborepo pipeline config
├── tsconfig.json                ← Base TypeScript config
├── README.md
└── CHANGELOG.md
```

---

## 3. Module Boundary Rules

```
┌──────────────────────────────────────────────────────────────┐
│  apps/web (UI)                                               │
│  - Pages and components only                                 │
│  - Calls API via lib/api-client.ts                           │
│  - NO direct Prisma imports                                  │
│  - NO business logic                                         │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP (fetch)
┌────────────────────────▼─────────────────────────────────────┐
│  apps/web/app/api/v1/** (API Route Handlers)                  │
│  - Parse request, call service, format response               │
│  - Enforce authentication (requireSession middleware)         │
│  - NO business logic — delegate to service layer             │
│  - Return { data } or { error: { code, message, field } }    │
└────────────────────────┬─────────────────────────────────────┘
                         │ function calls
┌────────────────────────▼─────────────────────────────────────┐
│  Service Layer (lib/services/*.ts inside apps/web)            │
│  - ALL business rule enforcement lives here                   │
│  - Calls repository layer for DB access                       │
│  - References BR-xxx IDs in comments                         │
│  - Owns state machine transitions                             │
└────────────────────────┬─────────────────────────────────────┘
                         │ function calls
┌────────────────────────▼─────────────────────────────────────┐
│  Repository Layer (lib/repositories/*.ts)                     │
│  - Prisma queries only                                        │
│  - NO business logic                                          │
│  - Returns typed Prisma objects                               │
└────────────────────────┬─────────────────────────────────────┘
                         │ Prisma client
┌────────────────────────▼─────────────────────────────────────┐
│  packages/database (Prisma schema + client singleton)         │
└──────────────────────────────────────────────────────────────┘

Shared packages consumed by both layers:
  packages/validation  — Zod schemas
  packages/types       — TypeScript types
```

**Hard rules:**
- UI layer (`app/(route)/page.tsx`) → NEVER imports from `lib/repositories`
- Service layer → NEVER handles HTTP (`Request`/`Response` objects)
- Repository layer → NEVER contains `if`/business logic
- `packages/*` → NEVER imports from `apps/*`

---

## 4. Authentication Architecture (DEC-011)

```
Client                     API Route Handler              Session Store (DB)
  │                              │                              │
  │── POST /auth/login ──────────▶                              │
  │   { email, password }        │── lookup user by emailLower ─▶
  │                              │◀── User row ─────────────────│
  │                              │── argon2id.verify() ─────────┤ (in-process)
  │                              │── create Session row ────────▶
  │                              │◀── { id, token, expiresAt } ─│
  │◀── 200 { data: { user, token } } ──────────────────────────│
  │                              │                              │
  │── GET /auth/me ──────────────▶                              │
  │   Authorization: Bearer tok  │── lookup Session by token ───▶
  │                              │◀── Session + User ───────────│
  │                              │── check expiresAt > now() ───┤
  │◀── 200 { data: User } ───────│                              │
```

**Session table fields:** `id UUID PK, userId FK, token VARCHAR(255) UNIQUE, expiresAt TIMESTAMP, createdAt TIMESTAMP`

**Logout:** DELETE Session row server-side. Token immediately invalid.

**Middleware (`middleware.ts`):** Runs before every `/(dashboard)`, `/(organizer)`, `/(judge)`, `/(admin)` route. Reads `Authorization` header; 401 if missing or expired.

---

## 5. Event Status — Computed-on-Read (DEC-012)

The Event entity has date fields `startDate` and `endDate`. Status is NOT automatically updated by a background job. Instead, when an event is read or written, the following computed status is applied:

```typescript
function computeEventStatus(event: Event, now: Date): EventStatus {
  if (event.status === 'CANCELLED') return 'CANCELLED';
  if (event.status === 'DRAFT') return 'DRAFT';       // only manual publish can change
  if (now < event.startDate) return 'PUBLISHED';
  if (now >= event.startDate && now < event.endDate) return 'ONGOING';
  return 'COMPLETED';
}
```

**Implication:** `event.status` in the database stores only `DRAFT`, `PUBLISHED`, or `CANCELLED`. `ONGOING` and `COMPLETED` are computed. The service layer applies this computation on every read before returning.

**DB column:** `status` stores only `DRAFT | PUBLISHED | CANCELLED`. `ONGOING` and `COMPLETED` are virtual.

---

## 6. Validation Architecture (Zod + OpenAPI)

```
openapi.yaml                     packages/validation
    │                                    │
    │ (Zod schema MUST match             │
    │  OpenAPI schema constraints)       │
    │                                    │
    ▼                                    ▼
API Route Handler ──── parse(req.body, schema) ──── 422 on failure
                                        │
                              If valid → Service Layer
```

**Rule:** Every Zod schema in `packages/validation` must be kept in sync with the corresponding OpenAPI request schema in `openapi.yaml`. Contract tests (Schemathesis) will catch any divergence on CI.

---

## 7. Error Response Architecture

Every API error follows this exact shape (matches `openapi.yaml` `ErrorResponse` schema):

```typescript
// lib/api/errors.ts
export function apiError(
  code: ErrorCode,
  message: string,
  field: string | null = null,
  status: number
): NextResponse {
  return NextResponse.json({ error: { code, message, field } }, { status });
}

// Usage in route handler:
if (team.memberCount >= event.teamMaxSize) {
  return apiError('TEAM_FULL', 'This team has reached its maximum size.', null, 409);
}
```

---

## 8. Naming Conventions (APPROVED)

| Thing | Convention | Example |
|---|---|---|
| TypeScript variables | camelCase | `teamMaxSize` |
| TypeScript functions | camelCase | `computeEventStatus` |
| TypeScript classes/types/interfaces | PascalCase | `CreateTeamRequest` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TEAM_SIZE` |
| Files | kebab-case | `team-service.ts` |
| DB columns (Prisma) | camelCase in schema → snake_case in DB via `@map` | `teamMaxSize @map("team_max_size")` |
| API error codes | SCREAMING_SNAKE_CASE | `TEAM_FULL` |
| Test `describe` blocks | Feature ID | `describe('TEAM-002')` |
| Test `it` blocks | Acceptance criterion ID | `it('AC-TEAM-002-3: ...')` |
| Business rule comments | BR reference | `// BR-001: capacity check` |

---

## 9. CI/CD Pipeline

```
PR opened / pushed
    │
    ├── tsc --noEmit (TypeScript type check)
    ├── eslint (lint)
    ├── vitest run (unit + integration tests)
    │       └── tests/unit/business-rules/br-*.test.ts
    │       └── tests/integration/*.test.ts
    └── schemathesis run openapi/openapi.yaml --base-url=http://localhost:3000
        (contract tests — fails if any endpoint drifts from spec)
    │
    ▼ All pass → PR mergeable

Merge to main
    ├── All above checks
    └── playwright test (E2E)
        ├── participant-journey.spec.ts
        └── organizer-journey.spec.ts
    │
    ▼ All pass → deploy to demo environment
        └── prisma migrate deploy
        └── smoke tests: GET /api/v1/events → 200
```

---

## 10. Environment Variables

```bash
# Required for all environments
DATABASE_URL=postgresql://user:pass@localhost:5432/syncflow
SESSION_SECRET=<min-32-char-random-string>
SESSION_EXPIRY_DAYS=7
NODE_ENV=development|production
BASE_URL=http://localhost:3000

# Required for production/demo
THALLY_API_KEY=       # Do NOT commit — set in deployment env
THALLY_REPO_URL=      # Confirm during Phase 0 spike

# Optional (rate limiting)
REDIS_URL=            # If using Redis; omit for in-memory fallback
```

`.env` → gitignored  
`.env.example` → committed with placeholder values  
Never hardcode any value that appears in this list.

---

## 11. Prisma Schema Conventions

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// All UUIDs use @default(uuid())
// All timestamps use @default(now()) and @updatedAt where applicable
// All enum types are declared in Prisma schema (not as DB ENUM — use String with validation)
// All column names snake_case in DB, camelCase in Prisma/TypeScript via @map
// All table names PascalCase in Prisma → snake_case in DB via @@map

model User {
  id           String   @id @default(uuid())
  name         String   @db.VarChar(120)
  email        String   @db.VarChar(255)
  emailLower   String   @unique @db.VarChar(255) @map("email_lower")
  passwordHash String   @db.VarChar(255) @map("password_hash")
  role         String   @default("PARTICIPANT")   // UserRole enum
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
  @@index([role])
}
```

---

## 12. Open Decisions Resolved by This Document

| Decision | Status |
|---|---|
| DEC-008 Next.js App Router | APPROVED |
| DEC-009 PostgreSQL + Prisma | APPROVED |
| DEC-010 argon2id | APPROVED |
| DEC-011 Server-side sessions | APPROVED |
| DEC-012 Computed-on-read transitions | APPROVED |
| DEC-013 TanStack Query | APPROVED |
| DEC-014 Vitest | APPROVED |
| DEC-015 shadcn/ui + Tailwind | APPROVED |
| DEC-016 Schemathesis contract tests | APPROVED |
| Q-004 Session strategy | RESOLVED → server sessions |
| Q-005 Event update restrictions | RESOLVED → dates locked post-PUBLISHED |
| Q-008 Component library | RESOLVED → shadcn/ui |
| Q-009 State management | RESOLVED → TanStack Query |
| Q-010 API architecture | RESOLVED → Next.js API routes |
| Q-011 Event transitions | RESOLVED → computed-on-read |
| Q-014 Password hashing | RESOLVED → argon2id |
| Q-015 Test framework | RESOLVED → Vitest |
