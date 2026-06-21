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
    frontendUrl: z.string().default("http://localhost:3000/"),
    githubToken: z.string().default(""),
    aiModel: z.string().default(""),
    redisURL: z.string().default("redis://127.0.0.1:6379"),
    ttlSeconds: z.coerce.number().int().positive().default(7200), // 120 mins
    aiBaseURL: z.string().default("https://models.github.ai/inference"),
  })
  .superRefine((data, ctx) => {
    const alwaysRequired: ReadonlyArray<[keyof z.infer<typeof envSchema>, string]> = [
      ["firebaseProjectId", "FIREBASE_PROJECT_ID"],
      ["firebaseClientEmail", "FIREBASE_CLIENT_EMAIL"],
      ["firebasePrivateKey", "FIREBASE_PRIVATE_KEY"],
      ["githubToken", "GITHUB_TOKEN"],
    ];

    for (const [key, envName] of alwaysRequired) {
      if (!data[key]) {
        ctx.addIssue({
          code: "custom",
          message: `${envName} is required`,
          path: [key],
        });
      }
    }

    if (data.environment === "prod") {
      const prodRequired: ReadonlyArray<[keyof z.infer<typeof envSchema>, string]> = [
        ["mongoURI", "MONGODB_URI"],
        ["githubToken", "GITHUB_TOKEN"],
        ["aiModel", "AI_MODEL"],
        ["redisURL", "REDIS_URL"],
        ["frontendUrl", "FRONTEND_URL"],
      ];

      for (const [key, envName] of prodRequired) {
        if (!data[key]) {
          ctx.addIssue({
            code: "custom",
            message: `${envName} is required in production`,
            path: [key],
          });
        }
      }
    }
  });

export type Environment = z.infer<typeof envSchema>;

const env: Readonly<Environment> = envSchema.parse({
  port: process.env.PORT,
  mongoURI: process.env.MONGODB_URI,
  environment: process.env.ENVIRONMENT,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  githubToken: process.env.GITHUB_TOKEN,
  aiModel: process.env.AI_MODEL,
  redisURL: process.env.REDIS_URL,
  ttlSeconds: process.env.TTL_SECONDS,
  aiBaseURL: process.env.AI_BASE_URL,
});

export default env;
