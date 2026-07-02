import { marcarNotificacaoComoVista, type NotificacaoItem } from "@/modules/notifications/api";
import { marcarSolicitacaoLida } from "@/modules/suporte/api";

/** ESCALA some ao confirmar presença — não usa marcar vista. */
export function notificacaoIgnoraMarcarVista(tipo: string): boolean {
  return tipo === "ESCALA";
}

export async function marcarNotificacaoComoLida(
  n: NotificacaoItem,
  onRemoverLocal: (tipo: string, referenciaId: number) => void,
): Promise<void> {
  if (notificacaoIgnoraMarcarVista(n.tipo)) return;
  await marcarNotificacaoComoVista(n.tipo, n.referenciaId);
  if (n.tipo === "SUPORTE") {
    await marcarSolicitacaoLida(n.referenciaId).catch(() => undefined);
  }
  onRemoverLocal(n.tipo, n.referenciaId);
}

export async function marcarTodasNotificacoesComoLidas(
  notificacoes: NotificacaoItem[],
  onRemoverLocal: (tipo: string, referenciaId: number) => void,
): Promise<void> {
  const pendentes = notificacoes.filter((n) => !notificacaoIgnoraMarcarVista(n.tipo));
  await Promise.all(pendentes.map((n) => marcarNotificacaoComoLida(n, onRemoverLocal)));
}

export async function tratarCliqueNotificacao(
  n: NotificacaoItem,
  onRemoverLocal: (tipo: string, referenciaId: number) => void,
): Promise<void> {
  await marcarNotificacaoComoLida(n, onRemoverLocal);
}

export function rotaNotificacao(link?: string): string {
  if (!link) return "/";
  if (link.startsWith("/")) return link;
  return `/${link}`;
}
