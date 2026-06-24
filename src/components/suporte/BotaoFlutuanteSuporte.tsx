import { Link, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { podeAcessarSuporte } from "@/auth/permissions";
import { cn } from "@/lib/utils";
import { usarEhMobile } from "@/hooks/use-mobile";

export function BotaoFlutuanteSuporte() {
  const { user } = usarAutenticacao();
  const location = useLocation();
  const isMobile = usarEhMobile();

  if (!podeAcessarSuporte(user) || location.pathname.startsWith("/suporte")) {
    return null;
  }

  // No celular o suporte já está no menu lateral e em Mais — evita sobrepor a barra inferior.
  if (isMobile) {
    return null;
  }

  return (
    <Link
      to="/suporte"
      className={cn(
        "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg ring-2 ring-background",
        "transition-transform hover:scale-105 active:scale-95",
        "bottom-6 right-6",
      )}
      aria-label="Precisa de ajuda? Abrir suporte"
      title="Precisa de ajuda?"
    >
      <LifeBuoy className="h-6 w-6" />
    </Link>
  );
}
