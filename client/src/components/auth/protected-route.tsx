import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/auth-context';
import { AppLoadingScreen } from '@/components/shared/app-loading-screen';
import { needsOnboarding } from '@/lib/onboarding';

export function ProtectedRoute() {
  const { user, loading, profile, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || (user && profileLoading)) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    needsOnboarding(profile) &&
    location.pathname !== '/onboarding' &&
    location.pathname !== '/invite'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
