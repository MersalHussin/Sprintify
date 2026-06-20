import express from "express";
import cors from "cors";
import helmet from "helmet";

import env from "./lib/env";
import { getFirebaseApp } from "./lib/firebase";
import { aiRateLimiter, globalRateLimiter } from "./middleware/rate-limiter";
import { connectDB } from "./lib/db";
import { requireAuth } from "./middleware/require-auth";
import { getOpenAI } from "./lib/openai";
import { getRedis } from "./lib/redis";

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(helmet());

const bootstrap = async (): Promise<void> => {
  await connectDB();
  await getRedis();
  getFirebaseApp();
  getOpenAI();

  // Require authentication for all routes
  app.use(requireAuth);
  app.use(express.json());
  app.use("/api/ai", aiRateLimiter);
  // TODO: Add globalRateLimiter for all upcoming routes
  app.use("/api/teams", globalRateLimiter);

  app.listen(env.port, () => console.log(`Server listening on http://localhost:${env.port}`));
};

bootstrap().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
