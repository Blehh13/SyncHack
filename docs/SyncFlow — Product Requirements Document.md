# SyncFlow
## Product Requirements Document

**Document Version:** 1.0  
**Product Version:** 0.1.0  
**Status:** Draft — Product Definition  
**Purpose:** SYNC HACK — Track 1  
**Primary Objective:** Demonstrate that product changes can be traced to affected documentation and converted into reviewable documentation updates.

---

# 1. Executive Summary

SyncFlow is a developer-focused event and project management platform designed to manage the complete lifecycle of a technical event.

The platform allows organizers to create events, participants to register, participants to form teams, teams to submit projects, and judges to evaluate submissions.

The primary purpose of SyncFlow is not to compete with large event platforms.

The platform is intentionally designed as a compact but realistic software product whose **product behavior, API contracts, business rules, examples, and documentation can evolve over time**.

This makes it an ideal environment for demonstrating the Track 1 problem:

> **When a product changes, how do we ensure that all affected knowledge remains accurate and synchronized?**

SyncFlow will establish a baseline product and documentation system. Controlled product changes will then be introduced through the GitHub repository.

Thally will be used to identify the documentation surfaces affected by those product changes and generate reviewable documentation updates.

The final demonstration will show:

```text
Product change
      ↓
Code / API change
      ↓
Thally detects change
      ↓
Affected knowledge identified
      ↓
Documentation update drafted
      ↓
Human review
      ↓
Documentation updated
```

---

# 2. Problem Statement

Software products change continuously.

An API endpoint may be renamed.

A required parameter may be introduced.

A business rule may change.

A feature may be added or removed.

An authentication mechanism may be replaced.

While the software changes, documentation often remains unchanged.

This creates documentation drift.

For example:

```text
Product:
POST /api/events/{eventId}/register
```

may later become:

```text
Product:
POST /api/events/{eventId}/registrations
```

The code may be correct while the following remain stale:

- API reference
- integration examples
- README
- developer guide
- tutorials
- FAQ
- SDK examples
- changelog

This creates a disconnect between:

```text
What the product does
```

and:

```text
What the documentation says the product does
```

SyncFlow exists to provide a controlled environment for demonstrating how this problem can be detected and managed.

---

# 3. Product Vision

Create a software product where **documentation is treated as a living knowledge layer of the product rather than a static collection of Markdown files**.

The long-term vision is:

> Every meaningful product change should have a traceable impact on the knowledge that describes that product.

---

# 4. Product Goals

## 4.1 Primary Goals

### G-001 — Event Management

Allow organizers to create and manage technical events.

### G-002 — Participant Registration

Allow users to register for events.

### G-003 — Team Formation

Allow participants to create and join teams.

### G-004 — Project Submission

Allow teams to submit their projects.

### G-005 — Judging

Allow judges to evaluate project submissions.

### G-006 — Documentation Synchronization

Demonstrate how product changes can be mapped to affected documentation.

### G-007 — Traceability

Every major product change used in the demonstration should have identifiable documentation consequences.

---

# 5. Hackathon-Specific Goals

## H-001

Demonstrate a real product rather than a documentation-only prototype.

## H-002

Maintain a structured documentation system alongside the product.

## H-003

Demonstrate at least three meaningful product changes.

## H-004

Show that different product changes affect different documentation surfaces.

## H-005

Demonstrate reviewable documentation updates.

## H-006

Demonstrate at least one change where documentation should NOT be updated.

## H-007

Show the complete product-change-to-documentation workflow during the final demo.

---

# 6. Non-Goals

The MVP will NOT include:

- Native mobile applications
- Payment processing
- Advanced recommendation systems
- Real-time chat
- Complex analytics
- AI judging
- Video hosting
- Marketplace functionality
- Multi-tenant enterprise billing
- Advanced sponsorship management
- Social networking

These features are explicitly excluded to prevent scope expansion.

---

# 7. Target Users

SyncFlow has four primary user roles.

## 7.1 Participant

A developer or student participating in an event.

Needs to:

- discover events
- view event information
- register
- create a team
- join a team
- submit a project
- view announcements
- track submission status

---

## 7.2 Organizer

The person responsible for running the event.

Needs to:

- create events
- configure event rules
- view participants
- manage teams
- manage submissions
- create announcements
- configure judging

---

## 7.3 Judge

A person evaluating submitted projects.

Needs to:

- view assigned submissions
- inspect project information
- score submissions
- provide feedback
- submit evaluations

