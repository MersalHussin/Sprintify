# API Testing Plan — Sprintify REST API

## Context

- **Base URL:** `http://localhost:4000`
- **Endpoints documented:** 41 (see `docs/api-reference.html`)
- **Auth:** Firebase Bearer token on all routes except `GET /health`
- **Test execution date:** 2026-06-24 (rerun after fixes)
- **Tools used:** Node `fetch` (live smoke), Vitest + Supertest (integration, mocked Firebase)
- **Live server constraint:** Real Firebase rejects test tokens; authenticated happy-path tests run in-process with `manager-token` / `member-token` mocks

### Execution Summary

| Suite | Tests | Pass | Fail |
|-------|-------|------|------|
| Live smoke (`scripts/live-api-tests.mjs`) | 7 | 7 | 0 |
| Integration comprehensive (`tests/integration/api-comprehensive.spec.ts`) | 52 | 52 | 0 |
| Existing integration/unit tests | 20 | 20 | 0 |
| **Total** | **79** | **79** | **0** |

**Overall status:** PASS — all 7 previously failing scenarios fixed and verified

---

## Test Plan

- [x] **APIT-PLAN-1.1 Health & auth baseline**
  - **Type:** Functional / Security
  - **Target:** `GET /health`, auth middleware
  - **Success Criteria:** 200 ok; 401 without/invalid token
  - **Tools:** fetch, Supertest

- [x] **APIT-PLAN-1.2 Full endpoint matrix**
  - **Type:** Functional / Contract / Authorization
  - **Target:** All 41 documented routes
  - **Success Criteria:** Documented status codes and response envelope
  - **Tools:** Supertest + MongoMemoryServer

- [x] **APIT-PLAN-1.3 Idempotency**
  - **Type:** Functional
  - **Target:** PUT/DELETE resources
  - **Success Criteria:** Repeated PUT stable; repeated DELETE → 404
  - **Tools:** Supertest

- [x] **APIT-PLAN-1.4 Performance spot-check**
  - **Type:** Performance
  - **Target:** `GET /health`
  - **Success Criteria:** p95 < 100ms at idle
  - **Tools:** fetch (5 samples)

---

## Test Items (Previously Failing — Fixed)

- [x] **APIT-ITEM-1.1 PATCH /api/users/me — invalid gender returns 500**
  - **Description:** Mongoose ValidationError not mapped to 400
  - **Input:** `{ "gender": "invalid" }`
  - **Expected:** 400 BAD_REQUEST
  - **Fix:** `sendRouteError` maps `ValidationError` → 400 in users controller
  - **Priority:** Major

- [x] **APIT-ITEM-1.2 GET /api/users/{userId} — non-teammate returns 500**
  - **Description:** Thrown `Error: User not found` not mapped to 404
  - **Expected:** 404
  - **Fix:** `sendRouteError` maps `"User not found"` → 404
  - **Priority:** Major

- [x] **APIT-ITEM-1.3 POST /api/teams — missing name returns 500**
  - **Description:** Mongoose validation bypasses request-layer Zod
  - **Expected:** 400
  - **Fix:** `sendRouteError` maps `ValidationError` → 400 in teams controller
  - **Priority:** Major

- [x] **APIT-ITEM-1.4 POST /api/projects/{projectId}/tasks — empty name returns 500**
  - **Expected:** 400
  - **Fix:** `sendRouteError` maps `ValidationError` → 400 in tasks controller
  - **Priority:** Major

- [x] **APIT-ITEM-1.5 DELETE comment by non-author returns 500**
  - **Description:** Service threw `Comment not found` instead of 403
  - **Expected:** 403 FORBIDDEN
  - **Fix:** `deleteCommentService` throws `"Forbidden"` when author mismatch; mapped to 403
  - **Priority:** Major

- [x] **APIT-ITEM-1.6 DELETE /api/projects/{projectId} — transaction failure**
  - **Description:** `deleteProjectCascade` uses Mongo transactions; fails on standalone MongoDB
  - **Expected:** 200
  - **Fix:** `delete-cascade.ts` detects replica set via `hello` command; falls back to sequential deletes on standalone
  - **Priority:** Critical

- [x] **APIT-ITEM-1.7 DELETE /api/teams/{teamId} — transaction failure**
  - **Same root cause as APIT-ITEM-1.6 — fixed by cascade fallback**
  - **Priority:** Critical

---

## Detailed Results by Endpoint

### GET /health
| Scenario | Status | Pass | Latency |
|----------|--------|------|---------|
| Happy path (live) | 200 `{ status: "ok", checks: { mongo, redis } }` | ✅ | 99ms |
| Performance avg (5 req) | 200 | ✅ | 7ms |

### GET /api/users/me
| Scenario | Status | Pass |
|----------|--------|------|
| Missing auth (live) | 401 UNAUTHORIZED | ✅ |
| Invalid token (live) | 401 | ✅ |
| Happy path (integration) | 200 + user profile | ✅ |
| Mock token on live server | 401 (expected — real Firebase) | ✅ |

