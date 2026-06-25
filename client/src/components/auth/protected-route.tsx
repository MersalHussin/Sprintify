import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/auth-context';
import { AppLoadingScreen } from '@/components/shared/app-loading-screen';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
