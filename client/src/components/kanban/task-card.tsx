import { ChevronDown, GripVertical, ListChecks, MessageCircleMore } from "lucide-react"
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { PriorityBadge } from "@/components/kanban/priority-badge"
import { getAvatarBackgroundClass, getInitials } from "@/lib/user-display"
import { cn } from "@/lib/utils"

export interface KanbanTaskCardData {
  _id: string
  name: string
  title?: string
  status: string
  priority?: string
  category?: string
  assignees?: string[]
  subtasks?: { name: string; completed: boolean }[]
  commentCount?: number
  order?: number
  createdAt?: string
}


const MAX_VISIBLE_ASSIGNEES = 5

function AssigneeStack({
  assignees,
  assigneeNames = {},
}: {
  assignees: string[]
  assigneeNames?: Record<string, string>
}) {
  const visible = assignees.slice(0, MAX_VISIBLE_ASSIGNEES)
  const overflow = assignees.length - visible.length

  if (visible.length === 0) {
    return <div className="size-6" aria-hidden="true" />
  }

  return (
    <AvatarGroup className="*:data-[slot=avatar]:size-6 *:data-[slot=avatar]:ring-1 *:data-[slot=avatar]:ring-background">
      {visible.map((assigneeId) => (
        <Avatar key={assigneeId} size="sm">
          <AvatarFallback
            className={cn(
              "text-[10px] font-semibold text-white",
              getAvatarBackgroundClass(assigneeId),
            )}
          >
            {getInitials(assigneeNames[assigneeId] ?? "?")}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 ? (
        <Avatar size="sm">
          <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
            +{overflow}
          </AvatarFallback>
        </Avatar>
      ) : null}
    </AvatarGroup>
  )
}

export function KanbanTaskCard({
  task,
  dragHandleProps,
  onClick,
  assigneeNames,
}: {
  task: KanbanTaskCardData
  dragHandleProps?: DraggableProvidedDragHandleProps | null
  onClick?: () => void
  assigneeNames?: Record<string, string>
}) {
  const title = task.name || task.title || "Untitled"
  const subtaskCount = task.subtasks?.length ?? 0
  const commentCount = task.commentCount ?? 0
  const assignees = task.assignees ?? []

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-colors hover:border-border",
        onClick && "cursor-pointer hover:bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-sidebar-primary">
          {task.category || "Task"}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {dragHandleProps ? (
            <button
              type="button"
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="rounded p-0.5 text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground"
              aria-label="Drag task"
            >
              <GripVertical className="size-4" />
            </button>
          ) : null}
          <ChevronDown
            className="size-4 text-muted-foreground/60"
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="mt-2 truncate text-sm text-foreground">{title}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <AssigneeStack assignees={assignees} assigneeNames={assigneeNames} />
        <PriorityBadge priority={task.priority} status={task.status} />
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-end gap-3 text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-xs font-medium">
          <MessageCircleMore className="size-3.5" />
          {commentCount}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-medium">
          <ListChecks className="size-3.5" />
          {subtaskCount}
        </span>
      </div>
    </div>
  )
}
