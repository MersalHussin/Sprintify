import { Router } from "express";
import { deleteMe, getMe, getUserById, updateMe } from "./controller";

const router = Router();

router.get("/me", getMe);
router.patch("/me", updateMe);
router.delete("/me", deleteMe);
router.get("/:userId", getUserById);

export default router;