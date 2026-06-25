import type { Location } from "react-router";

export function getRedirectPath(location: Location, fallback = "/dashboard"): string {
  const from = (location.state as { from?: Location } | null)?.from;
  if (!from) return fallback;
  return `${from.pathname}${from.search ?? ""}`;
}
