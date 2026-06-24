import { FaCopy, FaUsers, FaClock, FaPlus } from 'react-icons/fa6';
import { useParams } from 'react-router';
import Swal from 'sweetalert2';

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    title: 'Lead Designer',
    status: 'Active',
    team: 'Product Design',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    color: 'bg-teal-500'
  },
  {
    id: 2,
    name: 'Marcus Thorne',
    title: 'Senior Dev',
    status: 'Active',
    team: 'Core API',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    color: 'bg-teal-500'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    title: 'Product Manager',
    status: 'Away',
    team: 'Operations',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    color: 'bg-teal-600'
  },
  {
    id: 4,
    name: 'David Chen',
    title: 'QA Engineer',
    status: 'Active',
    team: 'Growth',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    color: 'bg-teal-500'
  }
];

export default function Teams() {
  const { boardId } = useParams();
  const boardCode = `#${boardId === 'dummy-workspace-1' ? '2213492' : boardId}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(boardCode);
    Swal.fire({
      title: 'Copied!',
      text: 'Board code copied to clipboard',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
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
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4 w-64">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <FaClock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Invites</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Active Members */}
        {TEAM_MEMBERS.map(member => (
          <div key={member.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl ${member.color} overflow-hidden`}>
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover pt-2" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
                <p className="text-gray-500 text-sm">{member.title}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm mb-3">
              <span className="text-gray-400">Status</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                {member.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Team</span>
              <span className="font-bold text-gray-900">{member.team}</span>
            </div>
          </div>
        ))}

        {/* Pending Invite Card */}
        <div className="bg-slate-50 border border-gray-200 border-dashed rounded-xl p-6 flex flex-col relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-400">
              <FaUsers size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-600 text-lg leading-tight">Alex Rivera</h3>
              <p className="text-gray-400 text-sm">Frontend Developer</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm mb-3">
            <span className="text-gray-400">Status</span>
            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
              Pending Invite
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Team</span>
            <span className="font-bold text-gray-500">Core App</span>
          </div>
        </div>

        {/* Add New Member Card */}
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors group h-full min-h-[220px]">
          <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
            <FaPlus size={16} />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-1">Add new team member</h3>
            <p className="text-xs text-gray-400 font-medium">Start collaborating on Project Alpha</p>
          </div>
        </div>

      </div>
    </div>
  );
}
