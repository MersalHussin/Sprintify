import React, { useState, useEffect } from 'react';
import { FaCopy, FaUsers, FaClock, FaPlus, FaChevronDown, FaUserMinus } from 'react-icons/fa6';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { apiFetch } from '../../lib/api';
import { getAvatarBackgroundClass, getInitials } from '@/lib/user-display';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type TeamRole = 'manager' | 'member';

interface MemberType {
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    professionalTitle?: string;
  };
}

interface InviteType {
  _id: string;
  email: string;
  token: string;
  status: string;
}

const ROLE_SORT_ORDER: Record<TeamRole, number> = {
  manager: 0,
  member: 1,
};

function sortMembersByRole(members: MemberType[]): MemberType[] {
  return [...members].sort((a, b) => ROLE_SORT_ORDER[a.role] - ROLE_SORT_ORDER[b.role]);
}

export default function Teams({ teamId }: { teamId?: string | null }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.uid ?? null;

  const [members, setMembers] = useState<MemberType[]>([]);
  const [invites, setInvites] = useState<InviteType[]>([]);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [callerRole, setCallerRole] = useState<TeamRole | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [kickDialogOpen, setKickDialogOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState<MemberType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isManager = callerRole === 'manager';
  const managerCount = members.filter((member) => member.role === 'manager').length;
  const isOnlyManager = isManager && managerCount === 1;
  const isLastMember = members.length === 1;

  const loadTeamData = async () => {
    if (!teamId) {
      setMembers([]);
      setInvites([]);
      setTeamCode(null);
      setCallerRole(null);
      return;
    }

    try {
      const teamRes = await apiFetch(`/teams/${teamId}`);
      setMembers(sortMembersByRole(teamRes?.members || []));
      setTeamCode(teamRes?.team?.code ?? null);
      setCallerRole(teamRes?.callerRole ?? null);

      const invitesRes = await apiFetch(`/teams/${teamId}/invitations`);
      setInvites(invitesRes?.invitations || []);
    } catch (error) {
      console.error("Error fetching team data", error);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const handleCopyCode = () => {
    if (!teamCode) return;

    navigator.clipboard.writeText(teamCode);
    Swal.fire({
      title: 'Copied!',
      text: 'Team code copied to clipboard',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleAddMember = async () => {
    if (!teamId) return;

    const { value: email } = await Swal.fire({
      title: 'Invite Team Member',
      input: 'email',
      inputPlaceholder: 'Enter email address',
      showCancelButton: true,
      confirmButtonColor: '#1d4ed8',
      confirmButtonText: 'Send Invite'
    });

    if (!email) return;

    try {
      await apiFetch(`/teams/${teamId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      Swal.fire('Success', 'Invitation sent!', 'success');
      loadTeamData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send invite';
      Swal.fire('Error', message, 'error');
    }
  };

  const handleRoleChange = async (member: MemberType, role: TeamRole) => {
    if (!teamId || member.role === role) return;

    try {
      await apiFetch(`/teams/${teamId}/members/${member.userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await loadTeamData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update role';
      Swal.fire('Error', message, 'error');
    }
  };

  const openKickDialog = (member: MemberType) => {
    setKickTarget(member);
    setKickDialogOpen(true);
  };

  const handleKickMember = async () => {
    if (!teamId || !kickTarget) return;

    setActionLoading(true);
    try {
      const result = await apiFetch(`/teams/${teamId}/members/${kickTarget.userId}`, {
        method: 'DELETE',
      });
      setKickDialogOpen(false);
      setKickTarget(null);

      if (result?.teamDeleted) {
        navigate('/boards');
        return;
      }

      await loadTeamData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove member';
      Swal.fire('Error', message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveClick = () => {
    if (isOnlyManager && !isLastMember) {
      Swal.fire(
        'Cannot leave team',
        'You are the only manager. Promote another member to manager before leaving.',
        'warning',
      );
      return;
    }

    setLeaveDialogOpen(true);
  };

  const handleLeaveTeam = async () => {
    if (!teamId) return;

    setActionLoading(true);
    try {
      const result = await apiFetch(`/teams/${teamId}/leave`, {
        method: 'POST',
      });
      setLeaveDialogOpen(false);

      if (result?.teamDeleted) {
        navigate('/boards');
        return;
      }

      navigate('/boards');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to leave team';
      Swal.fire('Error', message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const canDemoteMember = (member: MemberType) => {
    if (member.role !== 'manager') return true;
    return managerCount > 1;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 md:p-8 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Teams</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your organization's members and collaborative roles.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">
              Team Code: {teamCode ?? "Unavailable"}
            </span>
            <Button 
              onClick={handleCopyCode}
              disabled={!teamCode}
              title="Copy team code"
              variant="outline"
              size="icon-lg"
            >
              <FaCopy size={14} />
            </Button>
            <Button variant="outline" onClick={handleLeaveClick}>
              Leave team
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 mb-10">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4 w-64">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FaUsers size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4 w-64">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FaClock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Invites</p>
            <p className="text-2xl font-bold text-gray-900">{invites.length}</p>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Active Members */}
        {members.map(member => {
          const memberName = member.user?.name || "Unknown User";
          const isSelf = member.userId === currentUserId;
          const showRoleDropdown = isManager;
          const showKick = isManager && !isSelf;

          return (
          <div key={member.userId} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className={cn(
                  "flex size-14 items-center justify-center rounded-2xl text-lg font-semibold text-white",
                  getAvatarBackgroundClass(member.userId),
                )}>
                  {getInitials(memberName)}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500`}></div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                  {memberName}
                  {isSelf ? <span className="text-gray-400 font-medium text-sm ml-1">(You)</span> : null}
                </h3>
                <p className="text-gray-500 text-sm truncate">{member.user?.professionalTitle || member.role}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-400">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700`}>
                Active
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-400">Role</span>
              {showRoleDropdown ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold capitalize text-gray-900 hover:bg-gray-50"
                    >
                      {member.role}
                      <FaChevronDown className="size-3 text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={member.role === 'manager'}
                      onClick={() => handleRoleChange(member, 'manager')}
                    >
                      Manager
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={member.role === 'member' || !canDemoteMember(member)}
                      onClick={() => handleRoleChange(member, 'member')}
                    >
                      Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="font-bold text-gray-900 capitalize">{member.role}</span>
              )}
            </div>

            {showKick ? (
              <Button
                variant="destructive"
                size="sm"
                className="mt-auto w-full"
                onClick={() => openKickDialog(member)}
              >
                <FaUserMinus />
                Remove from team
              </Button>
            ) : null}
          </div>
          )
        })}

        {/* Pending Invite Cards */}
        {invites.map(invite => (
          <div key={invite._id} className="bg-slate-50 border border-gray-200 border-dashed rounded-xl p-6 flex flex-col relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400">
                <FaUsers size={20} />
              </div>
              <div className="truncate">
                <h3 className="font-bold text-gray-600 text-lg leading-tight truncate">{invite.email}</h3>
                <p className="text-gray-400 text-sm">Invited</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-400">Status</span>
              <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                Pending Invite
              </span>
            </div>
          </div>
        ))}

        {/* Add New Member Card */}
        {isManager ? (
          <div 
            onClick={handleAddMember}
            className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors group h-full min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
              <FaPlus size={16} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-1">Add new team member</h3>
              <p className="text-xs text-gray-400 font-medium">Invite users to collaborate</p>
            </div>
          </div>
        ) : null}

      </div>

      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isLastMember ? 'Delete team?' : 'Leave team?'}</DialogTitle>
            <DialogDescription>
              {isLastMember
                ? 'You are the last member of this team. Leaving will permanently delete the team and all of its projects, tasks, and data.'
                : 'You will lose access to this team and its projects. You can rejoin later with the team code if invited again.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveTeam} disabled={actionLoading}>
              {isLastMember ? 'Delete team and leave' : 'Leave team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={kickDialogOpen} onOpenChange={setKickDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove team member?</DialogTitle>
            <DialogDescription>
              {kickTarget
                ? `${kickTarget.user?.name ?? 'This member'} will lose access to the team and its projects.`
                : 'This member will lose access to the team and its projects.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKickDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleKickMember} disabled={actionLoading}>
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
