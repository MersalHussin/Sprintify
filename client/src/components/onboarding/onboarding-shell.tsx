import type { ReactNode } from "react";

import { Stepper } from "@/components/ui/stepper";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "./steps";

export type StepDirection = "forward" | "backward";

export type OnboardingShellProps = {
  readonly currentStep: number;
  readonly direction?: StepDirection;
  readonly onStepClick?: (step: number) => void;
  readonly children: ReactNode;
  /** Vertically center the content (used by the welcome step). */
  readonly center?: boolean;
};

function OnboardingShell({
  currentStep,
  direction = "forward",
  onStepClick,
  children,
  center = false,
}: OnboardingShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-186">
        <Stepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          onStepClick={onStepClick}
        />
      </div>

      <div
        className={cn(
          "mx-auto flex w-full max-w-186 flex-1 transition-[padding] duration-300 ease-out",
          center
            ? "items-center justify-center"
            : "items-start pt-10 sm:pt-16",
        )}
      >
        <div
          key={currentStep}
          className={cn(
            "w-full motion-reduce:animate-none motion-reduce:opacity-100 animate-in fade-in duration-300 ease-out fill-mode-both",
            direction === "backward"
              ? "slide-in-from-left-3"
              : "slide-in-from-right-3",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { OnboardingShell };
