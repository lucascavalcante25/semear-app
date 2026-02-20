import { requisicaoApi } from "@/modules/api/client";

export type NotificacaoItem = {
  tipo: string;
  referenciaId: number;
  titulo: string;
  descricao: string;
  link: string;
};

export const listarNotificacoesNaoVistas = async (): Promise<NotificacaoItem[]> => {
  const lista = await requisicaoApi<NotificacaoItem[]>("/api/notificacoes", { auth: true });
  return lista ?? [];
};

export const marcarNotificacaoComoVista = async (
  tipo: string,
  referenciaId: number
): Promise<void> => {
  await requisicaoApi("/api/notificacoes/marcar-vista", {
    method: "POST",
    body: JSON.stringify({ tipo, referenciaId }),
    auth: true,
  });
};
