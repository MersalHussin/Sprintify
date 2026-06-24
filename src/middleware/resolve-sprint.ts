import type { NextFunction, Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { MEMBERSHIP_ROLE_FIELDS } from "../lib/query-projections";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";
import { TeamMembership } from "../models/team-memberships";

export const resolveSprint = async (req: Request, res: Response, next: NextFunction) => {
  const { sprintId } = req.params as { sprintId: string };
  if(!sprintId) return handleResponse(res, 400, undefined, "Sprint ID is required");

  const sprint = await Sprint.findById(sprintId);
  if(!sprint) return handleResponse(res, 404, undefined, "Sprint not found");

  const [membership, project] = await Promise.all([
    TeamMembership.findOne({ teamId: sprint.teamId, userId: req.user!.id }).select(MEMBERSHIP_ROLE_FIELDS),
    Project.findById(sprint.projectId),
  ]);
  if(!membership) return handleResponse(res, 404, undefined, "Sprint not found");
  if(!project) return handleResponse(res, 404, undefined, "Sprint not found");

  req.sprint = sprint;
  req.project = project;
  req.callerMembership = { role: membership.role };

  next();
};
