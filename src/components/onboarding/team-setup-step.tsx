import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TextDivider } from "@/components/ui/text-divider";
import {
  createTeamSchema,
  joinTeamSchema,
  type CreateTeamFormValues,
  type JoinTeamFormValues,
} from "@/models/onboarding-schemas.zod";

export type TeamSetupStepProps = {
  readonly onJoinTeam: (values: JoinTeamFormValues) => void;
  readonly onCreateTeam: (values: CreateTeamFormValues) => void;
  readonly onSkip: () => void;
};

function TeamSetupStep({ onJoinTeam, onCreateTeam, onSkip }: TeamSetupStepProps) {
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
            <label
              htmlFor="inviteCode"
              className="font-sans text-base font-light text-muted-foreground"
            >
              Invite code
            </label>
            <Input
              id="inviteCode"
              placeholder="ExampleCode"
              className="h-12 rounded-full px-4"
              aria-invalid={joinForm.formState.errors.inviteCode ? true : undefined}
              aria-describedby={joinForm.formState.errors.inviteCode ? "inviteCode-error" : undefined}
              {...joinForm.register("inviteCode")}
            />
          </div>
          <Button type="submit" size="lg" className="rounded-full font-sans font-medium">
            Join Team
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
            <label
              htmlFor="teamName"
              className="font-sans text-base font-light text-muted-foreground"
            >
              Team name
            </label>
            <Input
              id="teamName"
              placeholder="Target Achievers"
              className="h-12 rounded-full px-4"
              aria-invalid={createForm.formState.errors.teamName ? true : undefined}
              aria-describedby={createForm.formState.errors.teamName ? "teamName-error" : undefined}
              {...createForm.register("teamName")}
            />
          </div>
          <Button type="submit" size="lg" className="rounded-full font-sans font-medium">
            Create your Team
          </Button>
        </div>
        {createForm.formState.errors.teamName ? (
          <FieldError id="teamName-error">{createForm.formState.errors.teamName.message}</FieldError>
        ) : null}
      </form>

      <TextDivider label="Or" className="py-1" />

      <button
        type="button"
        onClick={onSkip}
        className="mx-auto rounded-sm font-sans text-lg text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Skip for now
      </button>
    </div>
  );
}

export { TeamSetupStep };
