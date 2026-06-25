import type { NextFunction, Request, Response } from "express";

import { isTaskAssignee } from "../lib/task-access";
import { handleResponse } from "../lib/response-handler";

export const requireTaskManagerOrAssignee = (req: Request, res: Response, next: NextFunction) => {
  const task = req.task;
  const callerRole = req.callerMembership?.role;
  const userId = req.user!.id;

  if(!task) return handleResponse(res, 400, undefined, "Task ID is required");

  const isManager = callerRole === "manager";
  if(isManager || isTaskAssignee(task.assignees, userId)) return next();

  return handleResponse(res, 403);
};
