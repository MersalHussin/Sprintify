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
  FaTable
} from 'react-icons/fa6';
import { useContactModal } from '@/context/contact-modal-context';

const SIDEBAR_LINKS = [
  { title: 'Build with AI', path: '/ai', icon: FaDiagramProject },
  { title: 'Workspaces', path: '/workspaces', icon: FaPersonRunning },
  { title: 'Settings', path: '/settings', icon: FaGear },
];

export default function Sidebar() {
  const { open: openContact } = useContactModal();

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

          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-4 rounded-3xl transition-colors font-medium">
            <FaPlus />
            New Project
          </button>

        </div>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-gray-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 object-cover" 
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              John Doe
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Product Manager
            </span>
          </div>
        </div>
      </div>
      
    </aside>
  );
}
