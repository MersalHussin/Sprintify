import type { NextFunction, Request, Response } from "express";

import { TeamMembership } from "../models/team-memberships";
import { Team } from "../models/team";
import type { TeamRole } from "../types/team";
import { handleResponse } from "../lib/response-handler";

export const requireTeamRole = (role: TeamRole) => async (req: Request, res: Response, next: NextFunction) => {
  const teamId = req.params.teamId ?? req.project?.teamId.toString();
  if (!teamId) return handleResponse(res, 400, undefined, "Team ID is required");

  const team = req.projectDetails?.team ?? req.team;
  if (!team) {
    const fetched = await Team.findById(teamId);
    if (!fetched) return handleResponse(res, 404, undefined, "Team not found");
    req.team = fetched;
  } else if (team._id.toString() !== teamId) {
    return handleResponse(res, 400, undefined, "Team ID is required");
  } else {
    req.team = team;
  }

  const resolvedTeamId = req.project?.teamId.toString() ?? req.team._id.toString();
  let callerRole =
    resolvedTeamId === teamId && req.callerMembership
      ? req.callerMembership.role
      : undefined;

  if (!callerRole) {
    callerRole = (await TeamMembership.findOne({ teamId, userId: req.user!.id }))?.role;
  }

  if (!callerRole) return handleResponse(res, 404, undefined, "You are not a member of this team");
  if (callerRole !== role) return handleResponse(res, 403);

  next();
};