---

## 7.4 Administrator

Platform-level operator.

Needs to:

- manage users
- manage events
- manage platform configuration
- review system activity
- manage permissions

---

# 8. Roles and Permissions

| Capability | Participant | Organizer | Judge | Admin |
|---|---:|---:|---:|---:|
| View public events | ✓ | ✓ | ✓ | ✓ |
| Register | ✓ | No | No | ✓ |
| Create team | ✓ | No | No | ✓ |
| Join team | ✓ | No | No | ✓ |
| Submit project | ✓ | No | No | ✓ |
| Create event | No | ✓ | No | ✓ |
| Manage participants | No | ✓ | No | ✓ |
| Manage teams | Limited | ✓ | No | ✓ |
| View submissions | Own team | ✓ | Assigned | ✓ |
| Judge submission | No | No | ✓ | ✓ |
| Configure rubric | No | ✓ | No | ✓ |
| Manage users | No | No | No | ✓ |

---

# 9. Core User Journeys

## 9.1 Participant Journey

```text
Create account
      ↓
Login
      ↓
Browse events
      ↓
Open event
      ↓
Register
      ↓
Create or join team
      ↓
Build project
      ↓
Submit project
      ↓
Track submission
```

---

## 9.2 Organizer Journey

```text
Login
 ↓
Create event
 ↓
Configure event
 ↓
Publish event
 ↓
Monitor registrations
 ↓
Manage teams
 ↓
Review submissions
 ↓
Configure judging
 ↓
View results
```

---

## 9.3 Judge Journey

```text
Login
 ↓
View assigned submissions
 ↓
Open submission
 ↓
Review project
 ↓
Score criteria
 ↓
Add feedback
 ↓
Submit evaluation
```

---

# 10. MVP Feature Set

The MVP contains six major modules.

```text
Authentication
Events
Registration
Teams
Submissions
Judging
```

---

# 11. Feature Requirements

# 11.1 Authentication

### AUTH-001 — User Registration

Users must be able to create an account using:

- name
- email
- password

### AUTH-002 — Login

Users must be able to authenticate using email and password.

### AUTH-003 — Session

Authenticated users must receive a secure authenticated session.

### AUTH-004 — Role

Each user must have a role.

Valid roles:

```text
PARTICIPANT
ORGANIZER
JUDGE
ADMIN
```

---

# 12. Event Management

## EVENT-001 — Create Event

Organizers can create an event.

Required fields:

```text
name
slug
description
startDate
endDate
registrationDeadline
teamMinSize
teamMaxSize
submissionDeadline
status
```

---

## EVENT-002 — Publish Event

An organizer can publish an event.

An unpublished event must not accept participant registrations.

---

## EVENT-003 — Update Event

Organizers can update event information.

Changes to critical configuration must be validated against existing registrations and teams.

---

## EVENT-004 — Event Status

Valid statuses:

```text
DRAFT
PUBLISHED
ONGOING
COMPLETED
CANCELLED
```

---

# 13. Registration

## REG-001 — Register for Event

An authenticated participant can register for a published event.

Registration requires:

```text
userId
eventId
```

---

## REG-002 — Eligibility

A participant cannot register after the registration deadline.

---

## REG-003 — Duplicate Registration

A participant cannot register for the same event more than once.

---

# 14. Team Management

## TEAM-001 — Create Team

A registered participant can create a team.

The creator becomes the team leader.

---

## TEAM-002 — Join Team

A registered participant can join an existing team.

---

## TEAM-003 — Team Capacity

Default MVP rule:

> A team must contain between **2 and 4 participants**.

This rule is intentionally documented because it will become one of the primary Track 1 change scenarios.

---

## TEAM-004 — One Team Per Event

A participant may belong to only one team within an event.

---

## TEAM-005 — Team Leader

Every team must have exactly one team leader.

---

# 15. Submission Management

## SUB-001 — Submit Project

A team leader can submit a project.

Required fields:

```text
projectName
description
repositoryUrl
demoUrl
```

---

## SUB-002 — Submission Deadline

Projects cannot be submitted after the configured submission deadline.

---

## SUB-003 — One Submission

A team may have only one active submission.

---

## SUB-004 — Submission Update

The team leader can update a submission until the submission deadline.

---

# 16. Judging

## JUDGE-001 — Assign Judge

Organizers can assign judges to submissions.

---

## JUDGE-002 — Evaluation

A judge can score an assigned submission.

