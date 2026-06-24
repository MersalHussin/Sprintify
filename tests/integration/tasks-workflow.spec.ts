import { describe, expect, it } from "vitest";

import { authed, TOKENS } from "../helpers";
import { seedProjectWorkspace } from "../factories";

describe("project task workflow", () => {
  it("lists tasks, creates a task, and reads it by id", async () => {
    const { project, team } = await seedProjectWorkspace();

    const listResponse = await authed(TOKENS.member).get(`/api/projects/${project._id}/tasks`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.tasks).toHaveLength(1);

    const createResponse = await authed(TOKENS.manager)
      .post(`/api/projects/${project._id}/tasks`)
      .send({ name: "Add OAuth provider", priority: "High", status: "To Do" });
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.task.name).toBe("Add OAuth provider");

    const taskId = createResponse.body.data.task._id as string;
    const detailResponse = await authed(TOKENS.member).get(`/api/tasks/${taskId}`);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.task.name).toBe("Add OAuth provider");
    expect(detailResponse.body.data.comments).toEqual([]);
    expect(detailResponse.body.data.task.teamId).toBe(team._id.toString());
  });

  it("supports optional pagination on task lists", async () => {
    const { project } = await seedProjectWorkspace();

    const response = await authed(TOKENS.member)
      .get(`/api/projects/${project._id}/tasks`)
      .query({ page: 1, limit: 1 });

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination.total).toBe(1);
  });
});
