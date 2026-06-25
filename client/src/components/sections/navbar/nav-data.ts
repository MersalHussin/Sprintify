import type * as React from "react";

export type NavLink = {
  readonly label: string;
  readonly href: string;
  readonly action?: "contact-modal";
};

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact us", href: "#", action: "contact-modal" },
] as const;


export const NAVBAR_OFFSET_PX = 80;

export function handleAnchorClick(
  event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  href: string,
  onAfterScroll?: () => void,
): void {
  if (!href.startsWith("#") || href.length < 2) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return;

  event.preventDefault();
  const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET_PX;
  window.scrollTo({ top, behavior: "smooth" });
  onAfterScroll?.();
}

