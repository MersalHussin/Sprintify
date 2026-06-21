import { Router } from "express";

import { resolveTeam } from "../middleware/resolve-team";
import { listMembers } from "./controller";

const router = Router();

router.get("/:teamId/members", resolveTeam, listMembers);

export default router;