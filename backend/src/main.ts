import { getFirebaseApp } from "./lib/firebase";
import { connectDB } from "./lib/db";
import { getOpenAI } from "./lib/openai";
import { getRedis } from "./lib/redis";
import env from "./lib/env";
import { createApp } from "./app";

const bootstrap = async (): Promise<void> => {
  await connectDB();
  await getRedis();
  getFirebaseApp();
  getOpenAI();

  const app = createApp();
  app.listen(env.port, () => console.log(`Server listening on http://localhost:${env.port}`));
};

bootstrap().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export { createApp } from "./app";
