import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { Check, ChevronDown, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SearchableSelectProps = {
  readonly id?: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
  readonly searchPlaceholder?: string;
  readonly emptyMessage?: string;
  readonly "aria-invalid"?: boolean;
  readonly "aria-describedby"?: string;
  readonly className?: string;
};

function SearchableSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  const selectOption = (nextValue: string) => {
    onValueChange(nextValue);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setQuery("");
      setHighlightedIndex(-1);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={id ? `${id}-listbox` : undefined}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          className={cn(
            "h-12 w-full justify-between rounded-full px-4 text-base font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground opacity-70"
          />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          <div className="relative mb-2">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={inputRef}
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-activedescendant={
                highlightedIndex >= 0 && id
                  ? `${id}-option-${highlightedIndex}`
                  : undefined
              }
              className="h-10 rounded-full pl-9"
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  return;
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setHighlightedIndex((prev) =>
                    prev < filtered.length - 1 ? prev + 1 : prev
                  );
                  return;
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                  return;
                }

                if (event.key === "Enter") {
                  event.preventDefault();
                  if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
                    selectOption(filtered[highlightedIndex].value);
                  } else if (filtered[0]) {
                    selectOption(filtered[0].value);
                  }
                }
              }}
            />
          </div>

          <ul
            id={id ? `${id}-listbox` : undefined}
            role="listbox"
            aria-label={placeholder}
            className="max-h-80 overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li key={option.value} role="presentation">
                    <Button
                      type="button"
                      variant="ghost"
                      id={id ? `${id}-option-${index}` : undefined}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "relative h-auto w-full justify-start rounded-xl py-2 pr-8 pl-3 text-base font-normal",
                        isSelected && "bg-muted/60",
                        isHighlighted && "bg-muted",
                      )}
                      onClick={() => selectOption(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {option.label}
                      {isSelected ? (
                        <Check
                          aria-hidden="true"
                          className="absolute right-3 size-4 text-primary"
                        />
                      ) : null}
                    </Button>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { SearchableSelect };
