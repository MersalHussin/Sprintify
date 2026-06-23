import type { PromptTeamMember } from "../prompts/chat-assistant-prompt";
import type { TeamMember } from "../types/team";
import type { TeamMembershipDocument } from "../models/team-memberships";
import { toAuthUser, type UserDisplayDocument } from "./users";

export type PopulatedTeamMembership = TeamMembershipDocument & {
  user: UserDisplayDocument | null;
};

export function buildTeamMembers(memberships: PopulatedTeamMembership[]): TeamMember[] {
  return memberships.map((membership) => {
    const user = membership.user;

    return {
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      user: user ? toAuthUser(user) : null,
    };
  });
}

export function toPromptTeamMembers(teamMembers: TeamMember[]): PromptTeamMember[] {
  return teamMembers.map((member) => ({
    id: member.userId,
    name: member.user?.name ?? member.userId,
    role: member.role,
  }));
}
