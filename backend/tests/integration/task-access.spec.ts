import { describe, expect, it } from "vitest";

import { assertTaskMember } from "../../src/lib/task-access";
import { createTask, createTeamWithMembership, createUser, createProject } from "../factories";

describe("assertTaskMember", () => {
  it("throws when caller is not a team member", async () => {
    await createUser({ uid: "owner-uid" });
    await createUser({ uid: "outsider-uid", firstName: "Out", lastName: "Side" });
    const team = await createTeamWithMembership("owner-uid");
    const project = await createProject(team._id, "owner-uid");
    const task = await createTask(project._id, team._id, "owner-uid");

    await expect(assertTaskMember(task._id.toString(), "outsider-uid")).rejects.toThrow("Task not found");
  });

  it("returns teamId slice when caller is a member", async () => {
    await createUser({ uid: "owner-uid" });
    const team = await createTeamWithMembership("owner-uid");
    const project = await createProject(team._id, "owner-uid");
    const task = await createTask(project._id, team._id, "owner-uid");

    const authTask = await assertTaskMember(task._id.toString(), "owner-uid");
    expect(authTask.teamId.toString()).toBe(team._id.toString());
  });
});
