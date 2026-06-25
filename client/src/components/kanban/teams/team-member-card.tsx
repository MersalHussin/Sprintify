import { FaChevronDown, FaUserMinus } from "react-icons/fa6"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAvatarBackgroundClass, getInitials } from "@/lib/user-display"
import { cn } from "@/lib/utils"

import type { TeamMember, TeamRole } from "./types"

interface TeamMemberCardProps {
  member: TeamMember
  currentUserId: string | null
  isManager: boolean
  managerCount: number
  onRoleChange: (member: TeamMember, role: TeamRole) => void
  onKick: (member: TeamMember) => void
}

export function TeamMemberCard({
  member,
  currentUserId,
  isManager,
  managerCount,
  onRoleChange,
  onKick,
}: TeamMemberCardProps) {
  const memberName = member.user?.name || "Unknown User"
  const isSelf = member.userId === currentUserId
  const showRoleDropdown = isManager
  const showKick = isManager && !isSelf
  const canDemote = member.role !== "manager" || managerCount > 1

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-6 flex flex-col relative">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl text-lg font-semibold text-primary-foreground",
              getAvatarBackgroundClass(member.userId),
            )}
          >
            {getInitials(memberName)}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-bg-surface bg-success" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-text-primary text-lg leading-tight truncate">
            {memberName}
            {isSelf ? (
              <span className="text-text-muted font-medium text-sm ml-1">(You)</span>
            ) : null}
          </h3>
          <p className="text-text-secondary text-sm truncate">
            {member.user?.professionalTitle || member.role}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-text-muted">Status</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-success/10 text-success">
          Active
        </span>
      </div>

      <div className="flex justify-between items-center text-sm mb-4">
        <span className="text-text-muted">Role</span>
        {showRoleDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-surface px-2.5 py-1 text-xs font-bold capitalize text-text-primary hover:bg-bg-subtle transition-colors duration-150"
              >
                {member.role}
                <FaChevronDown className="size-3 text-text-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={member.role === "manager"}
                onClick={() => onRoleChange(member, "manager")}
              >
                Manager
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={member.role === "member" || !canDemote}
                onClick={() => onRoleChange(member, "member")}
              >
                Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="font-bold text-text-primary capitalize">{member.role}</span>
        )}
      </div>

      {showKick ? (
        <Button
          variant="destructive"
          size="sm"
          className="mt-auto w-full"
          onClick={() => onKick(member)}
        >
          <FaUserMinus />
          Remove from team
        </Button>
      ) : null}
    </div>
  )
}
