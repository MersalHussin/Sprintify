import { Router } from "express";
import { deleteMe, getMe, getMyTasks, getUserById, updateMe } from "./controller";

const router = Router();

router.get("/me", getMe);
router.get("/me/tasks", getMyTasks);
router.patch("/me", updateMe);
router.delete("/me", deleteMe);
router.get("/:userId", getUserById);

export default router;