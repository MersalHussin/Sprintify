import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react"
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd"
import {
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/kanban/priority-badge"
import { useAuth } from "@/context/auth-context"
import { apiFetch } from "@/lib/api"
import { getAvatarBackgroundClass, getInitials } from "@/lib/user-display"
import { cn } from "@/lib/utils"
import type { TaskComment, TaskDetail, TaskDetailResponse, TaskSubtask, TaskUser } from "@/types/task"

const STATUSES = ["Backlog", "To Do", "In Progress", "Review", "Done"] as const
const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const

export type TaskListPatch = {
  taskId: string
  deleted?: boolean
  commentCount?: number
  name?: string
  status?: string
  priority?: string
  category?: string
  assignees?: string[]
  assigneeNames?: Record<string, string>
  subtasks?: { name: string; completed: boolean }[]
}

const PANEL_FOOTER_CLASS =
  "flex shrink-0 items-center border-t border-border px-6 py-4 min-h-[4.5rem]"

const STATUS_STYLES: Record<string, string> = {
  Backlog: "bg-muted text-muted-foreground",
  "To Do": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-accent text-accent-foreground",
  Review: "bg-primary/10 text-primary",
  Done: "bg-priority-low text-priority-low-foreground",
}

function formatDate(value?: string) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function userName(users: Record<string, TaskUser>, userId: string) {
  return users[userId]?.name?.trim() || "Unknown"
}

function mergeUsersForAssignees(
  users: Record<string, TaskUser>,
  assigneeIds: string[] | undefined,
  teamMembers: { userId: string; name: string }[],
): Record<string, TaskUser> {
  const next = { ...users }
  for (const userId of assigneeIds ?? []) {
    if (next[userId]?.name?.trim()) continue
    const member = teamMembers.find((m) => m.userId === userId)
    if (member?.name) {
      next[userId] = { id: userId, name: member.name }
    }
  }
  return next
}

function buildAssigneeNamesPatch(
  assigneeIds: string[] | undefined,
  teamMembers: { userId: string; name: string }[],
): Record<string, string> {
  const names: Record<string, string> = {}
  for (const userId of assigneeIds ?? []) {
    const member = teamMembers.find((m) => m.userId === userId)
    if (member?.name) names[userId] = member.name
  }
  return names
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  )
}

