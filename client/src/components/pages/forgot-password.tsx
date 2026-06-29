import { useState } from "react";
import { useLocation, Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { sendPasswordResetEmail } from "firebase/auth";
import { z } from "zod";

import { AuthLayout } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/auth-error";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setAuthError(null);
      setLoading(true);
      await sendPasswordResetEmail(auth, data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch (error: unknown) {
      console.error(error);
      setAuthError(getAuthErrorMessage(error, "An error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  });

  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        prompt="Remember your password?"
        promptActionLabel="Login"
        promptActionTo="/login"
        promptActionState={location.state}
      >
        <div className="flex w-full flex-col items-center gap-5 py-2">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="size-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-sans text-base text-foreground">
              We've sent a password reset link to
            </p>
            <p className="font-sans text-base font-medium text-foreground">
              {sentEmail}
            </p>
            <p className="font-sans text-sm text-foreground/60">
              Check your inbox and follow the link to reset your password.
              If you don't see the email, check your spam folder.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full font-sans font-medium"
            onClick={() => {
              setSent(false);
              setSentEmail("");
            }}
          >
            Send again
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      prompt="Remember your password?"
      promptActionLabel="Login"
      promptActionTo="/login"
      promptActionState={location.state}
    >
      <div className="flex w-full flex-col gap-4">
        <p className="font-sans text-sm text-foreground/60">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={onSubmit}
          noValidate
        >
          <FieldGroup className="gap-4">
            <Field className="w-full" data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="forgot-email">
                Email <span className="text-destructive" aria-hidden="true">*</span>
              </FieldLabel>
              <InputGroup className="h-12 rounded-2xl px-1">
                <InputGroupInput
                  id="forgot-email"
                  type="email"
                  placeholder="patrickjane@email.com"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "forgot-email-error" : undefined}
                  {...register("email")}
                />
                <InputGroupAddon align="inline-start" className="pr-2">
                  <Mail aria-hidden="true" className="size-5 text-foreground/80" />
                </InputGroupAddon>
              </InputGroup>
              {errors.email ? (
                <FieldError id="forgot-email-error">{errors.email.message}</FieldError>
              ) : null}
            </Field>

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
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Link
              to="/login"
              state={location.state}
              className="mx-auto flex items-center gap-2 rounded-sm font-sans text-sm text-foreground/60 underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </FieldGroup>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
