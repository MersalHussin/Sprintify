import type { CSSProperties, ReactNode } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/kanban/priority-badge"
import { getAvatarBackgroundClass, getInitials } from "@/lib/user-display"
import { cn } from "@/lib/utils"
import type { TaskComment, TaskDetail, TaskSubtask, TaskUser } from "@/types/task"

import { PANEL_FOOTER_CLASS, PRIORITIES, STATUSES, STATUS_STYLES } from "./constants"
import { formatDate, userName } from "./utils"

export function StatusBadge({ status }: { status: string }) {
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

export function UserAvatar({
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
          "font-semibold text-primary-foreground",
          size === "sm" ? "text-[10px]" : "text-sm",
          getAvatarBackgroundClass(userId),
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserChip({ userId, users }: { userId: string; users: Record<string, TaskUser> }) {
  const name = userName(users, userId)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-foreground">
      <UserAvatar userId={userId} name={name} size="sm" />
      {name}
    </span>
  )
}

export function DetailRow({
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

export function SubtaskRow({
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

interface TaskDetailDetailsPanelProps {
  task: TaskDetail
  users: Record<string, TaskUser>
  teamMembers: { userId: string; name: string }[]
  isManager: boolean
  canEditStatusAndSubtasks: boolean
  editingTitle: boolean
  titleDraft: string
  onTitleDraftChange: (value: string) => void
  onSaveTitle: () => void
  onCancelTitleEdit: () => void
  onStartTitleEdit: () => void
  editingDescription: boolean
  descriptionDraft: string
  onDescriptionDraftChange: (value: string) => void
  onSaveDescription: () => void
  onCancelDescriptionEdit: () => void
  onStartDescriptionEdit: () => void
  editingCategory: boolean
  categoryDraft: string
  onCategoryDraftChange: (value: string) => void
  onSaveCategory: () => void
  onCancelCategoryEdit: () => void
  onStartCategoryEdit: () => void
  onUpdateTaskFields: (fields: Record<string, unknown>) => void
  onAssigneeToggle: (userId: string, checked: boolean) => void
}

export function TaskDetailDetailsPanel({
  task,
  users,
  teamMembers,
  isManager,
  canEditStatusAndSubtasks,
  editingTitle,
  titleDraft,
  onTitleDraftChange,
  onSaveTitle,
  onCancelTitleEdit,
  onStartTitleEdit,
  editingDescription,
  descriptionDraft,
  onDescriptionDraftChange,
  onSaveDescription,
  onCancelDescriptionEdit,
  onStartDescriptionEdit,
  editingCategory,
  categoryDraft,
  onCategoryDraftChange,
  onSaveCategory,
  onCancelCategoryEdit,
  onStartCategoryEdit,
  onUpdateTaskFields,
  onAssigneeToggle,
}: TaskDetailDetailsPanelProps) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-6">
      <div className="flex flex-col gap-2">
        {isManager && editingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={titleDraft}
              onChange={(e) => onTitleDraftChange(e.target.value)}
              className="text-lg font-semibold"
              autoFocus
            />
            <Button type="button" size="sm" onClick={onSaveTitle}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancelTitleEdit}>
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
                onClick={onStartTitleEdit}
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
              onChange={(e) => onDescriptionDraftChange(e.target.value)}
              rows={3}
              className="resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={onSaveDescription}>
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onCancelDescriptionEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            {task.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{task.description}</p>
            ) : isManager ? (
              <p className="text-sm text-muted-foreground">No description.</p>
            ) : null}
            {isManager ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onStartDescriptionEdit}
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
              onValueChange={(value) => void onUpdateTaskFields({ status: value })}
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
            task.assignees.map((id) => <UserChip key={id} userId={id} users={users} />)
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
                      void onAssigneeToggle(member.userId, checked === true)
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
        <DetailRow label="Created">{formatDate(task.createdAt)}</DetailRow>
        <DetailRow label="Updated">{formatDate(task.updatedAt)}</DetailRow>
        <DetailRow label="Priority">
          {isManager ? (
            <Select
              value={task.priority ?? "Medium"}
              onValueChange={(value) => void onUpdateTaskFields({ priority: value })}
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
                onChange={(e) => onCategoryDraftChange(e.target.value)}
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") void onSaveCategory()
                  if (e.key === "Escape") onCancelCategoryEdit()
                }}
              />
              <Button type="button" size="sm" onClick={() => void onSaveCategory()}>
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={onCancelCategoryEdit}>
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
                  onClick={onStartCategoryEdit}
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
  )
}

interface TaskDetailSubtasksSectionProps {
  subtasks: TaskSubtask[]
  doneCount: number
  canEditStatusAndSubtasks: boolean
  addingSubtask: boolean
  subtaskAddDraft: string
  onSubtaskAddDraftChange: (value: string) => void
  onStartAddSubtask: () => void
  onSaveSubtaskAdd: () => void
  onCancelSubtaskAdd: () => void
  editingSubtaskId: string | null
  subtaskEditDraft: string
  onSubtaskEditDraftChange: (value: string) => void
  onSaveSubtaskEdit: () => void
  onCancelSubtaskEdit: () => void
  onSubtaskToggle: (subtask: TaskSubtask) => void
  onStartSubtaskEdit: (subtask: TaskSubtask) => void
  onSubtaskDelete: (subtaskId: string) => void
  onSubtaskDragEnd: (result: DropResult) => void
}

export function TaskDetailSubtasksSection({
  subtasks,
  doneCount,
  canEditStatusAndSubtasks,
  addingSubtask,
  subtaskAddDraft,
  onSubtaskAddDraftChange,
  onStartAddSubtask,
  onSaveSubtaskAdd,
  onCancelSubtaskAdd,
  editingSubtaskId,
  subtaskEditDraft,
  onSubtaskEditDraftChange,
  onSaveSubtaskEdit,
  onCancelSubtaskEdit,
  onSubtaskToggle,
  onStartSubtaskEdit,
  onSubtaskDelete,
  onSubtaskDragEnd,
}: TaskDetailSubtasksSectionProps) {
  return (
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
              onClick={onStartAddSubtask}
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
            onChange={(e) => onSubtaskAddDraftChange(e.target.value)}
            placeholder="Subtask name"
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") void onSaveSubtaskAdd()
              if (e.key === "Escape") onCancelSubtaskAdd()
            }}
          />
          <Button type="button" size="sm" onClick={() => void onSaveSubtaskAdd()}>
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancelSubtaskAdd}>
            Cancel
          </Button>
        </div>
      ) : null}

      {subtasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No subtasks yet.</p>
      ) : canEditStatusAndSubtasks ? (
        <DragDropContext onDragEnd={onSubtaskDragEnd}>
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
                    onEditDraftChange={onSubtaskEditDraftChange}
                    onSaveEdit={() => void onSaveSubtaskEdit()}
                    onCancelEdit={onCancelSubtaskEdit}
                    onToggle={() => onSubtaskToggle(subtask)}
                    onEdit={() => onStartSubtaskEdit(subtask)}
                    onDelete={() => onSubtaskDelete(subtask._id)}
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
  )
}

interface TaskDetailCommentsPanelProps {
  task: TaskDetail
  comments: TaskComment[]
  users: Record<string, TaskUser>
  commentDraft: string
  submittingComment: boolean
  onCommentDraftChange: (value: string) => void
  onAddComment: () => void
}

export function TaskDetailCommentsPanel({
  task,
  comments,
  users,
  commentDraft,
  submittingComment,
  onCommentDraftChange,
  onAddComment,
}: TaskDetailCommentsPanelProps) {
  const creator = users[task.createdBy]

  return (
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
            onChange={(e) => onCommentDraftChange(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <Button
            type="button"
            size="sm"
            className="self-end"
            disabled={!commentDraft.trim() || submittingComment}
            onClick={onAddComment}
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
  )
}
