import crypto from "node:crypto";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import env from "../lib/env";
import { chatAssistantPrompt } from "../prompts/chat-assistant-prompt";
import type { ProjectDetails, PromptTeamMember } from "../prompts/chat-assistant-prompt";
import { ProjectDocument } from "../models/project";
import type { AuthUser } from "../types/user";
import { taskGenerationPrompt } from "../prompts/task-generation-prompt";
import { PRIORITIES, STATUSES } from "../models/task";

export type ChatContext = {
  project: ProjectDocument;
  projectDetails: ProjectDetails;
  promptTeamMembers: PromptTeamMember[];
  usersById: Map<string, AuthUser>;
};

export async function chatService(
  userId: string,
  context: ChatContext,
  message: string,
  sessionId: string = "",
): Promise<{ sessionId: string; response: ChatCompletionMessageParam }> {
  const { project, projectDetails, promptTeamMembers, usersById } = context;
  if (!sessionId) sessionId = crypto.randomUUID();

  const key = `chat:${userId}:${project._id}:${sessionId}`;
  const chat = await global._redisClient?.get(key);

  let messages: ChatCompletionMessageParam[] = [];
  if (chat) messages = JSON.parse(chat);
  else {
    messages.push({
      role: "system",
      content: chatAssistantPrompt(projectDetails, promptTeamMembers, usersById),
    });
  }

  const userMessage: ChatCompletionMessageParam = { role: "user", content: message };

  const response = await global._openaiClient?.chat.completions.create({
    model: env.aiModel,
    messages: [...messages, userMessage],
    stream: false,
    max_tokens: 1024,
    temperature: 0.7,
  });

  const assistantMessage: ChatCompletionMessageParam = {
    role: "assistant",
    content: response?.choices[0]?.message.content,
  };

  if (response) {
    messages.push(userMessage);
    messages.push(assistantMessage);
    await global._redisClient?.set(key, JSON.stringify(messages), { EX: env.ttlSeconds });
  }

  return { sessionId, response: assistantMessage };
}

export type Task = {
  name: string;
  description: string;
  priority: (typeof PRIORITIES)[number];
  status: (typeof STATUSES)[number];
  subtasks: { name: string; completed: boolean }[];
}

export async function taskGenerationService(
  userId: string,
  context: ChatContext,
  projectId: string,
  message: string
): Promise<Task[]> {
  if (!projectId) throw new Error("Project ID is required");
  if (!message) throw new Error("Message is required");
  
  const { project, projectDetails, promptTeamMembers, usersById } = context;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: taskGenerationPrompt(projectDetails, promptTeamMembers),
    },
    { role: "user", content: message },
  ];

  const response = await global._openaiClient?.chat.completions.create({
    model: env.aiModel,
    messages,
    stream: false,
    max_tokens: 1024,
    temperature: 0.7,
    response_format: {
      type: "json_object"
    },
  });

  const tasks = JSON.parse(response?.choices[0]?.message.content ?? "{}");
  const key = `task-generation:${projectId}`;
  
  await global._redisClient?.set(key, JSON.stringify(tasks), { EX: (env.ttlSeconds / 4) }); // 30 mins

  return tasks as Task[];
};

export async function getChatHistoryService(userId: string, projectId: string, sessionId: string): Promise<ChatCompletionMessageParam[]> {
  if(!userId) throw new Error("User ID is required");
  if(!projectId) throw new Error("Project ID is required");
  if(!sessionId) throw new Error("Session ID is required");
  
  const key = `chat:${userId}:${projectId}:${sessionId}`;
  const chat = await global._redisClient?.get(key);
  if(!chat) return [];
  
  return JSON.parse(chat);
}