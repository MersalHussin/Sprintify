import React from 'react';



import PromptInput from '@/components/pages/ai/PromptInput';
import TemplateCards from '@/components/pages/ai/TemplateCards';
import RecentGenerations from '@/components/pages/ai/RecentGenerations';

function App() {
  return (
    <div className="flex-1 flex flex-col items-center py-16 px-8">
        
       
        <div className="w-full max-w-4xl flex flex-col gap-12">
          
          <PromptInput />
          <TemplateCards />
          <RecentGenerations />
          
        </div>

    </div>
  );
}

export default App;