import { rateLimit } from "express-rate-limit";
import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";

const rateLimitHandler = (_req: Request, res: Response) =>
  handleResponse(res, 429, undefined, "Rate limit exceeded");

// AI-only per-user AI rate limiter
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "unknown",
  handler: rateLimitHandler,
});

// Global Rate Limiter, per-user and falls back to ip address
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "unknown",
  handler: rateLimitHandler,
});
