import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { parseOptionalPagination } from "../lib/pagination";
import { isRecord } from "../types/api";
import { deleteTeamCascade } from "../services/delete-cascade";
import { createTeamInvitationService, createTeamService, deleteInvitationService, joinTeamViaInvitationService, listTeamInvitationsService, listUserTeamsService, updateTeamMemberRoleService, updateTeamService } from "./services";

export const createTeam = async (req: Request, res: Response) => {
  try {
    const team = await createTeamService(req.user!.id, req.body.name);
    return handleResponse(res, 201, { team });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const listUserTeams = async (req: Request, res: Response) => {
  try {
    const pagination = parseOptionalPagination(isRecord(req.query) ? req.query : {});
    const result = await listUserTeamsService(req.user!.id, pagination);
    if(pagination) return handleResponse(res, 200, result);
    return handleResponse(res, 200, { teams: result });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const joinTeamByInvitationCode = async (req: Request, res: Response) => {
  const invitationCode = req.params.invitationCode as string;
  if(!invitationCode) {
    return handleResponse(res, 400, undefined, "Invitation code is required");
  }

  try {
    const { team, membershipRole } = await joinTeamViaInvitationService(
      req.user!,
      invitationCode,
      { requireEmailMatch: false },
    );
    return handleResponse(res, 200, { team, role: membershipRole });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const acceptTeamInvitation = async (req: Request, res: Response) => {
  const invitationToken = req.params.invitationToken as string;
  if(!invitationToken)
    return handleResponse(res, 400, undefined, "Invitation token is required");

  try {
    const { team, membershipRole } = await joinTeamViaInvitationService(
      req.user!,
      invitationToken,
      { requireEmailMatch: true },
    );
    return handleResponse(res, 200, { team, role: membershipRole });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  return handleResponse(res, 200, {
    team: req.team,
    members: req.teamMembers,
  });
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const team = await updateTeamService(req.team!, req.body.name);
    return handleResponse(res, 200, { team });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    await deleteTeamCascade(req.team!._id);
    return handleResponse(res, 200, undefined, "Team deleted successfully");
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const createTeamInvitation = async (req: Request, res: Response) => {
  try {
    const invitation = await createTeamInvitationService(
      req.team!._id,
      req.body.email,
      req.user!.id,
    );
    return handleResponse(res, 201, { invitation });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const listTeamInvitations = async (req: Request, res: Response) => {
  try {
    const invitations = await listTeamInvitationsService(req.team!._id);
    return handleResponse(res, 200, { invitations });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteInvitation = async (req: Request, res: Response) => {
  const invitationToken = req.params.invitationToken as string;
  if(!invitationToken) {
    return handleResponse(res, 400, undefined, "Invitation token is required");
  }

  try {
    await deleteInvitationService(req.team!._id, invitationToken);
    return handleResponse(res, 200, undefined, "Invitation deleted successfully");
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const updateTeamMemberRole = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  if(!userId) {
    return handleResponse(res, 400, undefined, "User ID is required");
  }

  try {
    const member = await updateTeamMemberRoleService(req.team!._id, userId, req.body.role);
    return handleResponse(res, 200, { member });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};
