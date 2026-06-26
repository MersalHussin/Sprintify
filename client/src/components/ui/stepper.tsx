import React from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StepItem {
  title: string;
  subtitle?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <nav aria-label="Onboarding progress" className={cn("flex w-full font-sans", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = isCompleted && onStepClick !== undefined;
        const isLast = index === steps.length - 1;

        const stepBody = (
          <>
            <div
              className={cn(
                "z-10 flex size-12 items-center justify-center rounded-full text-lg font-semibold transition-[colors,transform] duration-200",
                isActive || isCompleted
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground/40",
                isClickable && "group-hover:scale-[1.03]",
              )}
            >
              {isCompleted ? (
                <Check className="size-6 text-background" strokeWidth={2.5} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-0.5 pr-4">
              <span
                className={cn(
                  "text-sm transition-colors duration-200",
                  isActive || isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/30",
                )}
              >
                {step.subtitle || `Step ${index + 1}`}
              </span>
              <span
                className={cn(
                  "text-lg transition-colors duration-200",
                  isActive
                    ? "font-medium text-primary"
                    : isCompleted
                      ? "font-light text-muted-foreground"
                      : "font-light text-muted-foreground/30",
                  isClickable && "group-hover:text-foreground",
                )}
              >
                {step.title}
              </span>
            </div>
          </>
        );

        return (
          <div
            key={step.title}
            className={cn(
              "relative flex flex-col items-start",
              isLast ? "" : "flex-1",
            )}
          >
            {!isLast && (
              <div
                className={cn(
                  "absolute left-12 right-0 transition-[background-color,height,top] duration-300 ease-out",
                  isCompleted
                    ? "top-6 h-1 bg-foreground"
                    : "top-6 h-0.5 bg-border",
                )}
              />
            )}

            {isClickable ? (
              <Button
                type="button"
                variant="ghost"
                aria-current={isActive ? "step" : undefined}
                aria-label={`Go back to ${step.title}`}
                onClick={() => onStepClick(index)}
                className="group h-auto flex-col items-start rounded-xl p-0 text-left hover:opacity-90"
              >
                {stepBody}
              </Button>
            ) : (
              <div
                aria-current={isActive ? "step" : undefined}
                className="flex flex-col items-start"
              >
                {stepBody}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
