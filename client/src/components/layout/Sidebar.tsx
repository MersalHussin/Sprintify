import { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import {
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"

import { useContactModal } from "@/context/contact-modal-context"
import { apiFetch } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface Team {
  _id: string
  name: string
}

interface Project {
  _id: string
  name: string
}

export default function AppSidebar() {
  const { open: openContact } = useContactModal()
  const location = useLocation()
  const { boardId, teamId: routeTeamId } = useParams()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isProjectManager, setIsProjectManager] = useState(false)
  const [projectOpen, setProjectOpen] = useState(true)
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadSidebarData() {
      try {
        const teamsRes = await apiFetch("/teams")
        const loadedTeams: Team[] = teamsRes?.teams || []
        setTeams(loadedTeams)

        const activeProjectId = boardId
        if (activeProjectId) {
          const projectRes = await apiFetch(`/projects/${activeProjectId}`)
          if (projectRes?.project) {
            setCurrentProject(projectRes.project)
            setIsProjectManager(projectRes.callerRole === "manager")
            return
          }
        }

        const teamId = loadedTeams[0]?._id
        if (!teamId) {
          setIsProjectManager(false)
          return
        }

        const projectsRes = await apiFetch(`/teams/${teamId}/projects`)
        const projects: Project[] = projectsRes?.projects || projectsRes?.items || []
        const fallbackProject = projects[0] ?? null
        setCurrentProject(fallbackProject)

        if (fallbackProject) {
          const projectRes = await apiFetch(`/projects/${fallbackProject._id}`)
          setIsProjectManager(projectRes?.callerRole === "manager")
        } else {
          setIsProjectManager(false)
        }
      } catch (error) {
        console.error("Failed to load sidebar data", error)
      }
    }

    loadSidebarData()
  }, [boardId])

  useEffect(() => {
    if (!routeTeamId) return
    setOpenTeams((prev) => ({ ...prev, [routeTeamId]: true }))
  }, [routeTeamId])

  const teamProjectsPath = (teamId: string) => `/teams/${teamId}/projects`
  const teamMembersPath = (teamId: string) => `/teams/${teamId}/members`

  const isTeamProjectsRoute = (teamId: string) =>
    location.pathname === teamProjectsPath(teamId) ||
    (location.pathname === "/workspaces" && teams[0]?._id === teamId && !routeTeamId)

  const isTeamMembersRoute = (teamId: string) =>
    location.pathname === teamMembersPath(teamId)

  const projectId = currentProject?._id
  const boardPath = projectId ? `/board/${projectId}` : "/workspaces"
  const backlogPath = projectId ? `/backlog/${projectId}` : "/workspaces"
  const isBoardRoute = location.pathname.startsWith("/board/")
  const isBacklogRoute = location.pathname.startsWith("/backlog/")
  const isProjectRoute = isBoardRoute || isBacklogRoute
  const isDashboard = location.pathname === "/dashboard"
  const isMyTasks = location.pathname === "/my-tasks"
  const isSettings = location.pathname === "/settings"

  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/workspaces" className="flex items-center gap-2 px-2 py-1">
          <img
            src="/assets/images/logo.webp"
            alt="Sprintify"
            className="h-7 w-auto rounded object-contain"
          />
        </Link>
      </SidebarHeader>

      <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isMyTasks}>
                  <Link to="/my-tasks">
                    <ClipboardList className="text-sidebar-foreground/70" />
                    <span>My Tasks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      <SidebarContent>
        <SidebarGroup>
          <Collapsible open={projectOpen} onOpenChange={setProjectOpen}>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="group/label flex w-full items-center">
                <span className="truncate">Current Project</span>
                <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/label:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={isProjectRoute} className="font-medium">
                      <FolderKanban className="text-sidebar-foreground/70" />
                      <span className="truncate">{currentProject?.name ?? "No project"}</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isBacklogRoute}>
                          <Link to={backlogPath}>
                            <ListTodo />
                            <span>Backlog</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isBoardRoute}>
                          <Link to={boardPath}>
                            <LayoutDashboard />
                            <span>Sprint</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {isProjectManager ? (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isDashboard}>
                            <Link to="/dashboard">
                              <Sparkles />
                              <span>Task Generation AI</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ) : null}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Teams</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teams.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Users />
                    <span>No teams yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                teams.map((team) => {
                  const teamOpen = openTeams[team._id] ?? false
                  const teamActive =
                    isTeamProjectsRoute(team._id) || isTeamMembersRoute(team._id)

                  return (
                    <Collapsible
                      key={team._id}
                      className="group/collapsible"
                      open={teamOpen}
                      onOpenChange={(open) =>
                        setOpenTeams((prev) => ({ ...prev, [team._id]: open }))
                      }
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={teamActive}>
                            <ChevronRight className="size-3.5 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            <Users className="text-sidebar-foreground/70" />
                            <span className="truncate">{team.name}</span>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isTeamProjectsRoute(team._id)}
                              >
                                <Link to={teamProjectsPath(team._id)}>
                                  <FolderKanban />
                                  <span>Projects</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isTeamMembersRoute(team._id)}
                              >
                                <Link to={teamMembersPath(team._id)}>
                                  <Users />
                                  <span>Team members</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => openContact()}>
              <CircleHelp />
              <span>Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isSettings}>
              <Link to="/settings">
                <Settings />
                <span>User Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
