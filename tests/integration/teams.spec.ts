import { describe, expect, it } from "vitest";

import { authed, TOKENS, testApp } from "../helpers";
import { createTeamWithMembership, createUser } from "../factories";

describe("teams API", () => {
  it("returns 401 without auth", async () => {
    const response = await testApp().get("/api/teams");
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("UNAUTHORIZED");
  });

  it("lists teams for the authenticated user", async () => {
    await createUser({ uid: "manager-uid" });
    await createTeamWithMembership("manager-uid", "manager", "Core Team");

    const response = await authed(TOKENS.manager).get("/api/teams");

    expect(response.status).toBe(200);
    expect(response.body.data.teams).toHaveLength(1);
    expect(response.body.data.teams[0].name).toBe("Core Team");
  });

  it("returns 404 for non-members accessing a team", async () => {
    await createUser({ uid: "manager-uid" });
    await createUser({ uid: "member-uid", firstName: "Grace", lastName: "Member" });
    const team = await createTeamWithMembership("manager-uid");

    const response = await authed(TOKENS.member).get(`/api/teams/${team._id}`);

    expect(response.status).toBe(404);
  });
});
