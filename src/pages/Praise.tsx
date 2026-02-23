import { useCallback, useEffect, useState } from "react";
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
  Download,
  Upload,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  listarLouvores,
  criarLouvor,
  atualizarLouvor,
  atualizarCifraLouvor,
  excluirLouvor,
  baixarCifra,
  type LouvorApp,
} from "@/modules/louvores/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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

const ACCEPT_CIFRA = "application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc";

interface CartaoLouvorProps {
  louvor: LouvorApp;
  aoEditar: (louvor: LouvorApp) => void;
  aoExcluir: (louvor: LouvorApp) => void;
  showDrag?: boolean;
  noGrupo?: boolean;
  aoRemoverDoGrupo?: (louvor: LouvorApp) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function CartaoLouvor({ louvor, aoEditar, aoExcluir, showDrag, noGrupo, aoRemoverDoGrupo, dragHandleProps }: CartaoLouvorProps) {
  const config = typeConfig[louvor.type];
  const [baixandoCifra, setBaixandoCifra] = useState(false);

  const handleBaixarCifra = async () => {
    if (!louvor.hasCifra || !louvor.idNum) return;
    setBaixandoCifra(true);
    try {
      const ext = louvor.cifraFileName?.match(/\.(pdf|docx?)$/i)?.[1] ?? "pdf";
      await baixarCifra(louvor.idNum, `${louvor.title.replace(/\s+/g, "_")}_cifra.${ext}`);
      toast.success("Cifra baixada.");
    } catch (e) {
      toast.error("Não foi possível baixar a cifra.");
    } finally {
      setBaixandoCifra(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {showDrag && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...dragHandleProps}
                  className="cursor-grab active:cursor-grabbing touch-none p-1 -ml-1 rounded hover:bg-muted shrink-0"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Arrastar para reordenar</p>
              </TooltipContent>
            </Tooltip>
          )}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-dark font-bold text-sm">
            {louvor.key || "—"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{louvor.title}</h3>
              <Badge variant="outline" className={cn("text-xs shrink-0", config.color)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{louvor.artist}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {louvor.hasCifra && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleBaixarCifra}
                    disabled={baixandoCifra}
                  >
                    {baixandoCifra ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Baixar cifra</p>
                </TooltipContent>
              </Tooltip>
            )}
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
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mais opções</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                {noGrupo && aoRemoverDoGrupo && (
                  <DropdownMenuItem onClick={() => aoRemoverDoGrupo(louvor)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover do grupo
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => aoEditar(louvor)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {!noGrupo && (
                  <DropdownMenuItem onClick={() => aoExcluir(louvor)} className="text-destructive">
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
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-50")}>
      <CartaoLouvor {...rest} showDrag dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default function PaginaLouvores() {
  const { user } = usarAutenticacao();
  const podeCadastrar = ["admin", "pastor", "lider", "secretaria"].includes(user?.role ?? "");

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

  // Form state
  const [titulo, setTitulo] = useState("");
  const [artista, setArtista] = useState("");
  const [tonalidade, setTonalidade] = useState("");
  const [tempo, setTempo] = useState("");
  const [tipo, setTipo] = useState<LouvorApp["type"]>("adoracao");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [cifraFile, setCifraFile] = useState<File | null>(null);
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

  const resetForm = () => {
    setTitulo("");
    setArtista("");
    setTonalidade("");
    setTempo("");
    setTipo("adoracao");
    setYoutubeUrl("");
    setCifraFile(null);
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
    setTempo(louvor.tempo ?? "");
    setTipo(louvor.type);
    setYoutubeUrl(louvor.youtubeUrl ?? "");
    setCifraFile(null);
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
          tempo: tempo || undefined,
          type: tipo,
          youtubeUrl: youtubeUrl.trim() || undefined,
          isActive: true,
        });
        if (cifraFile) {
          await atualizarCifraLouvor(editando.idNum, cifraFile);
        }
        toast.success("Louvor atualizado.");
      } else {
        await criarLouvor(
          {
            title: titulo.trim(),
            artist: artista.trim(),
            key: tonalidade,
            tempo: tempo || undefined,
            type: tipo,
            youtubeUrl: youtubeUrl.trim() || undefined,
            isActive: true,
          },
          cifraFile ?? undefined
        );
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

  const adicionarLouvor = async (grupo: GrupoLouvorApp, louvor: LouvorApp) => {
    if (!louvor.idNum) return;
    try {
      const atualizado = await adicionarLouvorAoGrupo(grupo.idNum, louvor.idNum);
      setGrupos((prev) => prev.map((g) => (g.id === grupo.id ? atualizado : g)));
      toast.success("Louvor adicionado ao grupo.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Este louvor já está no grupo.");
    }
  };

  const removerLouvorDoGrupoHandler = async (grupo: GrupoLouvorApp, louvor: LouvorApp) => {
    if (!louvor.idNum) return;
    try {
      await removerLouvorDoGrupo(grupo.idNum, louvor.idNum);
      await carregarGrupos();
      toast.success("Louvor removido do grupo.");
    } catch (e) {
      toast.error("Erro ao remover louvor do grupo.");
    }
  };

  const handleDragEndGrupo = async (grupo: GrupoLouvorApp, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = [...grupo.louvorIds];
    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = ids.indexOf(activeId);
    const newIndex = ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordenados = arrayMove(ids, oldIndex, newIndex);
    const louvorIdsNumericos = reordenados
      .map((id) => parseInt(id, 10))
      .filter((n) => !Number.isNaN(n));
    try {
      const atualizado = await reordenarLouvoresNoGrupo(grupo.idNum, louvorIdsNumericos);
      setGrupos((prev) => prev.map((g) => (g.id === grupo.id ? atualizado : g)));
      toast.success("Ordem atualizada.");
    } catch (e) {
      toast.error("Erro ao reordenar.");
      await carregarGrupos();
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const louvoresFiltrados = louvores;
  const obterLouvorPorId = (id: string) => louvores.find((p) => p.id === id);

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-gold-foreground">
              <Music className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Louvores</h1>
              <p className="text-sm text-muted-foreground">
                {louvores.length} louvores cadastrados
              </p>
            </div>
          </div>

          <Dialog open={dialogAberto} onOpenChange={(open) => { setDialogAberto(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={abrirNovo} disabled={!podeCadastrar} title={!podeCadastrar ? "Apenas administradores podem cadastrar louvores" : undefined}>
                  <Plus className="h-4 w-4" />
                  Novo
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                    <Input
                      id="artist"
                      placeholder="Ex: Hillsong"
                      value={artista}
                      onChange={(e) => setArtista(e.target.value)}
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
                    <Label htmlFor="tempo">Tempo (opcional)</Label>
                    <Input
                      id="tempo"
                      placeholder="Ex: Moderado, Lento, Alegre"
                      value={tempo}
                      onChange={(e) => setTempo(e.target.value)}
                    />
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
                  <div className="space-y-2">
                    <Label htmlFor="cifra" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Cifra (PDF ou Word)
                    </Label>
                    <Input
                      id="cifra"
                      type="file"
                      accept={ACCEPT_CIFRA}
                      onChange={(e) => setCifraFile(e.target.files?.[0] ?? null)}
                    />
                    {cifraFile && (
                      <p className="text-xs text-muted-foreground">
                        Arquivo selecionado: {cifraFile.name}
                      </p>
                    )}
                    {editando?.hasCifra && !cifraFile && (
                      <p className="text-xs text-muted-foreground">
                        Já existe cifra anexada. Selecione outro arquivo para substituir.
                      </p>
                    )}
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

        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups" className="gap-2">
              <List className="h-4 w-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Music className="h-4 w-4" />
              Repertório
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
              <DialogContent className="max-w-sm">
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
                    <Card key={grupo.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0" />
                          <CardTitle className="text-base truncate flex-1 text-center">
                            {grupo.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 shrink-0 flex-1 justify-end">
                            {podeCadastrar && (
                              <Dialog open={grupoModalAdicionar?.id === grupo.id} onOpenChange={(open) => !open && setGrupoModalAdicionar(null)}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => setGrupoModalAdicionar(grupo)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Adicionar
                                </Button>
                                <DialogContent className="max-w-md max-h-[85vh]">
                                  <DialogHeader>
                                    <DialogTitle>Adicionar louvor ao grupo</DialogTitle>
                                    <DialogDescription>
                                      Selecione o louvor para adicionar ao grupo &quot;{grupo.name}&quot;.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Command className="mt-2">
                                    <CommandInput placeholder="Buscar louvor..." />
                                    <CommandList className="max-h-[50vh]">
                                      <CommandEmpty>Nenhum louvor disponível.</CommandEmpty>
                                      <CommandGroup>
                                        {louvoresDisponiveis.map((louvor) => {
                                          const cfg = typeConfig[louvor.type];
                                          return (
                                            <CommandItem
                                              key={louvor.id}
                                              onSelect={() => {
                                                adicionarLouvor(grupo, louvor);
                                                setGrupoModalAdicionar(null);
                                              }}
                                            >
                                              <Music className="h-4 w-4 mr-2 shrink-0" />
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
                                </DialogContent>
                              </Dialog>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {grupo.louvorIds.length} louvores
                            </Badge>
                            {podeCadastrar && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
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
                      <CardContent className="space-y-2">
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
                                    noGrupo
                                    aoRemoverDoGrupo={() => removerLouvorDoGrupoHandler(grupo, louvor)}
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
      </div>
    </LayoutApp>
  );
}
