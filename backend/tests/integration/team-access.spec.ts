import { describe, expect, it } from "vitest";

import { isTeamMember } from "../../src/lib/team-access";
import { createTeamWithMembership, createUser } from "../factories";

describe("isTeamMember", () => {
  it("returns true for active memberships", async () => {
    await createUser({ uid: "manager-uid" });
    const team = await createTeamWithMembership("manager-uid");

    await expect(isTeamMember(team._id, "manager-uid")).resolves.toBe(true);
    await expect(isTeamMember(team._id, "unknown-uid")).resolves.toBe(false);
  });
});
