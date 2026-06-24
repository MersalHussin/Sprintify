import type { NextFunction, Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { findCallerMembership } from "../lib/team-access";
import { Project } from "../models/project";
import { Task } from "../models/task";

export const resolveTask = async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params as { taskId: string };
  if(!taskId) return handleResponse(res, 400, undefined, "Task ID is required");

  const task = await Task.findById(taskId);
  if(!task) return handleResponse(res, 404, undefined, "Task not found");

  // Membership and project lookups are independent once task refs are loaded.
  const [membership, project] = await Promise.all([
    findCallerMembership(task.teamId, req.user!.id),
    Project.findById(task.projectId),
  ]);
  if(!membership) return handleResponse(res, 404, undefined, "Task not found");
  if(!project) return handleResponse(res, 404, undefined, "Task not found");

  req.task = task;
  req.project = project;
  req.callerMembership = { role: membership.role };

  next();
};
