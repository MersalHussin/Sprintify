import type { ReactNode } from "react";
import { Accordion } from "radix-ui";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FAQ_ITEMS: readonly {
  id: string;
  question: string;
  answer: ReactNode;
}[] = [
  {
    id: "what-is-sprintify",
    question: "What exactly is Sprintify?",
    answer: "It's a smarter way to manage your team's work. You drop in a message or a rough idea, and Sprintify turns it into an organized set of tasks — ready to assign and track. Less setup, more shipping.",
  },
  {
    id: "install",
    question: "Do I need to install anything to get started?",
    answer: "No. It runs entirely in your browser. Sign up, invite your team, and you're in.",
  },
  {
    id: "ai",
    question: "How does the AI part actually work?",
    answer: "You paste in anything — a Slack message, meeting notes, a one-liner idea — and Sprintify breaks it down into tasks, subtasks, and checklists automatically. It does the structuring so you don't have to.",
  },
  {
    id: "realtime",
    question: "If someone moves a task, does everyone see it immediately?",
    answer: "Yes, instantly. No refreshing, no \"wait let me send you the updated board.\" Everyone's always looking at the same thing.",
  },
  {
    id: "startup-fit",
    question: "We're a small startup, is this built for us or for big companies?",
    answer: "Both, honestly. Small teams love how fast it is to get going. Larger teams love the structure and controls. You don't outgrow it.",
  },
] as const;

function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center">
          <Badge variant="section">FAQ</Badge>

          <h2
            id="faq-heading"
            className="mt-6 text-balance text-4xl font-medium leading-tight text-foreground sm:text-5xl"
          >
            Answers to your{" "}
            <span className="italic text-primary">Questions</span>
          </h2>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            The things people ask before they fall in love with Sprintify.
          </p>
        </div>

        <Accordion.Root
          type="single"
          collapsible
          defaultValue={FAQ_ITEMS[0].id}
          className="mt-14 w-full border-t border-border sm:mt-20"
        >
          {FAQ_ITEMS.map((item) => (
            <Accordion.Item
              key={item.id}
              value={item.id}
              className="group/item border-b border-border"
            >
              <Accordion.Header className="flex">
                <Accordion.Trigger
                  className={cn(
                    "group/trigger flex flex-1 items-center justify-between gap-6 py-6 text-left text-base font-medium text-foreground transition-colors duration-150 sm:py-7 sm:text-lg",
                    "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  <span className="flex-1 text-pretty font-sans group-data-[state=open]/item:text-primary">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="relative grid size-4 shrink-0 place-items-center text-muted-foreground transition-colors duration-150 group-data-[state=open]/item:text-primary"
                  >
                    <Plus className="size-4 scale-100 opacity-100 blur-[0px] transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[state=open]/item:scale-[0.25] group-data-[state=open]/item:opacity-0 group-data-[state=open]/item:blur-[4px]" />
                    <X className="absolute inset-0 size-4 scale-[0.25] opacity-0 blur-[4px] transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[state=open]/item:scale-100 group-data-[state=open]/item:opacity-100 group-data-[state=open]/item:blur-[0px]" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content
                className={cn(
                  "overflow-hidden text-base text-muted-foreground",
                  "duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
                )}
              >
                <div className="text-pretty pb-6 pr-12 leading-relaxed sm:pb-7">
                  {item.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}

export { Faq };
