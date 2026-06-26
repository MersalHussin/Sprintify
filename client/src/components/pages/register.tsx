import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthDivider, AuthLayout, PasswordField, SocialAuthButtons, TermsText } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { registerSchema, type RegisterFormValues } from "@/models/auth-schemas.zod";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api";
import { getRedirectPath } from "@/lib/redirect-after-auth";
import { getAuthErrorMessage } from "@/lib/auth-error";

const Register = () => {
  const { user, signUpWithEmail, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirectPath(location, "/onboarding");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setAuthError(null);
      setLoading(true);
      await signUpWithEmail(data.email, data.password, data.username);
      
      try {
        await apiFetch('/users/me', {
          method: 'PATCH',
          body: JSON.stringify({ firstName: data.username, lastName: '' })
        });
        await refreshProfile();
      } catch (e) {
        console.error("Failed to sync name to backend", e);
      }
      
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      console.error(error);
      setAuthError(getAuthErrorMessage(error, "An error occurred during registration."));
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout>
      <AuthLayout.Title>Welcome aboard!</AuthLayout.Title>
      <AuthLayout.Prompt>
        <span className="font-normal">Already an existing member? </span>
        <AuthLayout.PromptLink to="/login" state={location.state}>
          Login
        </AuthLayout.PromptLink>
      </AuthLayout.Prompt>
      <AuthLayout.Form>
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={onSubmit}
        noValidate
      >
        <FieldGroup className="gap-4">
          <Field className="w-full" data-invalid={errors.username ? true : undefined}>
            <FieldLabel htmlFor="username">
              Username <span className="text-destructive" aria-hidden="true">*</span>
            </FieldLabel>
            <InputGroup className="h-12 rounded-2xl px-1">
              <InputGroupInput
                id="username"
                placeholder="patrickjane"
                autoComplete="username"
                aria-invalid={errors.username ? true : undefined}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username")}
              />
              <InputGroupAddon align="inline-start" className="pr-2">
                <User aria-hidden="true" className="size-5 text-foreground/80" />
              </InputGroupAddon>
            </InputGroup>
            {errors.username ? (
              <FieldError id="username-error">{errors.username.message}</FieldError>
            ) : null}
          </Field>

          <Field className="w-full" data-invalid={errors.email ? true : undefined}>
            <FieldLabel htmlFor="email">
              Email <span className="text-destructive" aria-hidden="true">*</span>
            </FieldLabel>
            <InputGroup className="h-12 rounded-2xl px-1">
              <InputGroupInput
                id="email"
                type="email"
                placeholder="patrickjane@email.com"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              <InputGroupAddon align="inline-start" className="pr-2">
                <Mail aria-hidden="true" className="size-5 text-foreground/80" />
              </InputGroupAddon>
            </InputGroup>
            {errors.email ? (
              <FieldError id="email-error">{errors.email.message}</FieldError>
            ) : null}
          </Field>

          <PasswordField
            id="password"
            label="Password"
            description="Passwords must be at least 8 characters long"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordField
            id="confirm-password"
            label="Confirm password"
            description="Both passwords must match"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {authError ? (
            <p
              role="status"
              className="text-center text-sm text-destructive"
            >
              {authError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={loading}
            className="w-full rounded-full font-sans font-medium"
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <AuthDivider />
          <SocialAuthButtons onError={setAuthError} redirectTo="/onboarding" />
          <TermsText />
        </FieldGroup>
      </form>
      </AuthLayout.Form>
    </AuthLayout>
  );
};

export default Register;
