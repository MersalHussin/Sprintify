import { describe, expect, it } from "vitest";

import { clearRedisStore } from "../setup/mocks";
import { authed, TOKENS } from "../helpers";
import { seedProjectWorkspace } from "../factories";

describe("AI API", () => {
  it("rejects chat without a message", async () => {
    const { project } = await seedProjectWorkspace();

    const response = await authed(TOKENS.member)
      .post(`/api/ai/${project._id}/chat`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("4000");
  });

  it("returns assistant response for project members", async () => {
    clearRedisStore();
    const { project } = await seedProjectWorkspace();

    const response = await authed(TOKENS.member)
      .post(`/api/ai/${project._id}/chat`)
      .send({ message: "Summarize sprint progress." });

    expect(response.status).toBe(200);
    expect(response.body.data.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(response.body.data.response.content).toBe("Sprint summary ready.");
  });

  it("forbids task generation for non-managers", async () => {
    const { project } = await seedProjectWorkspace();

    const response = await authed(TOKENS.member)
      .post(`/api/ai/${project._id}/tasks`)
      .send({ message: "Create login tasks." });

    expect(response.status).toBe(403);
  });

  it("allows managers to generate tasks", async () => {
    clearRedisStore();
    const { project } = await seedProjectWorkspace();

    const response = await authed(TOKENS.manager)
      .post(`/api/ai/${project._id}/tasks`)
      .send({ message: "Create login tasks." });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("OK");
  });
});
