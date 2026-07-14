import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  BookOpen,
  ChevronRight,
  Church,
  FileText,
  GripVertical,
  Loader2,
  Mic2,
  Music,
  User,
  Users,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ModalResumoCulto, louvorAppDoItem } from "@/components/cultos/ModalResumoCulto";
import { VisualizadorLetraLouvor } from "@/components/louvores/VisualizadorLetraLouvor";
import { VisualizadorCifraOnlineLouvor } from "@/components/louvores/VisualizadorCifraOnlineLouvor";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, canWrite } from "@/auth/permissions";
import { cn } from "@/lib/utils";
import type { LouvorApp } from "@/modules/louvores/api";
import {
  listarAgendaCultos,
  salvarOcorrenciaCulto,
  type CultoAgendaItemDTO,
  type CultoLouvorItemDTO,
  type PapelCultoResponsavel,
} from "@/modules/cultos/api";

const LABEL_PAPEL: Record<PapelCultoResponsavel, string> = {
  PORTARIA: "Portaria",
  RECEPCAO: "Recepção",
  LIMPEZA: "Limpeza",
};

const formatarData = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const data = new Date(y, m - 1, d);
  const dias = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const diaSemana = dias[data.getDay()] ?? "";
  const dataFmt = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  return diaSemana ? `${diaSemana}, ${dataFmt}` : dataFmt;
};

const labelDiaRelativo = (iso: string) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const data = new Date(y, m - 1, d);
  data.setHours(0, 0, 0, 0);
  const diff = Math.round((data.getTime() - hoje.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff > 1 && diff <= 7) return `Em ${diff} dias`;
  return null;
};

