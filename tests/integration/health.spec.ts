import { describe, expect, it } from "vitest";

import { testApp } from "../helpers";

describe("GET /health", () => {
  it("returns ok when dependencies are reachable", async () => {
    const response = await testApp().get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.checks.mongo).toBe("ok");
    expect(response.body.checks.redis).toBe("ok");
  });
});
