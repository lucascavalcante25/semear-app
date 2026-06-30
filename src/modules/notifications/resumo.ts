import { requisicaoApi } from "@/modules/api/client";
import type { NotificacaoItem } from "@/modules/notifications/api";

export type NotificacaoResumo = {
  notificacoes: NotificacaoItem[];
  preCadastrosPendentes: number;
  pedidosOracaoPendentes: number;
};

export const obterResumoNotificacoes = async (): Promise<NotificacaoResumo> => {
  const resumo = await requisicaoApi<NotificacaoResumo>("/api/notificacoes/resumo", { auth: true });
  return {
    notificacoes: resumo?.notificacoes ?? [],
    preCadastrosPendentes: resumo?.preCadastrosPendentes ?? 0,
    pedidosOracaoPendentes: resumo?.pedidosOracaoPendentes ?? 0,
  };
};
