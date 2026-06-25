import type { TaskUser } from "@/types/task"

export function formatDate(value?: string) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function userName(users: Record<string, TaskUser>, userId: string) {
  return users[userId]?.name?.trim() || "Unknown"
}

export function mergeUsersForAssignees(
  users: Record<string, TaskUser>,
  assigneeIds: string[] | undefined,
  teamMembers: { userId: string; name: string }[],
): Record<string, TaskUser> {
  const next = { ...users }
  for (const userId of assigneeIds ?? []) {
    if (next[userId]?.name?.trim()) continue
    const member = teamMembers.find((m) => m.userId === userId)
    if (member?.name) {
      next[userId] = { id: userId, name: member.name }
    }
  }
  return next
}

export function buildAssigneeNamesPatch(
  assigneeIds: string[] | undefined,
  teamMembers: { userId: string; name: string }[],
): Record<string, string> {
  const names: Record<string, string> = {}
  for (const userId of assigneeIds ?? []) {
    const member = teamMembers.find((m) => m.userId === userId)
    if (member?.name) names[userId] = member.name
  }
  return names
}
