
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

import { FaPlus, FaFilter, FaTrash, FaArrowLeft, FaUsers } from "react-icons/fa6";
import Swal from "sweetalert2";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import Teams from "./Teams";

// 1. حذفنا الـ BoardProps لأننا هنجيب الـ boardId من الـ URL

// 2. تعريف شكل الـ Column
interface ColumnType {
  id: string;
  title: string;
  boardId: string | number;
}

// 3. تعريف شكل الـ Task
interface TaskType {
  id: string;
  title: string;
  columnId: string;
  tag?: string;
  tagColor?: string;
}

export default function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [boardTitle, setBoardTitle] = useState("Loading...");
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"board" | "team">("board");

  // ==========================================
  // 1. جلب البيانات المفلترة حسب الـ boardId الحالي
  // ==========================================
  const fetchData = async () => {
    try {
      const colsRes = await fetch(
        `http://localhost:4000/columns?boardId=${boardId}`,
      );
      const colsData = await colsRes.json();
      setColumns(colsData as ColumnType[]);

      const tasksRes = await fetch("http://localhost:4000/tasks");
      const tasksData = await tasksRes.json();
      setTasks(tasksData as TaskType[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  // ==========================================
  // 2. منطق الـ Drag and Drop (حددنا نوع الـ result بـ DropResult)
  // ==========================================
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const newColumnId = destination.droppableId;

    const updatedTasks = tasks.map((task) => {
      if (task.id === draggableId) {
        return { ...task, columnId: newColumnId };
      }
      return task;
    });
    setTasks(updatedTasks);

    try {
      await fetch(`http://localhost:4000/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: newColumnId }),
      });
    } catch (error) {
      console.error("Error saving drag drop position:", error);
      fetchData();
    }
  };

  // ==========================================
  // 3. إضافة عمود جديد
  // ==========================================
  const handleAddColumn = async () => {
    const { value: columnName } = await Swal.fire({
      title: "Add New Column",
      input: "text",
      inputPlaceholder: "e.g. In Progress",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      confirmButtonText: "Add",
    });

    if (!columnName || !columnName.trim()) return;

    try {
      const res = await fetch("http://localhost:4000/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: columnName.trim(), boardId: boardId }),
      });
      const data = await res.json();
      setColumns([...columns, data as ColumnType]);
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  // ==========================================
  // 4. مسح عمود
  // ==========================================
  const handleDeleteColumn = async (columnId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the column and ALL tasks inside it!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`http://localhost:4000/columns/${columnId}`, {
          method: "DELETE",
        });
        setColumns(columns.filter((col) => col.id !== columnId));
        setTasks(tasks.filter((task) => task.columnId !== columnId));
        Swal.fire("Deleted!", "Column has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting column:", error);
      }
    }
  };

  // ==========================================
  // 5. تعديل اسم العمود بالماوس
  // ==========================================
  const handleUpdateColumnName = async (columnId: string, newTitle: string) => {
    setEditingColId(null);
    if (!newTitle || !newTitle.trim()) return;

    try {
      const res = await fetch(`http://localhost:4000/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const updatedCol = await res.json();
      setColumns(
        columns.map((col) =>
          col.id === columnId ? (updatedCol as ColumnType) : col,
        ),
      );
    } catch (error) {
      console.error("Error updating column title:", error);
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
      title: taskTitle.trim(),
      tag: "Feature",
      tagColor: "blue",
      columnId: columnId,
    };

    try {
      const res = await fetch("http://localhost:4000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      setTasks([...tasks, data as TaskType]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ==========================================
  // 7. مسح تاسك
  // ==========================================
  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`http://localhost:4000/tasks/${taskId}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
        {/* رأس البورد */}
        <div className="flex justify-between items-center mb-8 flex-shrink-0">
          <div>
            <button
              onClick={() => navigate('/workspaces')}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold mb-2 transition-colors uppercase tracking-wider"
            >
              <FaArrowLeft /> Back to Workspaces
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{boardTitle}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sprint 24 &bull; Active Board
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab(activeTab === 'team' ? 'board' : 'team')}
              className={`flex items-center gap-2 border px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm ${
                activeTab === 'team' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <FaUsers className={activeTab === 'team' ? 'text-blue-600' : 'text-gray-500'} />
              {activeTab === 'team' ? 'Back to Board' : 'Team Members'}
            </button>
            {activeTab === 'board' && (
              <button
                onClick={handleAddColumn}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
              >
                <FaPlus />
                Add Column
              </button>
            )}
          </div>
        </div>

        {activeTab === 'team' ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Teams />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 h-full items-start">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="w-80 flex-shrink-0 bg-gray-100/50 border border-gray-200 rounded-xl flex flex-col max-h-full group"
                >
                  {/* هيدر العمود */}
                  <div className="p-3 flex justify-between items-center hover:bg-gray-200/50 rounded-t-xl transition-colors">
                    {editingColId === column.id ? (
                      <input
                        type="text"
                        className="font-bold text-gray-700 bg-white border border-blue-400 rounded px-2 py-1 w-full outline-none shadow-sm"
                        defaultValue={column.title}
                        autoFocus
                        onBlur={(e) =>
                          handleUpdateColumnName(column.id, e.target.value)
                        }
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>,
                        ) => {
                          if (e.key === "Enter")
                            handleUpdateColumnName(
                              column.id,
                              e.currentTarget.value,
                            );
                        }}
                      />
                    ) : (
                      <h3
                        className="font-bold text-gray-700 cursor-pointer flex-1"
                        onClick={() => setEditingColId(column.id)}
                        title="Click to edit name"
                      >
                        {column.title}
                      </h3>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">
                        {
                          tasks.filter((task) => task.columnId === column.id)
                            .length
                        }
                      </span>
                      <button
                        onClick={() => handleDeleteColumn(column.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <FaTrash size={12} />
                      </button>
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
                        {tasks
                          .filter((task) => task.columnId === column.id)
                          .map((task, index) => (
                            <Draggable
                              key={String(task.id)}
                              draggableId={String(task.id)}
                              index={index}
                            >
                              {(provided: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-400 transition-colors group/card relative"
                                >
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity p-1"
                                  >
                                    <FaTrash size={12} />
                                  </button>

                                  <div className="flex gap-2 mb-2">
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                      {task.tag || "TASK"}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-800 pr-5">
                                    {task.title}
                                  </p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* زرار إضافة تاسك سفلي */}
                  <div className="p-3 border-t border-gray-200/50 mt-auto">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 py-2 rounded-lg transition-colors text-sm font-medium"
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
        )}
    </div>
  );
}
