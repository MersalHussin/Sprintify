import { Task } from "../models/task";
import { TaskComment } from "../models/task-comment";
import type { ProjectDocument } from "../models/project";
import { TeamMembership } from "../models/team-memberships";
import { assertTaskMember } from "../lib/task-access";
import { omitKeys } from "../types/api";
import type {
  CommentInput,
  SubtaskInput,
  TaskCreateInput,
  TaskUpdateInput,
} from "../types/task";

const PROTECTED_TASK_KEYS = ["projectId", "teamId", "createdBy"] as const;

type SubtaskPositionalUpdate = {
  "subtasks.$.name"?: string;
  "subtasks.$.completed"?: boolean;
};

// Task retrieval services
export const getTasksByProjectIdService = async (projectId: string) => {
  // Uses { projectId: 1, ... } compound indexes; returns full documents for the task board UI.
  return Task.find({ projectId });
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

  return { task, comments };
};

// Task-related services
export const createTaskService = async (
  userId: string,
  project: ProjectDocument,
  task: TaskCreateInput,
) => {
  return Task.create({
    ...task,
    projectId: project._id,
    teamId: project.teamId,
    createdBy: userId,
  });
};

export const updateTaskService = async (taskId: string, userId: string, task: TaskUpdateInput) => {
  await assertTaskMember(taskId, userId);

  const fields = omitKeys({ ...task } as Record<string, unknown>, PROTECTED_TASK_KEYS);
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
  await assertTaskMember(taskId, userId);

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
  await assertTaskMember(taskId, userId);

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
  await assertTaskMember(taskId, userId);

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
  if(!existing || existing.author !== userId) throw new Error("Comment not found");

  await assertTaskMember(taskId, userId);

  await TaskComment.deleteOne({ _id: commentId });
};
