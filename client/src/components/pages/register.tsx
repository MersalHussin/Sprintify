import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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

const Register = () => {
  const { user, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
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
      
      // Update backend with the user's name
      try {
        await apiFetch('/users/me', {
          method: 'PATCH',
          body: JSON.stringify({ firstName: data.username, lastName: '' })
        });
      } catch (e) {
        console.error("Failed to sync name to backend", e);
      }
      
      navigate("/onboarding");
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Welcome aboard!"
      prompt="Already an existing member?"
      promptActionLabel="Login"
      promptActionTo="/login"
    >
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
    </AuthLayout>
  );
};

export default Register;
