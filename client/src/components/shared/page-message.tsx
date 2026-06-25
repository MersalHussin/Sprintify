import type { ReactNode } from "react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PageMessageProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  action?: ReactNode
  className?: string
}

export function PageMessage({
  title,
  description,
  actionLabel,
  actionTo,
  action,
  className,
}: PageMessageProps) {
  const cta =
    action ??
    (actionLabel && actionTo ? (
      <Button asChild size="lg" className="rounded-xl">
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    ) : null)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className,
      )}
    >
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {cta}
    </div>
  )
}
