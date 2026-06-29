import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
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
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { JoinTeamModal } from "@/components/ui/join-team-modal"

interface Team {
  _id: string
  name: string
}

interface Project {
  _id: string
  name: string
}

type AppSidebarContextValue = {
  teams: Team[]
  currentProject: Project | null
  isProjectManager: boolean
  projectOpen: boolean
  setProjectOpen: (open: boolean) => void
  openTeams: Record<string, boolean>
  setOpenTeams: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  openContact: () => void
  teamProjectsPath: (teamId: string) => string
  teamMembersPath: (teamId: string) => string
  isTeamProjectsRoute: (teamId: string) => boolean
  isTeamMembersRoute: (teamId: string) => boolean
  boardPath: string
  backlogPath: string
  isBoardRoute: boolean
  isBacklogRoute: boolean
  isProjectRoute: boolean
  isDashboard: boolean
  isMyTasks: boolean
  isSettings: boolean
  setJoinTeamOpen: (open: boolean) => void
}

const AppSidebarContext = createContext<AppSidebarContextValue | null>(null)

function useAppSidebar() {
  const context = useContext(AppSidebarContext)
  if (!context) {
    throw new Error("AppSidebar sub-components must be used within AppSidebar.")
  }
  return context
}

function AppSidebar({ children }: { children: ReactNode }) {
  const { open: openContact } = useContactModal()
  const location = useLocation()
  const { boardId, teamId: routeTeamId } = useParams()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isProjectManager, setIsProjectManager] = useState(false)
  const [projectOpen, setProjectOpen] = useState(true)
  const [openTeams, setOpenTeams] = useState<Record<string, boolean>>({})
  const [joinTeamOpen, setJoinTeamOpen] = useState(false)

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

  const value = useMemo<AppSidebarContextValue>(
    () => ({
      teams,
      currentProject,
      isProjectManager,
      projectOpen,
      setProjectOpen,
      openTeams,
      setOpenTeams,
      openContact,
      teamProjectsPath,
      teamMembersPath,
      isTeamProjectsRoute,
      isTeamMembersRoute,
      boardPath,
      backlogPath,
      isBoardRoute,
      isBacklogRoute,
      isProjectRoute,
      isDashboard,
      isMyTasks,
      isSettings,
      setJoinTeamOpen,
    }),
    [
      teams,
      currentProject,
      isProjectManager,
      projectOpen,
      openTeams,
      openContact,
      boardPath,
      backlogPath,
      isBoardRoute,
      isBacklogRoute,
      isProjectRoute,
      isDashboard,
      isMyTasks,
      isSettings,
      location.pathname,
      routeTeamId,
    ],
  )

  return (
    <AppSidebarContext.Provider value={value}>
      <Sidebar>{children}</Sidebar>
      <JoinTeamModal open={joinTeamOpen} onClose={() => setJoinTeamOpen(false)} />
    </AppSidebarContext.Provider>
  )
}

function AppSidebarBrand() {
  return (
    <SidebarHeader>
      <Button variant="ghost" asChild className="h-auto justify-start px-2 py-1">
        <Link to="/workspaces">
          <img
            src="/assets/images/logo.webp"
            alt="Sprintify"
            className="h-7 w-auto rounded object-contain"
          />
        </Link>
      </Button>
    </SidebarHeader>
  )
}

function AppSidebarMyTasksGroup() {
  const { isMyTasks } = useAppSidebar()

  return (
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
  )
}

function AppSidebarProjectGroup() {
  const {
    currentProject,
    isProjectManager,
    projectOpen,
    setProjectOpen,
    boardPath,
    backlogPath,
    isProjectRoute,
    isBacklogRoute,
    isBoardRoute,
    isDashboard,
  } = useAppSidebar()

  return (
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
  )
}

function AppSidebarTeamsGroup() {
  const {
    teams,
    openTeams,
    setOpenTeams,
    teamProjectsPath,
    teamMembersPath,
    isTeamProjectsRoute,
    isTeamMembersRoute,
    setJoinTeamOpen,
  } = useAppSidebar()

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between pr-2">
        <SidebarGroupLabel>Teams</SidebarGroupLabel>
        <button
          type="button"
          onClick={() => setJoinTeamOpen(true)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Join a team"
        >
          <UserPlus className="size-3.5" />
          <span>Join</span>
        </button>
      </div>
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
  )
}

function AppSidebarSupportMenu() {
  const { openContact, isSettings } = useAppSidebar()

  return (
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
  )
}

AppSidebar.Brand = AppSidebarBrand
AppSidebar.MyTasksGroup = AppSidebarMyTasksGroup
AppSidebar.ProjectGroup = AppSidebarProjectGroup
AppSidebar.TeamsGroup = AppSidebarTeamsGroup
AppSidebar.Separator = SidebarSeparator
AppSidebar.SupportMenu = AppSidebarSupportMenu

export default function AppSidebarLayout() {
  return (
    <AppSidebar>
      <AppSidebar.Brand />
      <AppSidebar.MyTasksGroup />
      <SidebarContent>
        <AppSidebar.ProjectGroup />
        <AppSidebar.Separator />
        <AppSidebar.TeamsGroup />
      </SidebarContent>
      <AppSidebar.SupportMenu />
    </AppSidebar>
  )
}
