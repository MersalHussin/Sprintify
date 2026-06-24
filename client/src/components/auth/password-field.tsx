import * as React from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export type PasswordFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly autoComplete?: string;
  readonly placeholder?: string;
  readonly error?: string;
} & Omit<
  React.ComponentProps<"input">,
  "id" | "type" | "placeholder" | "required"
>;

function PasswordField({
  id,
  label,
  description,
  autoComplete,
  placeholder = "********",
  error,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleLabel = showPassword
    ? `Hide ${label.toLowerCase()}`
    : `Show ${label.toLowerCase()}`;

  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <Field className="w-full" data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label} <span className="text-destructive" aria-hidden="true">*</span>
      </FieldLabel>
      <InputGroup className="h-12 rounded-2xl px-1">
        <InputGroupInput
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : descriptionId}
          className={className}
          {...inputProps}
        />
        <InputGroupAddon align="inline-start" className="pr-2">
          <KeyRound aria-hidden="true" className="size-5 text-foreground/80" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={toggleLabel}
            aria-controls={id}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <span className="relative grid size-4 place-items-center" aria-hidden="true">
              <Eye
                className={cn(
                  "text-foreground/80 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  showPassword
                    ? "scale-[0.25] opacity-0 blur-[4px]"
                    : "scale-100 opacity-100 blur-[0px]",
                )}
              />
              <EyeOff
                className={cn(
                  "absolute inset-0 text-foreground/80 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  showPassword
                    ? "scale-100 opacity-100 blur-[0px]"
                    : "scale-[0.25] opacity-0 blur-[4px]",
                )}
              />
            </span>
          </Button>
        </InputGroupAddon>
      </InputGroup>
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
    </Field>
  );
}

export { PasswordField };
