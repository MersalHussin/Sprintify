import React, { useState, useEffect, type MouseEvent } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router';
import { apiFetch } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { ensureDefaultWorkspaceTeam } from '@/lib/default-workspace';
import { useSetPageTitle } from '@/context/page-title-context';
import { useAuth } from '@/context/auth-context';

// 1. تعريف شكل البورد اللي راجعة من السيرفر
interface ProjectType {
  _id: string;
  name: string;
}

export default function Workspaces() {
  const navigate = useNavigate();
  const { teamId: routeTeamId } = useParams();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>();
  const [teamOwnerId, setTeamOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useSetPageTitle(teamName ? `${teamName} — Projects` : "Projects");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const defaultTeam = await ensureDefaultWorkspaceTeam();
        const teamId = routeTeamId ?? defaultTeam._id;
        setCurrentTeamId(teamId);

        const teamRes = await apiFetch(`/teams/${teamId}`);
        if (teamRes?.team) {
          if (teamRes.team.name) setTeamName(teamRes.team.name);
          if (teamRes.team.createdBy) setTeamOwnerId(teamRes.team.createdBy);
        }

        const projectsRes = await apiFetch(`/teams/${teamId}/projects`);
        setProjects(projectsRes?.projects || projectsRes?.items || []);
      } catch (error) {
        console.error("Error loading workspace data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [routeTeamId]);

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
    return <div className="p-12 text-text-secondary">Loading workspaces...</div>;
  }

  const isOwner = user?.uid === teamOwnerId;

  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
      <div className="max-w-6xl w-full mx-auto">        
        {projects.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-lg font-medium mb-2">No boards yet</p>
            <p className="text-sm mb-6">Create your first workspace board to get started.</p>
          </div>
        ) : null}

        {/* شبكة البوكسات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map(project => (
            <div 
              key={project._id}
              onClick={() => navigate(`/board/${project._id}`)}
              className="h-36 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-850 text-primary-foreground p-5 rounded-2xl font-bold text-xl cursor-pointer border border-border-strong transition-colors duration-150 transform hover:-translate-y-1 flex flex-col justify-between group relative"
            >
              {isOwner && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => handleDeleteBoard(e, project._id)}
                  className="absolute top-4 right-4 text-blue-200 opacity-0 hover:text-red-400 group-hover:opacity-100"
                  title="Delete Board"
                >
                  <FaTrash size={14} />
                </Button>
              )}

              <span className="truncate pr-6">{project.name}</span>
              <span className="text-xs font-normal text-blue-200 group-hover:text-primary-foreground transition-colors duration-150">Open Board →</span>
            </div>
          ))}

          {/* بوكس الإضافة المتقطع - يظهر فقط للمالك */}
          {isOwner && (
            <div 
              onClick={handleAddBoard}
              className="h-36 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 bg-bg-subtle/50 text-text-secondary font-semibold cursor-pointer transition-colors duration-150 hover:border-accent hover:bg-bg-subtle hover:text-accent"
            >
              <FaPlus size={20} />
              <span>Add New Board</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}