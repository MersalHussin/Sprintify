import type { Types } from "mongoose";

import type { ProjectDocument } from "../models/project";
import { Sprint, type SprintDocument } from "../models/sprint";
import { Task } from "../models/task";

export const listSprintsService = async (projectId: Types.ObjectId) => {
  return Sprint.find({ projectId });
};

export const createSprintService = async (project: ProjectDocument, sprint: Record<string, unknown>) => {
  const { projectId: _projectId, teamId: _teamId, status: _status, completedAt: _completedAt, ...fields } = sprint;
  return Sprint.create({
    ...fields,
    projectId: project._id,
    teamId: project.teamId,
  });
};

export const updateSprintService = async (sprint: SprintDocument, data: Record<string, unknown>) => {
  const {
    projectId: _projectId,
    teamId: _teamId,
    status: _status,
    completedAt: _completedAt,
    ...fields
  } = data;

  const updated = await Sprint.findByIdAndUpdate(sprint._id, fields, { new: true, runValidators: true });
  if(!updated) throw new Error("Sprint not found");
  return updated;
};

export const deleteSprintService = async (sprintId: Types.ObjectId) => {
  // Covered by sparse { sprintId: 1 } index on Task.
  await Task.updateMany({ sprintId }, { $unset: { sprintId: 1 } });
  const result = await Sprint.deleteOne({ _id: sprintId });
  if(result.deletedCount === 0) throw new Error("Sprint not found");
};

export const completeSprintService = async (sprint: SprintDocument) => {
  if(sprint.status === "completed") throw new Error("Sprint already completed");

  const updated = await Sprint.findByIdAndUpdate(
    sprint._id,
    { status: "completed", completedAt: new Date() },
    { new: true, runValidators: true },
  );
  if(!updated) throw new Error("Sprint not found");
  return updated;
};
