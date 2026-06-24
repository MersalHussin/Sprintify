import { describe, expect, it } from "vitest";

import { buildTeamMembers, toPromptTeamMembers } from "../../src/lib/team-members";

describe("team-members", () => {
  it("maps populated memberships to API members", () => {
    const members = buildTeamMembers([
      {
        userId: "u1",
        role: "manager",
        joinedAt: new Date("2024-01-01"),
        user: {
          uid: "u1",
          firstName: "Ada",
          lastName: "Lovelace",
          professionalTitle: "Lead",
        },
      } as never,
    ]);

    expect(members[0]?.user?.name).toBe("Ada Lovelace");
    expect(toPromptTeamMembers(members)[0]?.professionalTitle).toBe("Lead");
  });
});
