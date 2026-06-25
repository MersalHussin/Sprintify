import type { UserProfile } from "@/types/user";

export function needsOnboarding(profile: UserProfile | null): boolean {
  if (!profile) {
    return true;
  }

  return (
    !profile.lastName?.trim() ||
    !profile.professionalTitle?.trim() ||
    !profile.country?.trim()
  );
}
