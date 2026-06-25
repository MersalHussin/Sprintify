import { FaCopy, FaPlus, FaUsers } from "react-icons/fa6"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { TeamMemberCard } from "./teams/team-member-card"
import { TeamStatsRow } from "./teams/team-stats-row"
import type { TeamInvite } from "./teams/types"
import { useTeamMembers } from "./teams/use-team-members"

function TeamInviteCard({ invite }: { invite: TeamInvite }) {
  return (
    <div className="border border-dashed border-border rounded-xl bg-bg-subtle p-6 flex flex-col relative">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-bg-inset flex items-center justify-center text-text-muted">
          <FaUsers size={20} />
        </div>
        <div className="truncate">
          <h3 className="font-bold text-text-secondary text-lg leading-tight truncate">{invite.email}</h3>
          <p className="text-text-muted text-sm">Invited</p>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-text-muted">Status</span>
        <span className="bg-accent-subtle text-accent px-2.5 py-1 rounded-full text-xs font-bold">
          Pending Invite
        </span>
      </div>
    </div>
  )
}

function AddMemberCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-2 border-dashed border-border rounded-xl bg-bg-surface p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent hover:bg-accent-subtle/50 transition-colors duration-150 group h-full min-h-[220px]"
    >
      <div className="w-12 h-12 rounded-xl bg-bg-subtle group-hover:bg-accent-subtle flex items-center justify-center text-text-muted group-hover:text-accent transition-colors duration-150">
        <FaPlus size={16} />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-text-primary mb-1">Add new team member</h3>
        <p className="text-xs text-text-muted font-medium">Invite users to collaborate</p>
      </div>
    </button>
  )
}

export default function Teams({ teamId }: { teamId?: string | null }) {
  const team = useTeamMembers(teamId)

  return (
    <div className="flex flex-col h-full bg-bg-base/50 p-6 md:p-8 rounded-xl">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">Teams</h1>
          <p className="text-text-secondary text-sm font-medium">
            Manage your organization&apos;s members and collaborative roles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-text-primary">
              Team Code: {team.teamCode ?? "Unavailable"}
            </span>
            <Button
              onClick={team.handleCopyCode}
              disabled={!team.teamCode}
              title="Copy team code"
              variant="outline"
              size="icon-lg"
            >
              <FaCopy size={14} />
            </Button>
            <Button variant="outline" onClick={team.handleLeaveClick}>
              Leave team
            </Button>
          </div>
        </div>
      </div>

      <TeamStatsRow memberCount={team.members.length} inviteCount={team.invites.length} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.members.map((member) => (
          <TeamMemberCard
            key={member.userId}
            member={member}
            currentUserId={team.currentUserId}
            isManager={team.isManager}
            managerCount={team.managerCount}
            onRoleChange={team.handleRoleChange}
            onKick={team.openKickDialog}
          />
        ))}

        {team.invites.map((invite) => (
          <TeamInviteCard key={invite._id} invite={invite} />
        ))}

        {team.isManager ? <AddMemberCard onClick={team.handleAddMember} /> : null}
      </div>

      <Dialog open={team.leaveDialogOpen} onOpenChange={team.setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{team.isLastMember ? "Delete team?" : "Leave team?"}</DialogTitle>
            <DialogDescription>
              {team.isLastMember
                ? "You are the last member of this team. Leaving will permanently delete the team and all of its projects, tasks, and data."
                : "You will lose access to this team and its projects. You can rejoin later with the team code if invited again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => team.setLeaveDialogOpen(false)}
              disabled={team.actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={team.handleLeaveTeam}
              disabled={team.actionLoading}
            >
              {team.isLastMember ? "Delete team and leave" : "Leave team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={team.kickDialogOpen} onOpenChange={team.setKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              {team.kickTarget
                ? `${team.kickTarget.user?.name ?? "This member"} will lose access to the team and its projects.`
                : "This member will lose access to the team and its projects."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => team.setKickDialogOpen(false)}
              disabled={team.actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={team.handleKickMember}
              disabled={team.actionLoading}
            >
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
