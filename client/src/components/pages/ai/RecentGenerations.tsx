import { useState, useEffect } from 'react';
import { FaLayerGroup } from 'react-icons/fa6';
import { RotateCcw, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import {
  isGenerationRestorable,
  loadGenerations,
  type StoredGeneration,
} from '@/components/pages/ai/generations-storage';

interface RecentGenerationsProps {
  projectId: string | null;
  refreshKey: number;
  activeGenerationId?: string | null;
  onSelect?: (generation: StoredGeneration) => void;
  onDismiss?: (generationId: string) => void;
  onRetry?: (generation: StoredGeneration) => void;
}

export default function RecentGenerations({
  projectId,
  refreshKey,
  activeGenerationId,
  onSelect,
  onDismiss,
  onRetry,
}: RecentGenerationsProps) {
  const [generations, setGenerations] = useState<StoredGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setGenerations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setGenerations(loadGenerations(projectId));
    setIsLoading(false);
  }, [projectId, refreshKey]);

  if (isLoading) {
    return (
      <div className="w-full mt-12 animate-pulse flex flex-col gap-4">
        <div className="h-6 w-48 bg-muted rounded mb-2" />
        {[1, 2].map((n) => (
          <div key={n} className="h-20 w-full bg-muted/60 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mt-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Recent Generations</h2>

      {generations.length === 0 ? (
        <EmptyState variant="card">
          <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mb-4">
            <FaLayerGroup />
          </div>
          <p className="text-muted-foreground text-sm">No generations yet for this project.</p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            Generate tasks above to see them here.
          </p>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {generations.map((item) => {
            const isActive = activeGenerationId === item.id;
            const isClickable =
              item.status === 'IN_PROGRESS' && isGenerationRestorable(item);
            const isExpired = item.status === 'EXPIRED';

            return (
              <div
                key={item.id}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={isClickable ? () => onSelect?.(item) : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect?.(item);
                        }
                      }
                    : undefined
                }
                className={cn(
                  'flex items-center justify-between p-4 bg-card rounded-2xl border shadow-sm transition-shadow duration-200',
                  isActive
                    ? 'border-primary/40 ring-2 ring-primary/20'
                    : 'border-border',
                  isClickable && 'cursor-pointer hover:shadow-md hover:border-primary/30',
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                    <FaLayerGroup />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4 className="text-foreground font-bold text-[15px] truncate">
                      {item.title}
                    </h4>
                    <p className="text-muted-foreground text-xs mt-0.5">{item.meta}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {item.status === 'COMPLETED' ? (
                    <span className="bg-success/10 text-success text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                      Completed
                    </span>
                  ) : isExpired ? (
                    <>
                      <span className="bg-muted text-muted-foreground text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        Expired
                      </span>
                      {onRetry ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(item);
                          }}
                        >
                          <RotateCcw className="size-3.5" aria-hidden="true" />
                          Retry
                        </Button>
                      ) : null}
                      {onDismiss ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          aria-label="Dismiss generation"
                          onClick={() => onDismiss(item.id)}
                        >
                          <X className="size-4" aria-hidden="true" />
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <span className="bg-primary/10 text-primary text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
