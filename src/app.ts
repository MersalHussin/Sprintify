import express from "express";
import cors from "cors";
import helmet from "helmet";

import aiRoutes from "./ai/routes";
import env from "./lib/env";
import { aiRateLimiter, globalRateLimiter } from "./middleware/rate-limiter";
import { requireAuth } from "./middleware/require-auth";
import projectRoutes from "./projects/routes";
import sprintRoutes from "./sprints/routes";
import taskRoutes from "./tasks/routes";
import teamRoutes from "./teams/routes";
import userRoutes from "./users/routes";

/** Factory so integration tests can mount routes without starting the HTTP listener. */
export function createApp(): express.Application {
  const app = express();

  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(helmet());
  app.use(requireAuth);
  app.use(express.json());
  app.use("/api/ai", aiRateLimiter, aiRoutes);
  app.use("/api/teams", globalRateLimiter, teamRoutes);
  app.use("/api/projects", globalRateLimiter, projectRoutes);
  app.use("/api/sprints", globalRateLimiter, sprintRoutes);
  app.use("/api/tasks", globalRateLimiter, taskRoutes);
  app.use("/api/users", globalRateLimiter, userRoutes);

  return app;
}
