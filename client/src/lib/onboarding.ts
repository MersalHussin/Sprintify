import type { UserProfile } from "@/types/user";

/** True when the user has not finished the onboarding profile step. */
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
