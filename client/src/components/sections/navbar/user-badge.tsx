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
      {hasAvatar ? (
        <img
          src={user.avatarUrl}
          alt={`${user.name}'s avatar`}
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          className="size-9 rounded-full object-cover outline outline-1 -outline-offset-1 outline-border"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        >
          {initials}
        </span>
      )}
    </div>
  );

  if (!onClick) return content;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {content}
    </button>
  );
}

export { UserBadge };
