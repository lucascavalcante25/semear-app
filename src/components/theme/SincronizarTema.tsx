import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarTema } from "@/contexts/ThemeContext";
import { limparCoresIgreja } from "@/lib/cores-igreja";
import { CHAVE_TEMA_PLATAFORMA } from "@/lib/plataforma";
import { isRotaIgreja, isRotaPublica, isRotaSuperAdmin } from "@/lib/rotas-app";

const CHAVE_TEMA_APP = "semear.tema";

/**
 * Aplica o tema conforme o contexto:
 * - Rotas públicas (login): sempre claro
 * - Painel WillSas: preferência willsas.tema (padrão claro)
 * - App da igreja: preferência do usuário (menu do cabeçalho)
 */
export function SincronizarTema() {
  const { pathname } = useLocation();
  const { user } = usarAutenticacao();
  const { setTheme } = usarTema();

  useEffect(() => {
    if (isRotaPublica(pathname)) {
      limparCoresIgreja();
      setTheme("light", "none");
      return;
    }

    if (isRotaSuperAdmin(pathname)) {
      limparCoresIgreja();
      const stored = localStorage.getItem(CHAVE_TEMA_PLATAFORMA);
      setTheme(stored === "dark" ? "dark" : "light", "platform");
      return;
    }

    if (isRotaIgreja(pathname) && user) {
      const stored = localStorage.getItem(CHAVE_TEMA_APP);
      setTheme(stored === "dark" ? "dark" : "light", "app");
    }
  }, [pathname, user, setTheme]);

  return null;
}
