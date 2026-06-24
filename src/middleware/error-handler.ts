import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { handleResponse } from "../lib/response-handler";

export function notFoundHandler(_req: Request, res: Response) {
  return handleResponse(res, 404, undefined, "The requested resource was not found");
}

/** Maps known service / persistence errors to HTTP responses. Returns true when handled. */
export function sendRouteError(res: Response, err: unknown): boolean {
  if(err instanceof mongoose.Error.CastError) {
    handleResponse(res, 400, undefined, "Invalid resource identifier");
    return true;
  }

  if(err instanceof mongoose.Error.ValidationError) {
    handleResponse(res, 400, undefined, err.message);
    return true;
  }

  if(err instanceof Error) {
    if(err.message === "User not found" || err.message === "Comment not found") {
      handleResponse(res, 404);
      return true;
    }
    if(err.message === "Forbidden") {
      handleResponse(res, 403);
      return true;
    }
  }

  return false;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if(sendRouteError(res, err)) return undefined;

  console.error(err);
  if(!res.headersSent) return handleResponse(res, 500);
  return undefined;
}
