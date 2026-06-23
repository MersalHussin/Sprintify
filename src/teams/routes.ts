import { Router } from "express";

import { resolveTeam } from "../middleware/resolve-team";
import { acceptTeamInvitation, createTeam, createTeamInvitation, deleteInvitation, deleteTeam, getTeamById, joinTeamByInvitationCode, listTeamInvitations, listUserTeams, updateTeam, updateTeamMemberRole } from "./controller";
import { requireTeamRole } from "../middleware/require-team-role";

const router = Router();

// Create a new team
router.post("/", createTeam);
// List all teams for the current user
router.get("/", listUserTeams);
// Join a team by invitation code
router.post("/:invitationCode", joinTeamByInvitationCode);
// Accept a team invitation via email
router.post("/:invitationToken/accept", acceptTeamInvitation);
// Get a team by ID
router.get("/:teamId", resolveTeam, getTeamById);
// Update a team
router.patch("/:teamId", resolveTeam, updateTeam);
// Delete a team
router.delete("/:teamId", resolveTeam, deleteTeam);
// Invite a user to a team via email
router.post("/:teamId/invitations", requireTeamRole("manager"), resolveTeam, createTeamInvitation);
// List all invitations for a team
router.get("/:teamId/invitations", resolveTeam, listTeamInvitations);
// Delete an invitation
router.delete("/:teamId/invitations/:invitationToken", requireTeamRole("manager"), resolveTeam, deleteInvitation);
// Update a team member's role
router.patch("/:teamId/members/:userId", requireTeamRole("manager"), resolveTeam, updateTeamMemberRole);

export default router;