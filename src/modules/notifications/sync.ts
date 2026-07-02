type ListenerAtualizacao = () => void;

const listeners = new Set<ListenerAtualizacao>();

export function registrarListenerNotificacoes(listener: ListenerAtualizacao): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dispararAtualizacaoNotificacoes(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

export type SincronizacaoNotificacoesPayload = {
  preCadastrosPendentes: number;
  pedidosOracaoPendentes: number;
  notificacoes: import("@/modules/notifications/api").NotificacaoItem[];
  fingerprint: string;
};

const CANAL_SINCRONIZACAO = "semear.notificacoes.sync";

export function publicarNotificacoesNasAbas(payload: SincronizacaoNotificacoesPayload): void {
  if (typeof BroadcastChannel === "undefined") return;
  try {
    const canal = new BroadcastChannel(CANAL_SINCRONIZACAO);
    canal.postMessage(payload);
    canal.close();
  } catch {
    // ignore
  }
}

export function escutarNotificacoesDasAbas(
  callback: (payload: SincronizacaoNotificacoesPayload) => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }
  const canal = new BroadcastChannel(CANAL_SINCRONIZACAO);
  canal.onmessage = (event: MessageEvent<SincronizacaoNotificacoesPayload>) => {
    if (event.data?.fingerprint) {
      callback(event.data);
    }
  };
  return () => canal.close();
}
