import type { ReactNode } from "react";

import { Check, Minus, Rocket, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Features — the 2x2 grid section that highlights Sprintify's differentiators.
 *
 * Pure presentational component: no client state, no effects. Each card uses
 * a horizontal layout (image on the left, content on the right) with a thin
 * divider separating the description from a small visual element underneath.
 */

type FeatureCardProps = {
  readonly title: string;
  readonly description: string;
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly children?: ReactNode;
};

function FeatureCard({
  title,
  description,
  imageSrc,
  imageAlt,
  children,
}: FeatureCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_18px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_50px_rgba(0,0,0,0.35)] sm:flex-row">
      <div className="flex w-full items-center justify-center p-4 sm:w-2/5">
        <img
          src={imageSrc}
          alt={imageAlt}
          width={520}
          height={400}
          loading="lazy"
          decoding="async"
          className="max-h-40 w-full rounded-2xl object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-balance font-sans text-lg font-semibold text-foreground sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children ? (
          <>
            <Separator className="my-4" />
            {children}
          </>
        ) : null}
      </div>
    </article>
  );
}

const AI_CHECKLIST: ReadonlyArray<{ readonly id: string; readonly label: string }> = [
  { id: "instant", label: "Instant task generation" },
  { id: "subtasks", label: "AI-generated subtasks & checklists" },
];

const TEAM_TAGS: ReadonlyArray<{
  readonly id: string;
  readonly label: string;
  readonly icon: "check" | "rocket" | "users";
}> = [
  { id: "enterprise", label: "Enterprises stay in control", icon: "check" },
  { id: "startups", label: "Startups move fast", icon: "rocket" },
  { id: "teams", label: "Teams scale smarter", icon: "users" },
];

function TeamTagIcon({ icon }: { readonly icon: "check" | "rocket" | "users" }) {
  switch (icon) {
    case "check":
      return <Check className="size-4" aria-hidden="true" />;
    case "rocket":
      return <Rocket className="size-4" aria-hidden="true" />;
    case "users":
      return <Users className="size-4" aria-hidden="true" />;
  }
}

function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="relative bg-background"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Badge variant="section">Features</Badge>
          <h2
            id="features-title"
            className="mt-4 text-balance text-4xl font-medium sm:text-5xl"
          >
            What makes us{" "}
            <span className="italic text-primary">Special</span> ?
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Powerful features designed to help modern teams plan, collaborate,
            and ship faster.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2">
          <FeatureCard
            title="AI works where you work"
            description="Convert notes and messages into tasks instantly. AI-generated subtasks and checklists to keep work moving."
            imageSrc="/assets/images/feature-ai-works.webp"
            imageAlt="AI turning notes into tasks"
          >
            <ul className="flex flex-col gap-2.5">
              {AI_CHECKLIST.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2.5 text-sm text-foreground"
                >
                  <span
                    className="flex size-4 items-center justify-center text-primary"
                    aria-hidden="true"
                  >
                    <Minus className="size-4" />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            title="Built for every team"
            description="Ship faster with less overhead. From startups to enterprises, Sprintify adapts to the way your team works."
            imageSrc="/assets/images/feature-built-for-teams.webp"
            imageAlt="Teams of different sizes collaborating"
          >
            <ul className="flex flex-wrap gap-2">
              {TEAM_TAGS.map((tag) => (
                <li key={tag.id}>
                  <Badge variant="pill" className="inline-flex items-center gap-1.5">
                    <TeamTagIcon icon={tag.icon} />
                    {tag.label}
                  </Badge>
                </li>
              ))}
            </ul>
          </FeatureCard>

          <FeatureCard
            title="Focus on what matters"
            description="Less noise, more clarity. View only the tasks assigned to you, so your team stays aligned on what matters and ships faster."
            imageSrc="/assets/images/feature-focus.webp"
            imageAlt="Focused personal task list"
          >
            <img
              src="/assets/images/focus-on-what-matters.png"
              alt="Task filter toggle showing All tasks and My tasks options"
              width={400}
              height={120}
              loading="lazy"
              decoding="async"
              className="w-full object-contain"
            />
          </FeatureCard>

          <FeatureCard
            title="Real-time collaboration"
            description="Work together seamlessly with real-time task updates, instant changes across boards, and shared team activity all in one place."
            imageSrc="/assets/images/feature-realtime.webp"
            imageAlt="Real-time team activity on a shared board"
          >
            <img
              src="/assets/images/real-time-collaboration.png"
              alt="Kanban board showing In Progress, Done, and To do columns"
              width={400}
              height={120}
              loading="lazy"
              decoding="async"
              className="w-full object-contain"
            />
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

export { Features };
