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

function FeatureCard({ children }: { readonly children: ReactNode }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-border bg-bg-surface sm:flex-row">
      {children}
    </article>
  );
}

function FeatureCardMedia({
  src,
  alt,
}: {
  readonly src: string;
  readonly alt: string;
}) {
  return (
    <div className="flex w-full items-center justify-center p-4 sm:w-2/5">
      <img
        src={src}
        alt={alt}
        width={520}
        height={400}
        loading="lazy"
        decoding="async"
        className="max-h-40 w-full rounded-2xl object-contain"
      />
    </div>
  );
}

function FeatureCardBody({ children }: { readonly children: ReactNode }) {
  return <div className="flex flex-1 flex-col p-6">{children}</div>;
}

function FeatureCardTitle({ children }: { readonly children: ReactNode }) {
  return (
    <h3 className="text-balance font-sans text-lg font-semibold text-foreground sm:text-xl">
      {children}
    </h3>
  );
}

function FeatureCardDescription({ children }: { readonly children: ReactNode }) {
  return (
    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function FeatureCardExtra({ children }: { readonly children: ReactNode }) {
  return (
    <>
      <Separator className="my-4" />
      {children}
    </>
  );
}

FeatureCard.Media = FeatureCardMedia;
FeatureCard.Body = FeatureCardBody;
FeatureCard.Title = FeatureCardTitle;
FeatureCard.Description = FeatureCardDescription;
FeatureCard.Extra = FeatureCardExtra;

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
          <FeatureCard>
            <FeatureCard.Media
              src="/assets/images/feature-ai-works.webp"
              alt="AI turning notes into tasks"
            />
            <FeatureCard.Body>
              <FeatureCard.Title>AI works where you work</FeatureCard.Title>
              <FeatureCard.Description>
                Convert notes and messages into tasks instantly. AI-generated subtasks and checklists to keep work moving.
              </FeatureCard.Description>
              <FeatureCard.Extra>
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
              </FeatureCard.Extra>
            </FeatureCard.Body>
          </FeatureCard>

          <FeatureCard>
            <FeatureCard.Media
              src="/assets/images/feature-built-for-teams.webp"
              alt="Teams of different sizes collaborating"
            />
            <FeatureCard.Body>
              <FeatureCard.Title>Built for every team</FeatureCard.Title>
              <FeatureCard.Description>
                Ship faster with less overhead. From startups to enterprises, Sprintify adapts to the way your team works.
              </FeatureCard.Description>
              <FeatureCard.Extra>
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
              </FeatureCard.Extra>
            </FeatureCard.Body>
          </FeatureCard>

          <FeatureCard>
            <FeatureCard.Media
              src="/assets/images/feature-focus.webp"
              alt="Focused personal task list"
            />
            <FeatureCard.Body>
              <FeatureCard.Title>Focus on what matters</FeatureCard.Title>
              <FeatureCard.Description>
                Less noise, more clarity. View only the tasks assigned to you, so your team stays aligned on what matters and ships faster.
              </FeatureCard.Description>
              <FeatureCard.Extra>
                <img
                  src="/assets/images/focus-on-what-matters.png"
                  alt="Task filter toggle showing All tasks and My tasks options"
                  width={400}
                  height={120}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-contain"
                />
              </FeatureCard.Extra>
            </FeatureCard.Body>
          </FeatureCard>

          <FeatureCard>
            <FeatureCard.Media
              src="/assets/images/feature-realtime.webp"
              alt="Real-time team activity on a shared board"
            />
            <FeatureCard.Body>
              <FeatureCard.Title>Real-time collaboration</FeatureCard.Title>
              <FeatureCard.Description>
                Work together seamlessly with real-time task updates, instant changes across boards, and shared team activity all in one place.
              </FeatureCard.Description>
              <FeatureCard.Extra>
                <img
                  src="/assets/images/real-time-collaboration.png"
                  alt="Kanban board showing In Progress, Done, and To do columns"
                  width={400}
                  height={120}
                  loading="lazy"
                  decoding="async"
                  className="w-full object-contain"
                />
              </FeatureCard.Extra>
            </FeatureCard.Body>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

export { Features };
