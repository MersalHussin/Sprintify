import React from 'react';
import { NavLink } from 'react-router';
import { 
  FaChartPie, 
  FaPersonRunning, 
  FaList, 
  FaUsers, 
  FaGear, 
  FaHeadset, 
  FaPlus,
  FaDiagramProject,
  FaTable,
  FaArrowRightFromBracket,
  FaWandMagicSparkles,
  FaLayerGroup,
  FaSliders
} from 'react-icons/fa6';
import { useContactModal } from '@/context/contact-modal-context';
import { useAuth } from '@/context/auth-context';
import { useNavigate } from 'react-router';

const SIDEBAR_LINKS = [
  { title: 'Build with AI', path: '/dashboard', icon: FaWandMagicSparkles },
  { title: 'Workspaces', path: '/workspaces', icon: FaLayerGroup },
  { title: 'Settings', path: '/settings', icon: FaSliders },
];

export default function Sidebar() {
  const { open: openContact } = useContactModal();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col flex-shrink-0 hidden md:flex transition-colors duration-200">
      
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src="/assets/images/logo.webp" alt="Logo" className="w-35  rounded object-contain" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col border-t border-gray-200 dark:border-slate-800 px-4 pt-6 pb-6 overflow-y-auto">
        <div className="flex flex-col gap-2">
          
          {SIDEBAR_LINKS.map((link) => (
            <NavLink 
              key={link.path}
              to={link.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
                }`
              }
            >
              <link.icon className="text-lg" />
              <span>{link.title}</span>
            </NavLink>
          ))}

          {/* Support Button (Triggers Contact Modal) */}
          <button 
            onClick={() => openContact()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium w-full text-left"
          >
            <FaHeadset className="text-lg" />
            <span>Support</span>
          </button>

          {/* <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-4 rounded-3xl transition-colors font-medium">
            <FaPlus />
            New Project
          </button> */}

        </div>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-gray-200 dark:border-slate-800 p-4">
        <div 
          onClick={handleLogout}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors cursor-pointer group"
          title="Click to logout"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'User'}`} 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 object-cover" 
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-red-600 truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-red-400 truncate">
                Logout
              </span>
            </div>
          </div>
          <FaArrowRightFromBracket className="text-gray-400 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
    </aside>
  );
}
