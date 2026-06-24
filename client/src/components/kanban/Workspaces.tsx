import React, { useState, useEffect, type MouseEvent } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import { apiFetch } from '../../lib/api';

// 1. تعريف شكل البورد اللي راجعة من السيرفر
interface ProjectType {
  _id: string;
  name: string;
}

export default function Workspaces() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب اللوحات من السيرفر
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Get teams
        let teamsRes = await apiFetch('/teams');
        let teams = teamsRes?.teams || [];

        // 2. If no teams, create a default one
        if (teams.length === 0) {
          const newTeamRes = await apiFetch('/teams', {
            method: 'POST',
            body: JSON.stringify({ name: 'My Workspace' })
          });
          teams = [newTeamRes.team];
        }

        const teamId = teams[0]._id;
        setCurrentTeamId(teamId);

        // 3. Get projects for the team
        const projectsRes = await apiFetch(`/teams/${teamId}/projects`);
        setProjects(projectsRes?.projects || projectsRes?.items || []);
      } catch (error) {
        console.error("Error loading workspace data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // دالة إضافة بورد جديدة
  const handleAddBoard = async () => {
    const { value: boardTitle } = await Swal.fire({
      title: 'Create New Board',
      input: 'text',
      inputPlaceholder: 'e.g. Project Phase 2',
      showCancelButton: true,
      confirmButtonColor: '#1d4ed8',
      confirmButtonText: 'Create',
      cancelButtonText: 'Cancel'
    });

    if (!boardTitle || !boardTitle.trim() || !currentTeamId) return;

    try {
      const res = await apiFetch(`/teams/${currentTeamId}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name: boardTitle.trim() })
      });
      
      const newProject = res.project;
      setProjects([...projects, newProject]); 
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // دالة مسح البورد من السيرفر والـ UI
  // 4. حددنا نوع الـ Event هنا إنه MouseEvent الخاص بالـ button
  const handleDeleteBoard = async (e: MouseEvent<HTMLButtonElement>, boardId: string | number) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will permanently delete this board!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/projects/${boardId}`, {
          method: 'DELETE'
        });
        setProjects(projects.filter(p => p._id !== boardId));
        Swal.fire('Deleted!', 'Your workspace has been deleted.', 'success');
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  if (loading) {
    return <div className="p-12 text-gray-500">Loading workspaces...</div>;
  }

  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">
        
        {/* هيدر الدش بورد */}
        <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Workspaces</h1>
          </div>
          
          <button 
            onClick={handleAddBoard}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm shadow-sm"
          >
            <FaPlus />
            Create Board
          </button>
        </div>
        
        {/* شبكة البوكسات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Dummy Workspace Card */}
          <div 
            onClick={() => navigate('/board/dummy-workspace-1')}
            className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-5 rounded-2xl font-bold text-xl cursor-pointer shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between group relative"
          >
            <span className="truncate pr-6">Project Alpha Workspace</span>
            <span className="text-xs font-normal text-indigo-200 group-hover:text-white transition-colors">Open Board →</span>
          </div>

          {projects.map(project => (
            <div 
              key={project._id}
              onClick={() => navigate(`/board/${project._id}`)}
              className="h-36 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-850 text-white p-5 rounded-2xl font-bold text-xl cursor-pointer shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col justify-between group relative"
            >
              <button
                onClick={(e) => handleDeleteBoard(e, project._id)}
                className="absolute top-4 right-4 text-blue-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                title="Delete Board"
              >
                <FaTrash size={14} />
              </button>

              <span className="truncate pr-6">{project.name}</span>
              <span className="text-xs font-normal text-blue-200 group-hover:text-white transition-colors">Open Board →</span>
            </div>
          ))}

          {/* بوكس الإضافة المتقطع */}
          <div 
            onClick={handleAddBoard}
            className="h-36 bg-gray-200/50 dark:bg-slate-800/50 hover:bg-gray-200/80 dark:hover:bg-slate-800/80 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-semibold cursor-pointer transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FaPlus size={20} />
            <span>Add New Board</span>
          </div>

        </div>
      </div>
    </div>
  );
}