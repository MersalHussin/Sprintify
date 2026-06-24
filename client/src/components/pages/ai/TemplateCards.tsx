import React, { useState, useEffect } from 'react';
import { FaRocket, FaShieldHalved, FaDiagramProject } from 'react-icons/fa6';


interface Template {
  id: string; 
  title: string;
  description: string;
}

export default function TemplateCards() {
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Hardcoded templates since there is no backend endpoint for this
    const staticTemplates: Template[] = [
      {
        id: "1",
        title: "Sprint Planning",
        description: "Generate a comprehensive sprint plan with tasks and estimates based on your goals.",
      },
      {
        id: "2",
        title: "Security Audit",
        description: "Analyze your project's architecture for potential security vulnerabilities and risks.",
      },
      {
        id: "3",
        title: "Architecture Design",
        description: "Design a scalable and robust system architecture for your new feature or product.",
      }
    ];

    // Simulate a brief network delay
    setTimeout(() => {
      setTemplates(staticTemplates);
      setIsLoading(false);
    }, 500);
  }, []);

  
  const getIconForTemplate = (id: string): React.ReactNode => {
    switch (id) {
      case "1":
        return <FaRocket className="text-xl" />; 
      case "2":
        return <FaShieldHalved className="text-xl" />; 
      case "3":
        return <FaDiagramProject className="text-xl" />; 
      default:
        return <FaRocket className="text-xl" />; 
    }
  };

  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-gray-100 rounded-2xl h-40 w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div 
          key={template.id}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col group"
          onClick={() => {
            console.log(`Clicked template: ${template.title}`);
          }}
        >
          
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
            {getIconForTemplate(template.id)}
          </div>

          <h3 className="text-gray-900 font-bold text-lg mb-2">
            {template.title}
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {template.description}
          </p>
        </div>
      ))}
    </div>
  );
}