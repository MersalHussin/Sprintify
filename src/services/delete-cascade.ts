import type { ClientSession, Types } from "mongoose";
import mongoose from "mongoose";

import { Invitation } from "../models/invitation";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";
import { Task } from "../models/task";
import { TaskComment } from "../models/task-comment";
import { Team } from "../models/team";
import { TeamMembership } from "../models/team-memberships";

async function deleteCommentsForTasks(
  taskFilter: { projectId: Types.ObjectId } | { teamId: Types.ObjectId },
  session: ClientSession,
): Promise<void> {
  // distinct(filter) issues one indexed scan; find().distinct() would hydrate full task docs first.
  const taskIds = (await Task.distinct("_id", taskFilter).session(session)) as Types.ObjectId[];
  if(taskIds.length === 0) return;
  await TaskComment.deleteMany({ taskId: { $in: taskIds } }).session(session);
}

export async function deleteProjectCascade(projectId: Types.ObjectId): Promise<void> {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await deleteCommentsForTasks({ projectId }, session);
      await Task.deleteMany({ projectId }).session(session);
      await Sprint.deleteMany({ projectId }).session(session);
      await Project.deleteOne({ _id: projectId }).session(session);
    });
  } finally {
    await session.endSession();
  }
}

export async function deleteTeamCascade(teamId: Types.ObjectId): Promise<void> {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await deleteCommentsForTasks({ teamId }, session);
      await Task.deleteMany({ teamId }).session(session);
      await Sprint.deleteMany({ teamId }).session(session);
      await Project.deleteMany({ teamId }).session(session);
      await Invitation.deleteMany({ teamId }).session(session);
      await TeamMembership.deleteMany({ teamId }).session(session);
      await Team.deleteOne({ _id: teamId }).session(session);
    });
  } finally {
    await session.endSession();
  }
}
