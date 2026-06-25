import { Link, useNavigate } from "react-router"
import { LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { usePageTitle } from "@/context/page-title-context"
import {
  getAvatarBackgroundClass,
  getAvatarUrl,
  getDisplayName,
  getInitials,
} from "@/lib/user-display"
import { cn } from "@/lib/utils"

export function PageTitle({ className }: { className?: string }) {
  const title = usePageTitle()

  return (
    <h1
      className={cn(
        "truncate font-semibold text-foreground text-sm sm:text-base",
        className,
      )}
    >
      {title}
    </h1>
  )
}

export function UserMenu({ className }: { className?: string }) {
  const { user, profile, logOut } = useAuth()
  const navigate = useNavigate()
  const displayName = getDisplayName(profile, user)
  const initials = getInitials(displayName)
  const avatarUrl = getAvatarUrl(user)
  const avatarBg = getAvatarBackgroundClass(displayName)

  const handleLogout = async () => {
    await logOut()
    navigate("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <Avatar size="default">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback className={cn("font-semibold text-primary-foreground", avatarBg)}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{displayName}</span>
            {user?.email ? (
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