function UserAvatar({
  userId,
  name,
  size = "sm",
}: {
  userId: string
  name: string
  size?: "sm" | "lg"
}) {
  return (
    <Avatar size={size}>
      <AvatarFallback
        className={cn(
          "font-semibold text-white",
          size === "sm" ? "text-[10px]" : "text-sm",
          getAvatarBackgroundClass(userId),
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

function UserChip({ userId, users }: { userId: string; users: Record<string, TaskUser> }) {
  const name = userName(users, userId)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
      <UserAvatar userId={userId} name={name} size="sm" />
      {name}
    </span>
  )
}

function DetailRow({
  label,
  children,
  onEdit,
}: {
  label: string
  children: ReactNode
  onEdit?: () => void
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-start gap-x-4 gap-y-1 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onEdit ? (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${label.toLowerCase()}`}>
            <Pencil className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function SubtaskRow({
  subtask,
  index,
  canEdit,
  editing,
  editDraft,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
  onToggle,
  onEdit,
  onDelete,
}: {
  subtask: TaskSubtask
  index: number
  canEdit: boolean
  editing?: boolean
  editDraft?: string
  onEditDraftChange?: (value: string) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  if (!canEdit) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-2",
          subtask.completed && "opacity-70",
        )}
      >
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded border border-border",
            subtask.completed && "border-primary bg-primary text-primary-foreground",
          )}
        >
          {subtask.completed ? <Check className="size-3" /> : null}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 text-sm text-foreground",
            subtask.completed && "line-through text-muted-foreground",
          )}
        >
          {subtask.name}
        </span>
      </div>
    )
  }

  return (
    <Draggable draggableId={String(subtask._id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style as CSSProperties}
          className={cn(
            "group flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-border hover:bg-muted/40",
            snapshot.isDragging && "border-border bg-muted/40 shadow-sm",
            subtask.completed && "opacity-70",
          )}
        >
          <button
            type="button"
            {...provided.dragHandleProps}
            className="rounded p-0.5 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-muted-foreground"
            aria-label="Reorder subtask"
          >
            <GripVertical className="size-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded border border-border",
              subtask.completed && "border-primary bg-primary text-primary-foreground",
            )}
            aria-label={subtask.completed ? "Mark incomplete" : "Mark complete"}
          >
            {subtask.completed ? <Check className="size-3" /> : null}
          </button>
          {editing ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 pr-1">
              <Input
                value={editDraft ?? ""}
                onChange={(e) => onEditDraftChange?.(e.target.value)}
                className="h-7 min-w-0 flex-1 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveEdit?.()
                  if (e.key === "Escape") onCancelEdit?.()
                }}
              />
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={onSaveEdit} aria-label="Save subtask">
                  <Check className="size-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="xs" onClick={onCancelEdit} aria-label="Cancel edit">
                  <X data-icon="inline-start" className="size-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 text-sm text-foreground",
                subtask.completed && "line-through text-muted-foreground",
              )}
            >
              {subtask.name}
            </span>
          )}
          {!editing ? (
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit subtask">
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                aria-label="Delete subtask"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </Draggable>
  )
}

export function TaskDetailModal({
  taskId,
  open,
  onOpenChange,
  onTaskUpdated,
}: {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated?: (patch?: TaskListPatch) => void
}) {
  const [loading, setLoading] = useState(false)
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [users, setUsers] = useState<Record<string, TaskUser>>({})
  const [callerRole, setCallerRole] = useState<string | undefined>()
  const [teamMembers, setTeamMembers] = useState<{ userId: string; name: string }[]>([])
  const [commentDraft, setCommentDraft] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionDraft, setDescriptionDraft] = useState("")
  const [editingCategory, setEditingCategory] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState("")
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [subtaskAddDraft, setSubtaskAddDraft] = useState("")
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
  const [subtaskEditDraft, setSubtaskEditDraft] = useState("")
  const [deleting, setDeleting] = useState(false)

  const { user } = useAuth()
  const isManager = callerRole === "manager"
  const isAssignee = Boolean(user?.uid && task?.assignees?.includes(user.uid))
  const canEditStatusAndSubtasks = isManager || isAssignee

  const loadTask = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    try {
      const data = (await apiFetch(`/tasks/${taskId}`)) as TaskDetailResponse
      setTask(data.task)
      setComments(data.comments ?? [])
      setUsers(data.users ?? {})
      setCallerRole(data.callerRole)
      setTitleDraft(data.task.name)
      setDescriptionDraft(data.task.description ?? "")

      if (data.callerRole === "manager" && data.task.teamId) {
        try {
          const teamData = await apiFetch(`/teams/${data.task.teamId}`)
          const members = (teamData?.members ?? []).map(
            (member: { userId: string; user?: { name?: string } }) => ({
              userId: member.userId,
              name: member.user?.name?.trim() || "Team member",
            }),
          )
          setTeamMembers(members)
          setUsers((prev) => {
            const next = { ...prev, ...(data.users ?? {}) }
            for (const member of members) {
              if (!next[member.userId]?.name?.trim()) {
                next[member.userId] = { id: member.userId, name: member.name }
              }
            }
            return mergeUsersForAssignees(next, data.task.assignees, members)
          })
        } catch (error) {
          console.error("Failed to load team members", error)
          setTeamMembers([])
        }
      } else {
        setTeamMembers([])
      }
    } catch (error) {
      console.error("Failed to load task", error)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    if (!open || !taskId) return
    const timer = window.setTimeout(() => {
      void loadTask()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open, taskId, loadTask])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCommentDraft("")
      setTask(null)
      setCallerRole(undefined)
      setTeamMembers([])
      setEditingTitle(false)
      setEditingDescription(false)
      setEditingCategory(false)
      setAddingSubtask(false)
      setEditingSubtaskId(null)
    }
    onOpenChange(next)
  }

  const buildTaskPatch = (updated: TaskDetail): TaskListPatch => ({
    taskId: String(updated._id),
    name: updated.name,
    status: updated.status,
    priority: updated.priority,
    category: updated.category,
    assignees: updated.assignees,
    subtasks: updated.subtasks?.map(({ name, completed }) => ({ name, completed })),
  })

  const applyTaskUpdate = (updated: TaskDetail) => {
    setTask(updated)
    setTitleDraft(updated.name)
    setDescriptionDraft(updated.description ?? "")
    setUsers((prev) => mergeUsersForAssignees(prev, updated.assignees, teamMembers))
    onTaskUpdated?.({
      ...buildTaskPatch(updated),
      assigneeNames: buildAssigneeNamesPatch(updated.assignees, teamMembers),
    })
  }

  const updateTaskFields = async (fields: Record<string, unknown>) => {
    if (!taskId) return
    try {
      const data = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(fields),
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      console.error("Failed to update task", error)
    }
  }

  const handleAssigneeToggle = async (userId: string, checked: boolean) => {
    if (!task || !taskId) return
    const previousTask = task
    const current = new Set(task.assignees ?? [])
    if (checked) current.add(userId)
    else current.delete(userId)
    const nextAssignees = [...current]

    setTask({ ...task, assignees: nextAssignees })
    setUsers((prev) => mergeUsersForAssignees(prev, nextAssignees, teamMembers))
    onTaskUpdated?.({
      taskId: String(task._id),
      assignees: nextAssignees,
      assigneeNames: buildAssigneeNamesPatch(nextAssignees, teamMembers),
    })

    try {
      const data = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ assignees: nextAssignees }),
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      setTask(previousTask)
      setUsers((prev) => mergeUsersForAssignees(prev, previousTask.assignees, teamMembers))
      onTaskUpdated?.({
        taskId: String(task._id),
        assignees: previousTask.assignees,
        assigneeNames: buildAssigneeNamesPatch(previousTask.assignees, teamMembers),
      })
      console.error("Failed to update assignees", error)
    }
  }

  const saveCategory = async () => {
    if (!task) return
    const trimmed = categoryDraft.trim()
    if (trimmed === (task.category ?? "")) {
      setEditingCategory(false)
      return
    }
    await updateTaskFields({ category: trimmed || undefined })
    setEditingCategory(false)
  }

  const saveSubtaskAdd = async () => {
    if (!taskId || !subtaskAddDraft.trim()) {
      setAddingSubtask(false)
      setSubtaskAddDraft("")
      return
    }
    try {
      const data = await apiFetch(`/tasks/${taskId}/subtasks`, {
        method: "POST",
        body: JSON.stringify({ name: subtaskAddDraft.trim() }),
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      console.error("Failed to add subtask", error)
    } finally {
      setAddingSubtask(false)
      setSubtaskAddDraft("")
    }
  }

  const startSubtaskEdit = (subtask: TaskSubtask) => {
    setEditingSubtaskId(subtask._id)
    setSubtaskEditDraft(subtask.name)
  }

  const saveSubtaskEdit = async () => {
    if (!taskId || !editingSubtaskId || !subtaskEditDraft.trim()) {
      setEditingSubtaskId(null)
      return
    }
    try {
      const data = await apiFetch(`/tasks/${taskId}/subtasks/${editingSubtaskId}`, {
        method: "PATCH",
        body: JSON.stringify({ name: subtaskEditDraft.trim() }),
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      console.error("Failed to edit subtask", error)
    } finally {
      setEditingSubtaskId(null)
      setSubtaskEditDraft("")
    }
  }

  const cancelSubtaskEdit = () => {
    setEditingSubtaskId(null)
    setSubtaskEditDraft("")
  }

  const saveTitle = async () => {
    if (!task || !titleDraft.trim() || titleDraft.trim() === task.name) {
      setEditingTitle(false)
      setTitleDraft(task?.name ?? "")
      return
    }
    await updateTaskFields({ name: titleDraft.trim() })
    setEditingTitle(false)
  }

  const saveDescription = async () => {
    if (!task) return
    const trimmed = descriptionDraft.trim()
    if (trimmed === (task.description ?? "")) {
      setEditingDescription(false)
      return
    }
    await updateTaskFields({ description: trimmed || undefined })
    setEditingDescription(false)
  }

  const handleSubtaskToggle = async (subtask: TaskSubtask) => {
    if (!taskId) return
    try {
      const data = await apiFetch(`/tasks/${taskId}/subtasks/${subtask._id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !subtask.completed }),
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      console.error("Failed to update subtask", error)
    }
  }

  const handleSubtaskDelete = async (subtaskId: string) => {
    if (!taskId) return
    try {
      const data = await apiFetch(`/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: "DELETE",
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      console.error("Failed to delete subtask", error)
    }
  }

  const handleSubtaskDragEnd = async (result: DropResult) => {
    if (!taskId || !task?.subtasks || !result.destination) return
    const { source, destination } = result
    if (source.index === destination.index) return

    const reordered = [...task.subtasks]
    const [moved] = reordered.splice(source.index, 1)
    reordered.splice(destination.index, 0, moved!)
    setTask({ ...task, subtasks: reordered })

    try {
      const data = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({
          subtasks: reordered.map(({ name, completed }) => ({ name, completed })),
        }),
      })
      if (data?.task) applyTaskUpdate(data.task as TaskDetail)
    } catch (error) {
      console.error("Failed to reorder subtasks", error)
      loadTask()
    }
  }

  const handleDelete = async () => {
    if (!taskId) return
    if (!window.confirm("Delete this task? This action cannot be undone.")) return
    setDeleting(true)
    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" })
      onTaskUpdated?.({ taskId, deleted: true })
      handleOpenChange(false)
    } catch (error) {
      console.error("Failed to delete task", error)
    } finally {
      setDeleting(false)
    }
  }

  const handleAddComment = async () => {
    if (!taskId || !commentDraft.trim()) return
    setSubmittingComment(true)
    try {
      const data = await apiFetch(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentDraft.trim() }),
      })
      if (data?.comment) {
        setComments((prev) => {
          const next = [data.comment as TaskComment, ...prev]
          if (taskId) {
            onTaskUpdated?.({ taskId, commentCount: next.length })
          }
          return next
        })
        setCommentDraft("")
        if (data.comment.author && !users[data.comment.author]) {
          setUsers((prev) => ({
            ...prev,
            [data.comment.author]: { id: data.comment.author, name: data.comment.author.slice(0, 8) },
          }))
        }
      }
    } catch (error) {
      console.error("Failed to add comment", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const subtasks = task?.subtasks ?? []
  const doneCount = subtasks.filter((s) => s.completed).length
  const creator = task ? users[task.createdBy] : undefined

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex h-[min(85vh,720px)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          {task?.name ?? "Task details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Task details, subtasks, and comments
        </DialogDescription>

        {loading || !task ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {/* Left panel */}
            <div className="flex min-h-0 flex-1 flex-col border-border md:border-r">
              {/* Top: details */}
              <div className="flex flex-col gap-4 overflow-y-auto p-6">
                <div className="flex flex-col gap-2">
                  {isManager && editingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="text-lg font-semibold"
                        autoFocus
                      />
                      <Button type="button" size="sm" onClick={saveTitle}>
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingTitle(false)
                          setTitleDraft(task.name)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <h2 className="text-2xl font-semibold text-foreground">{task.name}</h2>
                      {isManager ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingTitle(true)}
                          aria-label="Edit title"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  )}
                  {isManager && editingDescription ? (
                    <div className="flex flex-col gap-2">
                      <Textarea
                        value={descriptionDraft}
                        onChange={(e) => setDescriptionDraft(e.target.value)}
                        rows={3}
                        className="resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={saveDescription}>
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingDescription(false)
                            setDescriptionDraft(task.description ?? "")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      {task.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {task.description}
                        </p>
                      ) : isManager ? (
                        <p className="text-sm text-muted-foreground">No description.</p>
                      ) : null}
                      {isManager ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingDescription(true)}
                          aria-label="Edit description"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <DetailRow label="Status">
                    {canEditStatusAndSubtasks ? (
                      <Select
                        value={task.status}
                        onValueChange={(value) => void updateTaskFields({ status: value })}
                      >
                        <SelectTrigger className="h-auto w-auto gap-1.5 rounded-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 [&_svg]:size-3.5">
                          <StatusBadge status={task.status} />
                        </SelectTrigger>
                        <SelectContent className="z-100">
                          {STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </DetailRow>
                  <DetailRow label="Assigned to">
                    {task.assignees?.length ? (
                      task.assignees.map((id) => (
                        <UserChip key={id} userId={id} users={users} />
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                    {isManager && teamMembers.length > 0 ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit assignees">
                            <Pencil className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="z-100 max-h-60 w-56" align="start">
                          {teamMembers.map((member) => (
                            <DropdownMenuCheckboxItem
                              key={member.userId}
                              checked={task.assignees?.includes(member.userId) ?? false}
                              onCheckedChange={(checked) =>
                                void handleAssigneeToggle(member.userId, checked === true)
                              }
                              onSelect={(e) => e.preventDefault()}
                            >
                              {member.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </DetailRow>
                  <DetailRow label="Created">
                    {formatDate(task.createdAt)}
                  </DetailRow>
                  <DetailRow label="Updated">
                    {formatDate(task.updatedAt)}
                  </DetailRow>
                  <DetailRow label="Priority">
                    {isManager ? (
                      <Select
                        value={task.priority ?? "Medium"}
                        onValueChange={(value) => void updateTaskFields({ priority: value })}
                      >
                        <SelectTrigger className="h-auto w-auto gap-1.5 rounded-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 [&_svg]:size-3.5">
                          <PriorityBadge priority={task.priority} status={task.status} />
                        </SelectTrigger>
                        <SelectContent className="z-100">
                          {PRIORITIES.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <PriorityBadge priority={task.priority} status={task.status} />
                    )}
                  </DetailRow>
                  <DetailRow label="Category">
                    {isManager && editingCategory ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={categoryDraft}
                          onChange={(e) => setCategoryDraft(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveCategory()
                            if (e.key === "Escape") {
                              setEditingCategory(false)
                              setCategoryDraft(task.category ?? "")
                            }
                          }}
                        />
                        <Button type="button" size="sm" onClick={() => void saveCategory()}>
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(false)
                            setCategoryDraft(task.category ?? "")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-foreground">{task.category || "—"}</span>
                        {isManager ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setCategoryDraft(task.category ?? "")
                              setEditingCategory(true)
                            }}
                            aria-label="Edit category"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        ) : null}
                      </>
                    )}
                  </DetailRow>
                </div>
              </div>

              <Separator />

              {/* Bottom: subtasks */}
              <div className="flex min-h-0 flex-1 flex-col p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {doneCount} done of {subtasks.length}
                    </span>
                    {canEditStatusAndSubtasks ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setAddingSubtask(true)}
                        aria-label="Add subtask"
                      >
                        <Plus className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {canEditStatusAndSubtasks && addingSubtask ? (
                  <div className="mb-3 flex items-center gap-2">
                    <Input
                      value={subtaskAddDraft}
                      onChange={(e) => setSubtaskAddDraft(e.target.value)}
                      placeholder="Subtask name"
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void saveSubtaskAdd()
                        if (e.key === "Escape") {
                          setAddingSubtask(false)
                          setSubtaskAddDraft("")
                        }
                      }}
                    />
                    <Button type="button" size="sm" onClick={() => void saveSubtaskAdd()}>
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAddingSubtask(false)
                        setSubtaskAddDraft("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : null}

                {subtasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subtasks yet.</p>
                ) : canEditStatusAndSubtasks ? (
                  <DragDropContext onDragEnd={handleSubtaskDragEnd}>
                    <Droppable droppableId="subtasks">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto"
                        >
                          {subtasks.map((subtask, index) => (
                            <SubtaskRow
                              key={subtask._id}
                              subtask={subtask}
                              index={index}
                              canEdit={canEditStatusAndSubtasks}
                              editing={editingSubtaskId === subtask._id}
                              editDraft={subtaskEditDraft}
                              onEditDraftChange={setSubtaskEditDraft}
                              onSaveEdit={() => void saveSubtaskEdit()}
                              onCancelEdit={cancelSubtaskEdit}
                              onToggle={() => handleSubtaskToggle(subtask)}
                              onEdit={() => startSubtaskEdit(subtask)}
                              onDelete={() => handleSubtaskDelete(subtask._id)}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
                    {subtasks.map((subtask, index) => (
                      <SubtaskRow
                        key={subtask._id}
                        subtask={subtask}
                        index={index}
                        canEdit={false}
                        onToggle={() => {}}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>

              {isManager ? (
                <div className={PANEL_FOOTER_CLASS}>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleting}
                    onClick={() => void handleDelete()}
                  >
                    {deleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Delete task
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Right panel: comments + creator */}
            <div className="flex min-h-0 w-full shrink-0 flex-col md:w-80 lg:w-96">
              <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
                <h3 className="text-sm font-semibold text-foreground">Comments</h3>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment._id} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            userId={comment.author}
                            name={userName(users, comment.author)}
                            size="sm"
                          />
                          <span className="text-xs font-medium text-foreground">
                            {userName(users, comment.author)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Add a comment…"
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="self-end"
                    disabled={!commentDraft.trim() || submittingComment}
                    onClick={handleAddComment}
                  >
                    {submittingComment ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        Post
                        <Send className="size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className={cn(PANEL_FOOTER_CLASS, "gap-3")}>
                <UserAvatar
                  userId={task.createdBy}
                  name={creator?.name ?? task.createdBy}
                  size="lg"
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Created by</span>
                  <span className="text-sm font-medium text-foreground">
                    {creator?.name ?? task.createdBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
