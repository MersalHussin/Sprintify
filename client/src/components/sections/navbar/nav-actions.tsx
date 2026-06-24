import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  if (variant === "logged-in" && user) {
    return <UserBadge user={user} onClick={isMobile ? onNavigate : undefined} />;
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
      {getStartedButton}
      {loginButton}
    </>
  ) : (
    <>
      {loginButton}
      {getStartedButton}
    </>
  );
}

export { NavActions };
