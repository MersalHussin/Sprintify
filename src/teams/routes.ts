import { Router } from "express";

import { resolveTeam } from "../middleware/resolve-team";
import { createProject, listTeamProjects } from "../projects/controller";
import {
  acceptTeamInvitation,
  createTeam,
  createTeamInvitation,
  deleteInvitation,
  deleteTeam,
  getTeamById,
  joinTeamByInvitationCode,
  listTeamInvitations,
  listUserTeams,
  updateTeam,
  updateTeamMemberRole,
} from "./controller";
import { requireTeamRole } from "../middleware/require-team-role";
import { validateObjectId } from "../middleware/validate-object-id";

const router = Router();

router.post("/", createTeam);
router.get("/", listUserTeams);
router.post("/:invitationCode", joinTeamByInvitationCode);
router.post("/:invitationToken/accept", acceptTeamInvitation);
router.get("/:teamId/projects", validateObjectId("teamId"), resolveTeam, listTeamProjects);
router.post("/:teamId/projects", validateObjectId("teamId"), resolveTeam, requireTeamRole("manager"), createProject);
router.get("/:teamId", validateObjectId("teamId"), resolveTeam, getTeamById);
router.patch("/:teamId", validateObjectId("teamId"), resolveTeam, updateTeam);
router.delete("/:teamId", validateObjectId("teamId"), resolveTeam, deleteTeam);
router.post("/:teamId/invitations", validateObjectId("teamId"), requireTeamRole("manager"), resolveTeam, createTeamInvitation);
router.get("/:teamId/invitations", validateObjectId("teamId"), resolveTeam, listTeamInvitations);
router.delete("/:teamId/invitations/:invitationToken", validateObjectId("teamId"), requireTeamRole("manager"), resolveTeam, deleteInvitation);
router.patch("/:teamId/members/:userId", validateObjectId("teamId"), requireTeamRole("manager"), resolveTeam, updateTeamMemberRole);

export default router;
