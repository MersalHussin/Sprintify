import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { parseOptionalPagination } from "../lib/pagination";
import { isRecord } from "../types/api";
import {
  completeSprintService,
  createSprintService,
  deleteSprintService,
  listSprintsService,
  updateSprintService,
} from "./services";

export const listSprints = async (req: Request, res: Response) => {
  try {
    const pagination = parseOptionalPagination(isRecord(req.query) ? req.query : {});
    const result = await listSprintsService(req.project!._id, pagination);
    if(pagination) return handleResponse(res, 200, result);
    return handleResponse(res, 200, { sprints: result });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const createSprint = async (req: Request, res: Response) => {
  try {
    const sprint = await createSprintService(req.project!, req.body);
    return handleResponse(res, 201, { sprint });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const getSprintById = async (req: Request, res: Response) => {
  return handleResponse(res, 200, { sprint: req.sprint });
};

export const updateSprint = async (req: Request, res: Response) => {
  try {
    const sprint = await updateSprintService(req.sprint!, req.body);
    return handleResponse(res, 200, { sprint });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteSprint = async (req: Request, res: Response) => {
  try {
    await deleteSprintService(req.sprint!._id);
    return handleResponse(res, 200, undefined, "Sprint deleted successfully");
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const completeSprint = async (req: Request, res: Response) => {
  try {
    const sprint = await completeSprintService(req.sprint!);
    return handleResponse(res, 200, { sprint });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};
