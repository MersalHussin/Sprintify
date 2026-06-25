import type { KanbanTaskCardData } from "@/components/kanban/task-card"
import type { TaskListPatch } from "@/components/kanban/task-detail-modal"

function mergeTaskPatch(task: KanbanTaskCardData, patch: TaskListPatch): KanbanTaskCardData {
  return {
    ...task,
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
    ...(patch.category !== undefined ? { category: patch.category } : {}),
    ...(patch.assignees !== undefined ? { assignees: patch.assignees } : {}),
    ...(patch.subtasks !== undefined ? { subtasks: patch.subtasks } : {}),
    ...(patch.commentCount !== undefined ? { commentCount: patch.commentCount } : {}),
  }
}

type ApplyTaskListPatchOptions = {
  /** When set, tasks whose status no longer matches are removed from the list. */
  statusFilter?: string
  /** When set, tasks moved to this status are removed from the list (e.g. Backlog on sprint board). */
  excludeStatus?: string
}

export function applyTaskListPatch(
  tasks: KanbanTaskCardData[],
  patch: TaskListPatch,
  options: ApplyTaskListPatchOptions = {},
): KanbanTaskCardData[] {
  const taskId = String(patch.taskId)

  if (patch.deleted) {
    return tasks.filter((task) => String(task._id) !== taskId)
  }

  if (patch.status !== undefined && patch.status === options.excludeStatus) {
    return tasks.filter((task) => String(task._id) !== taskId)
  }

  if (
    patch.status !== undefined &&
    options.statusFilter !== undefined &&
    patch.status !== options.statusFilter
  ) {
    return tasks.filter((task) => String(task._id) !== taskId)
  }

  const index = tasks.findIndex((task) => String(task._id) === taskId)
  if (index === -1) return tasks

  const next = [...tasks]
  next[index] = mergeTaskPatch(tasks[index]!, patch)
  return next
}
