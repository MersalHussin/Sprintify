import * as React from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

import { DesktopNav } from "./desktop-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavActions, type NavbarVariant } from "./nav-actions";
import type { NavbarUser } from "./user-badge";

export type { NavbarUser, NavbarVariant };

export type NavbarProps = {
  readonly variant?: NavbarVariant;
  readonly user?: NavbarUser;
  readonly onGetStarted?: () => void;
};

function Navbar({ variant: variantProp = "default", user, onGetStarted }: NavbarProps) {
  const { user: authUser, loading } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isAuthenticated = !loading && Boolean(authUser);
  const variant: NavbarVariant =
    variantProp === "logged-in" || isAuthenticated ? "logged-in" : "default";

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
          "mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 rounded-full border border-border bg-bg-surface/95 px-3 transition-colors duration-150 sm:px-5",
          scrolled && "border-border-strong",
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
