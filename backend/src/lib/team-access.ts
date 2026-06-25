import type { Types } from "mongoose";

import { TeamMembership } from "../models/team-memberships";
import type { TeamRole } from "../types/team";
import { MEMBERSHIP_ROLE_FIELDS } from "./query-projections";

type CallerMembership = { role: TeamRole };

export async function findCallerMembership(
  teamId: Types.ObjectId | string,
  userId: string,
): Promise<CallerMembership | null> {
  return TeamMembership.findOne({ teamId, userId }).select(MEMBERSHIP_ROLE_FIELDS);
}

export async function isTeamMember(teamId: Types.ObjectId | string, userId: string): Promise<boolean> {
  return Boolean(await TeamMembership.exists({ teamId, userId }));
}
