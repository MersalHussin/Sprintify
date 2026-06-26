import type { CSSProperties } from "react";
import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
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
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Open menu"
          className="rounded-full md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-base/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 md:hidden" />
        <Dialog.Content
          className="fixed inset-x-0 top-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-top-2 md:hidden focus:outline-none"
          style={drawerSafeAreaStyle}
        >
          <Dialog.Title className="sr-only">Mobile navigation</Dialog.Title>

          <div className="rounded-3xl border border-border bg-bg-elevated p-6">
            <div className="flex items-center justify-between">
              <Logo size="sm" onClick={closeMenu} />
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Close menu"
                  className="rounded-full"
                >
                  <X aria-hidden="true" className="size-5" />
                </Button>
              </Dialog.Close>
            </div>

            <ul className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Button
                    variant="ghost"
                    asChild
                    className="h-12 w-full justify-start rounded-2xl px-4 text-base font-medium"
                  >
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
                    >
                      {link.label}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>

            <div
              className={cn(
                "mt-6 flex flex-col gap-3 border-t border-border/60 pt-6",
                variant === "logged-in" ? "items-start" : undefined,
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
