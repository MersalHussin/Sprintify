import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { handleResponse } from "../lib/response-handler";

export function notFoundHandler(_req: Request, res: Response) {
  return handleResponse(res, 404, undefined, "The requested resource was not found");
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if(err instanceof mongoose.Error.CastError) {
    return handleResponse(res, 400, undefined, "Invalid resource identifier");
  }

  console.error(err);
  if(!res.headersSent) return handleResponse(res, 500);
  return undefined;
}
