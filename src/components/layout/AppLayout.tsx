import { ReactNode } from "react";
import { Cabecalho } from "./Header";
import { NavegacaoInferior } from "./BottomNav";
import { BarraLateral } from "./Sidebar";
import { usarEhMobile } from "@/hooks/use-mobile";

interface LayoutAppProps {
  children: ReactNode;
}

export function LayoutApp({ children }: LayoutAppProps) {
  const isMobile = usarEhMobile();

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && <BarraLateral />}
        
        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-6 md:ml-64">
          <div className="container max-w-4xl py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <NavegacaoInferior />}
    </div>
  );
}
