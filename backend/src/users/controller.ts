import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { sendRouteError } from "../middleware/error-handler";
import {
  deleteMeService,
  getMeService,
  getUserByIdService,
  updateMeService,
  type UserProfileUpdate,
} from "./services";

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await getMeService(req.user!.id);
    return handleResponse(res, 200, { user });
  } catch (error) {
    if(sendRouteError(res, error)) return;
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const user = await updateMeService(req.user!.id, req.body as UserProfileUpdate);
    return handleResponse(res, 200, { user });
  } catch (error) {
    if(sendRouteError(res, error)) return;
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteMe = async (req: Request, res: Response) => {
  try {
    await deleteMeService(req.user!.id);
    return handleResponse(res, 200, undefined, "Account deleted successfully");
  } catch (error) {
    if(sendRouteError(res, error)) return;
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  if(!userId) {
    return handleResponse(res, 400, undefined, "User ID is required");
  }

  try {
    const user = await getUserByIdService(req.user!.id, userId);
    return handleResponse(res, 200, { user });
  } catch (error) {
    if(sendRouteError(res, error)) return;
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};
