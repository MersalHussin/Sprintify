import { useContactModal } from "@/context/contact-modal-context";

import { NAV_LINKS, handleAnchorClick } from "./nav-data";

function DesktopNav() {
  const { open: openContact } = useContactModal();

  return (
    <ul className="hidden items-center justify-center gap-1 md:flex">
      {NAV_LINKS.map((link) => (
        <li key={link.label}>
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
            className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export { DesktopNav };
