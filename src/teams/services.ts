import crypto from "node:crypto";
import type { Types } from "mongoose";

import { Invitation } from "../models/invitation";
import { Team, type TeamDocument } from "../models/team";
import { TeamMembership } from "../models/team-memberships";
import type { TeamRole } from "../types/team";
import type { AuthUser } from "../types/user";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const createTeamService = async (userId: string, name: string) => {
  const team = await Team.create({ name, createdBy: userId });
  await TeamMembership.create({ teamId: team._id, userId, role: "manager" });
  return team;
};

export const listUserTeamsService = async (userId: string) => {
  const memberships = await TeamMembership.find({ userId }).select("teamId");
  if(memberships.length === 0) return [];
  return Team.find({ _id: { $in: memberships.map((m) => m.teamId) } });
};

export const joinTeamViaInvitationService = async (
  user: AuthUser,
  invitationCode: string,
  options: { requireEmailMatch: boolean },
) => {
  const invitation = await Invitation.findOne({ token: invitationCode });
  if(!invitation) throw new Error("Invitation not found");
  if(invitation.expiresAt <= new Date()) throw new Error("Invitation has expired");

  if(options.requireEmailMatch && (!user.email || user.email.toLowerCase() !== invitation.email))
    throw new Error("Email does not match invitation");

  const team = await Team.findById(invitation.teamId);
  if(!team) throw new Error("Team not found");

  const existing = await TeamMembership.findOne({ teamId: invitation.teamId, userId: user.id });
  if(existing) {
    await Invitation.deleteOne({ _id: invitation._id });
    return { team, membershipRole: existing.role };
  }

  const membershipRole: TeamRole = "member";
  await TeamMembership.create({ teamId: invitation.teamId, userId: user.id, role: membershipRole });
  await Invitation.deleteOne({ _id: invitation._id });

  return { team, membershipRole };
};

export const updateTeamService = async (team: TeamDocument, name: string) => {
  const updated = await Team.findByIdAndUpdate(team._id, { name }, { new: true });
  if(!updated) throw new Error("Team not found");
  return updated;
};

export const createTeamInvitationService = async (
  teamId: Types.ObjectId,
  email: string,
  invitedBy: string,
) => {
  return Invitation.create({
    teamId,
    email: email.trim().toLowerCase(),
    token: crypto.randomUUID(),
    invitedBy,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
  });
};

export const listTeamInvitationsService = async (teamId: Types.ObjectId) => {
  return Invitation.find({ teamId });
};

export const deleteInvitationService = async (teamId: Types.ObjectId, invitationToken: string) => {
  const result = await Invitation.deleteOne({ teamId, token: invitationToken });
  if(result.deletedCount === 0) throw new Error("Invitation not found");
};

export const updateTeamMemberRoleService = async (
  teamId: Types.ObjectId,
  userId: string,
  role: TeamRole,
) => {
  const member = await TeamMembership.findOneAndUpdate({ teamId, userId }, { role }, { new: true });
  if(!member) throw new Error("Team member not found");
  return member;
};
