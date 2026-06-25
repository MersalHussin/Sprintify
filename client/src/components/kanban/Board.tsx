
import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { FaPlus } from "react-icons/fa6";
import Swal from "sweetalert2";
import { apiFetch } from "../../lib/api";
import { useSetPageTitle } from "@/context/page-title-context";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { KanbanTaskCard, type KanbanTaskCardData } from "./task-card";
import { TaskDetailModal } from "./task-detail-modal";
import type { TaskListPatch } from "@/types/task";
import { Skeleton } from "@/components/ui/skeleton";
import { applyTaskListPatch } from "@/lib/apply-task-list-patch";
import { reorderBoardTasks, sortTasksByColumnOrder } from "@/lib/reorder-board-tasks";
// 1. حذفنا الـ BoardProps لأننا هنجيب الـ boardId من الـ URL

// 2. تعريف شكل الـ Column (Now Hardcoded based on backend enum)
interface ColumnType {
  id: string;
  title: string;
}

const SPRINT_COLUMNS: ColumnType[] = [
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

const COLUMN_CARD_SKELETON_HEIGHTS = ["h-24", "h-28", "h-20"] as const;
const SPRINT_COLUMN_IDS = SPRINT_COLUMNS.map((column) => column.id);

function BoardSkeleton() {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-8 shrink-0">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full items-start">
          {SPRINT_COLUMNS.map((column) => (
            <div
              key={column.id}
              className="w-80 shrink-0 bg-bg-subtle/50 border border-border rounded-xl flex flex-col"
            >
              <div className="p-3 flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex flex-col gap-3 p-3 min-h-[150px]">
                {COLUMN_CARD_SKELETON_HEIGHTS.map((height, cardIndex) => (
                  <Skeleton key={cardIndex} className={`${height} rounded-lg`} />
                ))}
              </div>
              <div className="p-3 border-t border-border/50">
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. تعريف شكل الـ Task
type TaskType = KanbanTaskCardData;

export default function Board() {
  const { boardId } = useParams();
  const [boardTitle, setBoardTitle] = useState<string>();
  const [sprintSubtitle, setSprintSubtitle] = useState("Loading sprint...");
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  useSetPageTitle(loading ? undefined : boardTitle);

  // ==========================================
  // 1. جلب البيانات المفلترة حسب الـ boardId الحالي
  // ==========================================
  const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!boardId) return;

    try {
      const projectData = await apiFetch(`/projects/${boardId}`);
      if (projectData?.project) {
        setBoardTitle(projectData.project.name);
      } else {
        setBoardTitle("Workspace Board");
      }

      const [tasksData, sprintsData] = await Promise.all([
        apiFetch(`/projects/${boardId}/tasks`),
        apiFetch(`/projects/${boardId}/sprints`),
      ]);

      setTasks(tasksData?.tasks || tasksData?.items || []);

      const resolvedTeamId = projectData?.project?.teamId ?? null;
      if (resolvedTeamId) {
        try {
          const teamRes = await apiFetch(`/teams/${resolvedTeamId}`);
          const members = teamRes?.members ?? [];
          setAssigneeNames(
            Object.fromEntries(
              members.map((member: { userId: string; user?: { name?: string } }) => [
                member.userId,
                member.user?.name?.trim() ?? "",
              ]),
            ),
          );
        } catch {
          setAssigneeNames({});
        }
      } else {
        setAssigneeNames({});
      }

      const sprints = sprintsData?.sprints || [];
      const activeSprint = sprints.find(
        (s: { status: string }) => s.status !== "completed",
      );
      setSprintSubtitle("Active Board");
    } catch (error) {
      console.error("Error fetching data:", error);
      setSprintSubtitle("No active sprint");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [boardId]);

  // ==========================================
  // 2. منطق الـ Drag and Drop (حددنا نوع الـ result بـ DropResult)
  // ==========================================
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const { tasks: reorderedTasks, updates } = reorderBoardTasks(
      tasks,
      result,
      SPRINT_COLUMN_IDS,
    );
    if (updates.length === 0) return;

    setTasks(reorderedTasks);

    try {
      await apiFetch(`/projects/${boardId}/tasks/reorder`, {
        method: "PUT",
        body: JSON.stringify({ tasks: updates }),
      });
    } catch (error) {
      console.error("Error saving drag drop position:", error);
      fetchData({ silent: true });
    }
  };



  // ==========================================
  // 6. إضافة تاسك جديد
  // ==========================================
  const handleAddTask = async (columnId: string) => {
    const { value: taskTitle } = await Swal.fire({
      title: "Add New Task",
      input: "text",
      inputPlaceholder: "What needs to be done?",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      confirmButtonText: "Add",
    });

    if (!taskTitle || !taskTitle.trim()) return;

    const newTask = {
      name: taskTitle.trim(),
      status: columnId,
    };

    try {
      const res = await apiFetch(`/projects/${boardId}/tasks`, {
        method: "POST",
        body: JSON.stringify(newTask),
      });
      const data = res.task;
      if (data) setTasks([...tasks, data as TaskType]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const applyTaskPatch = (patch?: TaskListPatch) => {
    if (!patch?.taskId) {
      fetchData({ silent: true });
      return;
    }
    if (patch.assigneeNames) {
      setAssigneeNames((prev) => ({ ...prev, ...patch.assigneeNames }));
    }
    setTasks((prev) => applyTaskListPatch(prev, patch, { excludeStatus: "Backlog" }));
  };

  const openTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskModalOpen(true);
  };

  if (loading) {
    return <BoardSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* رأس البورد */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div>
            <p className="text-text-secondary text-sm">
              {sprintSubtitle}
            </p>
          </div>

        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 h-full items-start">
              {SPRINT_COLUMNS.map((column) => (
                <div
                  key={column.id}
                  className="w-80 shrink-0 bg-bg-subtle/50 border border-border rounded-xl flex flex-col max-h-full group"
                >
                  {/* هيدر العمود */}
                  <div className="p-3 flex justify-between items-center hover:bg-bg-subtle rounded-t-xl transition-colors duration-150">
                    <h3 className="font-bold text-text-primary flex-1">
                      {column.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-bg-inset text-text-secondary text-xs px-2 py-1 rounded-full font-bold">
                        {
                          tasks.filter((task) => task.status === column.id)
                            .length
                        }
                      </span>
                    </div>
                  </div>

                  {/* منطقة الإسقاط */}
                  <Droppable droppableId={column.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-[150px]"
                      >
                        {sortTasksByColumnOrder(
                          tasks.filter((task) => task.status === column.id),
                        ).map((task, index) => (
                            <Draggable
                              key={String(task._id)}
                              draggableId={String(task._id)}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={provided.draggableProps.style as React.CSSProperties}
                                  className="outline-none"
                                >
                                  <KanbanTaskCard
                                    task={task}
                                    assigneeNames={assigneeNames}
                                    dragHandleProps={provided.dragHandleProps}
                                    onClick={() => openTaskDetail(String(task._id))}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* زرار إضافة تاسك سفلي */}
                  <div className="p-3 border-t border-border/50 mt-auto">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="w-full flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle py-2 rounded-lg transition-colors duration-150 text-sm font-medium"
                    >
                      <FaPlus />
                      Add Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
        <TaskDetailModal
          taskId={selectedTaskId}
          open={taskModalOpen}
          onOpenChange={setTaskModalOpen}
          onTaskUpdated={applyTaskPatch}
        />
    </div>
  );
}
