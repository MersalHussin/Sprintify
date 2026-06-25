import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { parseOptionalPagination } from "../lib/pagination";
import { isRecord } from "../types/api";
import {
  createProjectService,
  deleteProjectService,
  listTeamProjectsService,
  updateProjectService,
} from "./services";

export const listTeamProjects = async (req: Request, res: Response) => {
  try {
    const pagination = parseOptionalPagination(isRecord(req.query) ? req.query : {});
    const result = await listTeamProjectsService(req.team!._id, pagination);
    if(pagination) return handleResponse(res, 200, result);
    return handleResponse(res, 200, { projects: result });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await createProjectService(req.user!.id, req.team!._id, req.body.name);
    return handleResponse(res, 201, { project });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  return handleResponse(res, 200, {
    project: req.project,
    callerRole: req.callerMembership?.role,
  });
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await updateProjectService(req.project!, req.body.name);
    return handleResponse(res, 200, { project });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await deleteProjectService(req.project!._id);
    return handleResponse(res, 200, undefined, "Project deleted successfully");
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};
