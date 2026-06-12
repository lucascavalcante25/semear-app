import { Link, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { podeAcessarSuporte } from "@/auth/permissions";
import { cn } from "@/lib/utils";

export function BotaoFlutuanteSuporte() {
  const { user } = usarAutenticacao();
  const location = useLocation();

  if (!podeAcessarSuporte(user) || location.pathname.startsWith("/suporte")) {
    return null;
  }

  return (
    <Link
      to="/suporte"
      className={cn(
        "fixed z-40 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg ring-2 ring-background",
        "transition-transform hover:scale-105 active:scale-95",
        "bottom-20 right-4 md:bottom-6 md:right-6",
      )}
      aria-label="Precisa de ajuda? Abrir suporte"
      title="Precisa de ajuda?"
    >
      <LifeBuoy className="h-6 w-6" />
    </Link>
  );
}
