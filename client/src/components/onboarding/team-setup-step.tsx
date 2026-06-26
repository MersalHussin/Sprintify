import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextDivider } from "@/components/ui/text-divider";
import {
  createTeamSchema,
  joinTeamSchema,
  type CreateTeamFormValues,
  type JoinTeamFormValues,
} from "@/models/onboarding-schemas.zod";

export type TeamSetupStepProps = {
  readonly isSubmitting?: boolean;
  readonly onJoinTeam: (values: JoinTeamFormValues) => void | Promise<void>;
  readonly onCreateTeam: (values: CreateTeamFormValues) => void | Promise<void>;
  readonly onSkip: () => void;
};

function TeamSetupStep({
  isSubmitting = false,
  onJoinTeam,
  onCreateTeam,
  onSkip,
}: TeamSetupStepProps) {
  const joinForm = useForm<JoinTeamFormValues>({
    resolver: zodResolver(joinTeamSchema),
    defaultValues: { inviteCode: "" },
  });

  const createForm = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: { teamName: "" },
  });

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-sans text-3xl font-normal text-foreground">
          Choose your path
        </h1>
        <p className="font-sans text-lg text-foreground/70">
          Join an existing team with an invite, or create a new team for yourself
          and others.
        </p>
      </div>

      {/* Join an existing team */}
      <form
        className="flex w-full flex-col gap-2"
        onSubmit={joinForm.handleSubmit(onJoinTeam)}
        noValidate
      >
        <div className="flex w-full items-end justify-between gap-4">
          <div className="flex w-full max-w-[361px] flex-col gap-2">
            <Label
              htmlFor="inviteCode"
              className="font-sans text-base font-light text-muted-foreground"
            >
              Invite code
            </Label>
            <Input
              id="inviteCode"
              placeholder="ABC12XYZ"
              className="h-12 rounded-full px-4"
              aria-invalid={joinForm.formState.errors.inviteCode ? true : undefined}
              aria-describedby={joinForm.formState.errors.inviteCode ? "inviteCode-error" : undefined}
              {...joinForm.register("inviteCode")}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="rounded-full font-sans font-medium"
          >
            {isSubmitting ? "Joining..." : "Join Team"}
          </Button>
        </div>
        {joinForm.formState.errors.inviteCode ? (
          <FieldError id="inviteCode-error">{joinForm.formState.errors.inviteCode.message}</FieldError>
        ) : null}
      </form>

      <TextDivider label="Or" className="py-1" />

      {/* Create a new team */}
      <form
        className="flex w-full flex-col gap-2"
        onSubmit={createForm.handleSubmit(onCreateTeam)}
        noValidate
      >
        <div className="flex w-full items-end justify-between gap-4">
          <div className="flex w-full max-w-[361px] flex-col gap-2">
            <Label
              htmlFor="teamName"
              className="font-sans text-base font-light text-muted-foreground"
            >
              Team name
            </Label>
            <Input
              id="teamName"
              placeholder="Target Achievers"
              className="h-12 rounded-full px-4"
              aria-invalid={createForm.formState.errors.teamName ? true : undefined}
              aria-describedby={createForm.formState.errors.teamName ? "teamName-error" : undefined}
              {...createForm.register("teamName")}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="rounded-full font-sans font-medium"
          >
            {isSubmitting ? "Creating..." : "Create your Team"}
          </Button>
        </div>
        {createForm.formState.errors.teamName ? (
          <FieldError id="teamName-error">{createForm.formState.errors.teamName.message}</FieldError>
        ) : null}
      </form>

      <TextDivider label="Or" className="py-1" />

      <Button
        type="button"
        variant="link"
        onClick={onSkip}
        className="mx-auto font-sans text-lg text-muted-foreground"
      >
        Skip for now
      </Button>
    </div>
  );
}

export { TeamSetupStep };
