import type { NextFunction, Request, Response } from "express";

import { TeamMembership } from "../models/team-memberships";
import { Team } from "../models/team";
import type { TeamRole } from "../types/team";

export const requireTeamRole = async (role: TeamRole) => async (req: Request, res: Response, next: NextFunction) => {
  const { teamId } = req.params as { teamId: string };
  if (!teamId) return res.status(400).json({ error: "Team ID is required" });

  const team = await Team.findById(teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const membership = await TeamMembership.findOne({ teamId, userId: req.user!.id });
  if (!membership) return res.status(404).json({ error: "You are not a member of this team" });

  if(membership.role !== role) return res.status(403).json({ error: "You are not authorized to access this resource" });

  req.team = team;
  
  next();
};
