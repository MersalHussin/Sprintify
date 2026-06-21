import type { Request, Response, NextFunction } from "express";

import type { ProjectDetails } from "../constants/chat-assistant-prompt";
import { handleResponse } from "../lib/response-handler";
import { buildTeamMembers, toPromptTeamMembers } from "../lib/team-members";
import { getUsersByIds } from "../lib/users";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";
import { Task } from "../models/task";
import { Team } from "../models/team";
import { TeamMembership } from "../models/team-memberships";

export const resolveProject = async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params as { projectId: string };
  if (!projectId) return handleResponse(res, 400, undefined, "Project ID is required");

  const project = await Project.findById(projectId);
  if (!project) return handleResponse(res, 404, undefined, "Project not found");

  const callerMembership = await TeamMembership.findOne({
    teamId: project.teamId,
    userId: req.user!.id,
  });
  if (!callerMembership)
    return handleResponse(res, 404, undefined, "You are not a member of this team");

  const [team, tasks, sprints, memberships] = await Promise.all([
    Team.findById(project.teamId),
    Task.find({ projectId: project._id }),
    Sprint.find({ projectId: project._id }),
    TeamMembership.find({ teamId: project.teamId }),
  ]);

  if (!team) return handleResponse(res, 404, undefined, "Team not found");

  const assigneeIds = tasks.flatMap((task) => task.assignees ?? []);
  const memberIds = memberships.map((membership) => membership.userId);
  const usersById = await getUsersByIds([...memberIds, ...assigneeIds]);

  const teamMembers = buildTeamMembers(memberships, usersById);

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
