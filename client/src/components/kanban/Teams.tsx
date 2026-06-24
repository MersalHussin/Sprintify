import React, { useState, useEffect } from 'react';
import { FaCopy, FaUsers, FaClock, FaPlus } from 'react-icons/fa6';
import { useParams } from 'react-router';
import Swal from 'sweetalert2';
import { apiFetch } from '../../lib/api';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

interface MemberType {
  userId: string;
  role: string;
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
  status: string;
}

export default function Teams({ teamId }: { teamId?: string | null }) {
  const { boardId } = useParams();
  const boardCode = `#${boardId === 'dummy-workspace-1' ? '2213492' : boardId}`;

  const [members, setMembers] = useState<MemberType[]>([]);
  const [invites, setInvites] = useState<InviteType[]>([]);

  const loadTeamData = async () => {
    if (!teamId || boardId === 'dummy-workspace-1') {
      // Dummy data for dummy workspace
      setMembers([{
        userId: '1', role: 'manager', joinedAt: '', user: { id: '1', name: 'Sarah Jenkins', professionalTitle: 'Lead Designer' }
      }]);
      return;
    }

    try {
      const teamRes = await apiFetch(`/teams/${teamId}`);
      if (teamRes?.members) setMembers(teamRes.members);

      const invitesRes = await apiFetch(`/teams/${teamId}/invitations`);
      if (invitesRes?.invitations) setInvites(invitesRes.invitations);
    } catch (error) {
      console.error("Error fetching team data", error);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(boardCode);
    Swal.fire({
      title: 'Copied!',
      text: 'Board code copied to clipboard',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  const handleAddMember = async () => {
    if (!teamId || boardId === 'dummy-workspace-1') return;

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
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Failed to send invite', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 md:p-8 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Teams</h1>
          <p className="text-gray-500 text-sm font-medium">Manage your organization's members and collaborative roles.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-gray-900">Board Code : {boardCode}</span>
          <button 
            onClick={handleCopyCode}
            className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-8 rounded flex items-center justify-center transition-colors shadow-sm"
            title="Copy Code"
          >
            <FaCopy size={14} />
          </button>
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
        {members.map(member => (
          <div key={member.userId} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-teal-500 overflow-hidden`}>
                  <img src={DEFAULT_AVATAR + member.user?.name} alt={member.user?.name} className="w-full h-full object-cover pt-2" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500`}></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.user?.name || "Unknown User"}</h3>
                <p className="text-gray-500 text-sm">{member.user?.professionalTitle || member.role}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-400">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700`}>
                Active
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Role</span>
              <span className="font-bold text-gray-900 capitalize">{member.role}</span>
            </div>
          </div>
        ))}

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

      </div>
    </div>
  );
}
}