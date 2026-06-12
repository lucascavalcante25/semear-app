import { useEffect } from "react";
import { aplicarFaviconMarca, tituloDocumento } from "@/lib/plataforma";

export function useTituloDocumento(opcoes?: { igreja?: string; area?: "plataforma" | "produto" }) {
  useEffect(() => {
    document.title = tituloDocumento(opcoes);
    aplicarFaviconMarca();
  }, [opcoes?.igreja, opcoes?.area]);
}
