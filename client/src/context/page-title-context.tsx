import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useLocation } from "react-router"

const ROUTE_TITLES: Record<string, string> = {
  "/my-tasks": "My Tasks",
  "/workspaces": "Workspaces",
  "/dashboard": "Task Generation AI",
  "/settings": "Settings",
  "/boards": "Board",
  "/kanban": "Kanban",
}

function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith("/board/")) return "Sprint"
  if (pathname.startsWith("/backlog/")) return "Backlog"
  if (/^\/teams\/[^/]+\/projects$/.test(pathname)) return "Projects"
  if (/^\/teams\/[^/]+\/members$/.test(pathname)) return "Team Members"
  return "Sprintify"
}

const PageTitleContext = createContext<{
  override: string | null
  setOverride: (title: string | null) => void
} | null>(null)

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [override, setOverride] = useState<string | null>(null)

  useEffect(() => {
    setOverride(null)
  }, [location.pathname])

  const value = useMemo(() => ({ override, setOverride }), [override])

  return (
    <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>
  )
}

export function usePageTitle(): string {
  const location = useLocation()
  const ctx = useContext(PageTitleContext)
  const base = getRouteTitle(location.pathname)
  return ctx?.override ?? base
}

export function useSetPageTitle(title: string | undefined) {
  const ctx = useContext(PageTitleContext)
  const location = useLocation()

  useEffect(() => {
    if (title) ctx?.setOverride(title)
    return () => ctx?.setOverride(null)
  }, [title, location.pathname, ctx])
}
