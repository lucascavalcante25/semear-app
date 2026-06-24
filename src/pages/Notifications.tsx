import { Link } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Cake, Heart, Megaphone, LifeBuoy, Loader2 } from "lucide-react";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { marcarNotificacaoComoVista } from "@/modules/notifications/api";
import { cn } from "@/lib/utils";

const ICONE_POR_TIPO: Record<string, React.ElementType> = {
  AVISO: Megaphone,
  ANIVERSARIANTE: Cake,
  SUPORTE: LifeBuoy,
  ASSINATURA: Bell,
  SAAS: Bell,
  PEDIDO_ORACAO: Heart,
};

export default function Notificacoes() {
  const { notificacoes, refreshNotificacoes, removerNotificacaoLocal } = usarNotificacoes();

  const marcarLida = async (tipo: string, referenciaId: number, link?: string) => {
    try {
      await marcarNotificacaoComoVista(tipo, referenciaId);
      removerNotificacaoLocal(tipo, referenciaId);
    } catch {
      /* ignore */
    }
    if (link) {
      window.location.href = link;
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
              Avisos, pedidos de oração e atualizações
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void refreshNotificacoes()}>
            Atualizar
          </Button>
        </div>

        {notificacoes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma notificação nova no momento.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notificacoes.map((n) => {
              const Icon = ICONE_POR_TIPO[n.tipo] ?? Bell;
              return (
                <Card
                  key={`${n.tipo}-${n.referenciaId}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => void marcarLida(n.tipo, n.referenciaId, n.link)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        n.tipo === "PEDIDO_ORACAO" ? "bg-primary/10 text-primary" : "bg-muted",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{n.titulo}</p>
                      {n.descricao && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.descricao}
                        </p>
                      )}
                    </div>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="text-xs text-primary shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver
                      </Link>
                    )}
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
