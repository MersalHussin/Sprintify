import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  LogOut,
  LayoutDashboard,
  MoreHorizontal,
  GripVertical,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high";

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

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    icon: <AlertCircle className="size-4" />,
    color: "bg-blue-500/15 text-blue-700",
    cards: [
      {
        id: "1",
        title: "Design sprint planning template",
        description: "Create reusable templates for sprint planning sessions",
        priority: "high",
        comments: 3,
        dueDate: "Jun 25",
      },
      {
        id: "2",
        title: "Set up CI/CD pipeline",
        priority: "medium",
        comments: 1,
        dueDate: "Jun 28",
      },
      {
        id: "3",
        title: "Write API documentation",
        description: "Document all REST endpoints for the team API",
        priority: "low",
        comments: 0,
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: <Clock className="size-4" />,
    color: "bg-amber-500/15 text-amber-700",
    cards: [
      {
        id: "4",
        title: "Implement user authentication",
        description: "Firebase email/password + Google OAuth",
        priority: "high",
        comments: 5,
        dueDate: "Jun 22",
      },
      {
        id: "5",
        title: "Build notification system",
        priority: "medium",
        comments: 2,
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    icon: <CheckCircle2 className="size-4" />,
    color: "bg-emerald-500/15 text-emerald-700",
    cards: [
      {
        id: "6",
        title: "Project setup & configuration",
        description: "Initialize repo, Vite, Tailwind, ESLint",
        priority: "low",
        comments: 0,
        dueDate: "Jun 18",
      },
      {
        id: "7",
        title: "Design system tokens",
        priority: "medium",
        comments: 4,
        dueDate: "Jun 19",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Priority Badge                                                     */
/* ------------------------------------------------------------------ */

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
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

function KanbanCard({ card }: { card: Card }) {
  return (
    <div className="group cursor-pointer rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <PriorityBadge priority={card.priority} />
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground/50 opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
          aria-label="Card options"
        >
          <MoreHorizontal className="size-4" />
        </button>
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
}: {
  column: Column;
  onAddCard: (columnId: string) => void;
}) {
  return (
    <div className="flex w-80 shrink-0 flex-col rounded-2xl bg-muted/40 border border-border/40">
      {/* Column header */}
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
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Column options"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {column.cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}
      </div>

      {/* Add card button */}
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={() => onAddCard(column.id)}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-sans text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
          Add a card
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WorkspaceBoard Page                                                */
/* ------------------------------------------------------------------ */

interface WorkspaceBoardProps {
  boardId?: string | number;
  boardTitle?: string;
  onBack?: () => void;
}

const WorkspaceBoard = ({ boardTitle, onBack }: WorkspaceBoardProps) => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "there";

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  const handleAddCard = (columnId: string) => {
    const newCard: Card = {
      id: Date.now().toString(),
      title: "New task",
      priority: "medium",
      comments: 0,
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col,
      ),
    );
  };

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left side */}
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

            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
            )}

            <h1 className="hidden font-sans text-sm font-medium text-muted-foreground sm:block">
              {boardTitle || "My Board"}
            </h1>
          </div>

          {/* Right side */}
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

      {/* Board area */}
      <main className="flex flex-1 gap-5 overflow-x-auto p-5 sm:p-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onAddCard={handleAddCard}
          />
        ))}

        {/* Add column button */}
        <div className="flex w-80 shrink-0 items-start">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-2xl border-2 border-dashed border-border/50 px-4 py-4 font-sans text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-5" />
            Add another list
          </button>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceBoard;