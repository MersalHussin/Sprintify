import crypto from "node:crypto";
import type { Types } from "mongoose";

import { buildPaginatedResult, type PaginationParams } from "../lib/pagination";
import { generateUniqueTeamCode, normalizeTeamCode } from "../lib/team-code";
import { deleteTeamCascade } from "../services/delete-cascade";
import { Invitation } from "../models/invitation";
import { Team, type TeamDocument } from "../models/team";
import { TeamMembership } from "../models/team-memberships";
import { TEAM_ROLES, type TeamRole } from "../types/team";
import type { AuthUser } from "../types/user";

async function countManagers(teamId: Types.ObjectId): Promise<number> {
  return TeamMembership.countDocuments({ teamId, role: "manager" });
}

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_WORKSPACE_NAME = "My Workspace";

const defaultWorkspaceCreationLocks = new Map<string, Promise<TeamDocument>>();

async function findDefaultWorkspaceTeam(userId: string) {
  const memberships = await TeamMembership.find({ userId }).select("teamId");
  if(memberships.length === 0) return null;

  return Team.findOne({
    _id: { $in: memberships.map((membership) => membership.teamId) },
    name: DEFAULT_WORKSPACE_NAME,
    createdBy: userId,
  });
}

async function createTeamRecord(userId: string, name: string) {
  const code = await generateUniqueTeamCode();
  const team = await Team.create({ name, code, createdBy: userId });
  await TeamMembership.create({ teamId: team._id, userId, role: "manager" });
  return team;
}

export const createTeamService = async (userId: string, name: string) => {
  const trimmedName = name.trim();

  if(trimmedName === DEFAULT_WORKSPACE_NAME) {
    const existing = await findDefaultWorkspaceTeam(userId);
    if(existing) return existing;

    const pending = defaultWorkspaceCreationLocks.get(userId);
    if(pending) return pending;

    const promise = (async () => {
      const existingAfterLock = await findDefaultWorkspaceTeam(userId);
      if(existingAfterLock) return existingAfterLock;
      return createTeamRecord(userId, trimmedName);
    })().finally(() => {
      defaultWorkspaceCreationLocks.delete(userId);
    });

    defaultWorkspaceCreationLocks.set(userId, promise);
    return promise;
  }

  return createTeamRecord(userId, trimmedName);
};

export const listUserTeamsService = async (
  userId: string,
  pagination: PaginationParams | null = null,
) => {
  const memberships = await TeamMembership.find({ userId }).select("teamId");
  if(memberships.length === 0) {
    return pagination ? buildPaginatedResult([], 0, pagination) : [];
  }

  const teamIds = memberships.map((m) => m.teamId);
  if(!pagination) return Team.find({ _id: { $in: teamIds } });

  const filter = { _id: { $in: teamIds } };
  const [items, total] = await Promise.all([
    Team.find(filter).skip(pagination.skip).limit(pagination.limit),
    Team.countDocuments(filter),
  ]);
  return buildPaginatedResult(items, total, pagination);
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

export const joinTeamByCodeService = async (user: AuthUser, teamCode: string) => {
  const code = normalizeTeamCode(teamCode);
  const team = await Team.findOne({ code });
  if(!team) throw new Error("Team not found");

  const existing = await TeamMembership.findOne({ teamId: team._id, userId: user.id });
  if(existing) return { team, membershipRole: existing.role };

  const membershipRole: TeamRole = "member";
  await TeamMembership.create({ teamId: team._id, userId: user.id, role: membershipRole });

  return { team, membershipRole };
};

export const joinTeamService = async (
  user: AuthUser,
  joinCode: string,
  options: { requireEmailMatch: boolean },
) => {
  const trimmed = joinCode.trim();
  if(!trimmed) throw new Error("Join code is required");

  const invitation = await Invitation.findOne({ token: trimmed });
  if(invitation) return joinTeamViaInvitationService(user, trimmed, options);

  return joinTeamByCodeService(user, trimmed);
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
  if(!TEAM_ROLES.includes(role)) throw new Error("Invalid team role");

  const member = await TeamMembership.findOne({ teamId, userId });
  if(!member) throw new Error("Team member not found");

  if(member.role === "manager" && role === "member") {
    const managerCount = await countManagers(teamId);
    if(managerCount <= 1) throw new Error("Cannot demote the only manager");
  }

  member.role = role;
  await member.save();
  return member;
};

async function removeMemberWithEmptyTeamCleanup(
  teamId: Types.ObjectId,
  userId: string,
): Promise<{ teamDeleted: boolean }> {
  const memberCount = await TeamMembership.countDocuments({ teamId });
  if(memberCount - 1 === 0) {
    await deleteTeamCascade(teamId);
    return { teamDeleted: true };
  }

  await TeamMembership.deleteOne({ teamId, userId });
  return { teamDeleted: false };
}

export const kickTeamMemberService = async (
  teamId: Types.ObjectId,
  userId: string,
  actorUserId: string,
) => {
  if(userId === actorUserId) throw new Error("Cannot remove yourself from the team");

  const member = await TeamMembership.findOne({ teamId, userId });
  if(!member) throw new Error("Team member not found");

  return removeMemberWithEmptyTeamCleanup(teamId, userId);
};

export const leaveTeamService = async (teamId: Types.ObjectId, userId: string) => {
  const member = await TeamMembership.findOne({ teamId, userId });
  if(!member) throw new Error("Team member not found");

  const memberCount = await TeamMembership.countDocuments({ teamId });
  if(memberCount - 1 === 0) return removeMemberWithEmptyTeamCleanup(teamId, userId);

  if(member.role === "manager") {
    const managerCount = await countManagers(teamId);
    if(managerCount <= 1) throw new Error("Cannot leave team as the only manager");
  }

  return removeMemberWithEmptyTeamCleanup(teamId, userId);
};
