export const TEAM_ROLES = ["manager", "member"] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];
