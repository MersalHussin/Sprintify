import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";

const rateLimitHandler = (_req: Request, res: Response) =>
  handleResponse(res, 429, undefined, "Rate limit exceeded");

const userOrIpKey = (req: Request): string => {
  if(req.user?.id) return req.user.id;
  return ipKeyGenerator(req.ip ?? "unknown");
};

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler,
});

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: rateLimitHandler,
});
