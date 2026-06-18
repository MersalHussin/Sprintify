import { cn } from "@/lib/utils";

export type LogoProps = {
  readonly size?: "default" | "sm";
  readonly onClick?: () => void;
};

function Logo({ size = "default", onClick }: LogoProps) {
  return (
    <a
      href="/"
      onClick={(event) => {
        if (window.location.pathname === "/") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        onClick?.();
      }}
      aria-label="Sprintify — go to top"
      className="flex min-h-10 shrink-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <img
        src="/assets/images/logo.webp"
        alt="Sprintify Logo"
        width={120}
        height={28}
        decoding="async"
        className={cn(size === "sm" ? "h-7" : "h-7 sm:h-8", "w-auto")}
      />
    </a>
  );
}

export { Logo };
