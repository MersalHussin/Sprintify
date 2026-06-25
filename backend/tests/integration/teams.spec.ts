import { describe, expect, it } from "vitest";

import { authed, TOKENS, testApp } from "../helpers";
import { createProject, createSprint, createTask, createTeamWithMembership, createUser } from "../factories";
import { Invitation } from "../../src/models/invitation";
import { Project } from "../../src/models/project";
import { Sprint } from "../../src/models/sprint";
import { Task } from "../../src/models/task";
import { TaskComment } from "../../src/models/task-comment";
import { Team } from "../../src/models/team";
import { TeamMembership } from "../../src/models/team-memberships";
import { kickTeamMemberService } from "../../src/teams/services";

describe("teams API", () => {
  it("returns 401 without auth", async () => {
    const response = await testApp().get("/api/teams");
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("UNAUTHORIZED");
  });

  it("returns the same default workspace for concurrent create requests", async () => {
    await createUser({ uid: "manager-uid" });

    const [first, second] = await Promise.all([
      authed(TOKENS.manager).post("/api/teams").send({ name: "My Workspace" }),
      authed(TOKENS.manager).post("/api/teams").send({ name: "My Workspace" }),
    ]);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.data.team._id).toBe(second.body.data.team._id);

    const teams = await Team.find({ createdBy: "manager-uid", name: "My Workspace" });
    expect(teams).toHaveLength(1);
    expect(await TeamMembership.countDocuments({ userId: "manager-uid" })).toBe(1);
  });

  it("lists teams for the authenticated user", async () => {
    await createUser({ uid: "manager-uid" });
    await createTeamWithMembership("manager-uid", "manager", "Core Team");

    const response = await authed(TOKENS.manager).get("/api/teams");

    expect(response.status).toBe(200);
    expect(response.body.data.teams).toHaveLength(1);
    expect(response.body.data.teams[0].name).toBe("Core Team");
  });

  it("returns 404 for non-members accessing a team", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid");

    const response = await authed(TOKENS.member).get(`/api/teams/${team._id}`);

    expect(response.status).toBe(404);
  });

  it("joins a team by team code", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");

    const response = await authed(TOKENS.member).post(`/api/teams/${team.code}`);

    expect(response.status).toBe(200);
    expect(response.body.data.team._id).toBe(team._id.toString());
    expect(response.body.data.role).toBe("member");
  });

  it("returns 404 for an invalid team code", async () => {
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });

    const response = await authed(TOKENS.member).post("/api/teams/ZZZZZZZZ");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Team not found");
  });

  it("returns caller role when fetching a team", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");

    const response = await authed(TOKENS.manager).get(`/api/teams/${team._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.callerRole).toBe("manager");
    expect(response.body.data.members).toHaveLength(1);
  });

  it("allows a manager to promote a member", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });

    const response = await authed(TOKENS.manager)
      .patch(`/api/teams/${team._id}/members/member-uid`)
      .send({ role: "manager" });

    expect(response.status).toBe(200);
    expect(response.body.data.member.role).toBe("manager");
  });

  it("prevents demoting the only manager", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");

    const response = await authed(TOKENS.manager)
      .patch(`/api/teams/${team._id}/members/manager-uid`)
      .send({ role: "member" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cannot demote the only manager");
  });

  it("allows a manager to remove another member", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });

    const response = await authed(TOKENS.manager).delete(`/api/teams/${team._id}/members/member-uid`);

    expect(response.status).toBe(200);
    const membership = await TeamMembership.findOne({ teamId: team._id, userId: "member-uid" });
    expect(membership).toBeNull();
  });

  it("prevents a manager from removing themselves", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");

    const response = await authed(TOKENS.manager).delete(`/api/teams/${team._id}/members/manager-uid`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cannot remove yourself from the team");
  });

  it("allows a member to leave a team", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });

    const response = await authed(TOKENS.member).post(`/api/teams/${team._id}/leave`);

    expect(response.status).toBe(200);
    expect(response.body.data.teamDeleted).toBe(false);
    const membership = await TeamMembership.findOne({ teamId: team._id, userId: "member-uid" });
    expect(membership).toBeNull();
  });

  it("prevents the only manager from leaving when other members exist", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });

    const response = await authed(TOKENS.manager).post(`/api/teams/${team._id}/leave`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cannot leave team as the only manager");
  });

  it("deletes the team when the last member leaves", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Solo Team");

    const response = await authed(TOKENS.manager).post(`/api/teams/${team._id}/leave`);

    expect(response.status).toBe(200);
    expect(response.body.data.teamDeleted).toBe(true);
    expect(await Team.findById(team._id)).toBeNull();
    expect(await TeamMembership.countDocuments({ teamId: team._id })).toBe(0);
  });

  it("cascade-deletes related data when the last member leaves", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Solo Team");
    const project = await createProject(team._id, "manager-uid");
    const task = await createTask(project._id, team._id, "manager-uid");
    const sprint = await createSprint(project._id, team._id);
    await Invitation.create({
      teamId: team._id,
      email: "invitee@example.com",
      token: "invite-token-1",
      invitedBy: "manager-uid",
      expiresAt: new Date(Date.now() + 86_400_000),
    });
    await TaskComment.create({ taskId: task._id, author: "manager-uid", content: "Looks good" });

    const response = await authed(TOKENS.manager).post(`/api/teams/${team._id}/leave`);

    expect(response.status).toBe(200);
    expect(response.body.data.teamDeleted).toBe(true);
    expect(await Team.findById(team._id)).toBeNull();
    expect(await TeamMembership.countDocuments({ teamId: team._id })).toBe(0);
    expect(await Project.countDocuments({ teamId: team._id })).toBe(0);
    expect(await Task.countDocuments({ teamId: team._id })).toBe(0);
    expect(await Sprint.countDocuments({ teamId: team._id })).toBe(0);
    expect(await Invitation.countDocuments({ teamId: team._id })).toBe(0);
    expect(await TaskComment.countDocuments({ taskId: task._id })).toBe(0);
  });

  it("does not delete the team when a non-final member is kicked", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid", "manager", "Core Team");
    await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });

    const response = await authed(TOKENS.manager).delete(`/api/teams/${team._id}/members/member-uid`);

    expect(response.status).toBe(200);
    expect(response.body.data.teamDeleted).toBe(false);
    expect(await Team.findById(team._id)).not.toBeNull();
    expect(await TeamMembership.countDocuments({ teamId: team._id })).toBe(1);
  });

  it("cascade-deletes the team when kicking the sole member", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("member-uid", "member", "Solo Team");
    const project = await createProject(team._id, "member-uid");
    const task = await createTask(project._id, team._id, "member-uid");

    const result = await kickTeamMemberService(team._id, "member-uid", "manager-uid");

    expect(result.teamDeleted).toBe(true);
    expect(await Team.findById(team._id)).toBeNull();
    expect(await TeamMembership.countDocuments({ teamId: team._id })).toBe(0);
    expect(await Project.countDocuments({ teamId: team._id })).toBe(0);
    expect(await Task.countDocuments({ teamId: task._id })).toBe(0);
  });
});
