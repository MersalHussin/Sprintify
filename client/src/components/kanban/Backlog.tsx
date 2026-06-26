import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { FaPlus } from "react-icons/fa6"
import Swal from "sweetalert2"

import { useSetPageTitle } from "@/context/page-title-context"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { KanbanTaskCard, type KanbanTaskCardData } from "./task-card"
import { TaskDetailModal } from "./task-detail-modal"
import type { TaskListPatch } from "@/types/task"
import { applyTaskListPatch } from "@/lib/apply-task-list-patch"
import { sortTasksByColumnOrder } from "@/lib/reorder-board-tasks"

const BACKLOG_STATUS = "Backlog"

export default function Backlog() {
  const { boardId } = useParams()
  const [projectTitle, setProjectTitle] = useState<string>()
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({})
  const [tasks, setTasks] = useState<KanbanTaskCardData[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  useSetPageTitle(projectTitle)

  const fetchData = async () => {
    if (!boardId) return

    try {
      const projectData = await apiFetch(`/projects/${boardId}`)
      if (projectData?.project) {
        setProjectTitle(projectData.project.name)
      } else {
        setProjectTitle("Backlog")
      }

      const tasksData = await apiFetch(`/projects/${boardId}/tasks`)
      const allTasks: KanbanTaskCardData[] = tasksData?.tasks || tasksData?.items || []
      setTasks(sortTasksByColumnOrder(allTasks.filter((task) => task.status === BACKLOG_STATUS)))

      const resolvedTeamId = projectData?.project?.teamId ?? null
      if (resolvedTeamId) {
        try {
          const teamRes = await apiFetch(`/teams/${resolvedTeamId}`)
          const members = teamRes?.members ?? []
          setAssigneeNames(
            Object.fromEntries(
              members.map((member: { userId: string; user?: { name?: string } }) => [
                member.userId,
                member.user?.name?.trim() ?? "",
              ]),
            ),
          )
        } catch {
          setAssigneeNames({})
        }
      } else {
        setAssigneeNames({})
      }
    } catch (error) {
      console.error("Error fetching backlog:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [boardId])

  const handleAddTask = async () => {
    const { value: taskTitle } = await Swal.fire({
      title: "Add Backlog Item",
      input: "text",
      inputPlaceholder: "What needs to be done?",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      confirmButtonText: "Add",
    })

    if (!taskTitle?.trim() || !boardId) return

    try {
      const res = await apiFetch(`/projects/${boardId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ name: taskTitle.trim(), status: BACKLOG_STATUS }),
      })
      if (res?.task) {
        setTasks((prev) => [...prev, res.task as KanbanTaskCardData])
      }
    } catch (error) {
      console.error("Error adding backlog item:", error)
    }
  }

  const applyTaskPatch = (patch?: TaskListPatch) => {
    if (!patch?.taskId) {
      fetchData()
      return
    }
    if (patch.assigneeNames) {
      setAssigneeNames((prev) => ({ ...prev, ...patch.assigneeNames }))
    }
    setTasks((prev) => applyTaskListPatch(prev, patch, { statusFilter: BACKLOG_STATUS }))
  }

  return (
    <div className="flex flex-1 flex-col p-8">
      <div className="w-full max-w-md shrink-0 rounded-xl border border-border bg-muted/40">
        <div className="flex items-center justify-between rounded-t-xl p-3">
          <h2 className="font-bold text-foreground">Backlog</h2>
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        <div className="flex flex-col gap-3 p-3">
          {sortTasksByColumnOrder(tasks).map((task) => (
            <KanbanTaskCard
              key={String(task._id)}
              task={task}
              assigneeNames={assigneeNames}
              onClick={() => {
                setSelectedTaskId(String(task._id))
                setTaskModalOpen(true)
              }}
            />
          ))}
        </div>

        <div className="border-t border-border/50 p-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleAddTask}
            className="w-full gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <FaPlus />
            Add Item
          </Button>
        </div>
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onTaskUpdated={applyTaskPatch}
      />
    </div>
  )
}
