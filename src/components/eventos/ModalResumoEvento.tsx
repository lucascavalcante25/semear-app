import { useState } from "react";
import { Calendar, ExternalLink, Loader2, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogContentSizeWide,
} from "@/components/ui/dialog";
import { BotoesCompartilharEvento } from "@/components/eventos/BotoesCompartilharEvento";
import { resolverUrlApi } from "@/modules/api/client";
import {
  cancelarInscricaoEvento,
  formatarDataHoraEvento,
  inscreverEvento,
  LABEL_CATEGORIA_EVENTO,
  LABEL_PUBLICO_EVENTO,
  LABEL_STATUS_EVENTO,
  type EventoDTO,
} from "@/modules/eventos/api";
import { cn } from "@/lib/utils";

export function podeInscreverEvento(item: EventoDTO): boolean {
  return Boolean(
    item.status === "PUBLICADO" &&
      item.inscricoesAbertas &&
      !item.inscricoesEncerradas &&
      !item.lotado &&
      item.dataInicio &&
      new Date(item.dataInicio) > new Date(),
  );
}

type Props = {
  evento: EventoDTO | null;
  aberto: boolean;
  onFechar: () => void;
  nomeIgreja?: string;
  onAtualizado?: (evento: EventoDTO) => void;
};

export function ModalResumoEvento({ evento, aberto, onFechar, nomeIgreja, onAtualizado }: Props) {
  const [inscrevendo, setInscrevendo] = useState(false);
  const [erroBanner, setErroBanner] = useState(false);

  if (!evento) return null;

  const bannerSrc = resolverUrlApi(evento.imagemUrl);
  const podeInscrever = podeInscreverEvento(evento);

  const toggleInscricao = async () => {
    if (!evento.id) return;
    setInscrevendo(true);
    try {
      if (evento.inscrito) {
        await cancelarInscricaoEvento(evento.id);
        const atualizado: EventoDTO = {
          ...evento,
          inscrito: false,
          situacaoInscricao: null,
          totalInscritos: Math.max(0, (evento.totalInscritos ?? 1) - 1),
          lotado: false,
        };
        onAtualizado?.(atualizado);
        toast.success("Inscrição cancelada.");
      } else {
        await inscreverEvento(evento.id);
        const total = (evento.totalInscritos ?? 0) + 1;
        const atualizado: EventoDTO = {
          ...evento,
          inscrito: true,
          situacaoInscricao: "ATIVA",
          totalInscritos: total,
          lotado: evento.capacidade != null ? total >= evento.capacidade : false,
        };
        onAtualizado?.(atualizado);
        toast.success("Inscrição realizada!");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível atualizar a inscrição.");
    } finally {
      setInscrevendo(false);
    }
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(o) => {
        if (!o) {
          setErroBanner(false);
          onFechar();
        }
      }}
    >
      <DialogContent
        className={cn(
          dialogContentSizeWide,
          "flex max-h-[92dvh] w-[calc(100vw-1.25rem)] flex-col gap-0 overflow-hidden p-0",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {bannerSrc && !erroBanner ? (
            <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
              <img
                src={bannerSrc}
                alt={evento.titulo}
                className="h-full w-full object-cover"
                onError={() => setErroBanner(true)}
              />
            </div>
          ) : (
            <div className="relative overflow-hidden bg-gradient-to-br from-olive/90 via-olive to-olive/80 px-4 pb-4 pt-5 text-white">
              <DialogHeader className="relative space-y-1 pr-8 text-left">
                <div className="flex items-center gap-1.5 text-white/90">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Evento</span>
                </div>
                <DialogTitle className="text-xl font-bold leading-tight text-white">{evento.titulo}</DialogTitle>
                {evento.dataInicio && (
                  <DialogDescription className="text-white/85">
                    {formatarDataHoraEvento(evento.dataInicio)}
                  </DialogDescription>
                )}
              </DialogHeader>
            </div>
          )}

          <div className="space-y-3 px-4 py-3 sm:px-5 sm:py-4">
            {bannerSrc && !erroBanner && (
              <DialogHeader className="space-y-1 p-0 text-left">
                <DialogTitle className="text-lg font-bold leading-tight sm:text-xl">{evento.titulo}</DialogTitle>
                {evento.dataInicio && (
                  <DialogDescription>{formatarDataHoraEvento(evento.dataInicio)}</DialogDescription>
                )}
              </DialogHeader>
            )}

            <div className="flex flex-wrap gap-1.5">
              {evento.categoria && (
                <Badge variant="secondary">{LABEL_CATEGORIA_EVENTO[evento.categoria]}</Badge>
              )}
              {evento.status && (
                <Badge variant={evento.status === "CANCELADO" ? "destructive" : "outline"}>
                  {LABEL_STATUS_EVENTO[evento.status]}
                </Badge>
              )}
              {evento.publico && (
                <Badge variant="outline">{LABEL_PUBLICO_EVENTO[evento.publico]}</Badge>
              )}
              {evento.inscrito && <Badge className="bg-olive text-white hover:bg-olive">Inscrito</Badge>}
              {evento.lotado && <Badge variant="destructive">Lotado</Badge>}
            </div>

            {evento.local && (
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{evento.local}</span>
              </p>
            )}

            {evento.descricao?.trim() && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {evento.descricao.trim()}
              </p>
            )}

            {(evento.totalInscritos != null || evento.capacidade != null) && (() => {
              const total = evento.totalInscritos ?? 0;
              const capacidade = evento.capacidade;
              const vagas =
                capacidade != null
                  ? Math.max(0, evento.vagasDisponiveis ?? capacidade - total)
                  : null;
              return (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {total}
                  {capacidade ? ` / ${capacidade} vagas` : " inscrito(s)"}
                  {vagas != null ? ` · ${vagas} disponível(is)` : ""}
                </p>
              );
            })()}

            {evento.linkExterno && (
              <Button size="sm" variant="outline" className="w-full gap-1.5 sm:w-auto" asChild>
                <a href={evento.linkExterno} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Saiba mais
                </a>
              </Button>
            )}

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Compartilhar
              </p>
              <BotoesCompartilharEvento evento={evento} nomeIgreja={nomeIgreja} />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t px-4 py-3 sm:flex-row sm:px-5">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onFechar}>
            Fechar
          </Button>
          {podeInscrever && (
            <Button
              type="button"
              variant={evento.inscrito ? "outline" : "default"}
              className="w-full sm:w-auto"
              disabled={inscrevendo}
              onClick={() => void toggleInscricao()}
            >
              {inscrevendo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : evento.inscrito ? (
                "Cancelar inscrição"
              ) : (
                "Inscrever-se"
              )}
            </Button>
          )}
          {evento.inscrito && !podeInscrever && (
            <p className="self-center text-xs text-muted-foreground">Você está inscrito neste evento.</p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
