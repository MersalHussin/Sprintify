import type { User } from "firebase/auth"
import type { UserProfile } from "@/types/user"

const AVATAR_BG_CLASSES = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
] as const

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (
    parts[0]!.charAt(0).toUpperCase() +
    parts[parts.length - 1]!.charAt(0).toUpperCase()
  )
}

export function getDisplayName(
  profile: UserProfile | null,
  user: User | null,
): string {
  if (profile) {
    return `${profile.firstName} ${profile.lastName}`.trim()
  }
  return user?.displayName || user?.email?.split("@")[0] || "User"
}

export function getAvatarUrl(user: User | null): string | undefined {
  return user?.photoURL ?? undefined
}

export function getAvatarBackgroundClass(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_BG_CLASSES[Math.abs(hash) % AVATAR_BG_CLASSES.length]!
}
