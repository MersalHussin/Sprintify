import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { handleResponse } from "../lib/response-handler";

type ObjectIdParams = Record<string, string>;

export function validateObjectId(...paramNames: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const params = req.params as ObjectIdParams;

    for (const name of paramNames) {
      const value = params[name];
      if(value && !mongoose.Types.ObjectId.isValid(value)) {
        return handleResponse(res, 400, undefined, "Invalid resource identifier");
      }
    }

    return next();
  };
}
