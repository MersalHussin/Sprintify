import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    hookTimeout: 300_000,
    testTimeout: 30_000,
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.spec.ts"],
          setupFiles: ["./tests/setup/env.ts", "./tests/setup/mocks.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.spec.ts"],
          setupFiles: ["./tests/setup/env.ts", "./tests/setup/mocks.ts", "./tests/setup/db.ts"],
        },
      },
    ],
  },
});
