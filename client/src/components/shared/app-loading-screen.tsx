import { cn } from "@/lib/utils"

interface AppLoadingScreenProps {
  className?: string
  message?: string
}

export function AppLoadingScreen({
  className,
  message = "Loading…",
}: AppLoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh items-center justify-center bg-bg-base text-text-primary",
        className,
      )}
    >
      <p className="font-sans text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
