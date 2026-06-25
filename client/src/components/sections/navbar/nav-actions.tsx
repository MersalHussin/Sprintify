import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { FaMoon, FaSun } from "react-icons/fa6";

import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";

import { UserBadge, type NavbarUser } from "./user-badge";

export type NavbarVariant = "default" | "logged-in";

export type NavActionsProps = {
  readonly variant: NavbarVariant;
  readonly user?: NavbarUser;
  readonly onGetStarted?: () => void;
  readonly onNavigate?: () => void;
  readonly layout?: "desktop" | "mobile";
};

function NavActions({
  variant,
  user,
  onGetStarted,
  onNavigate,
  layout = "desktop",
}: NavActionsProps) {
  const isMobile = layout === "mobile";
  const { user: authUser, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const themeToggle = (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className={cn(isMobile && "w-full flex items-center justify-center")}
      title="Toggle theme"
    >
      {theme === "dark" ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-text-secondary" />}
    </Button>
  );

  if (!loading && authUser) {
    return (
      <>
        {themeToggle}
        <UserMenu />
      </>
    );
  }

  if (variant === "logged-in" && user) {
    return (
      <>
        {themeToggle}
        <UserBadge user={user} onClick={isMobile ? onNavigate : undefined} />
      </>
    );
  }

  const handleGetStarted = () => {
    onNavigate?.();
    onGetStarted?.();
  };

  const loginButton = (
    <Button
      asChild
      variant="secondary"
      size="lg"
      className={cn(isMobile ? "w-full" : "rounded-full")}
    >
      <Link to="/login" onClick={onNavigate}>
        Login
      </Link>
    </Button>
  );

  const getStartedButton = (
    <Button
      asChild
      variant="default"
      size="lg"
      className={cn(isMobile ? "w-full" : "rounded-full")}
    >
      <Link to="/register" onClick={handleGetStarted}>
        Get Started
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </Link>
    </Button>
  );

  return isMobile ? (
    <>
      {themeToggle}
      {getStartedButton}
      {loginButton}
    </>
  ) : (
    <>
      {themeToggle}
      {loginButton}
      {getStartedButton}
    </>
  );
}

export { NavActions };
