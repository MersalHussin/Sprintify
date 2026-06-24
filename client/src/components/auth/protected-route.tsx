import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/auth-context';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-foreground dark:bg-slate-950 dark:text-white">
        <p className="font-sans text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
