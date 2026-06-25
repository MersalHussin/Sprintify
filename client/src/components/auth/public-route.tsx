import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/auth-context';
import { needsOnboarding } from '@/lib/onboarding';

export function PublicRoute() {
  const { user, loading, profile, profileLoading } = useAuth();

  if (loading || (user && profileLoading)) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-foreground dark:bg-slate-950 dark:text-white">
        <p className="font-sans text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to={needsOnboarding(profile) ? "/onboarding" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}
