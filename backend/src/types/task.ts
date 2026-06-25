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

export type TaskCreateInput = {
  name: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string;
  assignees?: string[];
  sprintId?: Types.ObjectId | string;
  subtasks?: SubtaskInput[];
  order?: number;
};

export type TaskUpdateInput = Partial<TaskCreateInput>;

export type TaskReorderEntry = {
  taskId: string;
  status: TaskStatus;
  order: number;
};

export type GeneratedTask = {
  name: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  subtasks: { name: string; completed: boolean }[];
};
