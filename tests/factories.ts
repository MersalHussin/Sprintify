import { Types } from "mongoose";

import { Project } from "../src/models/project";
import { Sprint } from "../src/models/sprint";
import { Task } from "../src/models/task";
import { Team } from "../src/models/team";
import { TeamMembership } from "../src/models/team-memberships";
import { User } from "../src/models/user";

export async function createUser(overrides: Partial<{ uid: string; firstName: string; lastName: string }> = {}) {
  return User.create({
    uid: overrides.uid ?? "manager-uid",
    firstName: overrides.firstName ?? "Ada",
    lastName: overrides.lastName ?? "Manager",
    professionalTitle: "Engineering Manager",
    gender: "prefer-not-to-say",
    timezone: "America/New_York",
    country: "US",
  });
}

export async function createTeamWithMembership(
  userId: string,
  role: "manager" | "member" = "manager",
  teamName = "Platform Team",
) {
  const team = await Team.create({ name: teamName, createdBy: userId });
  await TeamMembership.create({ teamId: team._id, userId, role });
  return team;
}

export async function createProject(teamId: Types.ObjectId, createdBy: string, name = "Mobile App") {
  return Project.create({ name, teamId, createdBy });
}

export async function createTask(
  projectId: Types.ObjectId,
  teamId: Types.ObjectId,
  createdBy: string,
  name = "Implement auth",
) {
  return Task.create({ name, projectId, teamId, createdBy });
}

export async function createSprint(projectId: Types.ObjectId, teamId: Types.ObjectId, name = "Sprint 1") {
  return Sprint.create({ name, projectId, teamId, startDate: new Date() });
}

export async function seedProjectWorkspace() {
  await createUser({ uid: "manager-uid" });
  await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });

  const team = await createTeamWithMembership("manager-uid", "manager");
  await TeamMembership.create({ teamId: team._id, userId: "member-uid", role: "member" });
  const project = await createProject(team._id, "manager-uid");
  const task = await createTask(project._id, team._id, "manager-uid");
  const sprint = await createSprint(project._id, team._id);

  return { team, project, task, sprint };
}
