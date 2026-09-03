import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "USER" | "ADMIN";
}

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const { accessToken, user } = useAuth();

  // Not logged in
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Role-specific route
  if (allowedRole && user?.role !== allowedRole) {
    if (user?.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}