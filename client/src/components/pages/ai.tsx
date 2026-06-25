import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router';
import { apiFetch } from '@/lib/api';
import type { GeneratedTask } from '@/types/task';
import PromptInput from '@/components/pages/ai/PromptInput';
import TemplateCards from '@/components/pages/ai/TemplateCards';
import RecentGenerations from '@/components/pages/ai/RecentGenerations';
import GeneratedTasksPanel from '@/components/pages/ai/GeneratedTasksPanel';
import type { GeneratedTaskItem } from '@/components/pages/ai/GeneratedTasksPanel';
import { PageMessage } from '@/components/shared/page-message';
import {
  dismissGeneration,
  getGeneration,
  isGenerationRestorable,
  markGenerationCompleted,
  saveGeneration,
  updateGenerationTasks,
  type StoredGeneration,
} from '@/components/pages/ai/generations-storage';

interface Project {
  _id: string;
  name: string;
}

export default function AIPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noTeams, setNoTeams] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTaskItem[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [approvingIndices, setApprovingIndices] = useState<Set<number>>(new Set());
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);
  const [isManager, setIsManager] = useState<boolean | null>(null);

  useEffect(() => {
    if (!selectedProjectId) {
      setIsManager(null);
      return;
    }

    let cancelled = false;

    async function loadProjectRole() {
      try {
        const projectRes = await apiFetch(`/projects/${selectedProjectId}`);
        if (!cancelled) {
          setIsManager(projectRes?.callerRole === 'manager');
        }
      } catch (error) {
        console.error('Error loading project role:', error);
        if (!cancelled) setIsManager(false);
      }
    }

    loadProjectRole();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const teamsRes = await apiFetch('/teams');
        const teams = teamsRes?.teams || [];

        if (teams.length === 0) {
          setNoTeams(true);
          return;
        }

        const teamId = teams[0]._id;
        const projectsRes = await apiFetch(`/teams/${teamId}/projects`);
        const loadedProjects: Project[] =
          projectsRes?.projects || projectsRes?.items || [];
        setProjects(loadedProjects);

        if (loadedProjects.length > 0) {
          setSelectedProjectId(loadedProjects[0]._id);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!selectedProjectId) return;

    setIsThinking(true);
    setGenerationError(null);
    setGeneratedTasks([]);
    setActiveGenerationId(null);

    try {
      const result = await apiFetch(`/ai/${selectedProjectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ message: prompt }),
      });

      const tasks: GeneratedTask[] = result?.tasks ?? [];
      const entry = saveGeneration(selectedProjectId, prompt, tasks);
      setGeneratedTasks(
        tasks.map((task, sourceIndex) => ({ ...task, sourceIndex })),
      );
      setActiveGenerationId(entry.id);
      setPromptText('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate tasks';
      setGenerationError(message);
      console.error('Error creating generation:', err);
    } finally {
      setIsThinking(false);
    }
  }, [selectedProjectId]);

  const approveTasks = useCallback(async (indices: number[]) => {
    if (!selectedProjectId || indices.length === 0) return;

    setApprovingIndices((prev) => new Set([...prev, ...indices]));
    setGenerationError(null);

    try {
      await apiFetch(`/ai/${selectedProjectId}/generated-tasks/approve`, {
        method: 'POST',
        body: JSON.stringify({ indices }),
      });

      setGeneratedTasks((prev) => {
        const next = prev
          .filter((task) => !indices.includes(task.sourceIndex))
          .map((task, index) => ({ ...task, sourceIndex: index }));
        if (activeGenerationId) {
          const remainingTasks = next.map(({ sourceIndex: _, ...task }) => task);
          if (next.length === 0) {
            markGenerationCompleted(selectedProjectId, activeGenerationId);
            setActiveGenerationId(null);
          } else {
            updateGenerationTasks(selectedProjectId, activeGenerationId, remainingTasks);
          }
          setRefreshKey((k) => k + 1);
        }
        return next;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to approve tasks';
      setGenerationError(message);
      console.error('Error approving tasks:', err);
    } finally {
      setApprovingIndices((prev) => {
        const next = new Set(prev);
        indices.forEach((index) => next.delete(index));
        return next;
      });
    }
  }, [activeGenerationId, selectedProjectId]);

  const handleApproveOne = useCallback(
    (sourceIndex: number) => approveTasks([sourceIndex]),
    [approveTasks],
  );

  const handleApproveAll = useCallback(() => {
    approveTasks(generatedTasks.map((task) => task.sourceIndex));
  }, [approveTasks, generatedTasks]);

  const handleSelectGeneration = useCallback(
    (generation: StoredGeneration) => {
      if (!selectedProjectId || generation.status === 'COMPLETED') return;

      const entry = getGeneration(selectedProjectId, generation.id) ?? generation;

      if (!isGenerationRestorable(entry)) {
        setGeneratedTasks([]);
        setActiveGenerationId(entry.id);
        setIsThinking(false);
        setGenerationError(
          'This generation expired or has no saved tasks. Retry with the prompt below.',
        );
        if (entry.prompt) setPromptText(entry.prompt);
        return;
      }

      setGenerationError(null);
      setIsThinking(false);
      setGeneratedTasks(
        entry.tasks!.map((task, sourceIndex) => ({ ...task, sourceIndex })),
      );
      setActiveGenerationId(entry.id);
    },
    [selectedProjectId],
  );

  const handleDismissGeneration = useCallback(
    (generationId: string) => {
      if (!selectedProjectId) return;
      dismissGeneration(selectedProjectId, generationId);
      if (activeGenerationId === generationId) {
        setActiveGenerationId(null);
        setGeneratedTasks([]);
        setGenerationError(null);
      }
      setRefreshKey((k) => k + 1);
    },
    [activeGenerationId, selectedProjectId],
  );

  const handleRetryGeneration = useCallback(
    (generation: StoredGeneration) => {
      const prompt = generation.prompt?.trim();
      if (!prompt || !selectedProjectId) return;

      handleDismissGeneration(generation.id);
      setPromptText(prompt);
      handleGenerate(prompt);
    },
    [handleDismissGeneration, handleGenerate, selectedProjectId],
  );

  if (loading || (selectedProjectId && isManager === null)) {
    return (
      <div className="flex-1 flex flex-col items-center py-16 px-8">
        <div className="w-full max-w-4xl animate-pulse flex flex-col gap-8">
          <div className="h-12 bg-muted rounded-2xl w-full max-w-3xl mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-muted rounded-2xl h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (noTeams) {
    return (
      <PageMessage
        title="No workspace found"
        description="Create a workspace first to use AI task generation."
        actionLabel="Go to Workspaces"
        actionTo="/workspaces"
      />
    );
  }

  if (isManager === false) {
    return <Navigate to="/my-tasks" replace />;
  }

  return (
    <div className="flex-1 flex flex-col items-center py-16 px-8">
      <div className="w-full max-w-4xl flex flex-col gap-12">
        {projects.length > 1 && (
          <div className="flex justify-center">
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Project</span>
              <select
                value={selectedProjectId ?? ''}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setGeneratedTasks([]);
                  setGenerationError(null);
                }}
                className="bg-card border border-border rounded-xl px-4 py-2 text-foreground text-sm shadow-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {projects.length === 0 ? (
          <PageMessage
            className="py-12"
            title="No projects yet"
            description="Create a board in your workspace before generating tasks with AI."
            actionLabel="Go to Workspaces"
            actionTo="/workspaces"
          />
        ) : (
          <>
            <PromptInput
              projectId={selectedProjectId}
              promptText={promptText}
              isGenerating={isThinking}
              onPromptChange={setPromptText}
              onGenerate={handleGenerate}
            />
            <GeneratedTasksPanel
              tasks={generatedTasks}
              isThinking={isThinking}
              error={generationError}
              approvingIndices={approvingIndices}
              onApprove={handleApproveOne}
              onApproveAll={handleApproveAll}
            />
            <TemplateCards onSelectTemplate={setPromptText} />
            <RecentGenerations
              projectId={selectedProjectId}
              refreshKey={refreshKey}
              activeGenerationId={activeGenerationId}
              onSelect={handleSelectGeneration}
              onDismiss={handleDismissGeneration}
              onRetry={handleRetryGeneration}
            />
          </>
        )}
      </div>
    </div>
  );
}
