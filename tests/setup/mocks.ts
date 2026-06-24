import { vi } from "vitest";

const redisStore = new Map<string, string>();

vi.mock("../../src/lib/firebase", () => ({
  getFirebaseApp: vi.fn(),
  getFirebaseAuth: () => ({
    verifyIdToken: vi.fn(async (token: string) => {
      if(token === "manager-token") {
        return {
          uid: "manager-uid",
          email: "manager@sprintify.test",
          email_verified: true,
          name: "Ada Manager",
        };
      }
      if(token === "member-token") {
        return {
          uid: "member-uid",
          email: "member@sprintify.test",
          email_verified: true,
          name: "Grace Member",
        };
      }
      throw new Error("Invalid token");
    }),
    deleteUser: vi.fn(async () => undefined),
    getUsers: vi.fn(async () => ({ users: [] })),
  }),
}));

vi.mock("../../src/lib/redis", () => ({
  getRedis: vi.fn(async () => ({
    isOpen: true,
    get: vi.fn(async (key: string) => redisStore.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      redisStore.set(key, value);
      return "OK";
    }),
    ping: vi.fn(async () => "PONG"),
    on: vi.fn(),
    connect: vi.fn(async () => undefined),
  })),
}));

vi.mock("../../src/lib/openai", () => ({
  getOpenAI: () => ({
    chat: {
      completions: {
        create: vi.fn(async () => ({
          choices: [{ message: { role: "assistant", content: "Sprint summary ready." } }],
        })),
      },
    },
  }),
}));

export function clearRedisStore() {
  redisStore.clear();
}
