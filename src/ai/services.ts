import crypto from "node:crypto";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import env from "../lib/env";
import { getOpenAI } from "../lib/openai";
import { getRedis } from "../lib/redis";
import { chatAssistantPrompt } from "../prompts/chat-assistant-prompt";
import { taskGenerationPrompt } from "../prompts/task-generation-prompt";
import { parseJsonArray, parseJsonUnknown } from "../types/api";
import type { GeneratedTask } from "../types/task";
import type { ChatContext } from "../types/project-context";

export type { ChatContext } from "../types/project-context";

export async function chatService(
  userId: string,
  context: ChatContext,
  message: string,
  sessionId: string = "",
): Promise<{ sessionId: string; response: ChatCompletionMessageParam }> {
  const { project, projectDetails, promptTeamMembers, usersById } = context;
  if(!sessionId) sessionId = crypto.randomUUID();

  const redis = await getRedis();
  const openai = getOpenAI();
  const key = `chat:${userId}:${project._id}:${sessionId}`;
  const chat = await redis.get(key);

  let messages: ChatCompletionMessageParam[] = [];
  if(chat) {
    const parsed = parseJsonUnknown(chat);
    messages = Array.isArray(parsed) ? (parsed as ChatCompletionMessageParam[]) : [];
  } else {
    messages.push({
      role: "system",
      content: chatAssistantPrompt(projectDetails, promptTeamMembers, usersById),
    });
  }

  const userMessage: ChatCompletionMessageParam = { role: "user", content: message };

  const response = await openai.chat.completions.create({
    model: env.aiModel,
    messages: [...messages, userMessage],
    stream: false,
    max_tokens: 1024,
    temperature: 0.7,
  });

  const assistantMessage: ChatCompletionMessageParam = {
    role: "assistant",
    content: response.choices[0]?.message.content,
  };

  messages.push(userMessage);
  messages.push(assistantMessage);
  await redis.set(key, JSON.stringify(messages), { EX: env.ttlSeconds });

  return { sessionId, response: assistantMessage };
}

export type { GeneratedTask as Task } from "../types/task";

export async function taskGenerationService(
  _userId: string,
  context: ChatContext,
  projectId: string,
  message: string,
): Promise<GeneratedTask[]> {
  if(!projectId) throw new Error("Project ID is required");
  if(!message) throw new Error("Message is required");

  const { projectDetails, promptTeamMembers } = context;
  const openai = getOpenAI();
  const redis = await getRedis();

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: taskGenerationPrompt(projectDetails, promptTeamMembers),
    },
    { role: "user", content: message },
  ];

  const response = await openai.chat.completions.create({
    model: env.aiModel,
    messages,
    stream: false,
    max_tokens: 1024,
    temperature: 0.7,
    response_format: {
      type: "json_object",
    },
  });

  const content = response.choices[0]?.message.content ?? "[]";
  const tasks = parseJsonArray<GeneratedTask>(content.startsWith("[") ? content : "[]");
  const key = `task-generation:${projectId}`;

  await redis.set(key, JSON.stringify(tasks), { EX: env.ttlSeconds / 4 });

  return tasks;
}

export async function getChatHistoryService(
  userId: string,
  projectId: string,
  sessionId: string,
): Promise<ChatCompletionMessageParam[]> {
  if(!userId) throw new Error("User ID is required");
  if(!projectId) throw new Error("Project ID is required");
  if(!sessionId) throw new Error("Session ID is required");

  const redis = await getRedis();
  const key = `chat:${userId}:${projectId}:${sessionId}`;
  const chat = await redis.get(key);
  if(!chat) return [];

  const parsed = parseJsonUnknown(chat);
  return Array.isArray(parsed) ? (parsed as ChatCompletionMessageParam[]) : [];
}
