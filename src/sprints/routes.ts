import { Router } from "express";

import { resolveSprint } from "../middleware/resolve-sprint";
import { requireTeamRole } from "../middleware/require-team-role";
import { validateObjectId } from "../middleware/validate-object-id";
import { completeSprint, deleteSprint, getSprintById, updateSprint } from "./controller";

const router = Router();

router.get("/:sprintId", validateObjectId("sprintId"), resolveSprint, getSprintById);
router.put("/:sprintId", validateObjectId("sprintId"), resolveSprint, requireTeamRole("manager"), updateSprint);
router.delete("/:sprintId", validateObjectId("sprintId"), resolveSprint, requireTeamRole("manager"), deleteSprint);
router.post("/:sprintId/complete", validateObjectId("sprintId"), resolveSprint, requireTeamRole("manager"), completeSprint);

export default router;
