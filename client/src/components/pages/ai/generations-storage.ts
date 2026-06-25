import type { GeneratedTask } from '@/types/task';

export const GENERATIONS_STORAGE_KEY = 'sprintify-ai-generations';
export const STALE_GENERATION_MS = 2 * 60 * 60 * 1000;

export type GenerationStatus = 'COMPLETED' | 'IN_PROGRESS' | 'EXPIRED';

export interface StoredGeneration {
  id: string;
  title: string;
  meta: string;
  status: GenerationStatus;
  projectId: string;
  timestamp: number;
  prompt?: string;
  tasks?: GeneratedTask[];
}

function readAll(): StoredGeneration[] {
  try {
    return JSON.parse(localStorage.getItem(GENERATIONS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAll(entries: StoredGeneration[]): void {
  try {
    localStorage.setItem(GENERATIONS_STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function taskMeta(count: number): string {
  return `${count} task${count === 1 ? '' : 's'} pending review`;
}

export function isGenerationRestorable(entry: StoredGeneration): boolean {
  if (entry.status === 'COMPLETED') return false;
  if (entry.status === 'EXPIRED') return false;
  if (!entry.tasks?.length) return false;
  if (Date.now() - entry.timestamp > STALE_GENERATION_MS) return false;
  return true;
}

export function isGenerationStale(entry: StoredGeneration): boolean {
  if (entry.status !== 'IN_PROGRESS') return false;
  if (entry.tasks?.length) {
    return Date.now() - entry.timestamp > STALE_GENERATION_MS;
  }
  return true;
}

function reconcileEntry(entry: StoredGeneration): StoredGeneration {
  if (entry.status !== 'IN_PROGRESS') return entry;
  if (isGenerationStale(entry)) {
    return { ...entry, status: 'EXPIRED', meta: 'Generation expired' };
  }
  return entry;
}

export function loadGenerations(projectId: string): StoredGeneration[] {
  const stored = readAll();
  let changed = false;
  const updated = stored.map((entry) => {
    if (entry.projectId !== projectId) return entry;
    const reconciled = reconcileEntry(entry);
    if (reconciled !== entry) changed = true;
    return reconciled;
  });
  if (changed) writeAll(updated);
  return updated.filter((g) => g.projectId === projectId);
}

export function getGeneration(
  projectId: string,
  generationId: string,
): StoredGeneration | null {
  const entry = readAll().find(
    (g) => g.id === generationId && g.projectId === projectId,
  );
  if (!entry) return null;
  const reconciled = reconcileEntry(entry);
  if (reconciled.status !== entry.status) {
    writeAll(
      readAll().map((g) =>
        g.id === generationId && g.projectId === projectId ? reconciled : g,
      ),
    );
  }
  return reconciled;
}

export function saveGeneration(
  projectId: string,
  prompt: string,
  tasks: GeneratedTask[],
): StoredGeneration {
  const title = prompt.length > 50 ? `${prompt.slice(0, 50)}…` : prompt;
  const entry: StoredGeneration = {
    id: crypto.randomUUID(),
    title,
    meta: tasks.length > 0 ? taskMeta(tasks.length) : 'No tasks generated',
    status: tasks.length > 0 ? 'IN_PROGRESS' : 'COMPLETED',
    projectId,
    timestamp: Date.now(),
    prompt,
    tasks,
  };

  writeAll([entry, ...readAll()]);
  return entry;
}

export function updateGenerationTasks(
  projectId: string,
  generationId: string,
  tasks: GeneratedTask[],
): void {
  writeAll(
    readAll().map((entry) =>
      entry.id === generationId && entry.projectId === projectId
        ? {
            ...entry,
            tasks,
            meta: tasks.length > 0 ? taskMeta(tasks.length) : 'All tasks approved',
            status: (tasks.length > 0 ? 'IN_PROGRESS' : 'COMPLETED') as GenerationStatus,
          }
        : entry,
    ),
  );
}

export function markGenerationCompleted(projectId: string, generationId: string): void {
  writeAll(
    readAll().map((entry) =>
      entry.id === generationId && entry.projectId === projectId
        ? { ...entry, status: 'COMPLETED' as const, meta: 'All tasks approved', tasks: [] }
        : entry,
    ),
  );
}

export function dismissGeneration(projectId: string, generationId: string): void {
  writeAll(
    readAll().filter(
      (entry) => !(entry.id === generationId && entry.projectId === projectId),
    ),
  );
}
