import type { Request, Response, NextFunction } from "express";

import type { ProjectDetails } from "../prompts/chat-assistant-prompt";
import { handleResponse } from "../lib/response-handler";
import { buildTeamMembers, toPromptTeamMembers } from "../lib/team-members";
import { SPRINT_CONTEXT_FIELDS, TASK_CONTEXT_FIELDS } from "../lib/query-projections";
import { getUsersByUids, populateUserField, toAuthUser, type UserDisplayDocument } from "../lib/users";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";
import { Task } from "../models/task";
import { Team } from "../models/team";
import { TeamMembership } from "../models/team-memberships";

export const resolveProject = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params as { projectId: string };
  if(!projectId) return handleResponse(res, 400, undefined, "Project ID is required");

  const project = await Project.findById(projectId);
  if(!project) return handleResponse(res, 404, undefined, "Project not found");

  const callerMembership = await TeamMembership.findOne({
    teamId: project.teamId,
    userId: req.user!.id,
  });
  if(!callerMembership)
    return handleResponse(res, 404, undefined, "You are not a member of this team");

  const [team, tasks, sprints, memberships] = await Promise.all([
    Team.findById(project.teamId),
    Task.find({ projectId: project._id }).select(TASK_CONTEXT_FIELDS),
    Sprint.find({ projectId: project._id }).select(SPRINT_CONTEXT_FIELDS),
    TeamMembership.find({ teamId: project.teamId }).populate<{ user: UserDisplayDocument | null }>(
      populateUserField("user"),
    ),
  ]);

  if(!team) return handleResponse(res, 404, undefined, "Team not found");

  const teamMembers = buildTeamMembers(memberships);
  const assigneeUids = tasks.flatMap((task) => task.assignees ?? []);
  const usersByUid = await getUsersByUids(assigneeUids);

  const usersById = new Map(
    [...usersByUid.values()].map((user) => [user.uid, toAuthUser(user)]),
  );
  for (const member of teamMembers) {
    if(member.user) usersById.set(member.userId, member.user);
  }

  const projectDetails: ProjectDetails = {
    name: project.name,
    team,
    tasks,
    sprints,
  };

  req.project = project;
  req.team = team;
  req.callerMembership = { role: callerMembership.role };
  req.teamMembers = teamMembers;
  req.projectDetails = projectDetails;
  req.promptTeamMembers = toPromptTeamMembers(teamMembers);
  req.usersById = usersById;

  next();
};
