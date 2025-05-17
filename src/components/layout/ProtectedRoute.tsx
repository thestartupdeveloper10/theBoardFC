import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = {
  requireAdmin?: boolean;
};

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Not signed in
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Admin routes protection
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/player/dashboard" replace />;
  }

  return <Outlet />;
} 