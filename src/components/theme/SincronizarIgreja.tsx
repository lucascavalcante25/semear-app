import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";

/** Recarrega dados da igreja ao trocar de rota (ex.: super-admin → app da igreja). */
export function SincronizarIgreja() {
  const { pathname } = useLocation();
  const { recarregar } = useIgrejaConfiguracao();

  useEffect(() => {
    void recarregar();
  }, [pathname, recarregar]);

  return null;
}
