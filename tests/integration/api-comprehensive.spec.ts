/**
 * Comprehensive API test suite — all 41 documented endpoints.
 * Uses in-process supertest + mocked Firebase (manager-token / member-token).
 */
import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";

import { clearRedisStore } from "../setup/mocks";
import { authed, TOKENS, testApp } from "../helpers";
import {
  createProject,
  createSprint,
  createTask,
  createTeamWithMembership,
  createUser,
  seedProjectWorkspace,
} from "../factories";
import { Invitation } from "../../src/models/invitation";

type TestResult = {
  endpoint: string;
  scenario: string;
  status: number;
  pass: boolean;
  ms: number;
  note?: string;
};

export const results: TestResult[] = [];

function record(
  endpoint: string,
  scenario: string,
  status: number,
  expected: number | number[],
  ms: number,
  note?: string,
) {
  const expectedList = Array.isArray(expected) ? expected : [expected];
  const pass = expectedList.includes(status);
  results.push({ endpoint, scenario, status, pass, ms, note });
  expect(expectedList).toContain(status);
}

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, ms: Date.now() - start };
}

describe("API comprehensive test suite", () => {
  describe("Health", () => {
    it("GET /health — happy path", async () => {
      const { result: res, ms } = await timed(() => testApp().get("/health"));
      record("GET /health", "Happy path — dependencies healthy", res.status, 200, ms);
      expect(res.body.checks.mongo).toBe("ok");
    });
  });

  describe("Authentication", () => {
    it("GET /api/users/me — missing token", async () => {
      const { result: res, ms } = await timed(() => testApp().get("/api/users/me"));
      record("GET /api/users/me", "Missing Authorization header", res.status, 401, ms);
    });

    it("GET /api/users/me — invalid token", async () => {
      const { result: res, ms } = await timed(() =>
        testApp().get("/api/users/me").set("Authorization", "Bearer bad-token"),
      );
      record("GET /api/users/me", "Invalid/expired token", res.status, 401, ms);
    });
  });

  describe("Users", () => {
    it("GET /api/users/me — creates profile on first access", async () => {
      await createUser({ uid: "manager-uid" });
      const { result: res, ms } = await timed(() => authed(TOKENS.manager).get("/api/users/me"));
      record("GET /api/users/me", "Happy path — returns profile", res.status, 200, ms);
      expect(res.body.data.user.uid).toBe("manager-uid");
    });

    it("PATCH /api/users/me — happy path", async () => {
      await createUser({ uid: "manager-uid" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).patch("/api/users/me").send({ firstName: "Updated" }),
      );
      record("PATCH /api/users/me", "Happy path — update profile", res.status, 200, ms);
      expect(res.body.data.user.firstName).toBe("Updated");
    });

    it("PATCH /api/users/me — invalid gender", async () => {
      await createUser({ uid: "manager-uid" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).patch("/api/users/me").send({ gender: "invalid" }),
      );
      record("PATCH /api/users/me", "Invalid gender enum", res.status, 400, ms);
    });

    it("GET /api/users/{userId} — teammate public profile", async () => {
      const { team } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get("/api/users/member-uid"),
      );
      record("GET /api/users/{userId}", "Happy path — shared team member", res.status, 200, ms);
      expect(res.body.data.user.id).toBe("member-uid");
      void team;
    });

    it("GET /api/users/{userId} — non-teammate returns 404", async () => {
      await createUser({ uid: "manager-uid" });
      await createUser({ uid: "outsider-uid", firstName: "Out", lastName: "Side" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).get("/api/users/outsider-uid"),
      );
      record("GET /api/users/{userId}", "Non-teammate — access denied", res.status, 404, ms);
    });
  });

  describe("Teams", () => {
    it("POST /api/teams — happy path", async () => {
      await createUser({ uid: "manager-uid" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).post("/api/teams").send({ name: "New Team" }),
      );
      record("POST /api/teams", "Happy path — create team", res.status, 201, ms);
    });

    it("POST /api/teams — missing name", async () => {
      await createUser({ uid: "manager-uid" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).post("/api/teams").send({}),
      );
      record("POST /api/teams", "Missing required name", res.status, 400, ms);
    });

    it("GET /api/teams — list teams", async () => {
      await createUser({ uid: "manager-uid" });
      await createTeamWithMembership("manager-uid", "manager", "Alpha");
      const { result: res, ms } = await timed(() => authed(TOKENS.manager).get("/api/teams"));
      record("GET /api/teams", "Happy path — unpaginated list", res.status, 200, ms);
      expect(res.body.data.teams.length).toBeGreaterThan(0);
    });

    it("GET /api/teams — pagination", async () => {
      await createUser({ uid: "manager-uid" });
      await createTeamWithMembership("manager-uid", "manager", "Alpha");
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).get("/api/teams").query({ page: 1, limit: 10 }),
      );
      record("GET /api/teams", "Pagination query params", res.status, 200, ms);
      expect(res.body.data.pagination).toBeDefined();
    });

    it("GET /api/teams/{teamId} — happy path", async () => {
      await createUser({ uid: "manager-uid" });
      const team = await createTeamWithMembership("manager-uid");
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).get(`/api/teams/${team._id}`),
      );
      record("GET /api/teams/{teamId}", "Happy path — team details", res.status, 200, ms);
    });

    it("GET /api/teams/{teamId} — invalid ObjectId", async () => {
      await createUser({ uid: "manager-uid" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).get("/api/teams/not-an-objectid"),
      );
      record("GET /api/teams/{teamId}", "Invalid ObjectId format", res.status, 400, ms);
    });

    it("PATCH /api/teams/{teamId} — happy path", async () => {
      await createUser({ uid: "manager-uid" });
      const team = await createTeamWithMembership("manager-uid");
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).patch(`/api/teams/${team._id}`).send({ name: "Renamed" }),
      );
      record("PATCH /api/teams/{teamId}", "Happy path — rename team", res.status, 200, ms);
    });

    it("POST /api/teams/{teamId}/invitations — happy path", async () => {
      await createUser({ uid: "manager-uid" });
      const team = await createTeamWithMembership("manager-uid");
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .post(`/api/teams/${team._id}/invitations`)
          .send({ email: "invite@example.com" }),
      );
      record("POST /api/teams/{teamId}/invitations", "Happy path — create invitation", res.status, 201, ms);
    });

    it("GET /api/teams/{teamId}/invitations — list invitations", async () => {
      await createUser({ uid: "manager-uid" });
      const team = await createTeamWithMembership("manager-uid");
      await authed(TOKENS.manager)
        .post(`/api/teams/${team._id}/invitations`)
        .send({ email: "invite@example.com" });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).get(`/api/teams/${team._id}/invitations`),
      );
      record("GET /api/teams/{teamId}/invitations", "Happy path — list invitations", res.status, 200, ms);
    });

    it("POST /api/teams/{invitationCode} — join by code", async () => {
      await createUser({ uid: "manager-uid" });
      await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
      const team = await createTeamWithMembership("manager-uid");
      const token = randomUUID();
      await Invitation.create({
        teamId: team._id,
        email: "member@sprintify.test",
        token,
        invitedBy: "manager-uid",
        expiresAt: new Date(Date.now() + 86400000),
      });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).post(`/api/teams/${token}`),
      );
      record("POST /api/teams/{invitationCode}", "Happy path — join team", res.status, [200, 201], ms);
    });

    it("POST /api/teams/{invitationToken}/accept — email match", async () => {
      await createUser({ uid: "manager-uid" });
      await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
      const team = await createTeamWithMembership("manager-uid");
      const token = randomUUID();
      await Invitation.create({
        teamId: team._id,
        email: "member@sprintify.test",
        token,
        invitedBy: "manager-uid",
        expiresAt: new Date(Date.now() + 86400000),
      });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).post(`/api/teams/${token}/accept`),
      );
      record("POST /api/teams/{invitationToken}/accept", "Happy path — accept invitation", res.status, [200, 201], ms);
    });

    it("PATCH /api/teams/{teamId}/members/{userId} — update role", async () => {
      const { team } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .patch(`/api/teams/${team._id}/members/member-uid`)
          .send({ role: "manager" }),
      );
      record("PATCH /api/teams/{teamId}/members/{userId}", "Happy path — promote member", res.status, 200, ms);
    });

    it("PATCH /api/teams/{teamId}/members/{userId} — member forbidden", async () => {
      const { team } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member)
          .patch(`/api/teams/${team._id}/members/manager-uid`)
          .send({ role: "member" }),
      );
      record("PATCH /api/teams/{teamId}/members/{userId}", "Member role — insufficient permissions", res.status, 403, ms);
    });
  });

  describe("Projects", () => {
    it("GET /api/teams/{teamId}/projects — list projects", async () => {
      const { team, project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get(`/api/teams/${team._id}/projects`),
      );
      record("GET /api/teams/{teamId}/projects", "Happy path — list projects", res.status, 200, ms);
      expect(res.body.data.projects.some((p: { _id: string }) => p._id === project._id.toString())).toBe(true);
    });

    it("POST /api/teams/{teamId}/projects — happy path", async () => {
      const { team } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .post(`/api/teams/${team._id}/projects`)
          .send({ name: "Backend API" }),
      );
      record("POST /api/teams/{teamId}/projects", "Happy path — create project", res.status, 201, ms);
    });

    it("POST /api/teams/{teamId}/projects — member forbidden", async () => {
      const { team } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).post(`/api/teams/${team._id}/projects`).send({ name: "Blocked" }),
      );
      record("POST /api/teams/{teamId}/projects", "Member role — manager required", res.status, 403, ms);
    });

    it("GET /api/projects/{projectId} — happy path", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get(`/api/projects/${project._id}`),
      );
      record("GET /api/projects/{projectId}", "Happy path — project details", res.status, 200, ms);
    });

    it("PUT /api/projects/{projectId} — happy path + idempotency", async () => {
      const { project } = await seedProjectWorkspace();
      const url = `/api/projects/${project._id}`;
      const body = { name: "Renamed Project" };
      const first = await authed(TOKENS.manager).put(url).send(body);
      const second = await authed(TOKENS.manager).put(url).send(body);
      record("PUT /api/projects/{projectId}", "Happy path — update name", first.status, 200, 0);
      record("PUT /api/projects/{projectId}", "Idempotency — repeated PUT", second.status, 200, 0);
      expect(second.body.data.project.name).toBe("Renamed Project");
    });

    it("GET /api/projects/{projectId}/tasks — list tasks", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get(`/api/projects/${project._id}/tasks`),
      );
      record("GET /api/projects/{projectId}/tasks", "Happy path — list tasks", res.status, 200, ms);
    });

    it("POST /api/projects/{projectId}/tasks — happy path", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .post(`/api/projects/${project._id}/tasks`)
          .send({ name: "New task", priority: "High" }),
      );
      record("POST /api/projects/{projectId}/tasks", "Happy path — create task", res.status, 201, ms);
    });

    it("POST /api/projects/{projectId}/tasks — empty name", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).post(`/api/projects/${project._id}/tasks`).send({ name: "" }),
      );
      record("POST /api/projects/{projectId}/tasks", "Empty name — validation error", res.status, 400, ms);
    });

    it("GET /api/projects/{projectId}/sprints — list sprints", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get(`/api/projects/${project._id}/sprints`),
      );
      record("GET /api/projects/{projectId}/sprints", "Happy path — list sprints", res.status, 200, ms);
    });

    it("POST /api/projects/{projectId}/sprints — happy path", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .post(`/api/projects/${project._id}/sprints`)
          .send({ name: "Sprint 2", goal: "Ship v1" }),
      );
      record("POST /api/projects/{projectId}/sprints", "Happy path — create sprint", res.status, 201, ms);
    });
  });

  describe("Sprints", () => {
    it("GET /api/sprints/{sprintId} — happy path", async () => {
      const { sprint } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get(`/api/sprints/${sprint._id}`),
      );
      record("GET /api/sprints/{sprintId}", "Happy path — sprint details", res.status, 200, ms);
    });

    it("PUT /api/sprints/{sprintId} — happy path", async () => {
      const { sprint } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).put(`/api/sprints/${sprint._id}`).send({ goal: "New goal" }),
      );
      record("PUT /api/sprints/{sprintId}", "Happy path — update sprint", res.status, 200, ms);
    });

    it("POST /api/sprints/{sprintId}/complete — happy path", async () => {
      const { sprint } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).post(`/api/sprints/${sprint._id}/complete`),
      );
      record("POST /api/sprints/{sprintId}/complete", "Happy path — complete sprint", res.status, [200, 201], ms);
      expect(res.body.data.sprint.status).toBe("completed");
    });

    it("DELETE /api/sprints/{sprintId} — idempotency (second call 404)", async () => {
      const { sprint } = await seedProjectWorkspace();
      const url = `/api/sprints/${sprint._id}`;
      const first = await authed(TOKENS.manager).delete(url);
      const second = await authed(TOKENS.manager).delete(url);
      record("DELETE /api/sprints/{sprintId}", "Happy path — delete sprint", first.status, 200, 0);
      record("DELETE /api/sprints/{sprintId}", "Idempotency — second DELETE returns 404", second.status, 404, 0);
    });
  });

  describe("Tasks", () => {
    it("GET /api/tasks/{taskId} — happy path", async () => {
      const { task } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).get(`/api/tasks/${task._id}`),
      );
      record("GET /api/tasks/{taskId}", "Happy path — task with comments", res.status, 200, ms);
    });

    it("PUT /api/tasks/{taskId} — happy path", async () => {
      const { task } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .put(`/api/tasks/${task._id}`)
          .send({ name: "Updated task", status: "In Progress" }),
      );
      record("PUT /api/tasks/{taskId}", "Happy path — update task", res.status, 200, ms);
    });

    it("POST /api/tasks/{taskId}/subtasks — happy path", async () => {
      const { task } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .post(`/api/tasks/${task._id}/subtasks`)
          .send({ name: "Subtask A" }),
      );
      record("POST /api/tasks/{taskId}/subtasks", "Happy path — add subtask", res.status, 201, ms);
      expect(res.body.data.task.subtasks).toHaveLength(1);
    });

    it("PATCH /api/tasks/{taskId}/subtasks/{subtaskId} — happy path", async () => {
      const { task } = await seedProjectWorkspace();
      const createRes = await authed(TOKENS.manager)
        .post(`/api/tasks/${task._id}/subtasks`)
        .send({ name: "Subtask B" });
      const subtaskId = createRes.body.data.task.subtasks[0]._id as string;
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .patch(`/api/tasks/${task._id}/subtasks/${subtaskId}`)
          .send({ completed: true }),
      );
      record("PATCH /api/tasks/{taskId}/subtasks/{subtaskId}", "Happy path — mark complete", res.status, 200, ms);
    });

    it("DELETE /api/tasks/{taskId}/subtasks/{subtaskId} — happy path", async () => {
      const { task } = await seedProjectWorkspace();
      const createRes = await authed(TOKENS.manager)
        .post(`/api/tasks/${task._id}/subtasks`)
        .send({ name: "To remove" });
      const subtaskId = createRes.body.data.task.subtasks[0]._id as string;
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).delete(`/api/tasks/${task._id}/subtasks/${subtaskId}`),
      );
      record("DELETE /api/tasks/{taskId}/subtasks/{subtaskId}", "Happy path — remove subtask", res.status, 200, ms);
    });

    it("POST /api/tasks/{taskId}/comments — happy path", async () => {
      const { task } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member)
          .post(`/api/tasks/${task._id}/comments`)
          .send({ content: "Looks good!" }),
      );
      record("POST /api/tasks/{taskId}/comments", "Happy path — add comment", res.status, 201, ms);
    });

    it("PATCH /api/tasks/{taskId}/comments/{commentId} — author only", async () => {
      const { task } = await seedProjectWorkspace();
      const commentRes = await authed(TOKENS.member)
        .post(`/api/tasks/${task._id}/comments`)
        .send({ content: "Original" });
      const commentId = commentRes.body.data.comment._id as string;
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member)
          .patch(`/api/tasks/${task._id}/comments/${commentId}`)
          .send({ content: "Edited" }),
      );
      record("PATCH /api/tasks/{taskId}/comments/{commentId}", "Happy path — edit own comment", res.status, 200, ms);
    });

    it("DELETE /api/tasks/{taskId}/comments/{commentId} — non-author forbidden", async () => {
      const { task } = await seedProjectWorkspace();
      const commentRes = await authed(TOKENS.member)
        .post(`/api/tasks/${task._id}/comments`)
        .send({ content: "Member comment" });
      const commentId = commentRes.body.data.comment._id as string;
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).delete(`/api/tasks/${task._id}/comments/${commentId}`),
      );
      record("DELETE /api/tasks/{taskId}/comments/{commentId}", "Non-author — forbidden", res.status, 403, ms);
    });

    it("DELETE /api/tasks/{taskId} — idempotency", async () => {
      const { task } = await seedProjectWorkspace();
      const url = `/api/tasks/${task._id}`;
      const first = await authed(TOKENS.manager).delete(url);
      const second = await authed(TOKENS.manager).delete(url);
      record("DELETE /api/tasks/{taskId}", "Happy path — delete task", first.status, 200, 0);
      record("DELETE /api/tasks/{taskId}", "Idempotency — second DELETE returns 404", second.status, 404, 0);
    });
  });

  describe("AI", () => {
    it("POST /api/ai/{projectId}/chat — happy path", async () => {
      clearRedisStore();
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member)
          .post(`/api/ai/${project._id}/chat`)
          .send({ message: "Summarize progress" }),
      );
      record("POST /api/ai/{projectId}/chat", "Happy path — chat response", res.status, 200, ms);
      expect(res.body.data.response.content).toBeTruthy();
    });

    it("POST /api/ai/{projectId}/chat — empty message", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).post(`/api/ai/${project._id}/chat`).send({ message: "" }),
      );
      record("POST /api/ai/{projectId}/chat", "Empty message — validation error", res.status, 400, ms);
    });

    it("POST /api/ai/{projectId}/tasks — manager happy path", async () => {
      clearRedisStore();
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager)
          .post(`/api/ai/${project._id}/tasks`)
          .send({ message: "Generate onboarding tasks" }),
      );
      record("POST /api/ai/{projectId}/tasks", "Happy path — task generation", res.status, 200, ms);
    });

    it("POST /api/ai/{projectId}/tasks — member forbidden", async () => {
      const { project } = await seedProjectWorkspace();
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).post(`/api/ai/${project._id}/tasks`).send({ message: "Generate tasks" }),
      );
      record("POST /api/ai/{projectId}/tasks", "Member role — manager required", res.status, 403, ms);
    });

    it("POST /api/ai/{projectId}/chat-history/{sessionId} — happy path", async () => {
      clearRedisStore();
      const { project } = await seedProjectWorkspace();
      const chatRes = await authed(TOKENS.member)
        .post(`/api/ai/${project._id}/chat`)
        .send({ message: "Hello" });
      const sessionId = chatRes.body.data.sessionId as string;
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.member).post(`/api/ai/${project._id}/chat-history/${sessionId}`),
      );
      record("POST /api/ai/{projectId}/chat-history/{sessionId}", "Happy path — retrieve history", res.status, [200, 201], ms);
      expect(Array.isArray(res.body.data.chatHistory)).toBe(true);
    });
  });

  describe("Cleanup / destructive", () => {
    it("DELETE /api/teams/{teamId}/invitations/{invitationToken}", async () => {
      await createUser({ uid: "manager-uid" });
      const team = await createTeamWithMembership("manager-uid");
      const token = randomUUID();
      await Invitation.create({
        teamId: team._id,
        email: "revoke@example.com",
        token,
        invitedBy: "manager-uid",
        expiresAt: new Date(Date.now() + 86400000),
      });
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).delete(`/api/teams/${team._id}/invitations/${token}`),
      );
      record("DELETE /api/teams/{teamId}/invitations/{invitationToken}", "Happy path — revoke invitation", res.status, 200, ms);
    });

    it("DELETE /api/projects/{projectId} — happy path", async () => {
      const { team } = await seedProjectWorkspace();
      const project = await createProject(team._id, "manager-uid", "Disposable");
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).delete(`/api/projects/${project._id}`),
      );
      record("DELETE /api/projects/{projectId}", "Happy path — delete project", res.status, 200, ms);
    });

    it("DELETE /api/teams/{teamId} — happy path", async () => {
      await createUser({ uid: "manager-uid" });
      const team = await createTeamWithMembership("manager-uid", "manager", "Temp Team");
      const { result: res, ms } = await timed(() =>
        authed(TOKENS.manager).delete(`/api/teams/${team._id}`),
      );
      record("DELETE /api/teams/{teamId}", "Happy path — delete team", res.status, 200, ms);
    });
  });
});
