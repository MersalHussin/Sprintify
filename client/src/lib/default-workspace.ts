import { apiFetch } from "@/lib/api";

interface Team {
  _id: string;
  name: string;
}

let ensureDefaultWorkspacePromise: Promise<Team> | null = null;

/** Ensures the user has a default workspace team, deduping concurrent callers. */
export async function ensureDefaultWorkspaceTeam(): Promise<Team> {
  if (!ensureDefaultWorkspacePromise) {
    ensureDefaultWorkspacePromise = (async () => {
      const teamsRes = await apiFetch("/teams");
      const teams: Team[] = teamsRes?.teams || [];
      if (teams.length > 0) {
        return teams[0];
      }

      const newTeamRes = await apiFetch("/teams", {
        method: "POST",
        body: JSON.stringify({ name: "My Workspace" }),
      });
      return newTeamRes.team;
    })().finally(() => {
      ensureDefaultWorkspacePromise = null;
    });
  }

  return ensureDefaultWorkspacePromise;
}
