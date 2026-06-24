import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export type WelcomeStepProps = {
  readonly onContinue: () => void;
  readonly username?: string;
};

function WelcomeStep({ onContinue, username }: WelcomeStepProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <Sparkles
        aria-hidden="true"
        className="size-16 text-primary"
        strokeWidth={1.5}
      />

      <h1 className="font-sans text-4xl font-normal tracking-wide text-foreground sm:text-5xl">
        {username ? (
          <>
            Welcome{" "}
            <span className="text-primary font-heading italic">{username}</span>{" "}
            to{" "}
            <span className="text-primary font-heading italic">Sprintify</span>
          </>
        ) : (
          <>
            Welcome to{" "}
            <span className="text-primary font-heading italic">Sprintify</span>
          </>
        )}
      </h1>

      <p className="max-w-xl text-pretty font-sans text-xl leading-relaxed text-foreground/70">
        Precision through softness. Start orchestrating your team&apos;s greatest
        achievements today.
      </p>

      <Button
        type="button"
        size="lg"
        onClick={onContinue}
        className="mt-2 rounded-full font-sans font-medium"
      >
        Let&apos;s begin
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </Button>
    </div>
  );
}

export { WelcomeStep };
