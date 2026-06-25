import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import Swal from "sweetalert2"

import { useAuth } from "@/context/auth-context"
import { apiFetch } from "@/lib/api"

import {
  sortMembersByRole,
  type TeamMember,
  type TeamInvite,
  type TeamRole,
} from "./types"

export function useTeamMembers(teamId?: string | null) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentUserId = user?.uid ?? null

  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [teamCode, setTeamCode] = useState<string | null>(null)
  const [callerRole, setCallerRole] = useState<TeamRole | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [kickDialogOpen, setKickDialogOpen] = useState(false)
  const [kickTarget, setKickTarget] = useState<TeamMember | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const isManager = callerRole === "manager"
  const managerCount = members.filter((member) => member.role === "manager").length
  const isOnlyManager = isManager && managerCount === 1
  const isLastMember = members.length === 1

  const loadTeamData = async () => {
    if (!teamId) {
      setMembers([])
      setInvites([])
      setTeamCode(null)
      setCallerRole(null)
      return
    }

    try {
      const teamRes = await apiFetch(`/teams/${teamId}`)
      setMembers(sortMembersByRole(teamRes?.members || []))
      setTeamCode(teamRes?.team?.code ?? null)
      setCallerRole(teamRes?.callerRole ?? null)

      const invitesRes = await apiFetch(`/teams/${teamId}/invitations`)
      setInvites(invitesRes?.invitations || [])
    } catch (error) {
      console.error("Error fetching team data", error)
    }
  }

  useEffect(() => {
    loadTeamData()
  }, [teamId])

  const handleCopyCode = () => {
    if (!teamCode) return

    navigator.clipboard.writeText(teamCode)
    Swal.fire({
      title: "Copied!",
      text: "Team code copied to clipboard",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    })
  }

  const handleAddMember = async () => {
    if (!teamId) return

    const { value: email } = await Swal.fire({
      title: "Invite Team Member",
      input: "email",
      inputPlaceholder: "Enter email address",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      confirmButtonText: "Send Invite",
    })

    if (!email) return

    try {
      await apiFetch(`/teams/${teamId}/invitations`, {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      Swal.fire("Success", "Invitation sent!", "success")
      loadTeamData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send invite"
      Swal.fire("Error", message, "error")
    }
  }

  const handleRoleChange = async (member: TeamMember, role: TeamRole) => {
    if (!teamId || member.role === role) return

    try {
      await apiFetch(`/teams/${teamId}/members/${member.userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      })
      await loadTeamData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update role"
      Swal.fire("Error", message, "error")
    }
  }

  const openKickDialog = (member: TeamMember) => {
    setKickTarget(member)
    setKickDialogOpen(true)
  }

  const handleKickMember = async () => {
    if (!teamId || !kickTarget) return

    setActionLoading(true)
    try {
      const result = await apiFetch(`/teams/${teamId}/members/${kickTarget.userId}`, {
        method: "DELETE",
      })
      setKickDialogOpen(false)
      setKickTarget(null)

      if (result?.teamDeleted) {
        navigate("/boards")
        return
      }

      await loadTeamData()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to remove member"
      Swal.fire("Error", message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveClick = () => {
    if (isOnlyManager && !isLastMember) {
      Swal.fire(
        "Cannot leave team",
        "You are the only manager. Promote another member to manager before leaving.",
        "warning",
      )
      return
    }

    setLeaveDialogOpen(true)
  }

  const handleLeaveTeam = async () => {
    if (!teamId) return

    setActionLoading(true)
    try {
      const result = await apiFetch(`/teams/${teamId}/leave`, {
        method: "POST",
      })
      setLeaveDialogOpen(false)

      if (result?.teamDeleted) {
        navigate("/boards")
        return
      }

      navigate("/boards")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to leave team"
      Swal.fire("Error", message, "error")
    } finally {
      setActionLoading(false)
    }
  }

  return {
    members,
    invites,
    teamCode,
    isManager,
    managerCount,
    isOnlyManager,
    isLastMember,
    currentUserId,
    leaveDialogOpen,
    setLeaveDialogOpen,
    kickDialogOpen,
    setKickDialogOpen,
    kickTarget,
    actionLoading,
    handleCopyCode,
    handleAddMember,
    handleRoleChange,
    openKickDialog,
    handleKickMember,
    handleLeaveClick,
    handleLeaveTeam,
  }
}
