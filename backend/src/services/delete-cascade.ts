import type { ClientSession, Types } from "mongoose";
import mongoose from "mongoose";

import { Invitation } from "../models/invitation";
import { Project } from "../models/project";
import { Sprint } from "../models/sprint";
import { Task } from "../models/task";
import { TaskComment } from "../models/task-comment";
import { Team } from "../models/team";
import { TeamMembership } from "../models/team-memberships";

let transactionsSupported: boolean | undefined;

async function supportsTransactions(): Promise<boolean> {
  if(transactionsSupported !== undefined) return transactionsSupported;

  try {
    const admin = mongoose.connection.db?.admin();
    if(!admin) {
      transactionsSupported = false;
      return false;
    }
    const info = await admin.command({ hello: 1 }) as { setName?: string };
    transactionsSupported = Boolean(info.setName);
  } catch {
    transactionsSupported = false;
  }

  return transactionsSupported;
}

function withSession<T>(query: { session: (s: ClientSession) => T }, session?: ClientSession): T {
  return session ? query.session(session) : query as T;
}

async function deleteCommentsForTasks(
  taskFilter: { projectId: Types.ObjectId } | { teamId: Types.ObjectId },
  session?: ClientSession,
): Promise<void> {
  const taskIds = (await withSession(Task.distinct("_id", taskFilter), session)) as Types.ObjectId[];
  if(taskIds.length === 0) return;
  await withSession(TaskComment.deleteMany({ taskId: { $in: taskIds } }), session);
}

async function runCascade(work: (session?: ClientSession) => Promise<void>): Promise<void> {
  if(await supportsTransactions()) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await work(session);
      });
    } finally {
      await session.endSession();
    }
    return;
  }

  await work();
}

export async function deleteProjectCascade(projectId: Types.ObjectId): Promise<void> {
  await runCascade(async (session) => {
    await deleteCommentsForTasks({ projectId }, session);
    await withSession(Task.deleteMany({ projectId }), session);
    await withSession(Sprint.deleteMany({ projectId }), session);
    await withSession(Project.deleteOne({ _id: projectId }), session);
  });
}

export async function deleteTeamCascade(teamId: Types.ObjectId): Promise<void> {
  await runCascade(async (session) => {
    await deleteCommentsForTasks({ teamId }, session);
    await withSession(Task.deleteMany({ teamId }), session);
    await withSession(Sprint.deleteMany({ teamId }), session);
    await withSession(Project.deleteMany({ teamId }), session);
    await withSession(Invitation.deleteMany({ teamId }), session);
    await withSession(TeamMembership.deleteMany({ teamId }), session);
    await withSession(Team.deleteOne({ _id: teamId }), session);
  });
}
