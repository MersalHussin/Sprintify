export const STATUSES = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const
export const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const

export const PANEL_FOOTER_CLASS =
  "flex shrink-0 items-center border-t border-border px-6 py-4 min-h-[4.5rem]"

export const STATUS_STYLES: Record<string, string> = {
  Backlog: "bg-muted text-muted-foreground",
  "To Do": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-accent-subtle text-accent",
  Review: "bg-primary/10 text-primary",
  Done: "bg-priority-low text-priority-low-foreground",
}