Initial rubric:

```text
Innovation — 10 points
Technical Execution — 10 points
Design — 10 points
Impact — 10 points
```

Maximum:

```text
40 points
```

---

## JUDGE-003 — Feedback

Judges may provide written feedback.

---

## JUDGE-004 — Conflict of Interest

A judge cannot evaluate a submission belonging to their own team.

---

# 17. Business Rules

This section is authoritative for product behavior.

## BR-001

A team must contain between 2 and 4 participants.

## BR-002

A participant can belong to only one team per event.

## BR-003

Only the team leader can submit a project.

## BR-004

A participant cannot register after the registration deadline.

## BR-005

A team cannot submit after the submission deadline.

## BR-006

A team may have only one active submission.

## BR-007

A judge cannot evaluate their own team's submission.

## BR-008

Only organizers can configure judging criteria.

## BR-009

Only published events accept registrations.

## BR-010

A cancelled event cannot accept new registrations.

---

# 18. Product States

## Event

```text
DRAFT
 ↓
PUBLISHED
 ↓
ONGOING
 ↓
COMPLETED
```

Alternative:

```text
PUBLISHED → CANCELLED
```

---

## Submission

```text
DRAFT
 ↓
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
EVALUATED
```

---

# 19. Data Model

## User

```text
id
name
email
passwordHash
role
createdAt
updatedAt
```

---

## Event

```text
id
name
slug
description
startDate
endDate
registrationDeadline
teamMinSize
teamMaxSize
submissionDeadline
status
createdAt
updatedAt
```

---

## Registration

```text
id
userId
eventId
registeredAt
status
```

---

## Team

```text
id
eventId
name
leaderId
createdAt
updatedAt
```

---

## TeamMember

```text
id
teamId
userId
joinedAt
```

---

## Submission

```text
id
teamId
projectName
description
repositoryUrl
demoUrl
status
submittedAt
updatedAt
```

---

## JudgeAssignment

```text
id
judgeId
submissionId
assignedAt
```

---

## Evaluation

```text
id
submissionId
judgeId
innovationScore
technicalScore
designScore
impactScore
feedback
submittedAt
```

---

# 20. Entity Relationships

```text
User
 │
 ├──────────── Registration
 │                    │
 │                    ▼
 │                  Event
 │                    │
 │                    ▼
 │                   Team
 │                 /      \
 │                /        \
 ▼               ▼          ▼
Judge       TeamMember   Submission
                           │
                           ▼
                    JudgeAssignment
                           │
                           ▼
                       Evaluation
```

---

# 21. API Contract

The API will follow REST principles.

Base URL:

```text
/api/v1
```

---

## Authentication

### POST `/auth/register`

Creates a user account.

### POST `/auth/login`

Authenticates a user.

### GET `/auth/me`

Returns the authenticated user.

---

## Events

### GET `/events`

Returns published events.

### GET `/events/{eventId}`

Returns event details.

### POST `/events`

Creates an event.

Authorization:

```text
ORGANIZER
ADMIN
```

### PATCH `/events/{eventId}`

Updates an event.

Authorization:

```text
ORGANIZER
ADMIN
```

### POST `/events/{eventId}/publish`

Publishes an event.

---

## Registration

### POST `/events/{eventId}/registrations`

Registers the current participant.

### GET `/events/{eventId}/registrations`

Returns event registrations.

Authorization:

```text
ORGANIZER
ADMIN
```

---

## Teams

### POST `/events/{eventId}/teams`

Creates a team.

### POST `/teams/{teamId}/members`

Adds a participant to a team.

### GET `/teams/{teamId}`

Returns team information.

### DELETE `/teams/{teamId}/members/{userId}`

Removes a team member.

---

## Submissions

### POST `/teams/{teamId}/submission`

Creates a submission.

### GET `/teams/{teamId}/submission`

Returns the team's submission.

### PATCH `/submissions/{submissionId}`

Updates a submission.

### POST `/submissions/{submissionId}/submit`

Finalizes a submission.

---

## Judging

### POST `/submissions/{submissionId}/evaluation`

Creates an evaluation.

### GET `/submissions/{submissionId}/evaluations`

Returns evaluations.

Authorization:

```text
ORGANIZER
ADMIN
```

---

# 22. API Response Format

Successful response:

```json
{
  "data": {},
  "meta": {}
}
```

Error response:

```json
{
  "error": {
    "code": "TEAM_FULL",
    "message": "This team has reached its maximum size."
  }
}
```

