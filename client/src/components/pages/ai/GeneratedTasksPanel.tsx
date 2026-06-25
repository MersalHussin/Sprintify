import { useState } from 'react';
import { Check, ChevronRight, ListChecks, Loader2 } from 'lucide-react';

import { PriorityBadge } from '@/components/kanban/priority-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GeneratedTask } from '@/types/task';

export type GeneratedTaskItem = GeneratedTask & { sourceIndex: number };

interface GeneratedTasksPanelProps {
  tasks: GeneratedTaskItem[];
  isThinking: boolean;
  error: string | null;
  approvingIndices: Set<number>;
  onApprove: (sourceIndex: number) => void;
  onApproveAll: () => void;
}

export default function GeneratedTasksPanel({
  tasks,
  isThinking,
  error,
  approvingIndices,
  onApprove,
  onApproveAll,
}: GeneratedTasksPanelProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleExpanded = (sourceIndex: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sourceIndex)) next.delete(sourceIndex);
      else next.add(sourceIndex);
      return next;
    });
  };

  if (!isThinking && tasks.length === 0 && !error) return null;

  return (
    <div className="w-full flex flex-col gap-4">
      {isThinking && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-muted-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm">Thinking… generating tasks from your prompt.</p>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!isThinking && tasks.length > 0 && (
        <>
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-foreground">
              Generated tasks ({tasks.length})
            </h2>
            <Button
              type="button"
              size="sm"
              onClick={onApproveAll}
              disabled={approvingIndices.size > 0}
            >
              Approve all
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.map((task) => {
              const isApproving = approvingIndices.has(task.sourceIndex);
              const subtaskCount = task.subtasks?.length ?? 0;
              const isExpanded = expanded.has(task.sourceIndex);
              const hasSubtasks = subtaskCount > 0;

              return (
                <article
                  key={`${task.sourceIndex}-${task.name}`}
                  className={cn(
                    'rounded-2xl border border-border bg-card p-5 shadow-sm',
                    hasSubtasks && 'cursor-pointer',
                  )}
                  onClick={hasSubtasks ? () => toggleExpanded(task.sourceIndex) : undefined}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {hasSubtasks ? (
                          <ChevronRight
                            className={cn(
                              'size-4 shrink-0 text-muted-foreground transition-transform',
                              isExpanded && 'rotate-90',
                            )}
                            aria-hidden="true"
                          />
                        ) : null}
                        <h3 className="font-semibold text-card-foreground">{task.name}</h3>
                        <PriorityBadge priority={task.priority} status={task.status} />
                        {task.category ? (
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                            {task.category}
                          </span>
                        ) : null}
                      </div>

                      {task.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}

                      {hasSubtasks ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ListChecks className="size-3.5" aria-hidden="true" />
                          <span>
                            {subtaskCount} subtask{subtaskCount === 1 ? '' : 's'}
                          </span>
                        </div>
                      ) : null}

                      {isExpanded && hasSubtasks ? (
                        <ul className="mt-1 space-y-1 border-t border-border pt-3">
                          {task.subtasks!.map((subtask, i) => (
                            <li
                              key={`${task.sourceIndex}-sub-${i}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                              {subtask.name}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      disabled={isApproving}
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(task.sourceIndex);
                      }}
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                          Approving…
                        </>
                      ) : (
                        <>
                          <Check className="size-3.5" aria-hidden="true" />
                          Approve task
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
