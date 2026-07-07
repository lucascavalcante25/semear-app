import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Music,
  Search,
  Plus,
  Youtube,
  MoreVertical,
  Edit,
  Trash2,
  GripVertical,
  List,
  Loader2,
  X,
  Mic2,
  FileText,
  Check,
} from "lucide-react";
import { CampoArtistaLouvor } from "@/components/louvores/CampoArtistaLouvor";
import { VisualizadorLetraLouvor } from "@/components/louvores/VisualizadorLetraLouvor";
import { VisualizadorCifraOnlineLouvor } from "@/components/louvores/VisualizadorCifraOnlineLouvor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import {
  listarLouvores,
  criarLouvor,
  atualizarLouvor,
  excluirLouvor,
  atualizarTomLouvor,
  type LouvorApp,
} from "@/modules/louvores/api";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  listarGrupos,
  criarGrupo,
  excluirGrupo,
  adicionarLouvorAoGrupo,
  removerLouvorDoGrupo,
  reordenarLouvoresNoGrupo,
  type GrupoLouvorApp,
} from "@/modules/grupos-louvor/api";

// Todas as tonalidades disponíveis
const TONALIDADES = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm",
];

// Tipos permitidos: Júbilo, Adoração, Ceia
const TIPOS_LOUVOR = [
  { value: "jubilo" as const, label: "Júbilo" },
  { value: "adoracao" as const, label: "Adoração" },
  { value: "ceia" as const, label: "Ceia" },
];

const typeConfig = {
  adoracao: { label: "Adoração", color: "bg-deep-blue/10 text-deep-blue border-deep-blue/20" },
  jubilo: { label: "Júbilo", color: "bg-gold/10 text-gold-dark border-gold/20" },
  ceia: { label: "Ceia", color: "bg-olive/10 text-olive border-olive/20" },
};

