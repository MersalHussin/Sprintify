import { Router } from "express";

import { resolveProject } from "../middleware/resolve-project";
import { requireTeamRole } from "../middleware/require-team-role";
import { validateObjectId } from "../middleware/validate-object-id";
import { createTask, getTasksByProjectId, reorderProjectTasks } from "../tasks/controller";
import { createSprint, listSprints } from "../sprints/controller";
import { deleteProject, getProjectById, updateProject } from "./controller";

const router = Router();

router.get("/:projectId", validateObjectId("projectId"), resolveProject, getProjectById);
router.get("/:projectId/tasks", validateObjectId("projectId"), resolveProject, getTasksByProjectId);
router.put("/:projectId/tasks/reorder", validateObjectId("projectId"), resolveProject, requireTeamRole("manager"), reorderProjectTasks);
router.post("/:projectId/tasks", validateObjectId("projectId"), resolveProject, requireTeamRole("manager"), createTask);
router.get("/:projectId/sprints", validateObjectId("projectId"), resolveProject, listSprints);
router.post("/:projectId/sprints", validateObjectId("projectId"), resolveProject, requireTeamRole("manager"), createSprint);
router.put("/:projectId", validateObjectId("projectId"), resolveProject, requireTeamRole("manager"), updateProject);
router.delete("/:projectId", validateObjectId("projectId"), resolveProject, requireTeamRole("manager"), deleteProject);

export default router;
