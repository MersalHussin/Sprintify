import type { AuthUser } from "./user";

export const TEAM_ROLES = ["manager", "member"] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export type TeamMember = {
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  user: AuthUser | null;
};
