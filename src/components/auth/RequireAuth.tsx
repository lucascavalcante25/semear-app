import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { type Role } from "@/auth/permissions";

type RequireAuthProps = {
  allowedRoles?: Role[];
  children: React.ReactNode;
};

export function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
