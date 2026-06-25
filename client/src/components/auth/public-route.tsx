import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/auth-context';
import { needsOnboarding } from '@/lib/onboarding';
import { AppLoadingScreen } from '@/components/shared/app-loading-screen';

export function PublicRoute() {
  const { user, loading, profile, profileLoading } = useAuth();

  if (loading || (user && profileLoading)) {
    return <AppLoadingScreen />;
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
