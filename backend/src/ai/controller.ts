import type { Request, Response } from "express";

import { asyncHandler } from "../lib/async-handler";
import { handleResponse } from "../lib/response-handler";
import { chatService, getChatHistoryService, taskGenerationService } from "./services";

const MAX_AI_MESSAGE_LENGTH = 4000;

function validateAiMessage(message: unknown): message is string {
  return typeof message === "string" && message.length > 0 && message.length <= MAX_AI_MESSAGE_LENGTH;
}

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { message, sessionId: sessionIdParam } = req.body;
  if(!validateAiMessage(message)) {
    return handleResponse(res, 400, undefined, "Message must be 1–4000 characters");
  }

  const { sessionId, response } = await chatService(
    req.user!.id,
    {
      project: req.project!,
      projectDetails: req.projectDetails!,
      promptTeamMembers: req.promptTeamMembers!,
      usersById: req.usersById!,
    },
    message,
    sessionIdParam ?? "",
  );
  return handleResponse(res, 200, { sessionId, response });
});

export const taskGeneration = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;
  if(!validateAiMessage(message)) {
    return handleResponse(res, 400, undefined, "Message must be 1–4000 characters");
  }

  const tasks = await taskGenerationService(
    req.user!.id,
    {
      project: req.project!,
      projectDetails: req.projectDetails!,
      promptTeamMembers: req.promptTeamMembers!,
      usersById: req.usersById!,
    },
    req.project!._id.toString(),
    message,
  );
  return handleResponse(res, 200, { tasks });
});

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, sessionId } = req.params;
  if(!projectId) return handleResponse(res, 400, undefined, "Project ID is required");
  if(!sessionId) return handleResponse(res, 400, undefined, "Session ID is required");

  const chatHistory = await getChatHistoryService(req.user!.id, projectId as string, sessionId as string);
  return handleResponse(res, 200, { chatHistory });
});
