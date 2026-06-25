import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

type AcceptState = "loading" | "error";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const navigate = useNavigate();
  const [state, setState] = useState<AcceptState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const acceptedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("This invitation link is invalid or missing a token.");
      return;
    }

    if (acceptedRef.current) return;
    acceptedRef.current = true;

    apiFetch(`/teams/${encodeURIComponent(token)}/accept`, { method: "POST" })
      .then((res) => {
        const teamId = res?.team?._id as string | undefined;
        navigate(teamId ? `/teams/${teamId}/members` : "/dashboard", { replace: true });
      })
      .catch((error: unknown) => {
        setState("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to accept invitation. Please try again.",
        );
      });
  }, [token, navigate]);

  if (state === "loading") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <p className="text-sm text-muted-foreground">Joining your team…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-foreground">Could not join team</h1>
      <p className="max-w-md text-sm text-muted-foreground">{errorMessage}</p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
        {token ? (
          <Button onClick={() => {
            acceptedRef.current = false;
            setState("loading");
            setErrorMessage("");
            window.location.reload();
          }}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
