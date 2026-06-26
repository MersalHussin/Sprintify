import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PageMessageProps {
  className?: string
  children: ReactNode
}

function PageMessage({ className, children }: PageMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-8 py-16 text-center",
        className,
      )}
    >
      {children}
    </div>
  )
}

function PageMessageTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 text-2xl font-bold text-foreground">{children}</h2>
}

function PageMessageDescription({ children }: { children: ReactNode }) {
  return <p className="mb-6 max-w-md text-muted-foreground">{children}</p>
}

function PageMessageAction({ children }: { children: ReactNode }) {
  return children
}

PageMessage.Title = PageMessageTitle
PageMessage.Description = PageMessageDescription
PageMessage.Action = PageMessageAction

export { PageMessage }
