import type { NextFunction, Request, Response } from "express";
import { bearerToken, verifyToken } from "../lib/auth";
import { handleResponse } from "../lib/response-handler";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    
    if(!token) return handleResponse(res, 401);

    try {
        req.user = await verifyToken(token);
        return next();
    } catch {
        return handleResponse(res, 401, undefined, "Invalid or expired token");
    }
}