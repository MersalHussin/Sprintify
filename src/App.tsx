import React from 'react';

// We are importing the components we decided on (even if they are empty for now)
import Sidebar from './components/Sidebar';
import PromptInput from './components/PromptInput';
import TemplateCards from './components/TemplateCards';
import RecentGenerations from './components/RecentGenerations';

function App() {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] font-sans text-gray-800">
      
      {/* THE SIDEBAR AREA */}
      <div className="w-[260px] bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar />
      </div>

      {/* THE MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto py-16 px-8">
        
        {/* CONTENT CONTAINER */}
        <div className="w-full max-w-4xl flex flex-col gap-12">
          
          <PromptInput />
          <TemplateCards />
          <RecentGenerations />
          
        </div>

      </div>

    </div>
  );
}

export default App;