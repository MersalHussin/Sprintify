import { useEffect, useState } from "react"
import { useParams } from "react-router"

import Teams from "@/components/kanban/Teams"
import { useSetPageTitle } from "@/context/page-title-context"
import { apiFetch } from "@/lib/api"

export default function TeamMembers() {
  const { teamId } = useParams()
  const [teamName, setTeamName] = useState<string>()

  useEffect(() => {
    if (!teamId) return

    apiFetch(`/teams/${teamId}`)
      .then((res) => {
        if (res?.team?.name) setTeamName(res.team.name)
      })
      .catch(() => setTeamName(undefined))
  }, [teamId])

  useSetPageTitle(teamName ? `${teamName} — Members` : "Team Members")

  return (
    <div className="flex-1 overflow-y-auto">
      <Teams teamId={teamId ?? null} />
    </div>
  )
}
