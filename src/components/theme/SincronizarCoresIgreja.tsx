import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { usarTema } from "@/contexts/ThemeContext";
import { aplicarCoresIgreja, limparCoresIgreja } from "@/lib/cores-igreja";
import { isRotaIgreja, isRotaPublica, isRotaSuperAdmin } from "@/lib/rotas-app";

/** Reaplica cores da igreja ao alternar claro/escuro ou trocar de rota. */
export function SincronizarCoresIgreja() {
  const { pathname } = useLocation();
  const { theme } = usarTema();
  const { configuracao, publica } = useIgrejaConfiguracao();

  useEffect(() => {
    if (isRotaPublica(pathname) || isRotaSuperAdmin(pathname)) {
      limparCoresIgreja();
      return;
    }

    if (!isRotaIgreja(pathname)) return;

    const corPrimaria = configuracao?.corPrimaria || publica.corPrimaria;
    const corSecundaria = configuracao?.corSecundaria || publica.corSecundaria;
    if (corPrimaria || corSecundaria) {
      aplicarCoresIgreja(corPrimaria, corSecundaria);
    }
  }, [
    pathname,
    theme,
    configuracao?.corPrimaria,
    configuracao?.corSecundaria,
    publica.corPrimaria,
    publica.corSecundaria,
  ]);

  return null;
}
