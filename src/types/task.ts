import type { Types } from "mongoose";

import { PRIORITIES, STATUSES } from "../models/task";

export type TaskPriority = (typeof PRIORITIES)[number];
export type TaskStatus = (typeof STATUSES)[number];

export type SubtaskInput = {
  name: string;
  completed?: boolean;
};

export type CommentInput = {
  content: string;
};

/** Client-writable task fields; server assigns projectId, teamId, createdBy. */
export type TaskCreateInput = {
  name: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string;
  assignees?: string[];
  sprintId?: Types.ObjectId | string;
  subtasks?: SubtaskInput[];
};

export type TaskUpdateInput = Partial<TaskCreateInput>;

export type GeneratedTask = {
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  subtasks: { name: string; completed: boolean }[];
};
