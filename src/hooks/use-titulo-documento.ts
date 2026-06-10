import { useEffect } from "react";
import { tituloDocumento } from "@/lib/plataforma";

export function useTituloDocumento(opcoes?: { igreja?: string; area?: "plataforma" | "produto" }) {
  useEffect(() => {
    document.title = tituloDocumento(opcoes);
  }, [opcoes?.igreja, opcoes?.area]);
}
