import type { Types } from "mongoose";

import { Task, type TaskDocument } from "../models/task";
import { TaskComment } from "../models/task-comment";
import type { ProjectDocument } from "../models/project";
import { TeamMembership } from "../models/team-memberships";
import { assertTaskManagerOrAssignee, assertTaskMember } from "../lib/task-access";
import { getUsersByUids, toAuthUser } from "../lib/users";
import { buildPaginatedResult, type PaginationParams } from "../lib/pagination";
import { omitKeys } from "../types/api";
import type {
  CommentInput,
  SubtaskInput,
  TaskCreateInput,
  TaskReorderEntry,
  TaskStatus,
  TaskUpdateInput,
} from "../types/task";

const TASK_LIST_SORT = { order: 1 as const, createdAt: 1 as const };
const PROTECTED_TASK_KEYS = ["projectId", "teamId", "createdBy"] as const;
const ASSIGNEE_WRITABLE_TASK_KEYS = new Set(["status", "subtasks"]);

async function nextTaskOrder(projectId: Types.ObjectId, status: TaskStatus) {
  const last = await Task.findOne({ projectId, status }).sort({ order: -1 }).select("order");
  return (last?.order ?? -1) + 1;
}


function toPlainTask<T extends { _id: Types.ObjectId }>(task: T) {
  const doc = task as T & { toObject?: () => T };
  return typeof doc.toObject === "function" ? doc.toObject() : task;
}

export async function attachCommentCounts<T extends { _id: Types.ObjectId }>(tasks: T[]) {
  if(tasks.length === 0) return tasks;

  const taskIds = tasks.map((task) => task._id);
  const counts = await TaskComment.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { taskId: { $in: taskIds } } },
    { $group: { _id: "$taskId", count: { $sum: 1 } } },
  ]);
  const countByTaskId = new Map(counts.map(({ _id, count }) => [_id.toString(), count]));

  return tasks.map((task) => ({
    ...toPlainTask(task),
    commentCount: countByTaskId.get(task._id.toString()) ?? 0,
  }));
}

type SubtaskPositionalUpdate = {
  "subtasks.$.name"?: string;
  "subtasks.$.completed"?: boolean;
};

// Task retrieval services
export const getTasksByProjectIdService = async (
  projectId: string,
  pagination: PaginationParams | null = null,
) => {
  const filter = { projectId };
  if(!pagination) {
    return attachCommentCounts(await Task.find(filter).sort(TASK_LIST_SORT));
  }

  const [items, total] = await Promise.all([
    Task.find(filter).sort(TASK_LIST_SORT).skip(pagination.skip).limit(pagination.limit),
    Task.countDocuments(filter),
  ]);
  const paginated = buildPaginatedResult(items, total, pagination);
  return {
    ...paginated,
    items: await attachCommentCounts(paginated.items as TaskDocument[]),
  };
};

export const getTaskByIdService = async (taskId: string, userId: string) => {
  const task = await Task.findById(taskId);
  if(!task) throw new Error("Task not found");

  // Membership check and comment load are independent once teamId is known — run in parallel.
  const [isMember, comments] = await Promise.all([
    TeamMembership.exists({ teamId: task.teamId, userId }),
    TaskComment.find({ taskId }).sort({ createdAt: -1 }),
  ]);
  if(!isMember) throw new Error("Task not found");

  const userIds = [
    task.createdBy,
    ...task.assignees,
    ...comments.map((comment) => comment.author),
  ];
  const usersByUid = await getUsersByUids(userIds);
  const users = Object.fromEntries(
    [...usersByUid.entries()].map(([uid, user]) => [uid, toAuthUser(user)]),
  );

  return { task, comments, users };
};

// Task-related services
export const createTaskService = async (
  userId: string,
  project: ProjectDocument,
  task: TaskCreateInput,
) => {
  const status = task.status ?? "Backlog";
  const order = task.order ?? await nextTaskOrder(project._id, status);

  return Task.create({
    ...task,
    status,
    order,
    projectId: project._id,
    teamId: project.teamId,
    createdBy: userId,
  });
};