---

# 23. HTTP Status Codes

```text
200 — Successful request
201 — Resource created
204 — Successful request with no response body
400 — Invalid request
401 — Unauthenticated
403 — Forbidden
404 — Resource not found
409 — Resource conflict
422 — Validation failure
500 — Internal server error
```

---

# 24. Error Codes

Initial error codes:

```text
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
RESOURCE_NOT_FOUND
DUPLICATE_REGISTRATION
TEAM_FULL
ALREADY_IN_TEAM
REGISTRATION_CLOSED
SUBMISSION_CLOSED
ALREADY_SUBMITTED
JUDGE_CONFLICT
INVALID_SCORE
```

---

# 25. Technical Architecture

The MVP will use a modular web architecture.

```text
                    Web Application
                          │
                          ▼
                     API Layer
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
 Authentication        Events            Teams
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                     Submissions
                          │
                          ▼
                       Judging
                          │
                          ▼
                     PostgreSQL
```

---

# 26. Proposed Technology Stack

## Frontend

```text
Next.js
TypeScript
React
Tailwind CSS
```

## Backend

```text
Next.js API routes / server layer
TypeScript
```

## Database

```text
PostgreSQL
Prisma ORM
```

## Authentication

```text
Secure session-based authentication
```

## Repository

```text
GitHub
```

## Documentation

```text
Markdown / MDX
OpenAPI
Thally
```

The stack is intentionally simple so engineering effort remains focused on the Track 1 objective.

---

# 27. Security Requirements

## SEC-001

Passwords must never be stored in plaintext.

## SEC-002

Protected endpoints must require authentication.

## SEC-003

Role-restricted endpoints must enforce authorization.

## SEC-004

User input must be validated on the server.

## SEC-005

Secrets must not be committed to Git.

## SEC-006

API credentials must be stored using environment variables.

## SEC-007

Users must not be able to access resources belonging to unauthorized users.

---

# 28. Non-Functional Requirements

## Performance

Normal API requests should target:

```text
p95 < 500ms
```

under the expected MVP workload.

## Reliability

The system should gracefully handle failed requests.

## Accessibility

The frontend should provide:

- semantic HTML
- keyboard navigation
- readable contrast
- accessible form labels
- visible validation errors

## Maintainability

The codebase should use clear module boundaries.

## Testability

Core business rules must have automated tests.

---

# 29. Documentation Architecture

The product documentation will contain the following knowledge surfaces.

```text
docs/
│
├── getting-started.md
├── authentication.md
├── architecture.md
│
├── guides/
│   ├── creating-events.md
│   ├── registering.md
│   ├── teams.md
│   ├── submissions.md
│   └── judging.md
│
├── api/
│   ├── authentication.md
│   ├── events.md
│   ├── registrations.md
│   ├── teams.md
│   ├── submissions.md
│   └── judging.md
│
├── examples/
│   ├── registration.md
│   ├── team-creation.md
│   └── submission.md
│
├── faq.md
├── changelog.md
└── migrations/
```

---

# 30. Documentation Dependency Matrix

This matrix defines which knowledge surfaces depend on which product areas.

| Product Area | API Reference | Guide | Examples | FAQ | Changelog | Migration |
|---|---|---|---|---|---|---|
| Authentication | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Events | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Registration | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Teams | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Submissions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Judging | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

# 31. Documentation Source-of-Truth Rules

The documentation system must follow these rules.

## Rule 1

The running product and its implementation define actual product behavior.

## Rule 2

The API contract defines the supported API interface.

## Rule 3

Documentation must describe the current implementation and supported behavior.

## Rule 4

Examples must use currently supported API behavior.

## Rule 5

Deprecated behavior must be explicitly marked.

## Rule 6

Breaking changes require migration documentation.

## Rule 7

Product changes must not be silently reflected only in documentation.

---

# 32. Documentation IDs

Every major documentation page receives an ID.

Examples:

```text
DOC-001 Getting Started
DOC-002 Authentication
DOC-003 Event Management
DOC-004 Registration
DOC-005 Team Management
DOC-006 Submission Guide
DOC-007 Judging
DOC-008 API Reference
DOC-009 FAQ
DOC-010 Changelog
DOC-011 Migration Guide
DOC-012 Architecture
```

This makes documentation dependencies easier to reason about.

---

# 33. Track 1 Change Matrix

This is one of the most important sections of this PRD.

