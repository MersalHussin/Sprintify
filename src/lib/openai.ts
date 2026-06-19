import OpenAI from "openai";
import env from "./env"

declare global {
  var _openaiClient: OpenAI | undefined;
}

export function getOpenAI(): OpenAI {
    if(global._openaiClient) return global._openaiClient;

    global._openaiClient = new OpenAI({
        baseURL: "https://models.github.ai/inference",
        apiKey: env.githubToken,
    });

    return global._openaiClient;
}