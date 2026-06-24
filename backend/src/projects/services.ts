import type { Types } from "mongoose";

import { Project, type ProjectDocument } from "../models/project";
import { deleteProjectCascade } from "../services/delete-cascade";
import { buildPaginatedResult, type PaginationParams } from "../lib/pagination";

export const listTeamProjectsService = async (
  teamId: Types.ObjectId,
  pagination: PaginationParams | null = null,
) => {
  const filter = { teamId };
  if(!pagination) return Project.find(filter);

  const [items, total] = await Promise.all([
    Project.find(filter).skip(pagination.skip).limit(pagination.limit),
    Project.countDocuments(filter),
  ]);
  return buildPaginatedResult(items, total, pagination);
};

export type ProjectListResult = Awaited<ReturnType<typeof listTeamProjectsService>>;

export const createProjectService = async (userId: string, teamId: Types.ObjectId, name: string) => {
  return Project.create({ name, teamId, createdBy: userId });
};

export const updateProjectService = async (project: ProjectDocument, name: string) => {
  const updated = await Project.findByIdAndUpdate(project._id, { name }, { new: true, runValidators: true });
  if(!updated) throw new Error("Project not found");
  return updated;
};

export const deleteProjectService = async (projectId: Types.ObjectId) => {
  await deleteProjectCascade(projectId);
};
