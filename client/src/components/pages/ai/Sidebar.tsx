import React from 'react';
import { 
  FaPersonRunning, 
  FaUsers, 
  FaGear, 
  FaHeadset, 
  FaPlus,
  FaDiagramProject 
} from 'react-icons/fa6';

export default function Aside() {
  return (
    <aside className="w-64 h-screen bg-bg-surface border-r border-border flex flex-col flex-shrink-0 hidden md:flex">
      
      
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded object-contain" />
          <h2 className="text-xl font-bold text-text-primary">Sprintify</h2>
        </div>
      </div>

      
      <div className="flex-1 flex flex-col border-t border-border px-4 pt-6 pb-6">
        
        
        <div className="flex flex-col gap-2">
          
        
          <div className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:bg-bg-subtle hover:text-accent rounded-lg cursor-pointer transition-colors duration-150">
            <FaDiagramProject className="text-lg" />
            <span className="font-medium">Build with AI</span>
          </div>

         
          <div className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:bg-bg-subtle hover:text-accent rounded-lg cursor-pointer transition-colors duration-150">
            <FaPersonRunning className="text-lg" />
            <span className="font-medium">Sprints</span>
          </div>


          
          <div className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:bg-bg-subtle hover:text-accent rounded-lg cursor-pointer transition-colors duration-150">
            <FaUsers className="text-lg" />
            <span className="font-medium">Invite code team</span>
          </div>

         
          <div className="flex items-center gap-3 px-3 py-2.5 text-text-secondary hover:bg-bg-subtle hover:text-accent rounded-lg cursor-pointer transition-colors duration-150">
            <FaGear className="text-lg" />
            <span className="font-medium">Settings</span>
          </div>

        
          <button className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-bg-base py-2.5 mt-4 rounded-3xl transition-colors duration-150 font-medium">
            <FaPlus />
            New Sprint
          </button>

        </div>

      </div>
    </aside>
  );
}