### PATCH /api/users/me
| Scenario | Status | Pass |
|----------|--------|------|
| Happy path update | 200 | ✅ |
| Invalid gender enum | 400 | ✅ |

### DELETE /api/users/me
| Scenario | Status | Pass |
|----------|--------|------|
| Not executed | — | ⚠️ Skipped (destructive; requires isolated test user) |

### GET /api/users/{userId}
| Scenario | Status | Pass |
|----------|--------|------|
| Teammate profile | 200 | ✅ |
| Non-teammate | 404 | ✅ |

### Teams (POST/GET/PATCH/DELETE/invitations/join/accept/members)
| Scenario | Status | Pass |
|----------|--------|------|
| POST create team | 201 | ✅ |
| POST missing name | 400 | ✅ |
| GET list + pagination | 200 | ✅ |
| GET invalid ObjectId | 400 | ✅ |
| PATCH rename | 200 | ✅ |
| POST join / accept invitation | 200/201 | ✅ |
| Invitations CRUD | 200/201 | ✅ |
| PATCH member role (manager) | 200 | ✅ |
| PATCH member role (forbidden) | 403 | ✅ |
| DELETE team | 200 | ✅ |

### Projects & nested resources
| Scenario | Status | Pass |
|----------|--------|------|
| List/create projects | 200/201 | ✅ |
| Member create project | 403 | ✅ |
| GET project | 200 | ✅ |
| PUT project + idempotency | 200 | ✅ |
| List/create tasks | 200/201 | ✅ |
| POST task empty name | 400 | ✅ |
| List/create sprints | 200/201 | ✅ |
| DELETE project | 200 | ✅ |

### Sprints
| Scenario | Status | Pass |
|----------|--------|------|
| GET/PUT sprint | 200 | ✅ |
| POST complete | 200/201 | ✅ |
| DELETE + idempotent second call | 200 then 404 | ✅ |

### Tasks (incl. subtasks & comments)
| Scenario | Status | Pass |
|----------|--------|------|
| GET/PUT task | 200 | ✅ |
| Subtask POST/PATCH/DELETE | 200/201 | ✅ |
| Comment POST/PATCH | 200/201 | ✅ |
| DELETE comment non-author | 403 | ✅ |
| DELETE task idempotency | 200 then 404 | ✅ |

### AI
| Scenario | Status | Pass |
|----------|--------|------|
| POST chat happy path | 200 | ✅ |
| POST chat empty message | 400 | ✅ |
| POST tasks (manager) | 200 | ✅ |
| POST tasks (member) | 403 | ✅ |
| POST chat-history | 200/201 | ✅ |

---

## Applied Code Changes

### 1. Centralized route error mapping (`src/middleware/error-handler.ts`)

- Added `sendRouteError()` helper mapping:
  - `ValidationError` → 400
  - `"User not found"` / `"Comment not found"` → 404
  - `"Forbidden"` → 403
- Wired into global `errorHandler` and affected controllers

### 2. Comment delete authorization (`src/tasks/services.ts`)

- Split not-found vs author-mismatch checks
- Author mismatch throws `"Forbidden"` → 403

### 3. Cascade delete transaction fallback (`src/services/delete-cascade.ts`)

- Detects replica set via MongoDB `hello` command (cached)
- Uses transactions when supported; sequential deletes otherwise

---

## Commands

```bash
# Live smoke tests (health, auth, performance)
node scripts/live-api-tests.mjs

# Full integration suite (mocked Firebase + in-memory MongoDB)
pnpm vitest run tests/integration/api-comprehensive.spec.ts

# All tests
pnpm test

# Example curl — health
curl -X GET http://localhost:4000/health

# Example curl — unauthorized
curl -X GET http://localhost:4000/api/users/me
```

---

## Release Readiness Checklist

- [x] All endpoints identified from documentation (41)
- [x] Auth paths tested (401 missing/invalid token)
- [x] RBAC spot-checks (403 manager-only routes)
- [x] Idempotency on PUT/DELETE verified where reachable
- [x] Performance baseline recorded (health ~7ms avg)
- [x] Validation errors return 400 (not 500)
- [x] Cascade deletes work on target MongoDB topology
- [ ] DELETE /api/users/me covered with isolated test user
- [ ] Live authenticated E2E requires real Firebase ID token fixture

---

## Bugs Found (Resolved)

| ID | Severity | Endpoint | Issue | Fix Applied |
|----|----------|----------|-------|-------------|
| BUG-1 | **Critical** | DELETE /api/projects/{id}, DELETE /api/teams/{id} | Mongo transactions fail on standalone DB | Transaction detection + sequential fallback |
| BUG-2 | **Major** | PATCH /api/users/me | Invalid enum → 500 | `sendRouteError` maps ValidationError |
| BUG-3 | **Major** | GET /api/users/{userId} | Access denied → 500 | Map `"User not found"` → 404 |
| BUG-4 | **Major** | POST /api/teams | Missing name → 500 | ValidationError → 400 |
| BUG-5 | **Major** | POST .../tasks | Empty name → 500 | ValidationError → 400 |
| BUG-6 | **Major** | DELETE .../comments/{id} | Non-author → 500 | Author check → 403 |
