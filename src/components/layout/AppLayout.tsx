import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BannerTesteGratis } from "@/components/comercial/BannerTesteGratis";
import { BotaoFlutuanteSuporte } from "@/components/suporte/BotaoFlutuanteSuporte";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import { Cabecalho } from "./Header";
import { NavegacaoInferior } from "./BottomNav";
import { BarraLateral } from "./Sidebar";
import { usarEhMobile } from "@/hooks/use-mobile";
import { ModalInformativoLogin } from "@/components/informativo/ModalInformativoLogin";
import { ModalAvisoEscalaLogin } from "@/components/escalas/ModalAvisoEscalaLogin";
import { HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";

interface LayoutAppProps {
  children: ReactNode;
}

export function LayoutApp({ children }: LayoutAppProps) {
  const isMobile = usarEhMobile();
  const { user } = usarAutenticacao();
  const location = useLocation();
  const { nomeExibicao } = useIgrejaConfiguracao();
  useTituloDocumento({ igreja: nomeExibicao, area: "produto" });
  const mostrarFabOracao =
    isMobile && canAccess(user, "/oracao") && !location.pathname.startsWith("/oracao");

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Cabecalho />
      
      <div className="flex min-w-0 pt-14 md:pt-16">
        {/* Desktop Sidebar */}
        {!isMobile && <BarraLateral />}
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-6 md:ml-64">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <BannerTesteGratis />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <NavegacaoInferior />}

      {mostrarFabOracao && (
        <Link
          to="/oracao"
          className={cn(
            "fab-mobile fixed z-40 flex h-12 w-12 items-center justify-center rounded-full md:bottom-6",
            "bg-olive text-olive-foreground shadow-lg ring-2 ring-background",
            "transition-transform hover:scale-105 active:scale-95",
            "right-4 md:right-6",
          )}
          aria-label="Pedidos de oração"
          title="Oração"
        >
          <HandHeart className="h-5 w-5" />
        </Link>
      )}

      <BotaoFlutuanteSuporte />
      <ModalInformativoLogin />
      <ModalAvisoEscalaLogin />
    </div>
  );
}
