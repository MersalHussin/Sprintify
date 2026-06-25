import { cn } from "@/lib/utils"

export type TaskPriority = "Urgent" | "High" | "Medium" | "Low" | "Done"

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  Urgent: "bg-priority-urgent text-priority-urgent-foreground",
  High: "bg-priority-high text-priority-high-foreground",
  Medium: "bg-priority-medium text-priority-medium-foreground",
  Low: "bg-priority-low text-priority-low-foreground",
  Done: "bg-transparent text-priority-done-foreground",
}

function normalizePriority(priority?: string, status?: string): TaskPriority {
  if (status === "Done") return "Done"
  const value = priority?.trim()
  if (value === "Urgent" || value === "High" || value === "Medium" || value === "Low") {
    return value
  }
  return "Medium"
}

export function PriorityBadge({
  priority,
  status,
  className,
}: {
  priority?: string
  status?: string
  className?: string
}) {
  const level = normalizePriority(priority, status)

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PRIORITY_STYLES[level],
        className,
      )}
    >
      {level}
    </span>
  )
}
