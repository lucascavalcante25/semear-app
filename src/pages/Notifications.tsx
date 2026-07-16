import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  BellRing,
  Cake,
  CalendarDays,
  CheckCircle2,
  FileWarning,
  Heart,
  LifeBuoy,
  Loader2,
  Megaphone,
  Settings2,
  Church,
} from "lucide-react";
import { toast } from "sonner";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { confirmarItemEscala } from "@/modules/escalas/api";
import { cn } from "@/lib/utils";
import { usePushLembretePendente } from "@/hooks/use-push-lembrete-pendente";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";
import {
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  notificacaoIgnoraMarcarVista,
  rotaNotificacao,
  tratarCliqueNotificacao,
} from "@/lib/notificacao-acoes";

const ICONE_POR_TIPO: Record<string, React.ElementType> = {
  COMUNICADO: Megaphone,
  ANIVERSARIANTE: Cake,
  SUPORTE: LifeBuoy,
  ASSINATURA: Bell,
  SAAS: Bell,
  PEDIDO_ORACAO: Heart,
  ESCALA: CalendarDays,
  ESCALA_ALTERACAO: CalendarDays,
  ESCALA_CANCELAMENTO: CalendarDays,
  ESCALA_LEMBRETE_AMANHA: CalendarDays,
  ESCALA_LEMBRETE_SEMANA: CalendarDays,
  EVENTO: CalendarDays,
  EVENTO_CONFIRMACAO: CalendarDays,
  EVENTO_ALTERACAO: CalendarDays,
  EVENTO_LEMBRETE: CalendarDays,
  EVENTO_CANCELAMENTO: CalendarDays,
  EVENTO_PUBLICACAO: CalendarDays,
  EVENTO_LEMBRETE_HOJE: CalendarDays,
  EVENTO_LEMBRETE_AMANHA: CalendarDays,
  CULTO_CANCELADO: Church,
  DOCUMENTO_VENCENDO: FileWarning,
};

const labelLinkNotificacao = (tipo: string) => {
  if (tipo.startsWith("EVENTO")) return "Ver eventos";
  if (tipo.startsWith("ESCALA")) return "Ver escalas";
  if (tipo === "COMUNICADO") return "Ver comunicados";
  if (tipo === "CULTO_CANCELADO") return "Ver cultos";
  if (tipo === "DOCUMENTO_VENCENDO") return "Ver documentos";
  return "Ver detalhes";
};

const parseEscalaDaNotificacao = (link?: string) => {
  if (!link) return null;
  try {
    const url = new URL(link, window.location.origin);
    const escalaId = url.searchParams.get("escalaId");
    const itemId = url.searchParams.get("itemId");
    if (!escalaId || !itemId) return null;
    return { escalaId: Number(escalaId), itemId: Number(itemId) };
  } catch {
    return null;
  }
};

