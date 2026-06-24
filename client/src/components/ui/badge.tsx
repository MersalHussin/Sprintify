import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Sprintify badge — small inline label used to tag sections or content.
 *
 * Variants
 *  - `section` : primary-tinted pill, used above section headings
 *                (e.g. "FAQ", "Features"). Tracked-out uppercase eyebrow.
 *  - `pill`    : gray-tinted pill, used for inline tag lists
 *                (e.g. team-size chips). Sized to fit a leading icon.
 *
 * Implemented as a `<span>` by default since badges are non-interactive
 * inline labels.
 */
const badgeVariants = cva(
  cn([
    "inline-flex items-center gap-1.5 rounded-full",
    "border px-3 py-1.5 text-xs font-medium text-primary",
  ]),
  {
    variants: {
      variant: {
        section: "border-primary/15 bg-primary/10 gap-0 py-1 uppercase",
        pill: "border-muted bg-muted/50",
      },
    },
    defaultVariants: {
      variant: "section",
    },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant = "section", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge };
