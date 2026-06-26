import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export type NavbarUser = {
  readonly name: string;
  readonly avatarUrl?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return parts[0]!.charAt(0).toUpperCase() + parts[parts.length - 1]!.charAt(0).toUpperCase();
}

function UserBadge({ user, onClick }: { readonly user: NavbarUser; readonly onClick?: () => void }) {
  const initials = getInitials(user.name);
  const hasAvatar = Boolean(user.avatarUrl);

  const content = (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-foreground">
        Welcome, <span className="font-semibold">{user.name}</span>
      </span>
      <Avatar className="size-9">
        {hasAvatar ? (
          <AvatarImage src={user.avatarUrl} alt={`${user.name}'s avatar`} />
        ) : null}
        <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );

  if (!onClick) return content;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="min-h-10 rounded-full"
    >
      {content}
    </Button>
  );
}

export { UserBadge };
