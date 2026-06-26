import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateVariant = "page" | "card"

interface EmptyStateProps {
  variant?: EmptyStateVariant
  className?: string
  children: ReactNode
}

const variantClass: Record<EmptyStateVariant, string> = {
  page:
    "flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
  card:
    "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-12",
}

function EmptyState({ variant = "page", className, children }: EmptyStateProps) {
  return <div className={cn(variantClass[variant], className)}>{children}</div>
}

function EmptyStateIcon({ children }: { children: ReactNode }) {
  return children
}

function EmptyStateTitle({ children }: { children: ReactNode }) {
  return <h2 className="mt-4 text-lg font-medium text-foreground">{children}</h2>
}

function EmptyStateDescription({ children }: { children: ReactNode }) {
  return <p className="mt-2 max-w-sm text-sm text-muted-foreground">{children}</p>
}

function EmptyStateAction({ children }: { children: ReactNode }) {
  return <div className="mt-6">{children}</div>
}

function EmptyStateContent({ children }: { children: ReactNode }) {
  return children
}

EmptyState.Icon = EmptyStateIcon
EmptyState.Title = EmptyStateTitle
EmptyState.Description = EmptyStateDescription
EmptyState.Action = EmptyStateAction
EmptyState.Content = EmptyStateContent

export { EmptyState }
