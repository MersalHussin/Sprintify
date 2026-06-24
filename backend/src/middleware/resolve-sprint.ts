import type { NextFunction, Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { findCallerMembership } from "../lib/team-access";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";

export const resolveSprint = async (req: Request, res: Response, next: NextFunction) => {
  const { sprintId } = req.params as { sprintId: string };
  if(!sprintId) return handleResponse(res, 400, undefined, "Sprint ID is required");

  const sprint = await Sprint.findById(sprintId);
  if(!sprint) return handleResponse(res, 404, undefined, "Sprint not found");

  const [membership, project] = await Promise.all([
    findCallerMembership(sprint.teamId, req.user!.id),
    Project.findById(sprint.projectId),
  ]);
  if(!membership) return handleResponse(res, 404, undefined, "Sprint not found");
  if(!project) return handleResponse(res, 404, undefined, "Sprint not found");

  req.sprint = sprint;
  req.project = project;
  req.callerMembership = { role: membership.role };

  return next();
};
