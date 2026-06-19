import type { NextFunction, Request, Response } from "express";

import { getFirebaseAuth } from "./firebase";
import type { AuthUser } from "../types/user";

export const bearerToken = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}

export const verifyToken = async (token: string): Promise<AuthUser> => {
  const decoded = await getFirebaseAuth().verifyIdToken(token);

  return {
    id: decoded.uid,
    email: decoded.email,
    emailVerified: decoded.email_verified,
    name: decoded.name,
  };
}