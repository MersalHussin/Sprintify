import { PageTitle, UserMenu } from "@/components/layout/user-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { FaMoon, FaSun } from "react-icons/fa6"

export default function AppNavbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="md:hidden" />
      <PageTitle className="min-w-0 max-w-[50vw] sm:max-w-none" />
      <div className="flex-1" />
      <Button variant="ghost" size="icon-sm" onClick={toggleTheme} title="Toggle theme">
        {theme === "dark" ? (
          <FaSun className="text-yellow-500" />
        ) : (
          <FaMoon className="text-muted-foreground" />
        )}
      </Button>
      <UserMenu />
    </header>
  )
}
