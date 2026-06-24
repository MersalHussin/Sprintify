import type { Request, Response } from "express";

import { handleResponse } from "../lib/response-handler";
import { parseOptionalPagination } from "../lib/pagination";
import { isRecord } from "../types/api";
import {
  createCommentService,
  createSubtaskService,
  createTaskService,
  deleteCommentService,
  deleteSubtaskService,
  deleteTaskService,
  editCommentService,
  getTaskByIdService,
  getTasksByProjectIdService,
  updateSubtaskService,
  updateTaskService,
} from "./services";

export const getTasksByProjectId = async (req: Request, res: Response) => {
  try {
    const pagination = parseOptionalPagination(isRecord(req.query) ? req.query : {});
    const result = await getTasksByProjectIdService(req.project!._id.toString(), pagination);
    if(pagination) return handleResponse(res, 200, result);
    return handleResponse(res, 200, { tasks: result });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if(!taskId) return handleResponse(res, 400, undefined, "Task ID is required");

  try {
    const result = await getTaskByIdService(taskId, req.user!.id);
    return handleResponse(res, 200, result);
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const task = await createTaskService(req.user!.id, req.project!, req.body);
    return handleResponse(res, 201, { task });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if(!taskId) return handleResponse(res, 400, undefined, "Task ID is required");

  try {
    const task = await updateTaskService(taskId, req.user!.id, req.body);
    return handleResponse(res, 200, { task });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if(!taskId) return handleResponse(res, 400, undefined, "Task ID is required");

  try {
    await deleteTaskService(taskId, req.user!.id);
    return handleResponse(res, 200, undefined, "Task deleted successfully");
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const createSubtask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if(!taskId) return handleResponse(res, 400, undefined, "Task ID is required");

  try {
    const task = await createSubtaskService(taskId, req.user!.id, req.body);
    return handleResponse(res, 201, { task });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const subtaskId = req.params.subtaskId as string;
  if(!taskId || !subtaskId) return handleResponse(res, 400, undefined, "Task ID and subtask ID are required");

  try {
    const task = await updateSubtaskService(taskId, subtaskId, req.user!.id, req.body);
    return handleResponse(res, 200, { task });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const subtaskId = req.params.subtaskId as string;
  if(!taskId || !subtaskId) return handleResponse(res, 400, undefined, "Task ID and subtask ID are required");

  try {
    const task = await deleteSubtaskService(taskId, subtaskId, req.user!.id);
    return handleResponse(res, 200, { task });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const createComment = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  if(!taskId) return handleResponse(res, 400, undefined, "Task ID is required");

  try {
    const comment = await createCommentService(taskId, req.user!.id, req.body);
    return handleResponse(res, 201, { comment });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const editComment = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const commentId = req.params.commentId as string;
  if(!taskId || !commentId) return handleResponse(res, 400, undefined, "Task ID and comment ID are required");

  try {
    const comment = await editCommentService(taskId, commentId, req.user!.id, req.body);
    return handleResponse(res, 200, { comment });
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const taskId = req.params.taskId as string;
  const commentId = req.params.commentId as string;
  if(!taskId || !commentId) return handleResponse(res, 400, undefined, "Task ID and comment ID are required");

  try {
    await deleteCommentService(taskId, commentId, req.user!.id);
    return handleResponse(res, 200, undefined, "Comment deleted successfully");
  } catch (error) {
    console.error(error as Error);
    return handleResponse(res, 500, undefined, "An unexpected error occurred");
  }
};
