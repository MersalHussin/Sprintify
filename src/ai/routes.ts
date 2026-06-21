import { Router } from "express";
import { chat, taskGeneration } from "./controller";
import { resolveProject } from "../middleware/resolve-project";
import { requireTeamRole } from "../middleware/require-team-role";

const router = Router();

router.post("/:projectId/chat", resolveProject, chat);
router.post("/:projectId/tasks", resolveProject, requireTeamRole("manager"), taskGeneration);

export default router;