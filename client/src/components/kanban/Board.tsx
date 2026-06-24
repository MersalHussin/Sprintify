
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { FaPlus, FaFilter, FaTrash, FaArrowLeft, FaUsers } from "react-icons/fa6";
import Swal from "sweetalert2";
import { apiFetch } from "../../lib/api";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import Teams from "./Teams";

// 1. حذفنا الـ BoardProps لأننا هنجيب الـ boardId من الـ URL

// 2. تعريف شكل الـ Column (Now Hardcoded based on backend enum)
interface ColumnType {
  id: string;
  title: string;
}

const DEFAULT_COLUMNS: ColumnType[] = [
  { id: "Backlog", title: "Backlog" },
  { id: "To Do", title: "To Do" },
  { id: "In Progress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

// 3. تعريف شكل الـ Task
interface TaskType {
  _id: string;
  title: string;
  status: string; // Used instead of columnId
  priority?: string;
  tag?: string;
  tagColor?: string;
}

export default function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [boardTitle, setBoardTitle] = useState("Loading...");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [activeTab, setActiveTab] = useState<"board" | "team">("board");

  // ==========================================
  // 1. جلب البيانات المفلترة حسب الـ boardId الحالي
  // ==========================================
  const fetchData = async () => {
    if (boardId === 'dummy-workspace-1') {
      setBoardTitle("Project Alpha Workspace");
      const DUMMY_TASKS: TaskType[] = [
        { _id: "1", title: "Design sprint planning template", status: "To Do", tag: "Design", tagColor: "purple" },
        { _id: "2", title: "Set up CI/CD pipeline", status: "To Do", tag: "DevOps", tagColor: "orange" },
        { _id: "3", title: "Write API documentation", status: "To Do", tag: "Docs", tagColor: "green" },
        { _id: "4", title: "Implement user authentication", status: "In Progress", tag: "Auth", tagColor: "red" },
        { _id: "5", title: "Build notification system", status: "In Progress", tag: "Feature", tagColor: "blue" },
        { _id: "6", title: "Project setup & configuration", status: "Done", tag: "Setup", tagColor: "gray" },
        { _id: "7", title: "Design system tokens", status: "Done", tag: "Design", tagColor: "purple" },
      ];
      setTasks(DUMMY_TASKS);
      return;
    }

    try {
      // Fetch board (project) details to get title
      const projectData = await apiFetch(`/projects/${boardId}`);
      if (projectData && projectData.project) {
        setBoardTitle(projectData.project.name);
        setTeamId(projectData.project.teamId);
      } else {
        setBoardTitle("Workspace Board");
      }

      // Fetch Tasks
      const tasksData = await apiFetch(`/projects/${boardId}/tasks`);
      setTasks(tasksData?.tasks || tasksData?.items || []);
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

    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map((task) => {
      if (task._id === draggableId) {
        return { ...task, status: newStatus };
      }
      return task;
    });

    setTasks(updatedTasks);

    if (boardId === 'dummy-workspace-1') return; // Do not save dummy drag to backend

    try {
      await apiFetch(`/tasks/${draggableId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error saving drag drop position:", error);
      fetchData();
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
      status: columnId,
    };

    if (boardId === 'dummy-workspace-1') return; // Do not save dummy data to backend

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

  // ==========================================
  // 7. مسح تاسك
  // ==========================================
  const handleDeleteTask = async (taskId: string) => {
    if (boardId === 'dummy-workspace-1') return; // Do not save dummy data to backend
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: "DELETE",
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
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
              <div className="flex gap-2">
                {/* Custom Columns removed to comply with fixed backend columns */}
              </div>
            )}
          </div>
        </div>

        {activeTab === 'team' ? (
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Teams teamId={teamId} />
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-6 h-full items-start">
              {DEFAULT_COLUMNS.map((column) => (
                <div
                  key={column.id}
                  className="w-80 flex-shrink-0 bg-gray-100/50 border border-gray-200 rounded-xl flex flex-col max-h-full group"
                >
                  {/* هيدر العمود */}
                  <div className="p-3 flex justify-between items-center hover:bg-gray-200/50 rounded-t-xl transition-colors">
                    <h3 className="font-bold text-gray-700 flex-1">
                      {column.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">
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
                        {tasks
                          .filter((task) => task.status === column.id)
                          .map((task, index) => (
                            <Draggable
                              key={String(task._id)}
                              draggableId={String(task._id)}
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
                                    onClick={() => handleDeleteTask(task._id)}
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
