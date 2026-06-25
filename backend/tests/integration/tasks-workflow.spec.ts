import { describe, expect, it } from "vitest";

import { Task } from "../../src/models/task";
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

  it("allows assignees to update status and manage subtasks", async () => {
    const { task } = await seedProjectWorkspace();
    await Task.findByIdAndUpdate(task._id, { assignees: ["member-uid"] });

    const statusResponse = await authed(TOKENS.member)
      .put(`/api/tasks/${task._id}`)
      .send({ status: "In Progress" });
    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.task.status).toBe("In Progress");

    const forbiddenResponse = await authed(TOKENS.member)
      .put(`/api/tasks/${task._id}`)
      .send({ name: "Blocked rename" });
    expect(forbiddenResponse.status).toBe(403);

    const createSubtaskResponse = await authed(TOKENS.member)
      .post(`/api/tasks/${task._id}/subtasks`)
      .send({ name: "Assignee subtask" });
    expect(createSubtaskResponse.status).toBe(201);

    const subtaskId = createSubtaskResponse.body.data.task.subtasks[0]._id as string;
    const patchResponse = await authed(TOKENS.member)
      .patch(`/api/tasks/${task._id}/subtasks/${subtaskId}`)
      .send({ completed: true });
    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.data.task.subtasks[0].completed).toBe(true);

    const deleteResponse = await authed(TOKENS.member)
      .delete(`/api/tasks/${task._id}/subtasks/${subtaskId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.task.subtasks).toHaveLength(0);
  });

  it("forbids non-assignee members from updating tasks", async () => {
    const { task } = await seedProjectWorkspace();

    const response = await authed(TOKENS.member)
      .put(`/api/tasks/${task._id}`)
      .send({ status: "In Progress" });
    expect(response.status).toBe(403);
  });
});
