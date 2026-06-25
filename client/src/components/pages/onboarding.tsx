import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";

import {
  OnboardingShell,
  PersonalInfoStep,
  TeamSetupStep,
  WelcomeStep,
  type StepDirection,
} from "@/components/onboarding";
import type {
  CreateTeamFormValues,
  JoinTeamFormValues,
  PersonalInfoFormValues,
} from "@/models/onboarding-schemas.zod";

const EMPTY_PERSONAL_INFO: PersonalInfoFormValues = {
  firstName: "",
  lastName: "",
  professionalTitle: "",
  gender: "",
  country: "",
  timezone: "",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<StepDirection>("forward");
  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfoFormValues>(EMPTY_PERSONAL_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? "forward" : "backward");
    setCurrentStep(step);
  };

  const handleStepClick = (step: number) => {
    if (step >= currentStep) {
      return;
    }

    goToStep(step);
  };

  const handlePersonalInfo = async (values: PersonalInfoFormValues) => {
    try {
      setIsSubmitting(true);
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          professionalTitle: values.professionalTitle,
          gender: values.gender,
          country: values.country,
          timezone: values.timezone,
        }),
      });
      setPersonalInfo(values);
      goToStep(2);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishOnboarding = () => {
    navigate("/dashboard");
  };

  const handleJoinTeam = async (values: JoinTeamFormValues) => {
    try {
      setIsSubmitting(true);
      await apiFetch(`/teams/${encodeURIComponent(values.inviteCode)}`, {
        method: "POST",
      });
      finishOnboarding();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to join team. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTeam = async (values: CreateTeamFormValues) => {
    try {
      setIsSubmitting(true);
      await apiFetch("/teams", {
        method: "POST",
        body: JSON.stringify({ name: values.teamName }),
      });
      finishOnboarding();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create team. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingShell
      currentStep={currentStep}
      direction={direction}
      center={currentStep === 0}
      onStepClick={handleStepClick}
    >
      {currentStep === 0 ? (
        <WelcomeStep
          username={user?.displayName ?? undefined}
          onContinue={() => goToStep(1)}
        />
      ) : null}

      {currentStep === 1 ? (
        <PersonalInfoStep
          defaultValues={personalInfo}
          isSubmitting={isSubmitting}
          onSubmit={handlePersonalInfo}
        />
      ) : null}

      {currentStep === 2 ? (
        <TeamSetupStep
          isSubmitting={isSubmitting}
          onJoinTeam={handleJoinTeam}
          onCreateTeam={handleCreateTeam}
          onSkip={finishOnboarding}
        />
      ) : null}
    </OnboardingShell>
  );
};

export default Onboarding;