interface CartaoLouvorProps {
  louvor: LouvorApp;
  aoEditar: (louvor: LouvorApp) => void;
  aoExcluir: (louvor: LouvorApp) => void;
  aoVerDetalhes?: (louvor: LouvorApp) => void;
  aoVisualizarLetra?: (louvor: LouvorApp) => void;
  aoVisualizarCifraOnline?: (louvor: LouvorApp) => void;
  showDrag?: boolean;
  noGrupo?: boolean;
  aoRemoverDoGrupo?: (louvor: LouvorApp) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function DialogDetalheLouvor({
  louvor,
  aberto,
  onAbertoChange,
  aoEditar,
  aoVisualizarLetra,
  aoVisualizarCifraOnline,
  aoLetraManual,
  aoCifraManual,
  onLouvorAtualizado,
  noGrupo,
  aoRemoverDoGrupo,
}: {
  louvor: LouvorApp | null;
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  aoEditar: (louvor: LouvorApp) => void;
  aoVisualizarLetra?: (louvor: LouvorApp) => void;
  aoVisualizarCifraOnline?: (louvor: LouvorApp) => void;
  aoLetraManual?: (louvor: LouvorApp) => void;
  aoCifraManual?: (louvor: LouvorApp) => void;
  onLouvorAtualizado?: (louvor: LouvorApp) => void;
  noGrupo?: boolean;
  aoRemoverDoGrupo?: (louvor: LouvorApp) => void;
}) {
  const [tom, setTom] = useState("");
  const [salvandoTom, setSalvandoTom] = useState(false);

  useEffect(() => {
    if (louvor) {
      setTom(louvor.key ?? "");
    }
  }, [louvor]);

  if (!louvor) return null;
  const config = typeConfig[louvor.type];

  const alterarTom = async (novoTom: string) => {
    if (!louvor.idNum) return;
    const valor = novoTom === "__none__" ? "" : novoTom;
    setTom(valor);
    setSalvandoTom(true);
    try {
      const atualizado = await atualizarTomLouvor(louvor.idNum, valor || null);
      onLouvorAtualizado?.(atualizado);
      toast.success(valor ? `Tom alterado para ${valor}.` : "Tom removido.");
    } catch {
      setTom(louvor.key ?? "");
      toast.error("Erro ao alterar o tom.");
    } finally {
      setSalvandoTom(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left leading-snug pr-6">{louvor.title}</DialogTitle>
          <DialogDescription className="text-left">{louvor.artist}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="tom-louvor" className="sr-only">
                Tom
              </Label>
              <Select value={tom || "__none__"} onValueChange={(v) => void alterarTom(v)} disabled={salvandoTom}>
                <SelectTrigger id="tom-louvor" className="h-7 w-[7.5rem] text-xs">
                  <SelectValue placeholder="Tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem tom</SelectItem>
                  {TONALIDADES.map((t) => (
                    <SelectItem key={t} value={t}>
                      Tom: {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {salvandoTom && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </div>
          </div>
          {louvor.notes && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{louvor.notes}</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={() => {
                onAbertoChange(false);
                aoVisualizarLetra?.(louvor);
              }}
            >
              <Mic2 className="h-4 w-4 mr-2" />
              Ver letra
              {louvor.temLetraSalva && (
                <Badge variant="outline" className="ml-2 border-white/50 text-[10px] py-0 text-white">
                  salva
                </Badge>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={() => {
                onAbertoChange(false);
                aoVisualizarCifraOnline?.(louvor);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Cifra online
              {louvor.temCifraApiSalva && (
                <Badge variant="outline" className="ml-2 border-white/50 text-[10px] py-0 text-white">
                  salva
                </Badge>
              )}
            </Button>
            {louvor.youtubeUrl && (
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <a href={louvor.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4 mr-2" />
                  Abrir no YouTube
                </a>
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs"
              onClick={() => {
                onAbertoChange(false);
                aoLetraManual?.(louvor);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-2" />
              {louvor.temLetraSalva ? "Editar letra manual" : "Adicionar letra manual"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-xs"
              onClick={() => {
                onAbertoChange(false);
                aoCifraManual?.(louvor);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-2" />
              {louvor.temCifraApiSalva ? "Editar cifra manual" : "Adicionar cifra manual"}
            </Button>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            {noGrupo && aoRemoverDoGrupo && (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  onAbertoChange(false);
                  aoRemoverDoGrupo(louvor);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover do grupo
              </Button>
            )}
            <Button
              onClick={() => {
                onAbertoChange(false);
                aoEditar(louvor);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar louvor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CartaoLouvor({
  louvor,
  aoEditar,
  aoExcluir,
  aoVerDetalhes,
  aoVisualizarLetra,
  aoVisualizarCifraOnline,
  showDrag,
  noGrupo,
  aoRemoverDoGrupo,
  dragHandleProps,
}: CartaoLouvorProps) {
  const config = typeConfig[louvor.type];

  const linksExtras = (
    <>
      <DropdownMenuItem onClick={() => aoVisualizarLetra?.(louvor)}>
        <Mic2 className="h-4 w-4 mr-2" />
        Ver letra
        {louvor.temLetraSalva && <span className="ml-auto text-[10px] text-muted-foreground">salva</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => aoVisualizarCifraOnline?.(louvor)}>
        <FileText className="h-4 w-4 mr-2" />
        Cifra online
        {louvor.temCifraApiSalva && <span className="ml-auto text-[10px] text-muted-foreground">salva</span>}
      </DropdownMenuItem>
      {louvor.youtubeUrl && (
        <DropdownMenuItem asChild>
          <a href={louvor.youtubeUrl} target="_blank" rel="noopener noreferrer">
            <Youtube className="h-4 w-4 mr-2" />
            Abrir no YouTube
          </a>
        </DropdownMenuItem>
      )}
    </>
  );

  return (
    <Card className="hover:shadow-md transition-shadow min-w-0 overflow-hidden">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
          {showDrag && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...dragHandleProps}
                  className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded hover:bg-muted shrink-0 mt-0.5"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Arrastar para reordenar</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-dark font-bold text-xs sm:text-sm">
            {louvor.key || "—"}
          </div>

          <button
            type="button"
            className="flex-1 min-w-0 text-left rounded-md -my-1 py-1 px-0.5 hover:bg-muted/50 transition-colors"
            onClick={() => aoVerDetalhes?.(louvor)}
          >
            <h3 className="font-semibold text-sm sm:text-base leading-snug break-words">
              {louvor.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Badge variant="outline" className={cn("text-[10px] sm:text-xs shrink-0", config.color)}>
                {config.label}
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground break-words min-w-0">
                {louvor.artist}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-0.5 shrink-0 -mr-1 sm:mr-0">
            <div className="hidden sm:flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => aoVisualizarLetra?.(louvor)}
                  >
                    <Mic2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver letra{louvor.temLetraSalva ? " (salva)" : ""}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => aoVisualizarCifraOnline?.(louvor)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cifra online{louvor.temCifraApiSalva ? " (salva)" : ""}</p>
                </TooltipContent>
              </Tooltip>
              {louvor.youtubeUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={louvor.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Abrir no YouTube</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mais opções</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-52">
                <div className="sm:hidden">{linksExtras}</div>
                <DropdownMenuItem onClick={() => aoVerDetalhes?.(louvor)}>
                  <Music className="h-4 w-4 mr-2" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aoEditar(louvor)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {(noGrupo && aoRemoverDoGrupo) || !noGrupo ? <DropdownMenuSeparator /> : null}
                {noGrupo && aoRemoverDoGrupo && (
                  <DropdownMenuItem
                    onClick={() => aoRemoverDoGrupo(louvor)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover do grupo
                  </DropdownMenuItem>
                )}
                {!noGrupo && (
                  <DropdownMenuItem onClick={() => aoExcluir(louvor)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SortableCartaoLouvorProps extends CartaoLouvorProps {
  id: string;
}

function SortableCartaoLouvor(props: SortableCartaoLouvorProps) {
  const { id, ...rest } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50")}>
      <CartaoLouvor {...rest} showDrag dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default function PaginaLouvores() {
  const { user } = usarAutenticacao();
  const podeCadastrar = canWrite(user, "/louvores");

  const [buscaTexto, setBuscaTexto] = useState("");
  const [louvores, setLouvores] = useState<LouvorApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<LouvorApp | null>(null);
  const [excluindo, setExcluindo] = useState<LouvorApp | null>(null);

  const [grupos, setGrupos] = useState<GrupoLouvorApp[]>([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);
  const [dialogGrupoAberto, setDialogGrupoAberto] = useState(false);
  const [nomeNovoGrupo, setNomeNovoGrupo] = useState("");
  const [excluindoGrupo, setExcluindoGrupo] = useState<GrupoLouvorApp | null>(null);
  const [grupoModalAdicionar, setGrupoModalAdicionar] = useState<GrupoLouvorApp | null>(null);
  const [louvoresSelecionadosGrupo, setLouvoresSelecionadosGrupo] = useState<Set<string>>(new Set());
  const [adicionandoLouvoresGrupo, setAdicionandoLouvoresGrupo] = useState(false);
  const [louvorDetalhe, setLouvorDetalhe] = useState<{
    louvor: LouvorApp;
    grupo?: GrupoLouvorApp;
  } | null>(null);
  const [removendoLouvorDoGrupo, setRemovendoLouvorDoGrupo] = useState<{
    grupo: GrupoLouvorApp;
    louvor: LouvorApp;
  } | null>(null);
  const [letraVisualizando, setLetraVisualizando] = useState<LouvorApp | null>(null);
  const [letraModoEdicao, setLetraModoEdicao] = useState(false);
  const [cifraOnlineVisualizando, setCifraOnlineVisualizando] = useState<LouvorApp | null>(null);
  const [cifraOnlineModoEdicao, setCifraOnlineModoEdicao] = useState(false);
  const ordemGrupoTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Form state
  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [tonalidade, setTonalidade] = useState("");
  const [tipo, setTipo] = useState<LouvorApp["type"]>("adoracao");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarLouvores = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarLouvores(buscaTexto || undefined);
      setLouvores(lista);
    } catch (e) {
      toast.error("Erro ao carregar louvores.");
      setLouvores([]);
    } finally {
      setCarregando(false);
    }
  }, [buscaTexto]);

  useEffect(() => {
    carregarLouvores();
  }, [carregarLouvores]);

  const carregarGrupos = useCallback(async () => {
    setCarregandoGrupos(true);
    try {
      const lista = await listarGrupos();
      setGrupos(lista);
    } catch (e) {
      toast.error("Erro ao carregar grupos.");
      setGrupos([]);
    } finally {
      setCarregandoGrupos(false);
    }
  }, []);

  useEffect(() => {
    carregarGrupos();
  }, [carregarGrupos]);

  const abrirVisualizadorLetra = (louvor: LouvorApp) => {
    setLetraModoEdicao(false);
    setLetraVisualizando(louvor);
  };

  const abrirLetraManual = (louvor: LouvorApp) => {
    setLetraModoEdicao(true);
    setLetraVisualizando(louvor);
  };

  const abrirVisualizadorCifraOnline = (louvor: LouvorApp) => {
    setCifraOnlineModoEdicao(false);
    setCifraOnlineVisualizando(louvor);
  };

  const abrirCifraManual = (louvor: LouvorApp) => {
    setCifraOnlineModoEdicao(true);
    setCifraOnlineVisualizando(louvor);
  };

  const atualizarLouvorNaLista = useCallback((atualizado: LouvorApp) => {
    setLouvores((prev) => prev.map((l) => (l.id === atualizado.id ? atualizado : l)));
    setLouvorDetalhe((prev) =>
      prev && prev.louvor.id === atualizado.id ? { ...prev, louvor: atualizado } : prev,
    );
  }, []);

  const abrirDetalheLouvor = (louvor: LouvorApp, grupo?: GrupoLouvorApp) => {
    setLouvorDetalhe({ louvor, grupo });
  };

  const solicitarRemoverDoGrupo = (grupo: GrupoLouvorApp, louvor: LouvorApp) => {
    setLouvorDetalhe(null);
    setRemovendoLouvorDoGrupo({ grupo, louvor });
  };

  const executarRemoverDoGrupo = async () => {
    if (!removendoLouvorDoGrupo) return;
    const { grupo, louvor } = removendoLouvorDoGrupo;
    if (!louvor.idNum) return;
    setRemovendoLouvorDoGrupo(null);
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === grupo.id ? { ...g, louvorIds: g.louvorIds.filter((id) => id !== louvor.id) } : g,
      ),
    );
    try {
      await removerLouvorDoGrupo(grupo.idNum, louvor.idNum);
      toast.success("Louvor removido do grupo.");
    } catch {
      toast.error("Erro ao remover louvor do grupo.");
      await carregarGrupos();
    }
  };

  const salvarOrdemGrupoDebounced = useCallback((grupo: GrupoLouvorApp, louvorIds: string[]) => {
    const louvorIdsNumericos = louvorIds.map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n));
    const timerAnterior = ordemGrupoTimersRef.current.get(grupo.idNum);
    if (timerAnterior) clearTimeout(timerAnterior);
    const timer = setTimeout(async () => {
      ordemGrupoTimersRef.current.delete(grupo.idNum);
      try {
        const atualizado = await reordenarLouvoresNoGrupo(grupo.idNum, louvorIdsNumericos);
        setGrupos((prev) => prev.map((g) => (g.id === grupo.id ? atualizado : g)));
      } catch {
        toast.error("Erro ao salvar ordem.");
        await carregarGrupos();
      }
    }, 350);
    ordemGrupoTimersRef.current.set(grupo.idNum, timer);
  }, [carregarGrupos]);

  useEffect(() => {
    const timers = ordemGrupoTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const resetForm = () => {
    setTitulo("");
    setArtista("");
    setTonalidade("");
    setTipo("adoracao");
    setYoutubeUrl("");
    setEditando(null);
  };

  const abrirNovo = () => {
    resetForm();
    setEditando(null);
    setDialogAberto(true);
  };

  const abrirEditar = (louvor: LouvorApp) => {
    setEditando(louvor);
    setTitulo(louvor.title);
    setArtista(louvor.artist);
    setTonalidade(louvor.key);
    setTipo(louvor.type);
    setYoutubeUrl(louvor.youtubeUrl ?? "");
    setDialogAberto(true);
  };

  const salvar = async () => {
    if (!titulo.trim() || !artista.trim()) {
      toast.error("Título e artista são obrigatórios.");
      return;
    }
    setSalvando(true);
    try {
      if (editando?.idNum) {
        await atualizarLouvor(editando.idNum, {
          title: titulo.trim(),
          artist: artista.trim(),
          key: tonalidade,
          tempo: editando.tempo,
          type: tipo,
          youtubeUrl: youtubeUrl.trim() || undefined,
          isActive: true,
        });
        toast.success("Louvor atualizado.");
      } else {
        await criarLouvor({
          title: titulo.trim(),
          artist: artista.trim(),
          key: tonalidade,
          type: tipo,
          youtubeUrl: youtubeUrl.trim() || undefined,
          isActive: true,
        });
        toast.success("Louvor cadastrado.");
      }
      setDialogAberto(false);
      resetForm();
      carregarLouvores();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar louvor.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = (louvor: LouvorApp) => {
    setExcluindo(louvor);
  };

  const executarExcluir = async () => {
    if (!excluindo?.idNum) return;
    try {
      await excluirLouvor(excluindo.idNum);
      toast.success("Louvor excluído.");
      setExcluindo(null);
      carregarLouvores();
      carregarGrupos();
    } catch (e) {
      toast.error("Erro ao excluir louvor.");
    }
  };

  const criarNovoGrupo = async () => {
    if (!nomeNovoGrupo.trim()) {
      toast.error("Informe o nome do grupo.");
      return;
    }
    try {
      await criarGrupo(nomeNovoGrupo.trim());
      toast.success("Grupo criado.");
      setNomeNovoGrupo("");
      setDialogGrupoAberto(false);
      carregarGrupos();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar grupo.");
    }
  };

  const executarExcluirGrupo = async () => {
    if (!excluindoGrupo?.idNum) return;
    try {
      await excluirGrupo(excluindoGrupo.idNum);
      toast.success("Grupo excluído.");
      setExcluindoGrupo(null);
      carregarGrupos();
    } catch (e) {
      toast.error("Erro ao excluir grupo.");
    }
  };

  const abrirModalAdicionar = (grupo: GrupoLouvorApp) => {
    setLouvoresSelecionadosGrupo(new Set());
    setGrupoModalAdicionar(grupo);
  };

  const fecharModalAdicionar = () => {
    setGrupoModalAdicionar(null);
    setLouvoresSelecionadosGrupo(new Set());
  };

  const alternarSelecaoLouvor = (louvorId: string) => {
    setLouvoresSelecionadosGrupo((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(louvorId)) {
        proximo.delete(louvorId);
      } else {
        proximo.add(louvorId);
      }
      return proximo;
    });
  };

  const adicionarLouvoresSelecionados = async (grupo: GrupoLouvorApp) => {
    const ids = [...louvoresSelecionadosGrupo];
    const louvoresParaAdicionar = ids
      .map((id) => obterLouvorPorId(id))
      .filter((l): l is LouvorApp => l != null && l.idNum != null);
    if (louvoresParaAdicionar.length === 0) return;

    setAdicionandoLouvoresGrupo(true);
    let grupoAtualizado: GrupoLouvorApp | null = null;
    let erros = 0;
    for (const louvor of louvoresParaAdicionar) {
      try {
        grupoAtualizado = await adicionarLouvorAoGrupo(grupo.idNum, louvor.idNum!);
      } catch {
        erros += 1;
      }
    }
    if (grupoAtualizado) {
      const resultado = grupoAtualizado;
      setGrupos((prev) => prev.map((g) => (g.id === grupo.id ? resultado : g)));
    }
    setAdicionandoLouvoresGrupo(false);
    fecharModalAdicionar();

    const adicionados = louvoresParaAdicionar.length - erros;
    if (adicionados > 0) {
      toast.success(
        adicionados === 1 ? "Louvor adicionado ao grupo." : `${adicionados} louvores adicionados ao grupo.`,
      );
    }
    if (erros > 0) {
      toast.error(`${erros} louvor(es) não puderam ser adicionados.`);
    }
  };

  const handleDragEndGrupo = (grupo: GrupoLouvorApp, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = [...grupo.louvorIds];
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordenados = arrayMove(ids, oldIndex, newIndex);
    setGrupos((prev) => prev.map((g) => (g.id === grupo.id ? { ...g, louvorIds: reordenados } : g)));
    salvarOrdemGrupoDebounced(grupo, reordenados);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const louvoresFiltrados = louvores;
  const obterLouvorPorId = (id: string) => louvores.find((p) => p.id === id);

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Music className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold">Louvores</h1>
              <p className="text-sm text-muted-foreground">
                {louvores.length} louvores cadastrados
              </p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={(open) => { setDialogAberto(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0 w-full sm:w-auto" onClick={abrirNovo} disabled={!podeCadastrar} title={!podeCadastrar ? "Apenas administradores podem cadastrar louvores" : undefined}>
                  <Plus className="h-4 w-4" />
                  Novo
              </Button>
            </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editando ? "Editar Louvor" : "Novo Louvor"}</DialogTitle>
                  <DialogDescription>
                    {editando ? "Altere os dados do louvor." : "Cadastre um novo louvor no repertório."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Nome do louvor"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artista/Ministério *</Label>
                    <CampoArtistaLouvor
                      id="artist"
                      value={artista}
                      onChange={setArtista}
                      ativo={dialogAberto}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tonalidade</Label>
                      <Select value={tonalidade || "none"} onValueChange={(v) => setTonalidade(v === "none" ? "" : v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {TONALIDADES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={tipo} onValueChange={(v) => setTipo(v as LouvorApp["type"])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_LOUVOR.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube">Link do YouTube</Label>
                    <Input
                      id="youtube"
                      placeholder="https://youtube.com/..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogAberto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={salvar} disabled={salvando}>
                      {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {salvando ? " Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>

        <Tabs defaultValue="groups" className="w-full min-w-0">
          <TabsList className="grid w-full grid-cols-2 min-w-0">
            <TabsTrigger value="groups" className="gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
              <List className="h-4 w-4 shrink-0" />
              <span className="truncate">Grupos</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
              <Music className="h-4 w-4 shrink-0" />
              <span className="truncate">Repertório</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-4 space-y-4">
            <Dialog open={dialogGrupoAberto} onOpenChange={setDialogGrupoAberto}>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setDialogGrupoAberto(true)}
                disabled={!podeCadastrar}
              >
                <Plus className="h-4 w-4" />
                Criar Novo Grupo
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Grupo</DialogTitle>
                  <DialogDescription>Informe o nome do grupo de louvores.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeGrupo">Nome do grupo</Label>
                    <Input
                      id="nomeGrupo"
                      placeholder="Ex: Domingo - Manhã"
                      value={nomeNovoGrupo}
                      onChange={(e) => setNomeNovoGrupo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && criarNovoGrupo()}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogGrupoAberto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={criarNovoGrupo} disabled={!nomeNovoGrupo.trim()}>
                      Criar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {carregandoGrupos ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {grupos.filter((g): g is GrupoLouvorApp => g != null).map((grupo) => {
                  const louvoresNoGrupo = grupo.louvorIds
                    .map((id) => obterLouvorPorId(id))
                    .filter((l): l is LouvorApp => l != null);
                  const louvoresDisponiveis = louvores.filter(
                    (l) => !grupo.louvorIds.includes(l.id)
                  );

                  return (
                    <Card key={grupo.id} className="min-w-0 overflow-hidden">
                      <CardHeader className="pb-3 px-3 sm:px-6">
                        <div className="flex flex-col gap-2 min-w-0 sm:flex-row sm:items-center sm:justify-between">
                          <CardTitle className="text-base break-words text-left leading-snug">
                            {grupo.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
                            {podeCadastrar && (
                              <Dialog open={grupoModalAdicionar?.id === grupo.id} onOpenChange={(open) => !open && fecharModalAdicionar()}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => abrirModalAdicionar(grupo)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Adicionar
                                </Button>
                                <DialogContent className="max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>Adicionar louvores ao grupo</DialogTitle>
                                    <DialogDescription>
                                      Selecione um ou mais louvores para adicionar ao grupo &quot;{grupo.name}&quot;.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Command className="mt-2">
                                    <CommandInput placeholder="Buscar louvor..." />
                                    <CommandList className="max-h-[50vh]">
                                      <CommandEmpty>Nenhum louvor disponível.</CommandEmpty>
                                      <CommandGroup>
                                        {louvoresDisponiveis.map((louvor) => {
                                          const cfg = typeConfig[louvor.type];
                                          const selecionado = louvoresSelecionadosGrupo.has(louvor.id);
                                          return (
                                            <CommandItem
                                              key={louvor.id}
                                              value={`${louvor.title} ${louvor.artist}`}
                                              onSelect={() => alternarSelecaoLouvor(louvor.id)}
                                              className="gap-2"
                                            >
                                              <div
                                                className={cn(
                                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                                  selecionado
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "border-muted-foreground/40",
                                                )}
                                              >
                                                {selecionado && <Check className="h-3 w-3" />}
                                              </div>
                                              <div className="flex flex-col min-w-0 flex-1">
                                                <span className="truncate">{louvor.title} — {louvor.artist}</span>
                                                <span className="text-xs text-muted-foreground">
                                                  Tom: {louvor.key || "—"} · {cfg.label}
                                                </span>
                                              </div>
                                            </CommandItem>
                                          );
                                        })}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                  <DialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
                                    <span className="text-sm text-muted-foreground">
                                      {louvoresSelecionadosGrupo.size} selecionado(s)
                                    </span>
                                    <div className="flex gap-2 sm:justify-end">
                                      <Button variant="outline" onClick={fecharModalAdicionar} disabled={adicionandoLouvoresGrupo}>
                                        Cancelar
                                      </Button>
                                      <Button
                                        onClick={() => void adicionarLouvoresSelecionados(grupo)}
                                        disabled={louvoresSelecionadosGrupo.size === 0 || adicionandoLouvoresGrupo}
                                      >
                                        {adicionandoLouvoresGrupo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Adicionar
                                        {louvoresSelecionadosGrupo.size > 0 ? ` (${louvoresSelecionadosGrupo.size})` : ""}
                                      </Button>
                                    </div>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Badge variant="secondary" className="text-xs shrink-0 whitespace-nowrap">
                              {grupo.louvorIds.length} louvores
                            </Badge>
                            {podeCadastrar && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive ml-0.5 sm:ml-1"
                                    onClick={() => setExcluindoGrupo(grupo)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir grupo completamente</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 px-3 sm:px-6">
                        {louvoresNoGrupo.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4">
                            Nenhum louvor no grupo. Clique em &quot;Adicionar&quot; para incluir louvores.
                          </p>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEndGrupo(grupo, e)}
                          >
                            <SortableContext
                              items={grupo.louvorIds}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {louvoresNoGrupo.map((louvor) => (
                                  <SortableCartaoLouvor
                                    key={louvor.id}
                                    id={louvor.id}
                                    louvor={louvor}
                                    aoEditar={abrirEditar}
                                    aoExcluir={confirmarExcluir}
                                    aoVerDetalhes={(l) => abrirDetalheLouvor(l, grupo)}
                                    aoVisualizarLetra={abrirVisualizadorLetra}
                                    aoVisualizarCifraOnline={abrirVisualizadorCifraOnline}
                                    noGrupo
                                    aoRemoverDoGrupo={() => solicitarRemoverDoGrupo(grupo, louvor)}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {grupos.length === 0 && !carregandoGrupos && (
                  <div className="text-center py-12">
                    <List className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum grupo criado</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Clique em <strong>Criar Novo Grupo</strong> para começar.
                    </p>
                  </div>
                )}
              </div>
            )}

            <AlertDialog open={!!excluindoGrupo} onOpenChange={() => setExcluindoGrupo(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o grupo &quot;{excluindoGrupo?.name}&quot;?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={executarExcluirGrupo}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TabsContent>

          <TabsContent value="all" className="mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar louvor..."
                className="pl-10"
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
              />
            </div>

            {carregando ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {louvoresFiltrados.map((louvor) => (
                  <CartaoLouvor
                    key={louvor.id}
                    louvor={louvor}
                    aoEditar={abrirEditar}
                    aoExcluir={confirmarExcluir}
                    aoVerDetalhes={(l) => abrirDetalheLouvor(l)}
                    aoVisualizarLetra={abrirVisualizadorLetra}
                    aoVisualizarCifraOnline={abrirVisualizadorCifraOnline}
                  />
                ))}
                {louvoresFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum louvor encontrado</p>
                    {podeCadastrar && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Clique em <strong>Novo</strong> no canto superior direito para cadastrar seu primeiro louvor.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogDetalheLouvor
          louvor={louvorDetalhe?.louvor ?? null}
          aberto={!!louvorDetalhe}
          onAbertoChange={(open) => {
            if (!open) setLouvorDetalhe(null);
          }}
          aoEditar={abrirEditar}
          aoVisualizarLetra={abrirVisualizadorLetra}
          aoVisualizarCifraOnline={abrirVisualizadorCifraOnline}
          aoLetraManual={abrirLetraManual}
          aoCifraManual={abrirCifraManual}
          onLouvorAtualizado={atualizarLouvorNaLista}
          noGrupo={!!louvorDetalhe?.grupo}
          aoRemoverDoGrupo={
            louvorDetalhe?.grupo
              ? (l) => solicitarRemoverDoGrupo(louvorDetalhe.grupo!, l)
              : undefined
          }
        />

        <AlertDialog open={!!removendoLouvorDoGrupo} onOpenChange={(open) => !open && setRemovendoLouvorDoGrupo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover do grupo</AlertDialogTitle>
              <AlertDialogDescription>
                Remover &quot;{removendoLouvorDoGrupo?.louvor.title}&quot; do grupo &quot;
                {removendoLouvorDoGrupo?.grupo.name}&quot;? O louvor continua no repertório geral.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void executarRemoverDoGrupo()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir louvor</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir &quot;{excluindo?.title}&quot;? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={executarExcluir} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <VisualizadorLetraLouvor
          louvor={letraVisualizando}
          aberto={!!letraVisualizando}
          onFechar={() => {
            setLetraVisualizando(null);
            setLetraModoEdicao(false);
          }}
          onCacheAtualizado={carregarLouvores}
          modoEdicaoInicial={letraModoEdicao}
        />

        <VisualizadorCifraOnlineLouvor
          louvor={cifraOnlineVisualizando}
          aberto={!!cifraOnlineVisualizando}
          onFechar={() => {
            setCifraOnlineVisualizando(null);
            setCifraOnlineModoEdicao(false);
          }}
          onCacheAtualizado={carregarLouvores}
          modoEdicaoInicial={cifraOnlineModoEdicao}
        />
      </div>
    </LayoutApp>
  );
}
