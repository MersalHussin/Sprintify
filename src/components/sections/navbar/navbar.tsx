import * as React from "react";

import { cn } from "@/lib/utils";

import { DesktopNav } from "./desktop-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavActions, type NavbarVariant } from "./nav-actions";
import type { NavbarUser } from "./user-badge";

export type { NavbarUser, NavbarVariant };

export type NavbarProps = {
  /** Controls the right-side action. Defaults to `"default"`. */
  readonly variant?: NavbarVariant;
  /** Required when `variant="logged-in"`. */
  readonly user?: NavbarUser;
  /** Optional override for the CTA link/handler. */
  readonly onGetStarted?: () => void;
};

function Navbar({ variant = "default", user, onGetStarted }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full pt-4">
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 rounded-full bg-background/95 px-3 transition-shadow duration-150 sm:px-5",
          scrolled
            ? "shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_18px_45px_rgba(15,23,42,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_18px_45px_rgba(0,0,0,0.35)]"
            : "shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_24px_rgba(15,23,42,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.25)]",
        )}
      >
        <Logo />
        <DesktopNav />

        <div className="hidden items-center gap-3 md:flex">
          <NavActions
            variant={variant}
            user={user}
            onGetStarted={onGetStarted}
            layout="desktop"
          />
        </div>

        <MobileNav
          open={menuOpen}
          onOpenChange={setMenuOpen}
          variant={variant}
          user={user}
          onGetStarted={onGetStarted}
        />
      </nav>
    </header>
  );
}

export { Navbar };
