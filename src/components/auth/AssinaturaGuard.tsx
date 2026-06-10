import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { obterAssinaturaAcesso } from "@/modules/admin/api";
import { Loader2 } from "lucide-react";

const ROTAS_LIBERADAS_BLOQUEIO = ["/assinatura-bloqueada", "/suporte", "/configuracoes"];

type AssinaturaGuardProps = {
  children: React.ReactNode;
};

export function GuardAssinatura({ children }: AssinaturaGuardProps) {
  const { user } = usarAutenticacao();
  const location = useLocation();
  const [carregando, setCarregando] = useState(true);
  const [acessoPermitido, setAcessoPermitido] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const rotaLiberada = ROTAS_LIBERADAS_BLOQUEIO.some(
    (r) => location.pathname === r || location.pathname.startsWith(`${r}/`),
  );

  useEffect(() => {
    if (!user || user.role === "super_admin") {
      setCarregando(false);
      setAcessoPermitido(true);
      return;
    }

    let cancelado = false;
    const verificar = async () => {
      setCarregando(true);
      try {
        const status = await obterAssinaturaAcesso();
        if (!cancelado) {
          setAcessoPermitido(status.acessoPermitido !== false);
          setMensagem(status.mensagem ?? null);
        }
      } catch {
        if (!cancelado) {
          setAcessoPermitido(true);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };
    void verificar();
    return () => {
      cancelado = true;
    };
  }, [user, location.pathname]);

  if (carregando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!acessoPermitido && !rotaLiberada) {
    return <Navigate to="/assinatura-bloqueada" state={{ mensagem }} replace />;
  }

  return <>{children}</>;
}
