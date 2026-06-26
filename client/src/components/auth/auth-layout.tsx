import type { ReactNode } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <AuthLayout.Logo />
        {children}
      </div>
    </div>
  );
}

function AuthLayoutLogo() {
  return (
    <Button variant="ghost" asChild className="h-auto rounded-sm px-0">
      <Link to="/" aria-label="Sprintify home">
        <img
          src="/assets/images/logo.webp"
          alt="Sprintify"
          width={160}
          height={40}
          decoding="async"
          className="h-10 w-auto"
        />
      </Link>
    </Button>
  );
}

function AuthLayoutTitle({ children }: { readonly children: ReactNode }) {
  return (
    <h1 className="text-balance text-center font-sans text-2xl font-medium leading-tight text-foreground">
      {children}
    </h1>
  );
}

function AuthLayoutPrompt({ children }: { readonly children: ReactNode }) {
  return (
    <p className="text-pretty text-center font-sans text-lg text-foreground/70">
      {children}
    </p>
  );
}

function AuthLayoutPromptLink({
  to,
  state,
  children,
}: {
  readonly to: string;
  readonly state?: unknown;
  readonly children: ReactNode;
}) {
  return (
    <Button variant="link" asChild className="h-auto p-0 font-normal text-foreground/70">
      <Link to={to} state={state}>
        {children}
      </Link>
    </Button>
  );
}

function AuthLayoutForm({ children }: { readonly children: ReactNode }) {
  return children;
}

AuthLayout.Logo = AuthLayoutLogo;
AuthLayout.Title = AuthLayoutTitle;
AuthLayout.Prompt = AuthLayoutPrompt;
AuthLayout.PromptLink = AuthLayoutPromptLink;
AuthLayout.Form = AuthLayoutForm;

export { AuthLayout };
