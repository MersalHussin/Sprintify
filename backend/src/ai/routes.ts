import { Router } from "express";
import { approveGeneratedTasks, chat, getChatHistory, taskGeneration } from "./controller";
import { resolveProject } from "../middleware/resolve-project";
import { requireTeamRole } from "../middleware/require-team-role";
import { validateObjectId } from "../middleware/validate-object-id";

const router = Router();

router.post("/:projectId/chat", validateObjectId("projectId"), resolveProject, chat);
router.post("/:projectId/tasks", validateObjectId("projectId"), resolveProject, requireTeamRole("manager"), taskGeneration);
router.post(
  "/:projectId/generated-tasks/approve",
  validateObjectId("projectId"),
  resolveProject,
  requireTeamRole("manager"),
  approveGeneratedTasks,
);
router.post("/:projectId/chat-history/:sessionId", validateObjectId("projectId"), resolveProject, getChatHistory);

export default router;