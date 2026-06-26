import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LogoProps = {
  readonly size?: "default" | "sm";
  readonly onClick?: () => void;
};

function Logo({ size = "default", onClick }: LogoProps) {
  return (
    <Button variant="ghost" asChild className="min-h-10 shrink-0 gap-2 rounded-full px-0">
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
    </Button>
  );
}

export { Logo };
