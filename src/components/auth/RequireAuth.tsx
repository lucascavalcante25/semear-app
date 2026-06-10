import { Navigate, useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";
import { GuardAssinatura } from "@/components/auth/AssinaturaGuard";

type RequerAutenticacaoProps = {
  children: React.ReactNode;
};

export function RequerAutenticacao({ children }: RequerAutenticacaoProps) {
  const { user } = usarAutenticacao();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === "super_admin") {
    return <Navigate to="/super-admin/dashboard" replace />;
  }

  if (!canAccess(user, location.pathname)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  if (location.pathname === "/assinatura-bloqueada") {
    return <>{children}</>;
  }

  return <GuardAssinatura>{children}</GuardAssinatura>;
}
