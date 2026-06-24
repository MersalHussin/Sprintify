import type { Request, Response } from "express";

import { connectDB } from "./db";
import { getRedis } from "./redis";

export async function healthCheck(_req: Request, res: Response) {
  const checks: Record<string, "ok" | "error"> = {
    mongo: "ok",
    redis: "ok",
  };

  try {
    await connectDB();
  } catch {
    checks.mongo = "error";
  }

  try {
    const redis = await getRedis();
    await redis.ping();
  } catch {
    checks.redis = "error";
  }

  const healthy = Object.values(checks).every((status) => status === "ok");
  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    checks,
  });
}
