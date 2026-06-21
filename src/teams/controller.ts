import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";

export const listMembers = (req: Request, res: Response) => {
  return handleResponse(res, 200, { members: req.teamMembers });
};