export const reorderProjectTasksService = async (
  projectId: Types.ObjectId,
  updates: TaskReorderEntry[],
) => {
  if(updates.length === 0) return;

  await Task.bulkWrite(
    updates.map(({ taskId, status, order }) => ({
      updateOne: {
        filter: { _id: taskId, projectId },
        update: { $set: { status, order } },
      },
    })),
  );
};

export const updateTaskService = async (taskId: string, userId: string, task: TaskUpdateInput) => {
  const { isManager } = await assertTaskManagerOrAssignee(taskId, userId);

  const fields = omitKeys({ ...task } as Record<string, unknown>, PROTECTED_TASK_KEYS);
  if(!isManager) {
    const disallowed = Object.keys(fields).filter((key) => !ASSIGNEE_WRITABLE_TASK_KEYS.has(key));
    if(disallowed.length > 0) throw new Error("Forbidden");
  }

  const updated = await Task.findByIdAndUpdate(taskId, fields, { new: true, runValidators: true });
  if(!updated) throw new Error("Task not found");

  return updated;
};

export const deleteTaskService = async (taskId: string, userId: string) => {
  await assertTaskMember(taskId, userId);

  await TaskComment.deleteMany({ taskId });
  await Task.deleteOne({ _id: taskId });
};

// Subtask-related services
export const createSubtaskService = async (taskId: string, userId: string, subtask: SubtaskInput) => {
  await assertTaskManagerOrAssignee(taskId, userId);

  const updated = await Task.findByIdAndUpdate(
    taskId,
    { $push: { subtasks: { name: subtask.name, completed: subtask.completed ?? false } } },
    { new: true, runValidators: true },
  );
  if(!updated) throw new Error("Task not found");
  return updated;
};

export const updateSubtaskService = async (
  taskId: string,
  subtaskId: string,
  userId: string,
  subtask: SubtaskInput,
) => {
  await assertTaskManagerOrAssignee(taskId, userId);

  const update: SubtaskPositionalUpdate = {};
  if(subtask.name !== undefined) update["subtasks.$.name"] = subtask.name;
  if(subtask.completed !== undefined) update["subtasks.$.completed"] = subtask.completed;
  if(Object.keys(update).length === 0) {
    const task = await Task.findById(taskId);
    if(!task) throw new Error("Task not found");
    return task;
  }

  const updated = await Task.findOneAndUpdate(
    { _id: taskId, "subtasks._id": subtaskId },
    { $set: update },
    { new: true, runValidators: true },
  );
  if(!updated) throw new Error("Subtask not found");
  return updated;
};

export const deleteSubtaskService = async (taskId: string, subtaskId: string, userId: string) => {
  await assertTaskManagerOrAssignee(taskId, userId);

  const updated = await Task.findByIdAndUpdate(
    taskId,
    { $pull: { subtasks: { _id: subtaskId } } },
    { new: true },
  );
  if(!updated) throw new Error("Subtask not found");
  return updated;
};

// Comment-related services
export const createCommentService = async (taskId: string, userId: string, comment: CommentInput) => {
  await assertTaskMember(taskId, userId);

  return TaskComment.create({ taskId, author: userId, content: comment.content });
};

export const editCommentService = async (
  taskId: string,
  commentId: string,
  userId: string,
  comment: CommentInput,
) => {
  const existing = await TaskComment.findOne({ _id: commentId, taskId });
  if(!existing || existing.author !== userId) throw new Error("Comment not found");

  await assertTaskMember(taskId, userId);

  const updated = await TaskComment.findByIdAndUpdate(
    commentId,
    { content: comment.content },
    { new: true, runValidators: true },
  );
  if(!updated) throw new Error("Comment not found");
  return updated;
};

export const deleteCommentService = async (taskId: string, commentId: string, userId: string) => {
  const existing = await TaskComment.findOne({ _id: commentId, taskId });
  if(!existing) throw new Error("Comment not found");
  if(existing.author !== userId) throw new Error("Forbidden");

  await assertTaskMember(taskId, userId);

  await TaskComment.deleteOne({ _id: commentId });
};
