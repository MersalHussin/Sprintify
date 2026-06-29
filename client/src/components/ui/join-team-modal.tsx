import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { UserPlus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import {
  joinTeamSchema,
  type JoinTeamFormValues,
} from "@/models/onboarding-schemas.zod";

interface JoinTeamModalProps {
  open: boolean;
  onClose: () => void;
}

function JoinTeamModal({ open, onClose }: JoinTeamModalProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: { inviteCode: "" },
  });

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* Focus input on open */
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* Reset state when modal closes */
  useEffect(() => {
    if (!open) {
      reset();
      setApiError(null);
      setSuccess(false);
    }
  }, [open, reset]);

  const onSubmit = useCallback(
    handleSubmit(async (data) => {
      try {
        setApiError(null);
        setIsSubmitting(true);
        const res = await apiFetch(`/teams/${encodeURIComponent(data.inviteCode)}`, {
          method: "POST",
        });
        setSuccess(true);
        const teamId = res?.team?._id as string | undefined;
        setTimeout(() => {
          onClose();
          navigate(teamId ? `/teams/${teamId}/members` : "/workspaces", { replace: false });
          // Force reload sidebar data
          window.location.reload();
        }, 1200);
      } catch (error) {
        console.error(error);
        setApiError(
          error instanceof Error
            ? error.message
            : "Failed to join team. Please check your invite code and try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }),
    [handleSubmit, onClose, navigate]
  );

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-team-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300",
        )}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close join team dialog"
          className="absolute end-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <UserPlus className="size-6 text-primary" />
          </div>
          <h3
            id="join-team-modal-title"
            className="font-heading text-2xl italic text-foreground"
          >
            Join a Team
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the invite code shared by your team to join them on Sprintify.
          </p>
        </div>

        {/* Content */}
        {success ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="size-7 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">
              You're in!
            </p>
            <p className="text-sm text-muted-foreground">
              You've successfully joined the team. Redirecting...
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="join-team-invite-code"
                className="font-sans text-sm font-medium text-foreground"
              >
                Invite Code
              </label>
              {(() => {
                const { ref: registerRef, ...registerRest } = register("inviteCode");
                return (
                  <Input
                    ref={(el) => {
                      registerRef(el);
                      inputRef.current = el;
                    }}
                    id="join-team-invite-code"
                    placeholder="ABC12XYZ"
                    className="h-12 rounded-full px-4"
                    aria-invalid={errors.inviteCode ? true : undefined}
                    aria-describedby={errors.inviteCode ? "join-invite-error" : undefined}
                    {...registerRest}
                  />
                );
              })()}
              {errors.inviteCode ? (
                <FieldError id="join-invite-error">{errors.inviteCode.message}</FieldError>
              ) : null}
            </div>

            {apiError ? (
              <p
                role="status"
                className="text-center text-sm text-destructive"
              >
                {apiError}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? "Joining..." : "Join Team"}
              <UserPlus data-icon="inline-end" aria-hidden="true" />
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export { JoinTeamModal };
