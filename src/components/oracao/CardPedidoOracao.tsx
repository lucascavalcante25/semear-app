import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, Loader2, MoreVertical, CheckCircle2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  aprovarPedidoOracao,
  denunciarPedidoOracao,
  encerrarPedidoOracao,
  excluirPedidoOracao,
  LABEL_CATEGORIA,
  LABEL_STATUS,
  registrarIntercessao,
  rejeitarPedidoOracao,
  removerIntercessao,
  responderPedidoOracao,
  type PedidoOracaoDTO,
} from "@/modules/oracao/api";

function formatarData(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

type Props = {
  pedido: PedidoOracaoDTO;
  modoLideranca?: boolean;
  onAtualizado?: (pedido: PedidoOracaoDTO | null) => void;
};

export function CardPedidoOracao({ pedido, modoLideranca, onAtualizado }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [confirmarDenunciar, setConfirmarDenunciar] = useState(false);

  const nomeExibicao = pedido.anonimo ? "Pedido anônimo" : pedido.usuarioNome ?? "Irmão(ã)";
  const categoria = pedido.categoria ? LABEL_CATEGORIA[pedido.categoria] : "Geral";
  const statusLabel = LABEL_STATUS[pedido.status] ?? pedido.status;
  const total = pedido.totalIntercessoes ?? 0;

  const executar = async (acao: () => Promise<PedidoOracaoDTO | void>, msg: string, removido = false) => {
    setCarregando(true);
    try {
      const resultado = await acao();
      toast.success(msg);
      if (removido) {
        onAtualizado?.(null);
      } else if (resultado) {
        onAtualizado?.(resultado);
      } else {
        onAtualizado?.(pedido);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível concluir a ação.");
    } finally {
      setCarregando(false);
    }
  };

  const toggleOrei = () => {
    if (pedido.oreiPorMim) {
      void executar(() => removerIntercessao(pedido.id), "Intercessão removida.");
    } else {
      void executar(() => registrarIntercessao(pedido.id), "Obrigado por orar! 🙏");
    }
  };

  const urgente = pedido.status === "AGUARDANDO_APROVACAO";

  return (
    <>
      <Card
        className={cn(
          "transition-shadow hover:shadow-md",
          urgente && "border-destructive/30 bg-destructive/5",
          pedido.status === "RESPONDIDO" && "border-primary/20 bg-primary/5",
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {categoria}
                </Badge>
                <Badge
                  variant={urgente ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {statusLabel}
                </Badge>
                {pedido.visibilidade === "PRIVADA" && (
                  <Badge variant="outline" className="text-xs">
                    Privado
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-foreground leading-snug">{pedido.titulo}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{pedido.descricao}</p>
            </div>

            {(modoLideranca || pedido.status !== "ENCERRADO") && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {modoLideranca && pedido.status === "AGUARDANDO_APROVACAO" && (
                    <>
                      <DropdownMenuItem
                        onClick={() =>
                          void executar(() => aprovarPedidoOracao(pedido.id), "Pedido aprovado para o mural.")
                        }
                      >
                        Aprovar para mural
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          void executar(() => rejeitarPedidoOracao(pedido.id), "Pedido rejeitado.")
                        }
                      >
                        Rejeitar
                      </DropdownMenuItem>
                    </>
                  )}
                  {modoLideranca && pedido.status !== "RESPONDIDO" && pedido.status !== "ENCERRADO" && (
                    <DropdownMenuItem
                      onClick={() => {
                        const texto = window.prompt("Testemunho ou resposta da oração (opcional):");
                        if (texto === null) return;
                        void executar(
                          () => responderPedidoOracao(pedido.id, texto),
                          "Pedido marcado como respondido.",
                        );
                      }}
                    >
                      Marcar como respondido
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() =>
                      void executar(() => encerrarPedidoOracao(pedido.id), "Pedido encerrado.")
                    }
                  >
                    Encerrar
                  </DropdownMenuItem>
                  {!modoLideranca && (
                    <DropdownMenuItem onClick={() => setConfirmarDenunciar(true)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Denunciar
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setConfirmarExcluir(true)}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {pedido.respostaTexto && (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm">
              <p className="font-medium text-primary flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Resposta
              </p>
              <p className="text-foreground/90 mt-1">{pedido.respostaTexto}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-xs text-muted-foreground">
              <span>{nomeExibicao}</span>
              {pedido.criadoEm && <span> · {formatarData(pedido.criadoEm)}</span>}
              {total > 0 && (
                <span>
                  {" "}
                  · {total} {total === 1 ? "pessoa orou" : "pessoas oraram"}
                </span>
              )}
            </div>

            {pedido.status !== "ENCERRADO" &&
              pedido.status !== "REJEITADO" &&
              pedido.visibilidade === "PUBLICA" &&
              (pedido.aprovado || !pedido.requerAprovacao) && (
                <Button
                  size="sm"
                  variant={pedido.oreiPorMim ? "secondary" : "default"}
                  onClick={toggleOrei}
                  disabled={carregando}
                  className="gap-1.5"
                >
                  {carregando ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={cn("h-4 w-4", pedido.oreiPorMim && "fill-current")} />
                  )}
                  {pedido.oreiPorMim ? "Orei por este pedido" : "Orei por este pedido"}
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmarExcluir} onOpenChange={setConfirmarExcluir}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido de oração?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pedido será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                void executar(() => excluirPedidoOracao(pedido.id), "Pedido excluído.", true)
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmarDenunciar} onOpenChange={setConfirmarDenunciar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Use esta opção se o conteúdo for inadequado ou ofensivo. A liderança será notificada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                void executar(() => denunciarPedidoOracao(pedido.id), "Denúncia registrada. Obrigado.")
              }
            >
              Denunciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
