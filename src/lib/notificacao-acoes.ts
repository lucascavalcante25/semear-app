import { marcarNotificacaoComoVista, type NotificacaoItem } from "@/modules/notifications/api";
import { marcarSolicitacaoLida } from "@/modules/suporte/api";

/** ESCALA some ao confirmar presença — não usa marcar vista. */
export function notificacaoIgnoraMarcarVista(tipo: string): boolean {
  return tipo === "ESCALA";
}

export async function tratarCliqueNotificacao(
  n: NotificacaoItem,
  onRemoverLocal: (tipo: string, referenciaId: number) => void,
): Promise<void> {
  if (!notificacaoIgnoraMarcarVista(n.tipo)) {
    await marcarNotificacaoComoVista(n.tipo, n.referenciaId);
    if (n.tipo === "SUPORTE") {
      await marcarSolicitacaoLida(n.referenciaId).catch(() => undefined);
    }
    onRemoverLocal(n.tipo, n.referenciaId);
  }
}

export function rotaNotificacao(link?: string): string {
  if (!link) return "/";
  if (link.startsWith("/")) return link;
  return `/${link}`;
}