The following changes will be deliberately introduced after the baseline product is complete.

---

## CHANGE-001 — Team Size Change

### Before

```text
Minimum: 2
Maximum: 4
```

### After

```text
Minimum: 2
Maximum: 5
```

### Product changes

- backend validation
- frontend validation
- event configuration
- tests

### Documentation affected

```text
DOC-005 Team Management
DOC-009 FAQ
DOC-008 API Reference
DOC-010 Changelog
```

### Expected outcome

Thally should identify affected knowledge and prepare the relevant documentation update.

---

# 34. CHANGE-002 — Registration Endpoint Change

### Before

```text
POST /api/v1/events/{eventId}/registrations
```

### After

```text
POST /api/v1/events/{eventId}/register
```

### Affected knowledge

```text
API Reference
Registration Guide
Registration Example
Getting Started
Changelog
```

### Expected outcome

Documentation referencing the old endpoint should be identified.

---

# 35. CHANGE-003 — Required Registration Field

### Before

Registration requires:

```text
name
email
```

### After

Registration additionally requires:

```text
college
```

### Product changes

- database
- validation
- API request body
- frontend form

### Documentation affected

```text
Registration Guide
API Reference
Registration Example
FAQ
Changelog
```

---

# 36. CHANGE-004 — Authentication Change

### Before

```text
Email + Password
```

### After

```text
Google OAuth
```

### Documentation affected

```text
Getting Started
Authentication Guide
API Reference
Examples
FAQ
Migration Guide
Changelog
```

This is intentionally a larger change designed to test whether the documentation synchronization system can understand a cross-cutting change.

---

# 37. CHANGE-005 — Judging Rubric Change

### Before

```text
Innovation — 10
Technical Execution — 10
Design — 10
Impact — 10
```

### After

```text
Innovation — 20
Technical Execution — 20
Design — 10
Impact — 10
```

### Documentation affected

```text
Judging Guide
FAQ
Organizer Guide
Changelog
```

---

# 38. CHANGE-006 — Internal Refactor

Example:

Rename an internal service:

```text
TeamService
```

to:

```text
TeamManagementService
```

If no public behavior changes, documentation should NOT require an update.

This is an important test case.

### Expected outcome

```text
No documentation update required.
```

A valid "no change" result is important because the objective is not to generate documentation for every code change. Thally explicitly describes this principle: it should draft an update only when evidence indicates one is needed.

---

# 39. Track 1 Success Criteria

The project succeeds if it can demonstrate:

### SC-001

A functioning product exists before synchronization testing begins.

### SC-002

Documentation accurately describes the baseline product.

### SC-003

A product change can be introduced through the repository.

### SC-004

The change can be traced to affected knowledge.

### SC-005

A documentation update can be generated for review.

### SC-006

A human can inspect and approve the proposed update.

### SC-007

The resulting documentation accurately represents the changed product.

### SC-008

At least one irrelevant/internal code change results in no unnecessary documentation update.

---

# 40. Testing Strategy

## Unit Tests

Test:

- registration
- team creation
- team capacity
- submission deadlines
- judging
- authorization

## Integration Tests

Test:

```text
Registration → Team → Submission
```

and:

```text
Submission → Judge Assignment → Evaluation
```

## API Tests

Validate:

- request schema
- response schema
- authentication
- errors
- status codes

## Documentation Tests

Verify:

- endpoint examples
- links
- API references
- code examples
- business rules

---

# 41. Documentation Synchronization Test Plan

Before making changes, establish a baseline.

```text
BASELINE
 ↓
Product v0.1
 ↓
Documentation v0.1
 ↓
Verify consistency
```

Then:

```text
CHANGE-001
 ↓
Modify product
 ↓
Run tests
 ↓
Thally analysis
 ↓
Affected documentation
 ↓
Draft update
 ↓
Human review
 ↓
Merge
 ↓
Verify documentation
```

Repeat for each major change.

---

# 42. Final Demo Flow

The final presentation should NOT start with:

> "We built an event platform."

Instead:

> "We built a product whose documentation can demonstrate what happens when software changes."

---

## Demo Part 1 — Baseline

Show:

```text
Product
Documentation
API
GitHub
```

Explain that everything is currently synchronized.

---

## Demo Part 2 — Product Change

Open the code.

Change:

```text
Team maximum:
4 → 5
```

Commit the change.

---

## Demo Part 3 — Thally

Show the change being analyzed.

Show:

