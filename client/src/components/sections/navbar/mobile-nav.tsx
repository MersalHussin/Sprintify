import type { CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";

import { cn } from "@/lib/utils";
import { useContactModal } from "@/context/contact-modal-context";

import { Logo } from "./logo";
import { NAV_LINKS, handleAnchorClick } from "./nav-data";
import { NavActions, type NavbarVariant } from "./nav-actions";
import type { NavbarUser } from "./user-badge";

const drawerSafeAreaStyle: CSSProperties = {
  paddingTop: "calc(1rem + env(safe-area-inset-top))",
  paddingRight: "calc(1rem + env(safe-area-inset-right))",
  paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
  paddingLeft: "calc(1rem + env(safe-area-inset-left))",
};

export type MobileNavProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly variant: NavbarVariant;
  readonly user?: NavbarUser;
  readonly onGetStarted?: () => void;
};

function MobileNav({
  open,
  onOpenChange,
  variant,
  user,
  onGetStarted,
}: MobileNavProps) {
  const closeMenu = () => onOpenChange(false);
  const { open: openContact } = useContactModal();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 md:hidden" />
        <Dialog.Content
          className="fixed inset-x-0 top-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2 md:hidden focus:outline-none"
          style={drawerSafeAreaStyle}
        >
          <Dialog.Title className="sr-only">Mobile navigation</Dialog.Title>

          <div className="rounded-3xl bg-background p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_24px_70px_rgba(15,23,42,0.18)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_24px_70px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between">
              <Logo size="sm" onClick={closeMenu} />
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </Dialog.Close>
            </div>

            <ul className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      if (link.action === "contact-modal") {
                        event.preventDefault();
                        closeMenu();
                        openContact();
                      } else {
                        handleAnchorClick(event, link.href, closeMenu);
                      }
                    }}
                    className="flex h-12 items-center rounded-2xl px-4 text-base font-medium text-foreground transition-colors duration-150 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div
              className={cn(
                "mt-6 flex flex-col gap-3 border-t border-border/60 pt-6",
                variant === "logged-in" && user ? "items-start" : undefined,
              )}
            >
              <NavActions
                variant={variant}
                user={user}
                onGetStarted={onGetStarted}
                onNavigate={closeMenu}
                layout="mobile"
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { MobileNav };
