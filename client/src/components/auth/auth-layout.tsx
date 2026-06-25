import type { ReactNode } from "react";
import { Link } from "react-router";

export type AuthLayoutProps = {
  readonly title: string;
  readonly prompt: string;
  readonly promptActionLabel: string;
  readonly promptActionTo: string;
  readonly promptActionState?: unknown;
  readonly children: ReactNode;
};

function AuthLayout({
  title,
  prompt,
  promptActionLabel,
  promptActionTo,
  promptActionState,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Link
          to="/"
          aria-label="Sprintify home"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <img
            src="/assets/images/logo.webp"
            alt="Sprintify"
            width={160}
            height={40}
            decoding="async"
            className="h-10 w-auto"
          />
        </Link>

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-balance font-sans text-2xl font-medium leading-tight text-foreground">
            {title}
          </h1>
          <p className="text-pretty font-sans text-lg text-foreground/70">
            <span className="font-normal">{prompt} </span>
            <Link
              to={promptActionTo}
              state={promptActionState}
              className="underline underline-offset-2 hover:text-foreground"
            >
              {promptActionLabel}
            </Link>
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}

export { AuthLayout };
