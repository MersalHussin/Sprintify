# Sprintify API

Backend for Sprintify, a team-based project management app built around sprints, tasks, and a small AI layer for chat and task generation. Express on TypeScript, MongoDB for persistence, Redis for chat sessions, Firebase for auth.

Default port: `4000`. Base path for resources: `/api`.

## What you get

Teams own projects. Projects have sprints and tasks. Tasks support subtasks, comments, assignees, and a Kanban-style status flow (`Backlog` through `Done`). Managers can create and edit most things; members can read and comment.

Two AI endpoints sit on top of project context: a sprint-aware chat assistant and a task generator that returns structured task suggestions. Chat history lives in Redis with a two-hour TTL by default.

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js, TypeScript (strict) |
| HTTP | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Cache | Redis (chat sessions) |
| Auth | Firebase Admin (ID token verification) |
| AI | OpenAI-compatible client (defaults to GitHub Models) |
| Validation | Zod (env + request bodies), MongoDB JSON Schema validators |
| Tests | Vitest, Supertest, mongodb-memory-server |

## Prerequisites

- Node.js 20+ (LTS recommended)
- MongoDB (local or Atlas)
- Redis
- A Firebase project with a service account
- A GitHub token with access to [GitHub Models](https://github.com/marketplace/models) (or another OpenAI-compatible endpoint)

## Quick start

```bash
git clone <repo-url>
cd sprintify-typescript
npm install
cp .env.example .env
# fill in .env — see below
npm run dev
```

`npm run dev` starts the server with nodemon and tsx. Production build:

```bash
npm run build
npm start
```

Health check (no auth): `GET http://localhost:4000/health`

## Environment variables

Copy `.env.example` and set:

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `PORT` | No | `4000` | HTTP listen port |
| `MONGODB_URI` | Prod | `mongodb://127.0.0.1:27017/sprintify` | Required in production |
| `REDIS_URL` | Prod | `redis://127.0.0.1:6379` | Chat session storage |
| `FRONTEND_URL` | Prod | `http://localhost:3000/` | CORS origin |
| `FIREBASE_PROJECT_ID` | Yes | — | Service account |
| `FIREBASE_CLIENT_EMAIL` | Yes | — | Service account |
| `FIREBASE_PRIVATE_KEY` | Yes | — | Use `\n` for newlines in the key |
| `GITHUB_TOKEN` | Yes | — | API key for the AI client |
| `AI_BASE_URL` | No | `https://models.github.ai/inference` | OpenAI-compatible base URL |
| `AI_CHAT_MODEL` | Prod* | — | Chat assistant, e.g. `meta/llama-3.3-70b-instruct` |
| `AI_TASK_MODEL` | Prod* | — | Task generation, e.g. `openai/gpt-4.1-mini` |
| `AI_MODEL` | Prod* | — | Legacy fallback when chat/task model vars are unset |
| `TTL_SECONDS` | No | `7200` | Redis TTL for chat history (seconds) |
| `ENVIRONMENT` | No | `dev` | `dev` or `prod` |

Firebase credentials and `GITHUB_TOKEN` are always required. Additional vars are enforced when `ENVIRONMENT=prod`. In production, set `AI_CHAT_MODEL` and `AI_TASK_MODEL` (or `AI_MODEL` as a fallback for both).

## Authentication

Every route except `GET /health` expects:

```
Authorization: Bearer <firebase-id-token>
```

The server verifies the token with Firebase Admin and attaches `req.user` (`id`, `email`, `name`, `emailVerified`). Invalid or missing tokens get `401`.

User records in MongoDB are keyed by Firebase `uid`. Profile routes live under `/api/users`.

## Response format

Success and error responses share an envelope:

```json
{
  "status": "OK",
  "message": "OK",
  "data": { ... }
}
```

`status` maps to HTTP semantics (`OK`, `CREATED`, `BAD_REQUEST`, `UNAUTHORIZED`, etc.). `data` is omitted when there is nothing to return.

## Team roles

| Role | Can do |
|------|--------|
| `manager` | Create/update/delete projects, sprints, tasks, subtasks; invite members; change roles; run AI task generation |
| `member` | Read team resources; add/edit/delete own comments on tasks |

Role checks run through `requireTeamRole` middleware after resource resolution (`resolveTeam`, `resolveProject`, etc.).

## Rate limits

- Global API routes: 100 requests per minute per user (falls back to IP if unauthenticated — only `/health` is public)
- AI routes (`/api/ai/*`): 5 requests per minute per user

Exceeded limits return `429` with `TOO_MANY_REQUESTS`.

## API overview

Path params use MongoDB ObjectIds (24 hex characters). List endpoints accept optional `page` and `limit` query params; omit both to get unpaginated results (default limit when paginating: 50, max 200).

Full endpoint reference with request/response shapes: [`docs/api-reference.html`](docs/api-reference.html).

### Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | No |

Returns Mongo and Redis connectivity. `503` if either check fails.

### Users (`/api/users`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/me` | Current user profile |
| PATCH | `/me` | Update profile |
| DELETE | `/me` | Delete account (cascade) |
| GET | `/:userId` | Public profile by id |

### Teams (`/api/teams`)

| Method | Path | Role |
|--------|------|------|
| POST | `/` | Create team (caller becomes manager) |
| GET | `/` | List teams for current user |
| GET | `/:teamId` | Team detail |
| PATCH | `/:teamId` | Update team |
| DELETE | `/:teamId` | Delete team and related data |
| POST | `/:invitationCode` | Join by invitation code |
| POST | `/:invitationToken/accept` | Accept email invitation |
| GET | `/:teamId/projects` | List projects |
| POST | `/:teamId/projects` | manager — create project |
| POST | `/:teamId/invitations` | manager — invite by email |
| GET | `/:teamId/invitations` | List pending invitations |
| DELETE | `/:teamId/invitations/:invitationToken` | manager — revoke invitation |
| PATCH | `/:teamId/members/:userId` | manager — change member role |

### Projects (`/api/projects`)

| Method | Path | Role |
|--------|------|------|
| GET | `/:projectId` | Project detail |
| PUT | `/:projectId` | manager — update |
| DELETE | `/:projectId` | manager — delete (cascade) |
| GET | `/:projectId/tasks` | List tasks |
| POST | `/:projectId/tasks` | manager — create task |
| GET | `/:projectId/sprints` | List sprints |
| POST | `/:projectId/sprints` | manager — create sprint |

### Sprints (`/api/sprints`)

| Method | Path | Role |
|--------|------|------|
| GET | `/:sprintId` | Sprint detail |
| PUT | `/:sprintId` | manager — update |
| DELETE | `/:sprintId` | manager — delete |
| POST | `/:sprintId/complete` | manager — mark completed |

Sprint `status`: `active` or `completed`.

### Tasks (`/api/tasks`)

| Method | Path | Role |
|--------|------|------|
| GET | `/:taskId` | Task detail |
| PUT | `/:taskId` | manager — update |
| DELETE | `/:taskId` | manager — delete |
| POST | `/:taskId/subtasks` | manager — add subtask |
| PATCH | `/:taskId/subtasks/:subtaskId` | manager — update subtask |
| DELETE | `/:taskId/subtasks/:subtaskId` | manager — remove subtask |
| POST | `/:taskId/comments` | Add comment |
| PATCH | `/:taskId/comments/:commentId` | Edit own comment |
| DELETE | `/:taskId/comments/:commentId` | Delete own comment |

Task `priority`: `Urgent`, `High`, `Medium`, `Low`. Task `status`: `Backlog`, `To Do`, `In Progress`, `Review`, `Done`.

### AI (`/api/ai`)

| Method | Path | Role | Body |
|--------|------|------|------|
| POST | `/:projectId/chat` | member+ | `{ "message": string, "sessionId"?: string }` |
| POST | `/:projectId/tasks` | manager | `{ "message": string }` |
| POST | `/:projectId/chat-history/:sessionId` | member+ | — |

Messages must be 1–4000 characters. Chat uses `AI_CHAT_MODEL`; task generation uses `AI_TASK_MODEL` (lower temperature for steadier JSON). Chat returns `{ sessionId, response }`. Task generation returns `{ tasks }` as structured suggestions. The chat assistant is scoped to Agile PM help for the project; prompts include injection guards.

## Project layout

```
src/
├── main.ts              # Bootstrap: DB, Redis, Firebase, OpenAI, listen
├── app.ts               # Express app factory (used by tests)
├── ai/                  # Chat + task generation
├── teams/               # Teams, invitations, memberships
├── projects/            # Projects
├── sprints/             # Sprints
├── tasks/               # Tasks, subtasks, comments
├── users/               # User profiles
├── models/              # Mongoose schemas
├── middleware/          # Auth, rate limits, resource resolvers, roles
├── lib/                 # DB, Redis, Firebase, OpenAI, pagination, validators
├── prompts/             # System prompts for AI
├── services/            # Delete cascades
└── types/               # Shared TypeScript types

tests/
├── unit/
├── integration/
└── setup/               # Env, mocks, in-memory Mongo
```

Route modules follow a consistent pattern: `routes.ts` wires HTTP paths, `controller.ts` handles requests, `services.ts` holds business logic.

## Testing

```bash
npm test              # all tests (unit + integration)
npm run test:watch    # watch mode
npm run typecheck     # tsc --noEmit
```

Integration tests use `mongodb-memory-server` and mocked Firebase/OpenAI/Redis where needed. The app exports `createApp()` from `main.ts` so tests can hit routes without binding a port.

## Delete cascades

Deleting a team, project, sprint, task, or user triggers coordinated cleanup in `src/services/delete-cascade.ts`. Related documents (memberships, invitations, tasks, comments, sprints) are removed together. Replica sets use transactions; standalone MongoDB falls back to sequential deletes.

## Security notes

- `helmet` for default HTTP headers
- CORS locked to `FRONTEND_URL`
- JSON body limit: 1 MB
- AI chat prompts treat user input as untrusted and block role override attempts
- ObjectId validation on path params before DB lookups

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/main.js` |
| `npm run typecheck` | Type check without emit |
| `npm test` | Run test suite |

## License

ISC
