import { Router } from "express";

import { resolveTask } from "../middleware/resolve-task";
import { requireTaskManagerOrAssignee } from "../middleware/require-task-manager-or-assignee";
import { requireTeamRole } from "../middleware/require-team-role";
import { validateObjectId } from "../middleware/validate-object-id";
import {
  createComment,
  createSubtask,
  deleteComment,
  deleteSubtask,
  deleteTask,
  editComment,
  getTaskById,
  updateSubtask,
  updateTask,
} from "./controller";

const router = Router();

router.get("/:taskId", validateObjectId("taskId"), resolveTask, getTaskById);
router.put("/:taskId", validateObjectId("taskId"), resolveTask, requireTaskManagerOrAssignee, updateTask);
router.delete("/:taskId", validateObjectId("taskId"), resolveTask, requireTeamRole("manager"), deleteTask);

router.post("/:taskId/subtasks", validateObjectId("taskId"), resolveTask, requireTaskManagerOrAssignee, createSubtask);
router.patch("/:taskId/subtasks/:subtaskId", validateObjectId("taskId", "subtaskId"), resolveTask, requireTaskManagerOrAssignee, updateSubtask);
router.delete("/:taskId/subtasks/:subtaskId", validateObjectId("taskId", "subtaskId"), resolveTask, requireTaskManagerOrAssignee, deleteSubtask);

router.post("/:taskId/comments", validateObjectId("taskId"), resolveTask, createComment);
router.patch("/:taskId/comments/:commentId", validateObjectId("taskId", "commentId"), resolveTask, editComment);
router.delete("/:taskId/comments/:commentId", validateObjectId("taskId", "commentId"), resolveTask, deleteComment);

export default router;
