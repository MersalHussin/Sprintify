import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 outline-none select-none active:scale-[0.96] data-[static=true]:active:scale-100 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-bg-base hover:bg-accent/90",
        outline:
          "border border-border bg-bg-surface text-text-primary hover:bg-bg-subtle aria-expanded:bg-bg-subtle aria-expanded:text-text-primary",
        secondary:
          "bg-bg-subtle text-text-primary border border-border hover:bg-bg-inset aria-expanded:bg-bg-subtle aria-expanded:text-text-primary",
        ghost:
          "text-text-secondary hover:bg-bg-subtle hover:text-text-primary aria-expanded:bg-bg-subtle aria-expanded:text-text-primary",
        destructive:
          "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-4 py-2.5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[min(var(--radius-md),12px)] px-4 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-6 py-3 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon:
          "size-8 before:absolute before:-inset-1 before:content-['']",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] before:absolute before:-inset-2 before:content-[''] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] before:absolute before:-inset-1.5 before:content-[''] in-data-[slot=button-group]:rounded-lg",
        "icon-lg":
          "size-9 before:absolute before:-inset-0.5 before:content-['']",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export { buttonVariants };
export type { ButtonVariantProps };
