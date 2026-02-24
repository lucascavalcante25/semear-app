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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Cabecalho />
      
      <div className="flex min-w-0 pt-14 md:pt-16">
        {/* Desktop Sidebar */}
        {!isMobile && <BarraLateral />}
        
        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-6 md:ml-64">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <NavegacaoInferior />}
    </div>
  );
}
