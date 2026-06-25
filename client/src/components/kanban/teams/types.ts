export type TeamRole = "manager" | "member"

export interface TeamMember {
  userId: string
  role: TeamRole
  joinedAt: string
  user: {
    id: string
    name: string
    professionalTitle?: string
  }
}

export interface TeamInvite {
  _id: string
  email: string
  token: string
  status: string
}

export const ROLE_SORT_ORDER: Record<TeamRole, number> = {
  manager: 0,
  member: 1,
}

export function sortMembersByRole(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => ROLE_SORT_ORDER[a.role] - ROLE_SORT_ORDER[b.role])
}
