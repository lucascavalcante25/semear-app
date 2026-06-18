import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usarTema } from "@/contexts/ThemeContext";
import { limparCoresIgreja } from "@/lib/cores-igreja";
import { isRotaIgreja, isRotaPublica, isRotaSuperAdmin } from "@/lib/rotas-app";

/** Garante paleta fixa do sistema (CSS padrão) ao alternar claro/escuro ou trocar de rota. */
export function SincronizarCoresIgreja() {
  const { pathname } = useLocation();
  const { theme } = usarTema();

  useEffect(() => {
    if (isRotaPublica(pathname) || isRotaSuperAdmin(pathname)) {
      limparCoresIgreja();
      return;
    }

    if (isRotaIgreja(pathname)) {
      limparCoresIgreja();
    }
  }, [pathname, theme]);

  return null;
}
