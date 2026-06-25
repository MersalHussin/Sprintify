import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router"
import { ClipboardList } from "lucide-react"

import { KanbanTaskCard, type KanbanTaskCardData } from "@/components/kanban/task-card"
import { TaskDetailModal } from "@/components/kanban/task-detail-modal"
import { EmptyState } from "@/components/shared/empty-state"
import { applyTaskListPatch } from "@/lib/apply-task-list-patch"
import { Skeleton } from "@/components/ui/skeleton"
import { apiFetch } from "@/lib/api"
import type { TaskListPatch } from "@/types/task"

interface TaskGroup {
  project: { _id: string; name: string }
  tasks: KanbanTaskCardData[]
}

function filterOpenTasks(groups: TaskGroup[]): TaskGroup[] {
  return groups
    .map((group) => ({
      ...group,
      tasks: group.tasks.filter((task) => task.status !== "Done"),
    }))
    .filter((group) => group.tasks.length > 0)
}

function MyTasksSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[1, 2].map((section) => (
        <div key={section} className="flex flex-col gap-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((card) => (
              <Skeleton key={card} className="h-36 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MyTasks() {
  const [groups, setGroups] = useState<TaskGroup[]>([])
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  const loadMyTasks = useCallback(async () => {
    try {
      const data = await apiFetch("/users/me/tasks")
      const nextGroups = filterOpenTasks(data?.groups ?? [])
      setGroups(nextGroups)

      const teamIds = new Set<string>()
      await Promise.all(
        nextGroups.map(async (group) => {
          try {
            const projectData = await apiFetch(`/projects/${group.project._id}`)
            const teamId = projectData?.project?.teamId
            if (teamId) teamIds.add(teamId)
          } catch {
            /* ignore */
          }
        }),
      )

      const names: Record<string, string> = {}
      await Promise.all(
        [...teamIds].map(async (teamId) => {
          try {
            const teamRes = await apiFetch(`/teams/${teamId}`)
            for (const member of teamRes?.members ?? []) {
              names[member.userId] = member.user?.name ?? ""
            }
          } catch {
            /* ignore */
          }
        }),
      )
      setAssigneeNames(names)
    } catch (error) {
      console.error("Failed to load my tasks", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMyTasks()
  }, [loadMyTasks])

  const applyTaskPatch = (patch?: TaskListPatch) => {
    if (!patch?.taskId) {
      void loadMyTasks()
      return
    }
    if (patch.deleted) {
      setGroups((prev) =>
        prev
          .map((group) => ({
            ...group,
            tasks: group.tasks.filter((task) => String(task._id) !== String(patch.taskId)),
          }))
          .filter((group) => group.tasks.length > 0),
      )
      return
    }
    setGroups((prev) =>
      filterOpenTasks(
        prev.map((group) => ({
          ...group,
          tasks: applyTaskListPatch(group.tasks, patch),
        })),
      ),
    )
    if (patch.assigneeNames) {
      setAssigneeNames((prev) => ({ ...prev, ...patch.assigneeNames }))
    }
  }

  const totalTasks = groups.reduce((sum, group) => sum + group.tasks.length, 0)

  return (
    <div className="flex flex-1 flex-col p-6 md:p-8">
      <p className="mb-8 text-sm text-muted-foreground">
        All open tasks assigned to you, grouped by project.
      </p>

      {loading ? (
        <MyTasksSkeleton />
      ) : totalTasks === 0 ? (
        <EmptyState
          variant="page"
          icon={<ClipboardList className="size-10 text-muted-foreground/60" aria-hidden="true" />}
          title="No assigned tasks"
          description="When a task is assigned to you, it will appear here grouped by project."
          action={
            <Link to="/workspaces" className="text-sm font-medium text-primary hover:underline">
              Browse workspaces
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            <section key={group.project._id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-medium text-foreground">{group.project.name}</h2>
                <Link
                  to={`/board/${group.project._id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Open board
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.tasks.map((task) => (
                  <KanbanTaskCard
                    key={task._id}
                    task={task}
                    assigneeNames={assigneeNames}
                    onClick={() => {
                      setSelectedTaskId(task._id)
                      setTaskModalOpen(true)
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <TaskDetailModal
        taskId={selectedTaskId}
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onTaskUpdated={applyTaskPatch}
      />
    </div>
  )
}