function SortableLouvorCard({
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
        "flex items-center gap-1 rounded-lg border px-1.5 py-1.5 text-sm bg-background min-w-0",
        isDragging && "z-10 shadow-md ring-1 ring-olive/30 opacity-95",
      )}
    >
      {podeArrastar ? (
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none h-8 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted shrink-0"
          aria-label="Arrastar para reordenar"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      ) : (
        <span className="text-[11px] font-semibold text-muted-foreground w-4 shrink-0 text-center">
          {indice + 1}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate leading-snug">
          {podeArrastar ? `${indice + 1}. ` : ""}
          {item.titulo}
        </p>
        {item.artista && (
          <p className="text-[11px] text-muted-foreground truncate leading-tight">{item.artista}</p>
        )}
      </div>
      <div className="flex items-center shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                onVerLetra();
              }}
            >
              <Mic2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver letra{item.temLetraSalva ? " (salva)" : ""}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                onVerCifra();
              }}
            >
              <FileText className="h-3.5 w-3.5" />
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground touch-manipulation"
                aria-label={`YouTube: ${item.titulo}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Youtube className="h-3.5 w-3.5" />
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

export function DestaqueProximoCulto() {
  const navigate = useNavigate();
  const { user } = usarAutenticacao();
  const podeVer = canAccess(user, "/cultos");
  const podeEditar = canWrite(user, "/cultos");
  const [culto, setCulto] = useState<CultoAgendaItemDTO | null>(null);
  const [louvores, setLouvores] = useState<CultoLouvorItemDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoOrdem, setSalvandoOrdem] = useState(false);
  const [resumoAberto, setResumoAberto] = useState(false);
  const [louvorLetra, setLouvorLetra] = useState<LouvorApp | null>(null);
  const [louvorCifra, setLouvorCifra] = useState<LouvorApp | null>(null);

  useEffect(() => {
    if (!podeVer) {
      setCarregando(false);
      return;
    }
    const carregar = async () => {
      setCarregando(true);
      try {
        const agenda = await listarAgendaCultos();
        const proximo = agenda?.proximos?.[0] ?? null;
        setCulto(proximo);
        setLouvores(
          proximo?.louvores
            ? [...proximo.louvores].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
            : [],
        );
      } catch {
        setCulto(null);
        setLouvores([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [podeVer]);

  useEffect(() => {
    if (!culto) {
      setLouvores([]);
      return;
    }
    setLouvores([...(culto.louvores ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
  }, [culto]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const responsaveis = useMemo(() => {
    const ordem: PapelCultoResponsavel[] = ["PORTARIA", "RECEPCAO", "LIMPEZA"];
    return ordem
      .map((papel) => culto?.responsaveis?.find((r) => r.papel === papel))
      .filter(Boolean) as NonNullable<CultoAgendaItemDTO["responsaveis"]>;
  }, [culto]);

  const podeArrastar = Boolean(podeEditar && louvores.length > 1);

  const persistirOrdem = async (ordenados: CultoLouvorItemDTO[]) => {
    if (!culto || !podeEditar) return;
    setSalvandoOrdem(true);
    try {
      const atualizado = await salvarOcorrenciaCulto({
        cultoRegistroId: culto.cultoRegistroId,
        data: culto.data,
        pregador: culto.pregador ?? null,
        tituloMensagem: culto.tituloMensagem ?? null,
        versiculoCentral: culto.versiculoCentral ?? null,
        observacoes: culto.observacoes ?? null,
        grupoLouvorOrigemId: culto.grupoLouvorOrigemId ?? null,
        louvorIds: ordenados.map((l) => l.louvorId),
        responsaveisManuais: culto.temOverrideResponsaveis
          ? (culto.responsaveis ?? []).map((r) => ({ papel: r.papel, userId: r.userId }))
          : undefined,
      });
      setCulto(atualizado);
      toast.success("Ordem dos louvores atualizada.");
    } catch (e) {
      setLouvores([...(culto.louvores ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)));
      toast.error(e instanceof Error ? e.message : "Erro ao reordenar.");
      throw e;
    } finally {
      setSalvandoOrdem(false);
    }
  };

  const aoFimDrag = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = louvores.findIndex((l) => String(l.louvorId) === String(active.id));
    const newIndex = louvores.findIndex((l) => String(l.louvorId) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordenados = arrayMove(louvores, oldIndex, newIndex).map((l, i) => ({ ...l, ordem: i }));
    setLouvores(reordenados);
    try {
      await persistirOrdem(reordenados);
    } catch {
      /* revert já feito em persistirOrdem */
    }
  };

  const marcarCacheLouvor = (idNum: number, patch: Partial<CultoLouvorItemDTO>) => {
    setLouvores((prev) => prev.map((l) => (l.louvorId === idNum ? { ...l, ...patch } : l)));
    setCulto((prev) =>
      prev
        ? {
            ...prev,
            louvores: (prev.louvores ?? []).map((l) =>
              l.louvorId === idNum ? { ...l, ...patch } : l,
            ),
          }
        : prev,
    );
  };

  if (!podeVer) return null;

  if (carregando) {
    return (
      <Card className="overflow-hidden shadow-sm border-olive/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!culto) return null;

  const relativo = labelDiaRelativo(culto.data);

  return (
    <>
      <Card className="overflow-hidden shadow-md border-olive/25">
        <button
          type="button"
          className="w-full text-left touch-manipulation"
          onClick={() => setResumoAberto(true)}
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-olive/90 via-olive to-olive/75 text-white px-3.5 py-3.5 sm:px-5 sm:py-4">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-8 bottom-0 h-28 w-28 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div className="min-w-0 space-y-1.5 pr-6 sm:pr-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <Church className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
                    Próximo culto
                  </p>
                  <Badge className="bg-white text-olive hover:bg-white/90 text-[10px] px-1.5 py-0">Próximo</Badge>
                  {relativo && (
                    <Badge variant="secondary" className="bg-white/15 text-white border-0 text-[10px] px-1.5 py-0">
                      {relativo}
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold leading-tight break-words">{culto.nome}</h2>
                <p className="text-sm text-white/90">
                  {formatarData(culto.data)} · {culto.horario}
                </p>
              </div>
              <span className="hidden sm:inline-flex shrink-0 text-xs text-white/80 items-center gap-0.5 mt-1">
                Ver detalhes
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span className="sm:hidden text-xs text-white/85 inline-flex items-center gap-0.5">
                Toque para ver detalhes
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <CardContent className="space-y-3 p-3.5 sm:p-4 pointer-events-none">
            {(culto.pregador || culto.tituloMensagem || culto.versiculoCentral) && (
              <div className="space-y-1">
                {culto.pregador && (
                  <p className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate">{culto.pregador}</span>
                  </p>
                )}
                {culto.tituloMensagem && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{culto.tituloMensagem}</span>
                  </p>
                )}
                {culto.versiculoCentral && (
                  <p className="rounded-lg bg-muted/40 border px-2.5 py-1.5 text-sm italic text-foreground/90">
                    “{culto.versiculoCentral}”
                  </p>
                )}
              </div>
            )}

            {responsaveis.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Responsáveis
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {responsaveis.map((r) => (
                    <div key={`${r.papel}-${r.userId}`} className="rounded-lg border bg-muted/20 px-2.5 py-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-none">
                        {LABEL_PAPEL[r.papel]}
                      </p>
                      <p className="text-sm font-medium break-words mt-0.5 leading-snug">{r.nome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!culto.pregador &&
              !culto.tituloMensagem &&
              responsaveis.length === 0 &&
              louvores.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Detalhes ainda não cadastrados. Toque para abrir o culto.
                </p>
              )}
          </CardContent>
        </button>

        {louvores.length > 0 && (
          <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 -mt-1 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <Music className="h-3.5 w-3.5" />
              Louvores
              <Badge variant="outline" className="text-[10px] font-normal normal-case tracking-normal">
                {louvores.length}
              </Badge>
              {salvandoOrdem && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void aoFimDrag(e)}>
              <SortableContext items={louvores.map((l) => String(l.louvorId))} strategy={rectSortingStrategy}>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {louvores.map((l, i) => (
                    <SortableLouvorCard
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
            {podeArrastar && (
              <p className="text-[11px] text-muted-foreground">
                Arraste para reordenar — a ordem fica salva neste culto.
              </p>
            )}
          </div>
        )}

        <div className="border-t px-3.5 py-2 sm:px-4 flex justify-stretch sm:justify-end">
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground h-9 w-full sm:w-auto touch-manipulation">
            <Link to="/cultos">
              Ir para Culto
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </Card>

      <ModalResumoCulto
        item={culto}
        aberto={resumoAberto}
        onFechar={() => setResumoAberto(false)}
        podeEditar={podeEditar}
        destacandoProximo
        onReordenarLouvores={podeEditar ? persistirOrdem : undefined}
        onEditar={() => {
          setResumoAberto(false);
          navigate(
            `/cultos?editar=${culto.cultoRegistroId}&data=${encodeURIComponent(culto.data)}`,
          );
        }}
      />

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
