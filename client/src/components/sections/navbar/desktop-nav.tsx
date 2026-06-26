import { Button } from "@/components/ui/button";
import { useContactModal } from "@/context/contact-modal-context";

import { NAV_LINKS, handleAnchorClick } from "./nav-data";

function DesktopNav() {
  const { open: openContact } = useContactModal();

  return (
    <ul className="hidden items-center justify-center gap-1 md:flex">
      {NAV_LINKS.map((link) => (
        <li key={link.label}>
          <Button variant="ghost" asChild className="h-10 rounded-full px-4 text-sm font-medium text-muted-foreground">
            <a
              href={link.href}
              onClick={(event) => {
                if (link.action === "contact-modal") {
                  event.preventDefault();
                  openContact();
                } else {
                  handleAnchorClick(event, link.href);
                }
              }}
            >
              {link.label}
            </a>
          </Button>
        </li>
      ))}
    </ul>
  );
}

export { DesktopNav };
