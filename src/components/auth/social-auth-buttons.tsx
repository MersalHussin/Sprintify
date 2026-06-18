import { useState } from "react";
import { useNavigate } from "react-router";
import { GithubIcon, GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

interface SocialAuthButtonsProps {
  onError?: (error: string | null) => void;
  redirectTo?: string;
}

function SocialAuthButtons({ onError, redirectTo = "/dashboard" }: SocialAuthButtonsProps) {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      if (onError) onError(null);
      setLoadingGoogle(true);
      await signInWithGoogle();
      navigate(redirectTo);
    } catch (error: any) {
      console.error(error);
      if (onError) {
        onError(error.message || "Google sign-in failed.");
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="flex max-w-md items-center gap-3 sm:gap-4">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        disabled={loadingGoogle}
        onClick={handleGoogleSignIn}
        className="min-w-0 flex-1 shrink rounded-lg font-sans font-medium"
      >
        <GoogleIcon data-icon="inline-start" />
        {loadingGoogle ? "Connecting..." : "Google"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="lg"
        disabled
        className="min-w-0 flex-1 shrink rounded-lg font-sans font-medium"
      >
        <GithubIcon data-icon="inline-start" />
        Github
      </Button>
    </div>
  );
}

export { SocialAuthButtons };
