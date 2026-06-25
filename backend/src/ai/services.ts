import crypto from "node:crypto";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import env from "../lib/env";
import { getOpenAI } from "../lib/openai";
import { getRedis } from "../lib/redis";
import { chatAssistantPrompt } from "../prompts/chat-assistant-prompt";
import { taskGenerationPrompt } from "../prompts/task-generation-prompt";
import { isRecord, parseJsonArray, parseJsonUnknown } from "../types/api";
import { createTaskService } from "../tasks/services";
import { PRIORITIES, STATUSES } from "../models/task";
import type { ProjectDocument } from "../models/project";
import type { GeneratedTask, TaskPriority, TaskStatus } from "../types/task";
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
    model: env.aiChatModel,
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

function normalizePriority(value: unknown, taskName: string): TaskPriority {
  if(typeof value !== "string" || !value.trim()) {
    console.warn(`[task-generation] Missing priority for "${taskName}", defaulting to Medium`);
    return "Medium";
  }
  const match = PRIORITIES.find((p) => p.toLowerCase() === value.trim().toLowerCase());
  if(!match) {
    console.warn(`[task-generation] Invalid priority "${value}" for "${taskName}", defaulting to Medium`);
    return "Medium";
  }
  return match;
}

function normalizeStatus(value: unknown): TaskStatus {
  if(typeof value !== "string" || !value.trim()) return STATUSES[0];
  const match = STATUSES.find((s) => s.toLowerCase() === value.trim().toLowerCase());
  return match ?? STATUSES[0];
}

function normalizeGeneratedTask(raw: unknown): GeneratedTask | null {
  if(!isRecord(raw) || typeof raw.name !== "string" || !raw.name.trim()) return null;

  const name = raw.name.trim();
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const categoryRaw = typeof raw.category === "string" ? raw.category.trim() : "";

  if(!description) {
    console.warn(`[task-generation] Dropping task "${name}" — missing description`);
    return null;
  }

  const subtasks = Array.isArray(raw.subtasks)
    ? raw.subtasks
        .filter((item): item is { name: string; completed: boolean } =>
          isRecord(item) && typeof item.name === "string" && item.name.trim().length > 0,
        )
        .map((item) => ({
          name: item.name.trim(),
          completed: Boolean(item.completed),
        }))
    : [];

  if(subtasks.length === 0) {
    console.warn(`[task-generation] Dropping task "${name}" — missing subtasks`);
    return null;
  }

  const category = categoryRaw || "General";
  if(!categoryRaw) {
    console.warn(`[task-generation] Missing category for "${name}", defaulting to General`);
  }

  return {
    name,
    description,
    priority: normalizePriority(raw.priority, name),
    status: normalizeStatus(raw.status),
    category,
    subtasks,
  };
}

function extractGeneratedTasks(content: string): GeneratedTask[] {
  let parsed: unknown;
  try {
    parsed = parseJsonUnknown(content);
  } catch {
    return [];
  }

  const rawTasks = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.tasks)
      ? parsed.tasks
      : isRecord(parsed)
        ? Object.values(parsed).find(Array.isArray)
        : undefined;

  if(!Array.isArray(rawTasks)) return [];

  return rawTasks
    .map(normalizeGeneratedTask)
    .filter((task): task is GeneratedTask => task !== null);
}

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
    model: env.aiTaskModel,
    messages,
    stream: false,
    max_tokens: 4096,
    temperature: 0.3,
    response_format: {
      type: "json_object",
    },
  });

  const content = response.choices[0]?.message.content ?? '{"tasks":[]}';
  const tasks = extractGeneratedTasks(content);
  const key = `task-generation:${projectId}`;

  await redis.set(key, JSON.stringify(tasks), { EX: env.ttlSeconds / 4 });

  return tasks;
}

export async function approveGeneratedTasksService(
  userId: string,
  project: ProjectDocument,
  projectId: string,
  indices?: number[],
): Promise<{ tasks: Awaited<ReturnType<typeof createTaskService>>[] }> {
  const redis = await getRedis();
  const key = `task-generation:${projectId}`;
  const raw = await redis.get(key);
  if(!raw) throw new Error("No generated tasks found. Generate tasks first.");

  const stored = parseJsonArray<GeneratedTask>(raw);
  const selected: GeneratedTask[] =
    indices && indices.length > 0
      ? indices
          .filter((index) => Number.isInteger(index) && index >= 0 && index < stored.length)
          .map((index) => stored[index])
          .filter((task): task is GeneratedTask => task !== undefined)
      : stored;

  if(selected.length === 0) throw new Error("No tasks to approve");

  const created = await Promise.all(
    selected.map((task) =>
      createTaskService(userId, project, {
        name: task.name,
        description: task.description,
        priority: task.priority,
        status: task.status,
        category: task.category,
        subtasks: task.subtasks,
      }),
    ),
  );

  const approvedIndices = new Set(
    indices && indices.length > 0
      ? indices.filter((index) => Number.isInteger(index) && index >= 0 && index < stored.length)
      : stored.map((_, index) => index),
  );
  const remaining = stored.filter((_, index) => !approvedIndices.has(index));

  if(remaining.length > 0) {
    await redis.set(key, JSON.stringify(remaining), { EX: env.ttlSeconds / 4 });
  } else {
    await redis.del(key);
  }

  return { tasks: created };
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