```text
Product change
      ↓
Evidence
      ↓
Affected pages
```

---

## Demo Part 4 — Documentation Draft

Show the proposed documentation changes.

---

## Demo Part 5 — Human Review

Review the proposed update.

Approve/edit it.

---

## Demo Part 6 — Final State

Show:

```text
Product = 5 members

Documentation = 5 members

API = 5 members

Examples = 5 members

FAQ = 5 members
```

Everything is synchronized.

---

# 43. Second Demo Scenario

Repeat the process with:

```text
POST /events/{eventId}/registrations
```

changing to:

```text
POST /events/{eventId}/register
```

Show how the change affects multiple knowledge surfaces.

This is a stronger demonstration than the team-size example because API changes naturally propagate into examples and developer documentation.

---

# 44. Third Demo Scenario

Perform an internal refactor that does not change public behavior.

Example:

```text
TeamService
      ↓
TeamManagementService
```

Show that the documentation does not need an unnecessary rewrite.

This demonstrates that the system is not simply:

```text
code changed = rewrite docs
```

but instead:

```text
code changed
      ↓
understand change
      ↓
determine impact
      ↓
update only when necessary
```

---

# 45. Repository Structure

The final repository should roughly follow:

```text
syncflow/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── database/
│   ├── validation/
│   └── types/
│
├── docs/
│   ├── getting-started.md
│   ├── authentication.md
│   ├── architecture.md
│   │
│   ├── guides/
│   ├── api/
│   ├── examples/
│   ├── migrations/
│   │
│   ├── faq.md
│   └── changelog.md
│
├── openapi/
│   └── openapi.yaml
│
├── prd/
│   └── product-requirements.md
│
├── tests/
│
├── README.md
├── CHANGELOG.md
└── package.json
```

---

# 46. Definition of Done

The MVP is considered complete when:

- [ ] Users can register and log in
- [ ] Organizers can create events
- [ ] Participants can register
- [ ] Participants can form teams
- [ ] Teams can submit projects
- [ ] Judges can evaluate submissions
- [ ] Core business rules have automated tests
- [ ] API documentation exists
- [ ] User/developer guides exist
- [ ] Examples exist
- [ ] FAQ exists
- [ ] Changelog exists
- [ ] Baseline documentation matches the product
- [ ] Thally is connected
- [ ] CHANGE-001 has been tested
- [ ] CHANGE-002 has been tested
- [ ] CHANGE-003 has been tested
- [ ] CHANGE-006 has been tested
- [ ] Final demo can show product → change → affected docs → review → update

---

# 47. What We Are NOT Doing Yet

Do not start building the frontend yet.

The next artifacts need to be created first:

```text
1. PRD
        ↓
2. Architecture Decision Record
        ↓
3. Database Schema
        ↓
4. OpenAPI Contract
        ↓
5. Documentation Map
        ↓
6. Change Matrix
        ↓
7. GitHub Repository Structure
        ↓
8. Implementation
```

The PRD above is the **product baseline**.

It is deliberately detailed enough that the next artifacts can be derived from it rather than invented independently.

---

# 48. Source-of-Truth Hierarchy

The project will use this hierarchy:

```text
                 PRODUCT BEHAVIOR
                       │
                       ▼
              Implementation
                       │
              ┌────────┴────────┐
              ▼                 ▼
          API Contract      Business Rules
              │                 │
              └────────┬────────┘
                       ▼
                 Documentation
                       │
                       ▼
                    Thally
                       │
                       ▼
              Change Detection
                       │
                       ▼
              Reviewable Update
```

The PRD defines the **intended product**.

The implementation defines the **actual product**.

The documentation describes the **actual supported product**.

Thally helps keep the documentation aligned with product changes.

---

# 49. Core Principle

The entire project should be judged internally against one question:

> **If we change the product tomorrow, can we prove exactly what documentation became stale and why?**

If the answer is yes, the project is doing Track 1 correctly.

If the answer is:

> "We made a really nice documentation website."

then we've missed the point.

---

# 50. Immediate Next Step

Do NOT code yet.

The next thing to create is the **Architecture + Technical Design Document**, derived directly from this PRD.

It should contain:

```text
Architecture
Database ERD
Module boundaries
API architecture
Authentication architecture
Folder structure
OpenAPI design
Documentation architecture
GitHub workflow
Thally integration points
Change simulation strategy
Testing strategy
Deployment architecture
```

That document will turn this PRD into an **actual build specification**.