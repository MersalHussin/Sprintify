import { useCallback, useEffect, useState } from "react"
import type { DropResult } from "@hello-pangea/dnd"

import { useAuth } from "@/context/auth-context"
import { apiFetch } from "@/lib/api"
import type {
  TaskComment,
  TaskDetail,
  TaskDetailResponse,
  TaskListPatch,
  TaskSubtask,
  TaskUser,
} from "@/types/task"

import {
  buildAssigneeNamesPatch,
  mergeUsersForAssignees,
} from "./utils"

interface UseTaskDetailOptions {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated?: (patch?: TaskListPatch) => void
}

export function useTaskDetail({
  taskId,
  open,
  onOpenChange,
  onTaskUpdated,
}: UseTaskDetailOptions) {
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
    if (!moved) return
    reordered.splice(destination.index, 0, moved)
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

  return {
    loading,
    task,
    comments,
    users,
    isManager,
    canEditStatusAndSubtasks,
    editingTitle,
    titleDraft,
    setTitleDraft,
    editingDescription,
    descriptionDraft,
    setDescriptionDraft,
    editingCategory,
    categoryDraft,
    setCategoryDraft,
    addingSubtask,
    subtaskAddDraft,
    setSubtaskAddDraft,
    editingSubtaskId,
    subtaskEditDraft,
    setSubtaskEditDraft,
    deleting,
    subtasks,
    doneCount,
    handleOpenChange,
    saveTitle,
    saveDescription,
    saveCategory,
    saveSubtaskAdd,
    saveSubtaskEdit,
    cancelSubtaskEdit,
    startSubtaskEdit,
    handleSubtaskToggle,
    handleSubtaskDelete,
    handleSubtaskDragEnd,
    handleDelete,
    handleAddComment,
    updateTaskFields,
    handleAssigneeToggle,
    setEditingTitle,
    setEditingDescription,
    setEditingCategory,
    setAddingSubtask,
    commentDraft,
    setCommentDraft,
    submittingComment,
    teamMembers,
  }
}
