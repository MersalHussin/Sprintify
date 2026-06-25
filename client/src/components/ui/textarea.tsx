import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-border bg-bg-inset px-2.5 py-2 text-base text-text-primary transition-colors duration-150 outline-none placeholder:text-text-muted focus-visible:border-border-strong focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:bg-bg-inset/50 disabled:text-text-disabled md:text-sm aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
