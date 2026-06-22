import React from 'react';
import { 
  FaChartPie, 
  FaPersonRunning, 
  FaList, 
  FaUsers, 
  FaGear, 
  FaHeadset, 
  FaPlus 
} from 'react-icons/fa6';

export default function Aside() {
  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 hidden md:flex">
      
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded object-contain" />
          <h2 className="text-xl font-bold text-gray-800">Sprintify</h2>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col border-t border-gray-200 px-4 pt-6 pb-6">
        <div className="flex flex-col gap-2">
          
          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
            <FaChartPie className="text-lg" />
            <span className="font-medium">Dashboard</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
            <FaPersonRunning className="text-lg" />
            <span className="font-medium">Sprint</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
            <FaList className="text-lg" />
            <span className="font-medium">Backlog</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
            <FaUsers className="text-lg" />
            <span className="font-medium">Team Member</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
            <FaGear className="text-lg" />
            <span className="font-medium">Settings</span>
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
            <FaHeadset className="text-lg" />
            <span className="font-medium">Support</span>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 mt-4 rounded-3xl transition-colors font-medium">
            <FaPlus />
            New Project
          </button>

        </div>
      </div>
    </aside>
  );
}