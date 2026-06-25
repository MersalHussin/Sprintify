import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.enum(["prod", "dev"]);

const envSchema = z
  .object({
    port: z.coerce.number().int().positive().default(4000),
    mongoURI: z.string().min(1).default("mongodb://127.0.0.1:27017/sprintify"),
    environment: environmentSchema.default("dev"),
    firebaseProjectId: z.string().default(""),
    firebaseClientEmail: z.string().default(""),
    firebasePrivateKey: z.string().default(""),
    frontendUrl: z.string().default("http://localhost:5173"),
    githubToken: z.string().default(""),
    aiChatModel: z.string().default(""),
    aiTaskModel: z.string().default(""),
    /** Legacy fallback when AI_CHAT_MODEL / AI_TASK_MODEL are unset. */
    aiModel: z.string().default(""),
    redisURL: z.string().default("redis://127.0.0.1:6379"),
    ttlSeconds: z.coerce.number().int().positive().default(7200), // 120 mins
    aiBaseURL: z.string().default("https://models.github.ai/inference"),
    brevoApiKey: z.string().default(""),
    brevoFromEmail: z.union([z.string().email(), z.literal("")]).default(""),
    brevoFromName: z.string().default("Sprintify"),
  })
  .superRefine((data, ctx) => {
    const alwaysRequired: ReadonlyArray<[keyof z.infer<typeof envSchema>, string]> = [
      ["firebaseProjectId", "FIREBASE_PROJECT_ID"],
      ["firebaseClientEmail", "FIREBASE_CLIENT_EMAIL"],
      ["firebasePrivateKey", "FIREBASE_PRIVATE_KEY"],
      ["githubToken", "GITHUB_TOKEN"],
    ];

    for (const [key, envName] of alwaysRequired) {
      if(!data[key]) {
        ctx.addIssue({
          code: "custom",
          message: `${envName} is required`,
          path: [key],
        });
      }
    }

    if(data.environment === "prod") {
      const prodRequired: ReadonlyArray<[keyof z.infer<typeof envSchema>, string]> = [
        ["mongoURI", "MONGODB_URI"],
        ["githubToken", "GITHUB_TOKEN"],
        ["redisURL", "REDIS_URL"],
        ["frontendUrl", "FRONTEND_URL"],
        ["brevoApiKey", "BREVO_API_KEY"],
        ["brevoFromEmail", "BREVO_FROM_EMAIL"],
      ];

      for (const [key, envName] of prodRequired) {
        if(!data[key]) {
          ctx.addIssue({
            code: "custom",
            message: `${envName} is required in production`,
            path: [key],
          });
        }
      }

      const chatModel = data.aiChatModel || data.aiModel;
      const taskModel = data.aiTaskModel || data.aiModel;

      if(!chatModel) {
        ctx.addIssue({
          code: "custom",
          message: "AI_CHAT_MODEL or AI_MODEL is required in production",
          path: ["aiChatModel"],
        });
      }

      if(!taskModel) {
        ctx.addIssue({
          code: "custom",
          message: "AI_TASK_MODEL or AI_MODEL is required in production",
          path: ["aiTaskModel"],
        });
      }
    }
  });

type ParsedEnvironment = z.infer<typeof envSchema>;

export type Environment = Omit<ParsedEnvironment, "aiModel"> & {
  aiChatModel: string;
  aiTaskModel: string;
};

const parsed: ParsedEnvironment = envSchema.parse({
  port: process.env.PORT,
  mongoURI: process.env.MONGODB_URI,
  environment: process.env.ENVIRONMENT,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  githubToken: process.env.GITHUB_TOKEN,
  aiChatModel: process.env.AI_CHAT_MODEL,
  aiTaskModel: process.env.AI_TASK_MODEL,
  aiModel: process.env.AI_MODEL,
  redisURL: process.env.REDIS_URL,
  ttlSeconds: process.env.TTL_SECONDS,
  aiBaseURL: process.env.AI_BASE_URL,
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoFromEmail: process.env.BREVO_FROM_EMAIL,
  brevoFromName: process.env.BREVO_FROM_NAME,
});

/** Strip trailing slash so CORS Origin matches the browser value exactly. */
function normalizeFrontendUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const env: Readonly<Environment> = {
  ...parsed,
  frontendUrl: normalizeFrontendUrl(parsed.frontendUrl),
  aiChatModel: parsed.aiChatModel || parsed.aiModel,
  aiTaskModel: parsed.aiTaskModel || parsed.aiModel,
};

export default env;
