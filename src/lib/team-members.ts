import type { PromptTeamMember } from "../constants/chat-assistant-prompt";
import type { TeamMember, TeamRole } from "../types/team";
import type { AuthUser } from "../types/user";

type Membership = {
  userId: string;
  role: TeamRole;
  joinedAt: Date;
};

export function buildTeamMembers(
  memberships: Membership[],
  usersById: Map<string, AuthUser>,
): TeamMember[] {
  return memberships.map((membership) => {
    const user = usersById.get(membership.userId);
    const sanitized = user
      ? { id: user.id, email: user.email, name: user.name }
      : null;

    return {
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      user: sanitized,
    };
  });
}

export function toPromptTeamMembers(teamMembers: TeamMember[]): PromptTeamMember[] {
  return teamMembers.map((member) => ({
    id: member.userId,
    name: member.user?.name ?? member.user?.email ?? member.userId,
    role: member.role,
  }));
}
