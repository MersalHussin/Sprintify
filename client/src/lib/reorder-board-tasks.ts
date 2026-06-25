import type { DropResult } from "@hello-pangea/dnd";

export type TaskReorderUpdate = {
  taskId: string;
  status: string;
  order: number;
};

export function sortTasksByColumnOrder<T extends { order?: number; createdAt?: string }>(
  tasks: T[],
): T[] {
  return [...tasks].sort((a, b) => {
    const orderDiff = (a.order ?? 0) - (b.order ?? 0);
    if (orderDiff !== 0) return orderDiff;
    if (a.createdAt && b.createdAt) {
      return a.createdAt.localeCompare(b.createdAt);
    }
    return 0;
  });
}

export function reorderBoardTasks<T extends { _id: string; status: string; order?: number }>(
  tasks: T[],
  result: DropResult,
  columnIds: readonly string[],
): { tasks: T[]; updates: TaskReorderUpdate[] } {
  const { source, destination, draggableId } = result;
  if (!destination) return { tasks, updates: [] };
  if (source.droppableId === destination.droppableId && source.index === destination.index) {
    return { tasks, updates: [] };
  }

  const columnIdSet = new Set(columnIds);
  const byStatus = new Map<string, T[]>();
  for (const columnId of columnIds) {
    byStatus.set(
      columnId,
      sortTasksByColumnOrder(tasks.filter((task) => task.status === columnId)),
    );
  }

  const sourceList = [...(byStatus.get(source.droppableId) ?? [])];
  const fromIndex = sourceList.findIndex((task) => String(task._id) === draggableId);
  if (fromIndex === -1) return { tasks, updates: [] };

  const [moved] = sourceList.splice(fromIndex, 1);
  if (!moved) return { tasks, updates: [] };

  if (source.droppableId === destination.droppableId) {
    sourceList.splice(destination.index, 0, moved);
    byStatus.set(source.droppableId, sourceList);
  } else {
    const destList = [...(byStatus.get(destination.droppableId) ?? [])];
    destList.splice(destination.index, 0, { ...moved, status: destination.droppableId });
    byStatus.set(source.droppableId, sourceList);
    byStatus.set(destination.droppableId, destList);
  }

  const updates: TaskReorderUpdate[] = [];
  const boardTasks: T[] = [];

  for (const columnId of columnIds) {
    const list = byStatus.get(columnId) ?? [];
    list.forEach((task, order) => {
      const next = { ...task, status: columnId, order };
      boardTasks.push(next);
      updates.push({ taskId: String(task._id), status: columnId, order });
    });
  }

  const otherTasks = tasks.filter((task) => !columnIdSet.has(task.status));
  return { tasks: [...otherTasks, ...boardTasks], updates };
}
