import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Ban,
  BookOpen,
  Church,
  Edit,
  FileText,
  GripVertical,
  Loader2,
  Mic2,
  Music,
  RotateCcw,
  Sparkles,
  User,
  Users,
  Youtube,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VisualizadorLetraLouvor } from "@/components/louvores/VisualizadorLetraLouvor";
import { VisualizadorCifraOnlineLouvor } from "@/components/louvores/VisualizadorCifraOnlineLouvor";
import { cn } from "@/lib/utils";
import type { LouvorApp } from "@/modules/louvores/api";
import type { CultoAgendaItemDTO, CultoLouvorItemDTO, PapelCultoResponsavel } from "@/modules/cultos/api";

const LABEL_PAPEL: Record<PapelCultoResponsavel, string> = {
  PORTARIA: "Portaria",
  RECEPCAO: "Recepção",
  LIMPEZA: "Limpeza",
};

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const formatarData = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const data = new Date(y, m - 1, d);
  const diaSemana = DIAS_SEMANA[data.getDay()] ?? "";
  const dataFmt = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  return diaSemana ? `${diaSemana}, ${dataFmt}` : dataFmt;
};

export function louvorAppDoItem(item: CultoLouvorItemDTO): LouvorApp {
  return {
    id: String(item.louvorId),
    idNum: item.louvorId,
    title: item.titulo,
    artist: item.artista ?? "",
    key: item.tonalidade ?? "",
    type: "adoracao",
    youtubeUrl: item.youtubeUrl ?? undefined,
    temLetraSalva: Boolean(item.temLetraSalva),
    temCifraApiSalva: Boolean(item.temCifraApiSalva),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

type Props = {
  item: CultoAgendaItemDTO | null;
  aberto: boolean;
  onFechar: () => void;
  podeEditar: boolean;
  onEditar: () => void;
  onCancelar?: (motivo: string) => Promise<void>;
  onReativar?: () => Promise<void>;
  onReordenarLouvores?: (louvores: CultoLouvorItemDTO[]) => Promise<void>;
  destacandoProximo?: boolean;
};

function SortableLouvorRow({
  item,
  indice,
  podeArrastar,
  onVerLetra,
  onVerCifra,
}: {
  item: CultoLouvorItemDTO;
  indice: number;
  podeArrastar: boolean;
  onVerLetra: () => void;
  onVerCifra: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(item.louvorId),
    disabled: !podeArrastar,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border bg-background/80 px-2 py-1.5 sm:gap-2 sm:px-2.5",
        isDragging && "z-10 shadow-lg ring-1 ring-olive/30 opacity-95",
      )}
    >
      {podeArrastar ? (
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none rounded-md text-muted-foreground hover:bg-muted shrink-0 h-9 w-8 inline-flex items-center justify-center"
          aria-label="Arrastar para reordenar"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <span className="w-5 text-center text-[11px] font-semibold text-muted-foreground shrink-0">
          {indice + 1}
        </span>
      )}

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-olive/10 text-olive text-[10px] font-bold">
        {item.tonalidade?.trim() || "—"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm leading-snug truncate">
          {podeArrastar ? `${indice + 1}. ` : ""}
          {item.titulo}
        </p>
        {item.artista && (
          <p className="text-[11px] text-muted-foreground truncate leading-tight">{item.artista}</p>
        )}
      </div>

      <div className="flex items-center shrink-0 -mr-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={onVerLetra}>
              <Mic2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver letra{item.temLetraSalva ? " (salva)" : ""}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 touch-manipulation" onClick={onVerCifra}>
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver cifra{item.temCifraApiSalva ? " (salva)" : ""}</p>
          </TooltipContent>
        </Tooltip>
        {item.youtubeUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={item.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground touch-manipulation"
                aria-label="Abrir no YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Abrir no YouTube</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </li>
  );
}

export function ModalResumoCulto({
  item,
  aberto,
  onFechar,
  podeEditar,
  onEditar,
  onCancelar,
  onReativar,
  onReordenarLouvores,
  destacandoProximo,
}: Props) {
  const [louvores, setLouvores] = useState<CultoLouvorItemDTO[]>([]);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);
  const [louvorLetra, setLouvorLetra] = useState<LouvorApp | null>(null);
  const [louvorCifra, setLouvorCifra] = useState<LouvorApp | null>(null);
  const [dialogCancelar, setDialogCancelar] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [salvandoStatus, setSalvandoStatus] = useState(false);

  useEffect(() => {
    if (!item) {
      setLouvores([]);
      return;
    }
    setLouvores([...(item.louvores ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
    setDialogCancelar(false);
    setMotivoCancelamento("");
  }, [item]);

  const confirmarCancelamento = async () => {
    if (!onCancelar) return;
    const motivo = motivoCancelamento.trim();
    if (motivo.length < 3) return;
    setSalvandoStatus(true);
    try {
      await onCancelar(motivo);
      setDialogCancelar(false);
      setMotivoCancelamento("");
    } finally {
      setSalvandoStatus(false);
    }
  };

  const confirmarReativacao = async () => {
    if (!onReativar) return;
    setSalvandoStatus(true);
    try {
      await onReativar();
    } finally {
      setSalvandoStatus(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const responsaveisOrdenados = useMemo(() => {
    const ordem: PapelCultoResponsavel[] = ["PORTARIA", "RECEPCAO", "LIMPEZA"];
    return ordem
      .map((papel) => item?.responsaveis?.find((r) => r.papel === papel))
      .filter(Boolean) as NonNullable<CultoAgendaItemDTO["responsaveis"]>;
  }, [item]);

  const podeArrastar = Boolean(podeEditar && onReordenarLouvores && louvores.length > 1);

  const marcarCacheLouvor = (idNum: number, patch: Partial<CultoLouvorItemDTO>) => {
    setLouvores((prev) => prev.map((l) => (l.louvorId === idNum ? { ...l, ...patch } : l)));
  };

  const aoFimDrag = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReordenarLouvores) return;
    const oldIndex = louvores.findIndex((l) => String(l.louvorId) === String(active.id));
    const newIndex = louvores.findIndex((l) => String(l.louvorId) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordenados = arrayMove(louvores, oldIndex, newIndex).map((l, i) => ({ ...l, ordem: i }));
    setLouvores(reordenados);
    setSalvandoOrdem(true);
    try {
      await onReordenarLouvores(reordenados);
    } catch {
      if (item) setLouvores([...(item.louvores ?? [])]);
    } finally {
      setSalvandoOrdem(false);
    }
  };

  if (!item) return null;

  return (
    <>
      <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
        <DialogContent
          className={cn(
            dialogContentSizeWide,
            "max-h-[92dvh] overflow-y-auto w-[calc(100vw-1.25rem)] p-0 gap-0",
            "[&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:hover:bg-white/10 [&>button]:right-3 [&>button]:top-3",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-t-lg text-white px-3.5 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4",
              item.cancelado
                ? "bg-gradient-to-br from-stone-500 via-stone-600 to-stone-700"
                : "bg-gradient-to-br from-olive/90 via-olive to-olive/80",
            )}
          >
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-black/10 blur-xl" />
            <DialogHeader className="relative space-y-1 text-left pr-8">
              <div className="flex flex-wrap items-center gap-1.5">
                <Church className="h-4 w-4 shrink-0 opacity-90" />
                {item.cancelado ? (
                  <Badge className="bg-red-500 text-white hover:bg-red-500 text-[10px] px-1.5 py-0">
                    Cancelado
                  </Badge>
                ) : destacandoProximo ? (
                  <Badge className="bg-white text-olive hover:bg-white/90 text-[10px] px-1.5 py-0">Próximo</Badge>
                ) : null}
                <Badge variant="secondary" className="bg-white/15 text-white border-0 text-[10px] px-1.5 py-0">
                  {item.tipo === "EXTRAORDINARIO" ? "Extraordinário" : "Recorrente"}
                </Badge>
                {item.temEscalaGerada && (
                  <Badge variant="secondary" className="bg-white/15 text-white border-0 text-[10px] px-1.5 py-0">
                    Escala
                  </Badge>
                )}
              </div>
              <DialogTitle
                className={cn(
                  "text-lg sm:text-xl font-bold leading-tight text-white",
                  item.cancelado && "line-through decoration-white/50",
                )}
              >
                {item.nome}
              </DialogTitle>
              <DialogDescription className="text-white/85 text-xs sm:text-sm">
                {formatarData(item.data)} · {item.horario}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-3 px-3.5 py-3 sm:px-5 sm:py-4">
            {item.cancelado && (
              <section className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 space-y-1 dark:border-red-900/40 dark:bg-red-950/30">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                  <Ban className="h-3.5 w-3.5" />
                  Culto cancelado
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {item.motivoCancelamento?.trim() || "Sem motivo informado."}
                </p>
              </section>
            )}
            <section className="rounded-xl border bg-muted/20 px-3 py-2.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-olive" />
                Mensagem
              </div>
              {item.pregador || item.tituloMensagem || item.versiculoCentral ? (
                <div className="space-y-1">
                  {item.pregador && (
                    <p className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="font-medium truncate">{item.pregador}</span>
                    </p>
                  )}
                  {item.tituloMensagem && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.tituloMensagem}</span>
                    </p>
                  )}
                  {item.versiculoCentral && (
                    <p className="rounded-lg bg-background/80 border px-2.5 py-1.5 text-sm italic text-foreground/90">
                      “{item.versiculoCentral}”
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Mensagem ainda não cadastrada.</p>
              )}
              {item.observacoes?.trim() && (
                <p className="text-[11px] text-muted-foreground border-t pt-1.5 whitespace-pre-wrap">
                  {item.observacoes}
                </p>
              )}
            </section>

            <section className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="h-3.5 w-3.5 text-olive" />
                Responsáveis
                {item.temOverrideResponsaveis && (
                  <Badge variant="outline" className="text-[10px] font-normal normal-case tracking-normal">
                    Ajuste manual
                  </Badge>
                )}
                {!item.temOverrideResponsaveis && item.temEscalaGerada && (
                  <Badge variant="secondary" className="text-[10px] font-normal normal-case tracking-normal">
                    Da escala
                  </Badge>
                )}
              </div>
              {responsaveisOrdenados.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum responsável definido ainda
                  {item.temEscalaGerada ? "." : " (sem escala gerada para esta data)."}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {responsaveisOrdenados.map((r) => (
                    <div
                      key={`${r.papel}-${r.userId}`}
                      className="rounded-lg border bg-card px-2.5 py-1.5"
                    >
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                        {LABEL_PAPEL[r.papel]}
                      </p>
                      <p className="text-sm font-medium break-words mt-0.5 leading-snug">{r.nome}</p>
                    </div>
                  ))}
                </div>
              )}
              {podeEditar && (
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Substituições na edição valem só para este culto — a escala gerada não muda.
                </p>
              )}
            </section>

            <section className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground min-w-0">
                  <Music className="h-3.5 w-3.5 text-olive shrink-0" />
                  <span className="truncate normal-case tracking-normal text-sm font-semibold text-foreground">
                    Louvores
                  </span>
                  <Badge variant="outline" className="text-[10px] font-normal shrink-0">
                    {louvores.length}
                  </Badge>
                  {salvandoOrdem && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </div>
                {item.grupoLouvorOrigemNome && (
                  <p className="text-[11px] text-muted-foreground truncate max-w-[40%]">
                    {item.grupoLouvorOrigemNome}
                  </p>
                )}
              </div>

              {louvores.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-lg border border-dashed px-3 py-3 text-center">
                  Nenhum louvor definido para este culto.
                </p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void aoFimDrag(e)}>
                  <SortableContext
                    items={louvores.map((l) => String(l.louvorId))}
                    strategy={rectSortingStrategy}
                  >
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {louvores.map((l, i) => (
                        <SortableLouvorRow
                          key={l.louvorId}
                          item={l}
                          indice={i}
                          podeArrastar={podeArrastar}
                          onVerLetra={() => setLouvorLetra(louvorAppDoItem(l))}
                          onVerCifra={() => setLouvorCifra(louvorAppDoItem(l))}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
              {podeArrastar && (
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Arraste para reordenar (só neste culto). Letra/cifra editadas valem no repertório.
                </p>
              )}
            </section>
          </div>

          <DialogFooter className="border-t px-3.5 py-2.5 sm:px-5 gap-2 flex-col-reverse sm:flex-row sm:flex-wrap sm:justify-end">
            <Button type="button" variant="outline" className="w-full sm:w-auto h-10 touch-manipulation" onClick={onFechar}>
              Fechar
            </Button>
            {podeEditar && item.cancelado && onReativar && (
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto h-10 touch-manipulation"
                disabled={salvandoStatus}
                onClick={() => void confirmarReativacao()}
              >
                {salvandoStatus ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Reativar culto
              </Button>
            )}
            {podeEditar && !item.cancelado && onCancelar && (
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto h-10 touch-manipulation"
                onClick={() => setDialogCancelar(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancelar culto
              </Button>
            )}
            {podeEditar && !item.cancelado && (
              <Button
                type="button"
                className="w-full sm:w-auto h-10 touch-manipulation"
                onClick={onEditar}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar culto
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogCancelar} onOpenChange={(o) => !o && !salvandoStatus && setDialogCancelar(false)}>
        <DialogContent className="max-w-md w-[calc(100vw-1.5rem)]">
          <DialogHeader>
            <DialogTitle>Cancelar culto</DialogTitle>
            <DialogDescription>
              O culto permanece na agenda como cancelado. Toda a igreja receberá uma notificação com o motivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label htmlFor="motivo-cancelamento-culto">Motivo do cancelamento</Label>
            <Textarea
              id="motivo-cancelamento-culto"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              placeholder="Ex.: Manutenção no som da igreja"
              rows={4}
              maxLength={500}
              disabled={salvandoStatus}
            />
            <p className="text-[11px] text-muted-foreground">Mínimo de 3 caracteres.</p>
          </div>
          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={salvandoStatus}
              onClick={() => setDialogCancelar(false)}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={salvandoStatus || motivoCancelamento.trim().length < 3}
              onClick={() => void confirmarCancelamento()}
            >
              {salvandoStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VisualizadorLetraLouvor
        louvor={louvorLetra}
        aberto={!!louvorLetra}
        onFechar={() => setLouvorLetra(null)}
        onCacheAtualizado={() => {
          if (louvorLetra?.idNum) {
            marcarCacheLouvor(louvorLetra.idNum, { temLetraSalva: true });
          }
        }}
      />
      <VisualizadorCifraOnlineLouvor
        louvor={louvorCifra}
        aberto={!!louvorCifra}
        onFechar={() => setLouvorCifra(null)}
        onCacheAtualizado={() => {
          if (louvorCifra?.idNum) {
            marcarCacheLouvor(louvorCifra.idNum, { temCifraApiSalva: true });
          }
        }}
      />
    </>
  );
}
