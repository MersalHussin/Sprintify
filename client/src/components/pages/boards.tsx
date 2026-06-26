import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  LogOut,
  LayoutDashboard,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useSetPageTitle } from "@/context/page-title-context";
import { apiFetch } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high";

interface ApiTask {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  priority?: string;
  status: string;
  category?: string;
}

interface Card {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  comments: number;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  cards: Card[];
}

const STATUS_COLUMNS: Omit<Column, "cards">[] = [
  {
    id: "Backlog",
    title: "Backlog",
    icon: <ListTodo className="size-4" />,
    color: "bg-bg-subtle text-text-secondary",
  },
  {
    id: "To Do",
    title: "To Do",
    icon: <AlertCircle className="size-4" />,
    color: "bg-accent-subtle text-accent",
  },
  {
    id: "In Progress",
    title: "In Progress",
    icon: <Clock className="size-4" />,
    color: "bg-accent-subtle/80 text-accent",
  },
  {
    id: "Review",
    title: "Review",
    icon: <Eye className="size-4" />,
    color: "bg-priority-urgent text-priority-urgent-foreground",
  },
  {
    id: "Done",
    title: "Done",
    icon: <CheckCircle2 className="size-4" />,
    color: "bg-priority-low text-priority-low-foreground",
  },
];

function mapPriority(priority?: string): Priority {
  const normalized = priority?.toLowerCase() ?? "medium";
  if (normalized === "urgent" || normalized === "high") return "high";
  if (normalized === "low") return "low";
  return "medium";
}

function taskToCard(task: ApiTask): Card {
  return {
    id: task._id,
    title: task.name || task.title || "Untitled",
    description: task.description,
    priority: mapPriority(task.priority),
    comments: 0,
  };
}

function buildColumns(tasks: ApiTask[]): Column[] {
  return STATUS_COLUMNS.map((col) => ({
    ...col,
    cards: tasks.filter((t) => t.status === col.id).map(taskToCard),
  }));
}

/* ------------------------------------------------------------------ */
/*  Priority Badge                                                     */
/* ------------------------------------------------------------------ */

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    low: "bg-priority-low text-priority-low-foreground",
    medium: "bg-priority-medium text-priority-medium-foreground",
    high: "bg-priority-high text-priority-high-foreground",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Card Component                                                     */
/* ------------------------------------------------------------------ */

function KanbanCard({
  card,
  onDelete,
}: {
  card: Card;
  onDelete: (cardId: string) => void;
}) {
  return (
    <div className="group cursor-pointer rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <PriorityBadge priority={card.priority} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(card.id)}
          className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-destructive"
          aria-label="Delete card"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <h3 className="mb-1 font-sans text-sm font-semibold leading-snug text-foreground">
        {card.title}
      </h3>

      {card.description ? (
        <p className="mb-3 font-sans text-xs leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      ) : null}

      <div className="flex items-center gap-3 text-muted-foreground">
        {card.dueDate ? (
          <span className="inline-flex items-center gap-1 font-sans text-[11px]">
            <Calendar className="size-3" />
            {card.dueDate}
          </span>
        ) : null}
        {card.comments > 0 ? (
          <span className="inline-flex items-center gap-1 font-sans text-[11px]">
            <MessageSquare className="size-3" />
            {card.comments}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Column Component                                                   */
/* ------------------------------------------------------------------ */

function KanbanColumn({
  column,
  onAddCard,
  onDeleteCard,
}: {
  column: Column;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col rounded-2xl bg-muted/40 border border-border/40">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-sans text-xs font-semibold ${column.color}`}>
            {column.icon}
            {column.title}
          </span>
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-foreground/10 font-sans text-[10px] font-bold text-muted-foreground">
            {column.cards.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} onDelete={onDeleteCard} />
        ))}
      </div>

      <div className="px-3 pb-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onAddCard(column.id)}
          className="w-full justify-start gap-2 rounded-xl px-3 py-2.5 font-sans text-sm text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-4" />
          Add a card
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Boards Page                                                        */
/* ------------------------------------------------------------------ */

function BoardsPageSkeleton() {
  return (
    <div className="flex flex-1 gap-5 overflow-x-auto p-5 sm:p-6">
      {STATUS_COLUMNS.map((column) => (
        <div
          key={column.id}
          className="flex w-80 shrink-0 flex-col rounded-2xl bg-muted/40 border border-border/40"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="size-5 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5 px-3 py-2">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <div className="px-3 pb-3 pt-1">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

const Boards = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("My Board");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const columns = useMemo(() => buildColumns(tasks), [tasks]);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "there";

  useSetPageTitle(loading ? undefined : projectName);

  useEffect(() => {
    async function loadBoard() {
      try {
        setLoading(true);
        setLoadError(null);

        const teamsRes = await apiFetch("/teams");
        const teams = teamsRes?.teams || [];

        if (teams.length === 0) {
          setProjectId(null);
          setProjectName("No boards yet");
          setTasks([]);
          return;
        }

        const teamId = teams[0]._id;
        const projectsRes = await apiFetch(`/teams/${teamId}/projects`);
        const projects = projectsRes?.projects || projectsRes?.items || [];

        if (projects.length === 0) {
          setProjectId(null);
          setProjectName("No boards yet");
          setTasks([]);
          return;
        }

        const project = projects[0];
        setProjectId(project._id);
        setProjectName(project.name);

        const tasksData = await apiFetch(`/projects/${project._id}/tasks`);
        setTasks(tasksData?.tasks || tasksData?.items || []);
      } catch (error) {
        console.error("Error loading board:", error);
        setLoadError("Failed to load board data");
      } finally {
        setLoading(false);
      }
    }

    loadBoard();
  }, []);

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const handleAddCard = async (columnId: string) => {
    if (!projectId) return;

    const { value: taskName } = await Swal.fire({
      title: "Add New Task",
      input: "text",
      inputPlaceholder: "What needs to be done?",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      confirmButtonText: "Add",
    });

    if (!taskName?.trim()) return;

    try {
      const res = await apiFetch(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ name: taskName.trim(), status: columnId }),
      });
      if (res?.task) {
        setTasks((prev) => [...prev, res.task]);
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteCard = async (taskId: string) => {
    const result = await Swal.fire({
      title: "Delete task?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <LayoutDashboard className="size-5" />
              </div>
              <span className="font-heading text-xl italic text-foreground">
                Sprintify
              </span>
            </div>

            <div className="hidden h-6 w-px bg-border sm:block" />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-sans text-sm text-foreground sm:block">
              Hello,{" "}
              <span className="font-semibold text-primary">{displayName}</span>
            </span>

            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className="size-8 rounded-full ring-2 ring-primary/20"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-sans text-sm font-bold text-primary">
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 rounded-lg font-sans text-sm text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        {loading ? (
          <BoardsPageSkeleton />
        ) : loadError ? (
          <p className="p-5 font-sans text-sm text-destructive sm:p-6">{loadError}</p>
        ) : !projectId ? (
          <div className="flex flex-col items-start gap-4 p-5 sm:p-6">
            <p className="font-sans text-sm text-muted-foreground">
              No projects found. Create a board from Workspaces to get started.
            </p>
            <Button onClick={() => navigate("/workspaces")}>Go to Workspaces</Button>
          </div>
        ) : (
          <div className="flex flex-1 gap-5 overflow-x-auto p-5 sm:p-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Boards;
