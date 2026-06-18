import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/auth-context";

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

  const handlePersonalInfo = (values: PersonalInfoFormValues) => {
    setPersonalInfo(values);
    goToStep(2);
  };

  const finishOnboarding = () => {
    navigate("/dashboard");
  };

  const handleJoinTeam = (_values: JoinTeamFormValues) => {
    void _values;
    finishOnboarding();
  };

  const handleCreateTeam = (_values: CreateTeamFormValues) => {
    void _values;
    finishOnboarding();
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
          onSubmit={handlePersonalInfo}
        />
      ) : null}

      {currentStep === 2 ? (
        <TeamSetupStep
          onJoinTeam={handleJoinTeam}
          onCreateTeam={handleCreateTeam}
          onSkip={finishOnboarding}
        />
      ) : null}
    </OnboardingShell>
  );
};

export default Onboarding;
