import { Navigate, useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usuarioEhSuperAdmin } from "@/auth/permissions";

export function RequerSuperAdmin({ children }: { children: React.ReactNode }) {
  const { user } = usarAutenticacao();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!usuarioEhSuperAdmin(user)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
