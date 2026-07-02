import { useEffect, useRef, useState } from "react";

const INTERVALO_HEARTBEAT_MS = 5_000;
const LIDER_EXPIRA_MS = 15_000;

/**
 * Elege uma aba "líder" para evitar polling duplicado entre várias abas abertas.
 * Se BroadcastChannel/localStorage não estiver disponível, todas as abas agem como líder.
 */
export function useLiderAbas(chave: string): boolean {
  const [ehLider, setEhLider] = useState(true);
  const tabIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `tab-${Date.now()}-${Math.random()}`,
  );
  const ehLiderRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `${chave}.lider`;
    const tabId = tabIdRef.current;

    const lerLider = (): { tabId: string; ts: number } | null => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { tabId?: string; ts?: number };
        if (!parsed.tabId || typeof parsed.ts !== "number") return null;
        return { tabId: parsed.tabId, ts: parsed.ts };
      } catch {
        return null;
      }
    };

    const gravarLider = () => {
      localStorage.setItem(storageKey, JSON.stringify({ tabId, ts: Date.now() }));
    };

    const tentarSerLider = (): boolean => {
      const atual = lerLider();
      const agora = Date.now();
      if (!atual || atual.tabId === tabId || agora - atual.ts > LIDER_EXPIRA_MS) {
        gravarLider();
        return true;
      }
      return false;
    };

    const atualizarLideranca = () => {
      const lider = tentarSerLider();
      ehLiderRef.current = lider;
      setEhLider(lider);
    };

    atualizarLideranca();

    const heartbeat = window.setInterval(() => {
      if (ehLiderRef.current) {
        gravarLider();
      } else {
        atualizarLideranca();
      }
    }, INTERVALO_HEARTBEAT_MS);

    const aoStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        atualizarLideranca();
      }
    };

    window.addEventListener("storage", aoStorage);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("storage", aoStorage);
      const atual = lerLider();
      if (atual?.tabId === tabId) {
        localStorage.removeItem(storageKey);
      }
    };
  }, [chave]);

  return ehLider;
}
