import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Cake, CalendarDays, CheckCircle2, Heart, LifeBuoy, Loader2, Megaphone, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { confirmarItemEscala } from "@/modules/escalas/api";
import { cn } from "@/lib/utils";
import { usePushLembretePendente } from "@/hooks/use-push-lembrete-pendente";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";

const ICONE_POR_TIPO: Record<string, React.ElementType> = {
  AVISO: Megaphone,
  COMUNICADO: Megaphone,
  ANIVERSARIANTE: Cake,
  SUPORTE: LifeBuoy,
  ASSINATURA: Bell,
  SAAS: Bell,
  PEDIDO_ORACAO: Heart,
  ESCALA: CalendarDays,
  EVENTO: CalendarDays,
  EVENTO_CONFIRMACAO: CalendarDays,
  EVENTO_ALTERACAO: CalendarDays,
  EVENTO_LEMBRETE: CalendarDays,
  EVENTO_CANCELAMENTO: CalendarDays,
};

const labelLinkNotificacao = (tipo: string) => {
  if (tipo.startsWith("EVENTO")) return "Ver eventos";
  if (tipo === "ESCALA") return "Ver escalas";
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
  const { notificacoes, refreshNotificacoes, removerNotificacaoLocal } = usarNotificacoes();
  const { mostrarLembrete: pushPendente, bloqueado: pushBloqueado } = usePushLembretePendente();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const rotaConfig = canAccess(user, "/configuracoes") ? "/configuracoes" : "/mais";

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
          <Button variant="outline" size="sm" onClick={() => void refreshNotificacoes()}>
            Atualizar
          </Button>
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
                      {n.link && (
                        <Link to={n.link.split("?")[0]} className="text-xs text-primary text-center">
                          {labelLinkNotificacao(n.tipo)}
                        </Link>
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
