import React from 'react';


import Sidebar from '@/components/pages/ai/Sidebar';
import PromptInput from '@/components/pages/ai/PromptInput';
import TemplateCards from '@/components/pages/ai/TemplateCards';
import RecentGenerations from '@/components/pages/ai/RecentGenerations';

function App() {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] font-sans text-gray-800">
      
     
      <div className="w-[260px] bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar />
      </div>

     
      <div className="flex-1 flex flex-col items-center overflow-y-auto py-16 px-8">
        
       
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