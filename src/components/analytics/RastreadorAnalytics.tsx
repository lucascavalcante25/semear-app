import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { inicializarAnalytics, registrarPagina } from "@/lib/analytics";

/** Inicializa GA4 e envia page_view a cada navegação (React Router). */
export function RastreadorAnalytics() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    inicializarAnalytics();
  }, []);

  useEffect(() => {
    registrarPagina(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}
