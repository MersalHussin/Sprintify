import { Router } from "express";
import { chat, getChatHistory, taskGeneration } from "./controller";
import { resolveProject } from "../middleware/resolve-project";
import { requireTeamRole } from "../middleware/require-team-role";

const router = Router();

router.post("/:projectId/chat", resolveProject, chat);
router.post("/:projectId/tasks", resolveProject, requireTeamRole("manager"), taskGeneration);
router.post("/:projectId/chat-history/:sessionId", resolveProject, getChatHistory);

export default router;