import { Navigate, useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";

type RequerAutenticacaoProps = {
  children: React.ReactNode;
};

export function RequerAutenticacao({ children }: RequerAutenticacaoProps) {
  const { user } = usarAutenticacao();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canAccess(user, location.pathname)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
