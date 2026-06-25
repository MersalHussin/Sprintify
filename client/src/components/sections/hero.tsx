import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { handleAnchorClick } from "./navbar/nav-data";

type HeroAvatar = {
  readonly initial: string;
  readonly backgroundClass: string;
};

const HERO_AVATARS: ReadonlyArray<HeroAvatar> = [
  { initial: "YA", backgroundClass: "bg-avatar-1" },
  { initial: "MM", backgroundClass: "bg-avatar-2" },
  { initial: "MH", backgroundClass: "bg-avatar-3" },
  { initial: "VP", backgroundClass: "bg-avatar-4" },
];

const HERO_PREVIEW_IMAGE = "/assets/images/application-preview-kanban-board.webp";

function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      className="relative overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1
            id="hero-title"
            className="text-balance text-5xl font-medium leading-tight sm:text-6xl lg:text-7xl"
          >
            Manage projects at the{" "}
            <span className="font-heading italic">Speed of Thought</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            The AI-powered workspace where teams plan, collaborate, and ship
            without the chaos.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/register">
                Start Shipping
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={(event) => handleAnchorClick(event, "#features")}
              className="rounded-full"
            >
              Explore Features
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <ul aria-hidden="true" className="flex -space-x-2">
              {HERO_AVATARS.map((avatar) => {
                return (
                  <li
                    key={avatar.initial}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-xs font-bold text-primary-foreground ring-2 ring-bg-base",
                      avatar.backgroundClass,
                    )}
                  >
                    {avatar.initial}
                  </li>
                );
              })}
            </ul>
            <p className="text-pretty text-sm text-muted-foreground sm:text-base">
              Joined by{" "}
              <span className="font-semibold tabular-nums text-foreground">2,000+</span>{" "}
              teams
            </p>
          </div>
        </div>

        <figure className="relative isolate mt-24 lg:mt-32">
          <div
            className="
              relative
              before:rounded-2xl
              before:pointer-events-none
              before:absolute
              before:inset-x-0
              before:-top-12
              before:-bottom-12
              before:-z-10
              before:bg-[url('/assets/images/application-preview-background.webp')]
              before:bg-cover
              before:bg-center
              before:bg-no-repeat
              sm:before:-top-20
              sm:before:-bottom-20
            "
          >
            <img
              src={HERO_PREVIEW_IMAGE}
              alt="Sprintify Kanban Board Preview"
              width={1200}
              height={750}
              loading="eager"
              decoding="async"
              className="mx-auto w-full max-w-5xl rounded-2xl border border-border outline outline-1 -outline-offset-1 outline-border"
            />
          </div>
        </figure>
      </div>
    </section>
  );
}

export { Hero };
