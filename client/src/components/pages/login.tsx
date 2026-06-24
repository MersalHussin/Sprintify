import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthDivider, AuthLayout, PasswordField, SocialAuthButtons, TermsText } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { loginSchema, type LoginFormValues } from "@/models/auth-schemas.zod";
import { useAuth } from "@/context/auth-context";

const Login = () => {
  const { user, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setAuthError(null);
      setLoading(true);
      await signInWithEmail(data.email, data.password);
      navigate("/ai");
    } catch (error: any) {
      console.error(error);
      setAuthError(error.message || "An error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthLayout
      title="Welcome back!"
      prompt="Don't have an account?"
      promptActionLabel="Register"
      promptActionTo="/register"
    >
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={onSubmit}
        noValidate
      >
        <FieldGroup className="gap-4">
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
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
            {loading ? "Logging in..." : "Login"}
          </Button>

          <AuthDivider />
          <SocialAuthButtons onError={setAuthError} />
          <TermsText />
        </FieldGroup>
      </form>
    </AuthLayout>
  );
};

export default Login;
