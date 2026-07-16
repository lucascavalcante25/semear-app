import { ReactNode } from "react";
import { createPortal } from "react-dom";
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

interface LayoutAppProps {
  children: ReactNode;
}

export function LayoutApp({ children }: LayoutAppProps) {
  const isMobile = usarEhMobile();
  const { nomeExibicao } = useIgrejaConfiguracao();
  useTituloDocumento({ igreja: nomeExibicao, area: "produto" });

  const navegacaoFixa =
    typeof document !== "undefined"
      ? createPortal(
          <>
            <Cabecalho />
            {isMobile && <NavegacaoInferior />}
          </>,
          document.body,
        )
      : null;

  return (
    <div className="min-h-screen bg-background">
      {navegacaoFixa}

      <div className="flex min-w-0 pt-14 md:pt-16">
        {!isMobile && <BarraLateral />}

        <main className="flex-1 min-w-0 overflow-x-clip pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-6 md:ml-64">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <BannerTesteGratis />
            {children}
          </div>
        </main>
      </div>

      <BotaoFlutuanteSuporte />
      <ModalInformativoLogin />
      <ModalAvisoEscalaLogin />
    </div>
  );
}
