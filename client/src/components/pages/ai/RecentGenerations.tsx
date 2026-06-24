import React, { useState, useEffect } from 'react';
import { FaArrowUpRightFromSquare, FaEllipsisVertical, FaLayerGroup } from 'react-icons/fa6';


interface Generation {
  id: string | number; 
  title: string;
  meta: string;
  status: string;
}

export default function RecentGenerations() {
  
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const response = await fetch('http://localhost:5000/generations');
        if (!response.ok) throw new Error('Failed to fetch generations');
        
        
        const data = await response.json() as Generation[];
        setGenerations(data);
      } catch (error) {
        console.error("Error loading generations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenerations();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full mt-12 animate-pulse flex flex-col gap-4">
        <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
        {[1, 2].map(n => (
          <div key={n} className="h-20 w-full bg-gray-100 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      
      <div className="flex justify-between items-center mb-6 px-1">
        <h2 className="text-xl font-bold text-gray-900">
          Recent Generations
        </h2>
        <a href="#" className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
          View History
          <FaArrowUpRightFromSquare />
        </a>
      </div>

      <div className="flex flex-col gap-3">
        {generations.map((item) => (
          
          <div 
            key={item.id}
            className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200"
          >
            
            <div className="flex items-center gap-4">
              
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 shadow-inner">
                <FaLayerGroup />
              </div>

              <div className="flex flex-col">
                <h4 className="text-gray-900 font-bold text-[15px]">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-xs mt-0.5">
                  {item.meta}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              
              {item.status === 'COMPLETED' ? (
                <span className="bg-[#e6f4f1] text-[#2c7a7b] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Completed
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
                  In Progress
                </span>
              )}

              <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
                <FaEllipsisVertical />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}