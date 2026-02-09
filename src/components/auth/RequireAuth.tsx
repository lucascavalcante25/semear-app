import { Navigate, useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { type Role } from "@/auth/permissions";

type RequerAutenticacaoProps = {
  allowedRoles?: Role[];
  children: React.ReactNode;
};

export function RequerAutenticacao({ allowedRoles, children }: RequerAutenticacaoProps) {
  const { user } = usarAutenticacao();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
