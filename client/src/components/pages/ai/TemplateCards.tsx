import React from 'react';
import { FaRocket, FaShieldHalved, FaDiagramProject } from 'react-icons/fa6';

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

const TEMPLATE_PRESETS: Template[] = [
  {
    id: '1',
    title: 'Sprint Planning',
    description:
      'Generate a comprehensive sprint plan with tasks and estimates based on your goals.',
    prompt:
      'Generate a comprehensive sprint plan with tasks, priorities, and time estimates based on our current project goals.',
  },
  {
    id: '2',
    title: 'Security Audit',
    description:
      "Analyze your project's architecture for potential security vulnerabilities and risks.",
    prompt:
      'Create tasks for a security audit covering authentication, data storage, API endpoints, and common vulnerability checks.',
  },
  {
    id: '3',
    title: 'Architecture Design',
    description:
      'Design a scalable and robust system architecture for your new feature or product.',
    prompt:
      'Generate tasks for designing a scalable system architecture including infrastructure, services, data models, and integration points.',
  },
];

interface TemplateCardsProps {
  onSelectTemplate: (prompt: string) => void;
}

export default function TemplateCards({ onSelectTemplate }: TemplateCardsProps) {
  const getIconForTemplate = (id: string): React.ReactNode => {
    switch (id) {
      case '1':
        return <FaRocket className="text-xl" />;
      case '2':
        return <FaShieldHalved className="text-xl" />;
      case '3':
        return <FaDiagramProject className="text-xl" />;
      default:
        return <FaRocket className="text-xl" />;
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {TEMPLATE_PRESETS.map((template) => (
        <div
          key={template.id}
          role="button"
          tabIndex={0}
          className="bg-card rounded-2xl p-6 border border-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-primary/30 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col group"
          onClick={() => onSelectTemplate(template.prompt)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectTemplate(template.prompt);
            }
          }}
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            {getIconForTemplate(template.id)}
          </div>

          <h3 className="text-foreground font-bold text-lg mb-2">{template.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{template.description}</p>
        </div>
      ))}
    </div>
  );
}