export default function Notificacoes() {
  const { user } = usarAutenticacao();
  const navigate = useNavigate();
  const { notificacoes, refreshNotificacoes, removerNotificacaoLocal } = usarNotificacoes();
  const { mostrarLembrete: pushPendente, bloqueado: pushBloqueado } = usePushLembretePendente();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [marcandoChave, setMarcandoChave] = useState<string | null>(null);
  const rotaConfig = canAccess(user, "/configuracoes") ? "/configuracoes" : "/mais";

  const temNotificacoesMarcaveis = notificacoes.some((n) => !notificacaoIgnoraMarcarVista(n.tipo));

  const confirmarEscala = async (escalaId: number, itemId: number, chave: string) => {
    setConfirmando(chave);
    try {
      await confirmarItemEscala(escalaId, itemId);
      removerNotificacaoLocal("ESCALA", itemId);
      toast.success("Presença confirmada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível confirmar presença.");
    } finally {
      setConfirmando(null);
    }
  };

  const abrirNotificacao = async (n: (typeof notificacoes)[0]) => {
    const chave = `${n.tipo}-${n.referenciaId}`;
    setMarcandoChave(chave);
    try {
      await tratarCliqueNotificacao(n, removerNotificacaoLocal);
    } catch {
      /* navega mesmo se marcar vista falhar */
    } finally {
      setMarcandoChave(null);
    }
    if (n.link) {
      navigate(rotaNotificacao(n.link));
    }
  };

  const marcarComoLida = async (n: (typeof notificacoes)[0]) => {
    const chave = `${n.tipo}-${n.referenciaId}`;
    setMarcandoChave(chave);
    try {
      await marcarNotificacaoComoLida(n, removerNotificacaoLocal);
      toast.success("Notificação marcada como lida.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível marcar como lida.");
    } finally {
      setMarcandoChave(null);
    }
  };

  const marcarTodasComoLidas = async () => {
    setMarcandoTodas(true);
    try {
      await marcarTodasNotificacoesComoLidas(notificacoes, removerNotificacaoLocal);
      toast.success("Todas as notificações foram marcadas como lidas.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível marcar todas como lidas.");
    } finally {
      setMarcandoTodas(false);
    }
  };

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notificações
            </h1>
            <p className="text-sm text-muted-foreground">
              Avisos, escalas, pedidos de oração e atualizações
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {temNotificacoesMarcaveis && (
              <Button
                variant="outline"
                size="sm"
                disabled={marcandoTodas}
                onClick={() => void marcarTodasComoLidas()}
              >
                {marcandoTodas ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Marcar todas como lidas
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => void refreshNotificacoes()}>
              Atualizar
            </Button>
          </div>
        </div>

        {(pushPendente || pushBloqueado) && (
          <Card className="border-dashed border-olive/40 bg-olive-light/20">
            <CardContent className="p-4 flex items-start gap-3">
              <BellRing className="h-5 w-5 text-olive-dark shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {pushBloqueado ? "Notificações bloqueadas no navegador" : "Ative lembretes no celular"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pushBloqueado
                    ? "Permita notificações nas configurações do site e recarregue a página."
                    : "Receba o versículo do dia, leitura bíblica coletiva, eventos e escalas."}
                </p>
                {!pushBloqueado && (
                  <Button variant="outline" size="sm" className="mt-3 h-8" asChild>
                    <Link to={rotaConfig}>
                      <Settings2 className="h-4 w-4 mr-2" />
                      Ir para configurações
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {notificacoes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma notificação nova no momento.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => {
              const Icon = ICONE_POR_TIPO[n.tipo] ?? Bell;
              const escala = n.tipo === "ESCALA" ? parseEscalaDaNotificacao(n.link) : null;
              const chave = `${n.tipo}-${n.referenciaId}`;
              const destino = n.link ? rotaNotificacao(n.link) : null;

              return (
                <Card key={chave} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        n.tipo === "PEDIDO_ORACAO" || n.tipo === "ESCALA" || n.tipo.startsWith("EVENTO")
                          ? "bg-primary/10 text-primary"
                          : "bg-muted",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{n.titulo}</p>
                      {n.descricao && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{n.descricao}</p>
                      )}
                      {n.tipo === "ESCALA" && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Permanece aqui até você confirmar presença.
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      {escala && (
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          disabled={confirmando === chave}
                          onClick={() => void confirmarEscala(escala.escalaId, escala.itemId, chave)}
                        >
                          {confirmando === chave ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Confirmar
                            </>
                          )}
                        </Button>
                      )}
                      {!notificacaoIgnoraMarcarVista(n.tipo) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          disabled={marcandoChave === chave || marcandoTodas}
                          onClick={() => void marcarComoLida(n)}
                        >
                          {marcandoChave === chave ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Marcar lida
                            </>
                          )}
                        </Button>
                      )}
                      {destino && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-8 text-xs px-0"
                          onClick={() => void abrirNotificacao(n)}
                        >
                          {labelLinkNotificacao(n.tipo)}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </LayoutApp>
  );
}
