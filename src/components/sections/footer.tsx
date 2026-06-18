import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

export type FooterProps = {
  year?: number;
  className?: string;
};

type FooterLink = {
  label: string;
  href: string;
  /** Open in a new tab. Defaults to `false`. */
  external?: boolean;
  disabled?: boolean;
};

type SocialLink = FooterLink & {
  /** Short name used for the `aria-label` and `alt` text. */
  name: string;
  /** Path to the SVG icon in the public folder. */
  icon: string;
};

const SECTION_LINKS: readonly FooterLink[] = [
  { label: "Features", href: "#features" },
  { label: "FAQs", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

const LEGAL_LINKS: readonly FooterLink[] = [
  { label: "Privacy Policy", href: "#", disabled: true },
  { label: "Terms & Conditions", href: "/terms" },
] as const;

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "Facebook",
    label: "Facebook",
    href: "#",
    external: true,
    icon: "/assets/social%20media%20icons/Icon=Icon3.svg",
  },
  {
    name: "Twitter / X",
    label: "Twitter / X",
    href: "#",
    external: true,
    icon: "/assets/social%20media%20icons/Icon=X-Twitter.svg",
  },
  {
    name: "Instagram",
    label: "Instagram",
    href: "#",
    external: true,
    icon: "/assets/social%20media%20icons/Icon=Instagram.svg",
  },
] as const;

function FooterColumn({
  title,
  children,
}: {
  title: string | ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="text-balance font-heading italic text-lg text-foreground">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function LinkList({ links }: { links: readonly FooterLink[] }) {
  return (
    <ul className="flex flex-col">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <FooterAnchor link={link} />
        </li>
      ))}
    </ul>
  );
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const className = cn(
    "inline-flex min-h-8 items-center text-pretty text-sm text-muted-foreground transition-colors duration-150",
    link.disabled ? "cursor-not-allowed opacity-50" : "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
  );

  if (link.disabled) {
    return (
      <span className={className} aria-disabled="true">
        {link.label}
      </span>
    );
  }

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    );
  }

  if (link.href.startsWith("/")) {
    return (
      <Link to={link.href} className={className}>
        {link.label}
      </Link>
    );
  }

  return (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );
}

function SocialTextLink({ link }: { link: SocialLink }) {
  return (
    <span
      aria-disabled="true"
      title="Coming soon"
      className={cn(
        "inline-flex min-h-8 items-center gap-2 text-pretty text-sm text-muted-foreground transition-colors duration-150 cursor-not-allowed opacity-50 rounded-sm",
      )}
    >
      <img
        src={link.icon}
        alt=""
        width={16}
        height={16}
        loading="lazy"
        decoding="async"
        className="size-4 opacity-80"
      />
      {link.label}
    </span>
  );
}

/* Main Component */
export function Footer({ year, className }: FooterProps) {
  const resolvedYear = year ?? new Date().getFullYear();

  return (
    <footer
      id="footer"
      className={cn(
        "border-t border-border bg-background w-full",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-6 pt-20 sm:pt-24 lg:pt-32 text-center">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-10 lg:gap-8">
          <FooterColumn title={
            <img
            src="/assets/images/logo.webp"
            alt="Sprintify"
            width={160}
            height={40}
            decoding="async"
            className="h-10 w-auto mx-auto"
          />
          }>
            <p className="text-muted-foreground text-sm">
              The AI-powered workspace where teams plan, collaborate, and ship.
            </p>
          </FooterColumn>

          <FooterColumn title="Sections">
            <LinkList links={SECTION_LINKS} />
          </FooterColumn>

          <FooterColumn title="Legal">
            <LinkList links={LEGAL_LINKS} />
          </FooterColumn>

          <FooterColumn title="Socials">
            <ul className="flex flex-col gap-1">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.name}>
                  <SocialTextLink link={link} />
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="mt-16 border-t border-border pt-8 text-center text-sm tabular-nums text-muted-foreground">
          © {resolvedYear} - Sprintify
        </div>

        {/* Oversized Sprintify logomark */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none overflow-hidden h-[clamp(6rem,12vw,12rem)]"
        >
          <p className="bg-linear-to-bl from-foreground/15 to-transparent bg-clip-text text-center font-heading text-[clamp(5rem,18vw,16rem)] italic leading-none text-transparent">
            Sprintify
          </p>
        </div>
      </div>
    </footer>
  );
}
