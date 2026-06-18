import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  professionalTitle: z
    .string()
    .min(1, "Professional title is required"),
  gender: z.string().min(1, "Please select your gender"),
  country: z.string().min(1, "Please select your country"),
  timezone: z.string().min(1, "Please select your timezone"),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export const joinTeamSchema = z.object({
  inviteCode: z.string().min(1, "Enter an invite code to join a team"),
});

export type JoinTeamFormValues = z.infer<typeof joinTeamSchema>;

export const createTeamSchema = z.object({
  teamName: z
    .string()
    .min(1, "Team name is required")
    .min(2, "Team name must be at least 2 characters"),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
