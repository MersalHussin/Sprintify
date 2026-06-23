import type { PromptTeamMember } from "../prompts/chat-assistant-prompt";
import type { TeamMember } from "../types/team";
import type { TeamMembershipDocument } from "../models/team-memberships";
import { toAuthUser, type UserDisplayDocument } from "./users";

export type PopulatedTeamMembership = Omit<TeamMembershipDocument, "userId"> & {
  userId: UserDisplayDocument;
};

export function buildTeamMembers(memberships: PopulatedTeamMembership[]): TeamMember[] {
  return memberships.map((membership) => {
    const user = membership.userId;

    return {
      userId: user.uid,
      role: membership.role,
      joinedAt: membership.joinedAt,
      user: toAuthUser(user),
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
