import { useEffect, useRef } from "react";

type OpcoesPolling = {
  ativo: boolean;
  aoAtualizar: () => void;
  intervaloVisivelMs: number;
  intervaloOcultoMs?: number;
};

/**
 * Polling adaptativo: mais rápido com aba visível, mais lento em background.
 * Atualiza imediatamente ao retornar o foco.
 */
export function usarPollingInteligente({
  ativo,
  aoAtualizar,
  intervaloVisivelMs,
  intervaloOcultoMs = intervaloVisivelMs * 4,
}: OpcoesPolling) {
  const callbackRef = useRef(aoAtualizar);
  callbackRef.current = aoAtualizar;

  useEffect(() => {
    if (!ativo) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const agendar = () => {
      const oculto = document.visibilityState === "hidden";
      const intervalo = oculto ? intervaloOcultoMs : intervaloVisivelMs;
      timer = setTimeout(() => {
        callbackRef.current();
        agendar();
      }, intervalo);
    };

    const aoFoco = () => {
      callbackRef.current();
      if (timer) clearTimeout(timer);
      agendar();
    };

    const aoVisibilidade = () => {
      if (timer) clearTimeout(timer);
      agendar();
    };

    agendar();
    window.addEventListener("focus", aoFoco);
    document.addEventListener("visibilitychange", aoVisibilidade);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", aoFoco);
      document.removeEventListener("visibilitychange", aoVisibilidade);
    };
  }, [ativo, intervaloVisivelMs, intervaloOcultoMs]);
}
