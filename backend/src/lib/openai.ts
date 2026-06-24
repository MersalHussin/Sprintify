import OpenAI from "openai";
import env from "./env"

declare global {
  var _openaiClient: OpenAI | undefined;
}

export function getOpenAI(): OpenAI {
    if(global._openaiClient) return global._openaiClient;

    global._openaiClient = new OpenAI({
        baseURL: env.aiBaseURL,
        apiKey: env.githubToken,
    });

    return global._openaiClient;
}