import type { NextFunction, Request, Response } from "express";

import { TeamMembership } from "../models/team-memberships";
import { Team } from "../models/team";
import type { TeamRole } from "../types/team";
import { handleResponse } from "../lib/response-handler";

export const requireTeamRole = async (role: TeamRole) => async (req: Request, res: Response, next: NextFunction) => {
  const { teamId } = req.params as { teamId: string };
  if(!teamId) return handleResponse(res, 400, undefined, "Team ID is required");

  const team = await Team.findById(teamId);
  if (!team) return handleResponse(res, 404, undefined, "Team not found");

  const membership = await TeamMembership.findOne({ teamId, userId: req.user!.id });
  if (!membership) return handleResponse(res, 404, undefined, "You are not a member of this team");

  if(membership.role !== role) return handleResponse(res, 403);

  req.team = team;
  next();
}