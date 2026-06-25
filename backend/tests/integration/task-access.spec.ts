import { describe, expect, it } from "vitest";

import { assertTaskManagerOrAssignee, assertTaskMember } from "../../src/lib/task-access";
import { Task } from "../../src/models/task";
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

describe("assertTaskManagerOrAssignee", () => {
  it("allows managers", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid", "manager");
    const project = await createProject(team._id, "manager-uid");
    const task = await createTask(project._id, team._id, "manager-uid");

    const result = await assertTaskManagerOrAssignee(task._id.toString(), "manager-uid");
    expect(result.isManager).toBe(true);
  });

  it("allows assignees who are not managers", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager");
    const { TeamMembership } = await import("../../src/models/team-memberships");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });
    const project = await createProject(team._id, "manager-uid");
    const task = await createTask(project._id, team._id, "manager-uid");
    await Task.findByIdAndUpdate(task._id, { assignees: ["member-uid"] });

    const result = await assertTaskManagerOrAssignee(task._id.toString(), "member-uid");
    expect(result.isManager).toBe(false);
  });

  it("forbids members who are not assignees", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager");
    const { TeamMembership } = await import("../../src/models/team-memberships");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });
    const project = await createProject(team._id, "manager-uid");
    const task = await createTask(project._id, team._id, "manager-uid");

    await expect(assertTaskManagerOrAssignee(task._id.toString(), "member-uid")).rejects.toThrow("Forbidden");
  });
});
