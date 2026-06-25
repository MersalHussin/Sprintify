import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateVariant = "page" | "card"

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: ReactNode
  action?: ReactNode
  variant?: EmptyStateVariant
  className?: string
  children?: ReactNode
}

const variantClass: Record<EmptyStateVariant, string> = {
  page:
    "flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
  card:
    "flex flex-col items-center justify-center py-12 bg-card rounded-2xl border border-border border-dashed",
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "page",
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(variantClass[variant], className)}>
      {icon}
      {title ? (
        <h2 className="mt-4 text-lg font-medium text-foreground">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
