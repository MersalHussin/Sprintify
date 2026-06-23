import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { deleteTeamCascade } from "../services/delete-cascade";

export const createTeam = async (req: Request, res: Response) => {

};

export const listUserTeams = async (req: Request, res: Response) => {
};

export const joinTeamByInvitationCode = async (req: Request, res: Response) => {
};

export const acceptTeamInvitation = async (req: Request, res: Response) => {
};

export const getTeamById = async (req: Request, res: Response) => {
};

export const updateTeam = async (req: Request, res: Response) => {
};

export const deleteTeam = async (req: Request, res: Response) => {
    await deleteTeamCascade(req.team!._id);
    return handleResponse(res, 200, undefined, "Team deleted successfully");
};

export const createTeamInvitation = async (req: Request, res: Response) => {
};

export const listTeamInvitations = async (req: Request, res: Response) => {
};

export const deleteInvitation = async (req: Request, res: Response) => {
};

export const updateTeamMemberRole = async (req: Request, res: Response) => {
};