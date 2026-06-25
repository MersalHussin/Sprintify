import React, { FormEvent } from 'react';
import { FaWandMagicSparkles, FaArrowRight, FaRegLightbulb } from 'react-icons/fa6';

interface PromptInputProps {
  projectId: string | null;
  promptText: string;
  isGenerating: boolean;
  onPromptChange: (value: string) => void;
  onGenerate: (prompt: string) => void;
}

export default function PromptInput({
  projectId,
  promptText,
  isGenerating,
  onPromptChange,
  onGenerate,
}: PromptInputProps) {
  const handleGenerate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = promptText.trim();
    if (!trimmed || !projectId || isGenerating) return;
    onGenerate(trimmed);
  };

  return (
    <div className="flex flex-col items-center text-center w-full mt-4">
      <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
        <FaWandMagicSparkles />
        <span>Powered by Sprintify-4</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
        What are we <span className="text-primary">building</span> today?
      </h1>

      <p className="text-muted-foreground max-w-xl mx-auto mb-10 text-base md:text-lg leading-relaxed">
        Define your goals and let AI orchestrate your entire workspace—
        from backlog items to sprint schedules.
      </p>

      <form
        onSubmit={handleGenerate}
        className="w-full max-w-3xl flex items-center bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2 border border-border transition-all focus-within:shadow-md focus-within:border-primary/40"
      >
        <div className="pl-4 pr-2 text-primary">
          <FaRegLightbulb />
        </div>

        <input
          type="text"
          value={promptText}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Build a fintech mobile app backlog..."
          className="flex-1 bg-transparent py-3 px-2 outline-none text-foreground placeholder:text-muted-foreground text-lg"
          disabled={isGenerating || !projectId}
        />

        <button
          type="submit"
          disabled={isGenerating || !promptText.trim() || !projectId}
          className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-colors duration-200"
        >
          {isGenerating ? 'Generating…' : 'Generate'}
          {!isGenerating && <FaArrowRight />}
        </button>
      </form>
    </div>
  );
}
