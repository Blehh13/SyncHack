# SyncFlow — Hackathon Event Management Platform
## Track 1: Documentation Synchronization (SYNC HACK)

> **The product is the vehicle. The documentation sync story is the deliverable.**

SyncFlow is a hackathon event management platform built as a controlled demonstration vehicle for **evidence-based documentation synchronization** — proving that a product change can be automatically traced to the exact documentation pages it invalidates, and producing a reviewable PR rather than ignoring staleness or rewriting everything blindly.

---

## What This Repo Contains

| Path | Purpose |
|---|---|
| `prd/syncflow-ssot-prd-v3.1.md` | **Single Source of Truth PRD** — product spec, technical contract, AI agent instructions, acceptance criteria, business rules, traceability matrix. Implementation Readiness Score: 100/100 |
| `openapi/openapi.yaml` | **OpenAPI 3.1 contract of record** — all 26 API endpoints with full request/response schemas, error codes, and entity definitions |
| `docs/architecture.md` | **ARCH-001** — approved architecture decisions (Next.js 14, PostgreSQL, Prisma, argon2id, server-side sessions, TanStack Query, Vitest, shadcn/ui, Schemathesis) |
| `docs/thally-spike-protocol.md` | **Phase 0 spike protocol** — step-by-step instructions to confirm Thally behavior before Phase 4 implementation |
| `docs/` | Baseline documentation layer monitored by Thally |

---

## Quick Start (for the AI coding agent)

1. Read `prd/syncflow-ssot-prd-v3.1.md` — this is your primary source of truth
2. Read `docs/architecture.md` — all technology decisions are approved here
3. Review `openapi/openapi.yaml` — this is the API contract you must implement against
4. Before touching Thally: run the spike per `docs/thally-spike-protocol.md`

---

## Implementation Phases

| Phase | Name | Prerequisite |
|---|---|---|
| 0 | Thally spike + hackathon brief | None |
| 1 | Foundation (repo setup, Prisma schema, auth) | None |
| 2 | API implementation (all 26 endpoints) | Phase 1 |
| 3 | UI implementation (11 screens) | Phase 2 |
| 4 | Thally connection | Phase 0 spike results |
| 5 | Change scenarios (CHANGE-001, -002, -011) | Phase 4 |
| 6 | Demo rehearsal | Phase 5 |

---

## Core Product Rules

- **Every business rule has a stable ID (BR-001 through BR-016)** — see PRD Section 17
- **`openapi/openapi.yaml` is the contract of record** — Schemathesis tests run against it on every CI run
- **Server clock is authoritative** for all deadline comparisons — never trust client timestamps
- **`passwordHash` never appears in any API response or log line**
- **Business rules live in the service layer** — not in route handlers, not in the database

---

## Demonstration Scenarios

| Scenario | Change | Docs Expected to Update |
|---|---|---|
| CHANGE-001 | `teamMaxSize` 4 → 5 | DOC-005, DOC-009, DOC-010 |
| CHANGE-002 | Endpoint rename `POST /registrations` → `POST /register` | DOC-004, DOC-008 |
| CHANGE-005 | Score range 0–10 → 0–20 (innovation + technical) | DOC-007, DOC-008 |
| CHANGE-011 *(negative control)* | Rename `TeamService` → `TeamManagementService` (no API surface change) | **Zero pages** |

---

## Tech Stack

- **Framework:** Next.js 14 App Router + TypeScript strict
- **Database:** PostgreSQL 16 + Prisma 5
- **Auth:** Server-side sessions + argon2id
- **Frontend:** TanStack Query v5 + shadcn/ui + Tailwind CSS
- **Testing:** Vitest + Playwright + Schemathesis
- **Docs sync:** Thally (Phase 4+)

---

## Status

- [x] PRD/SSOT v3.1 — Implementation Readiness: 100/100
- [x] OpenAPI 3.1 spec — all 26 endpoints
- [x] Architecture decisions — all approved (ARCH-001)
- [ ] Thally spike (Phase 0 — human-gated)
- [ ] Implementation (Phase 1+)
