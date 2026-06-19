import type { NextFunction, Request, Response } from "express";
import { bearerToken, verifyToken } from "../lib/auth";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = bearerToken(req);
    
    if(!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        req.user = await verifyToken(token);
        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}