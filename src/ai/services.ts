import { getRedis } from "../lib/redis";
import crypto from "node:crypto";
import env from "../lib/env";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { chatAssistantPrompt } from "../constants/chat-assistant-prompt";

// TODO: Add project details to the chat assistant prompt
export async function chat(userId: string, projectId: string, message: string, sessionId: string = ""): Promise<{ sessionId: string, response: ChatCompletionMessageParam }> {
    // chat:{userId}:{projectId}:{sessionId}
    const redis = await getRedis();
    if(!sessionId) sessionId = crypto.randomUUID(); 

    const key = `chat:${userId}:${projectId}:${sessionId}`;
    const chat = await redis.get(key);

    let messages: ChatCompletionMessageParam[] = [];
    if(chat) messages = JSON.parse(chat);
    // else messages.push({ role: "system", content: chatAssistantPrompt(projectDetails) as unkown as string });

    const userMessage: ChatCompletionMessageParam = { role: "user", content: message };

    const response = await global._openaiClient?.chat.completions.create({
        model: env.aiModel,
        messages: [
            ...messages,
            userMessage,
        ],
        stream: false,
        max_tokens: 1024,
        temperature: 0.7
    });

    const assistantMessage: ChatCompletionMessageParam = { role: "assistant", content: response?.choices[0]?.message.content };

    if(response) {
        messages.push(userMessage);
        messages.push(assistantMessage);
        await redis.set(key, JSON.stringify(messages), { EX: env.ttlSeconds });
    }

    return { sessionId, response: assistantMessage };
}