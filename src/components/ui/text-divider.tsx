import { cn } from "@/lib/utils";

interface TextDividerProps {
  label: string;
  className?: string;
}

function TextDivider({ label, className }: TextDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-foreground/30" />
      <span className="font-sans text-xs font-normal uppercase text-foreground/70">
        {label}
      </span>
      <span className="h-px flex-1 bg-foreground/30" />
    </div>
  );
}

export { TextDivider };
