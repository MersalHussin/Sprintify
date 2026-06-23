import type { Request, Response, NextFunction } from "express";

import { handleResponse } from "../lib/response-handler";
import { buildTeamMembers } from "../lib/team-members";
import { populateUserField, type UserDisplayDocument } from "../lib/users";
import { Team } from "../models/team";
import { TeamMembership } from "../models/team-memberships";

export const resolveTeam = async (req: Request, res: Response, next: NextFunction) => {
  const { teamId } = req.params as { teamId: string };
  if(!teamId) return handleResponse(res, 400, undefined, "Team ID is required");

  const team = await Team.findById(teamId);
  if(!team) return handleResponse(res, 404, undefined, "Team not found");

  const callerMembership = await TeamMembership.findOne({ teamId, userId: req.user!.id });
  if(!callerMembership) return handleResponse(res, 404, undefined, "You are not a member of this team");

  const memberships = await TeamMembership.find({ teamId }).populate<{ user: UserDisplayDocument | null }>(
    populateUserField("user"),
  );

  req.team = team;
  req.callerMembership = { role: callerMembership.role };
  req.teamMembers = buildTeamMembers(memberships);

  next();
};
