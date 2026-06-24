import React, { useState, FormEvent } from 'react';
import { FaWandMagicSparkles, FaArrowRight, FaRegLightbulb } from  'react-icons/fa6'


interface GenerationPayload {
  title: string;
  meta: string;
  status: string;
}

export default function PromptInput() {
  
  const [promptText, setPromptText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

 
  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    if (!promptText.trim()) return; 

    setIsGenerating(true);

    try {
     
      const newGeneration: GenerationPayload = {
        title: promptText, 
        meta: "Generating... • 0 tasks created",
        status: "In Progress"
      };

      const response = await fetch('http://localhost:5000/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGeneration),
      });

      if (response.ok) {
        setPromptText('');
      }
    } catch (error) {
      
      console.error("Error creating generation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center w-full mt-4">
      
      <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
        <FaWandMagicSparkles />
        <span>Powered by Sprintify-4</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
        What are we <span className="text-blue-600">building</span> today?
      </h1>

      <p className="text-gray-500 max-w-xl mx-auto mb-10 text-base md:text-lg leading-relaxed">
        Define your goals and let AI orchestrate your entire workspace—
        from backlog items to sprint schedules.
      </p>

      <form 
        onSubmit={handleGenerate}
        className="w-full max-w-3xl flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 border border-gray-100 transition-all focus-within:shadow-md focus-within:border-blue-300"
      >
        
        <div className="pl-4 pr-2 text-blue-500">
          <FaRegLightbulb  />
        </div>

        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Build a fintech mobile app backlog..."
          className="flex-1 bg-transparent py-3 px-2 outline-none text-gray-700 placeholder-gray-400 text-lg"
          disabled={isGenerating}
        />

        <button
          type="submit"
          disabled={isGenerating || !promptText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-colors duration-200"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
          {!isGenerating && <FaArrowRight />}
        </button>

      </form>

    </div>
  );
}