import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DatePicker } from "@/components/ui/date-picker";
import { AvatarCropperModal } from "@/components/avatar/AvatarCropperModal";
import { ModalRelatorioInscritosEvento } from "@/components/eventos/ModalRelatorioInscritosEvento";
import {
  Calendar,
  Camera,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { resolverUrlApi } from "@/modules/api/client";
import { canWrite } from "@/auth/permissions";
import {
  atualizarEvento,
  cancelarInscricaoEvento,
  confirmarCheckInInscricao,
  confirmarCheckInLote,
  criarEvento,
  excluirEvento,
  extrairData,
  extrairHora,
  formatarDataHoraEvento,
  inscreverEvento,
  LABEL_CATEGORIA_EVENTO,
  LABEL_PUBLICO_EVENTO,
  LABEL_STATUS_EVENTO,
  listarEventos,
  listarEventosPassados,
  listarEventosProximos,
  listarInscritosEvento,
  listarMinhasInscricoes,
  removerBannerEvento,
  uploadBannerEvento,
  type CategoriaEvento,
  type EventoDTO,
  type EventoFiltro,
  type EventoInscricaoDTO,
  type PublicoEvento,
  type StatusEvento,
} from "@/modules/eventos/api";

type AbaEventos = "proximos" | "passados" | "minhas" | "gestao";

type FormEvento = EventoDTO & { horaInicio?: string; horaFim?: string; horaPrazoCancelamento?: string };

const CATEGORIAS = Object.keys(LABEL_CATEGORIA_EVENTO) as CategoriaEvento[];
const STATUS_LIST = Object.keys(LABEL_STATUS_EVENTO) as StatusEvento[];
const PROPORCAO_BANNER = 16 / 7;

const vazio = (): FormEvento => ({
  titulo: "",
  descricao: "",
  dataInicio: new Date().toISOString().slice(0, 10),
  horaInicio: "09:00",
  publico: "INTERNO",
  inscricoesAbertas: true,
  categoria: "OUTRO",
  status: "PUBLICADO",
});

const badgeStatusVariant = (status?: StatusEvento) => {
  if (status === "PUBLICADO") return "default" as const;
  if (status === "CANCELADO") return "destructive" as const;
  return "secondary" as const;
};

export default function Eventos() {
  const [searchParams] = useSearchParams();
  const eventoIdParam = searchParams.get("eventoId");
  const { user } = usarAutenticacao();
  const { nomeExibicao } = useIgrejaConfiguracao();
  const userId = user?.id ? Number(user.id) : undefined;
  const podeEditar = canWrite(user, "/eventos");

  const [aba, setAba] = useState<AbaEventos>("proximos");
  const [lista, setLista] = useState<EventoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaEvento | "">("");
  const [filtroPublico, setFiltroPublico] = useState<PublicoEvento | "">("");
  const [filtroInscricoes, setFiltroInscricoes] = useState<"abertas" | "fechadas" | "">("");
  const [filtroStatus, setFiltroStatus] = useState<StatusEvento | "">("");

  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState<FormEvento>(vazio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null);
  const [inscrevendoId, setInscrevendoId] = useState<number | null>(null);

  const [inscritosEvento, setInscritosEvento] = useState<EventoDTO | null>(null);
  const [inscritosLista, setInscritosLista] = useState<EventoInscricaoDTO[]>([]);
  const [carregandoInscritos, setCarregandoInscritos] = useState(false);
  const [buscaInscritos, setBuscaInscritos] = useState("");
  const [filtroInscritos, setFiltroInscritos] = useState("TODOS");
  const [selecionadosCheckIn, setSelecionadosCheckIn] = useState<number[]>([]);
  const [checkInId, setCheckInId] = useState<number | null>(null);
  const [checkInLote, setCheckInLote] = useState(false);
  const [relatorioInscritosAberto, setRelatorioInscritosAberto] = useState(false);

  const inputBannerRef = useRef<HTMLInputElement>(null);
  const [bannerArquivo, setBannerArquivo] = useState<File | null>(null);
  const [bannerPreviewLocal, setBannerPreviewLocal] = useState<string | null>(null);
  const [removerBanner, setRemoverBanner] = useState(false);
  const [cropperBannerAberto, setCropperBannerAberto] = useState(false);
  const [imagemBannerParaRecortar, setImagemBannerParaRecortar] = useState<string | null>(null);

  const resetBanner = useCallback(() => {
    setBannerArquivo(null);
    setRemoverBanner(false);
    setImagemBannerParaRecortar(null);
    setCropperBannerAberto(false);
    setBannerPreviewLocal((atual) => {
      if (atual) URL.revokeObjectURL(atual);
      return null;
    });
  }, []);

  const previewBanner = useMemo(
    () => (removerBanner ? null : bannerPreviewLocal ?? resolverUrlApi(form.imagemUrl) ?? null),
    [removerBanner, bannerPreviewLocal, form.imagemUrl],
  );

  const dadosRelatorioInscritos = useMemo(
    () => ({
      tituloEvento: inscritosEvento?.titulo ?? "Evento",
      dataEvento: inscritosEvento?.dataInicio,
      local: inscritosEvento?.local,
      nomeIgreja: nomeExibicao,
    }),
    [inscritosEvento, nomeExibicao],
  );

  const montarFiltro = useCallback((): EventoFiltro => {
    const filtro: EventoFiltro = { busca: busca.trim() || undefined };
    if (filtroCategoria) filtro.categoria = filtroCategoria;
    if (filtroPublico) filtro.publico = filtroPublico;
    if (filtroStatus) filtro.status = filtroStatus;
    if (filtroInscricoes === "abertas") filtro.inscricoesAbertas = true;
    if (filtroInscricoes === "fechadas") filtro.inscricoesAbertas = false;
    if (aba === "proximos") filtro.periodo = "PROXIMOS";
    if (aba === "passados") filtro.periodo = "PASSADOS";
    if (aba === "gestao") filtro.periodo = "TODOS";
    return filtro;
  }, [aba, busca, filtroCategoria, filtroInscricoes, filtroPublico, filtroStatus]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      let dados: EventoDTO[] = [];
      if (aba === "minhas") {
        dados = (await listarMinhasInscricoes(userId)) ?? [];
        const filtro = montarFiltro();
        if (filtro.busca) {
          const t = filtro.busca.toLowerCase();
          dados = dados.filter(
            (i) =>
              i.titulo.toLowerCase().includes(t) ||
              i.local?.toLowerCase().includes(t) ||
              i.descricao?.toLowerCase().includes(t),
          );
        }
      } else if (aba === "proximos") {
        dados = (await listarEventosProximos(userId)) ?? [];
      } else if (aba === "passados") {
        dados = (await listarEventosPassados(userId)) ?? [];
      } else {
        dados = (await listarEventos(montarFiltro(), userId)) ?? [];
      }
      if (aba !== "gestao" && aba !== "minhas") {
        const filtro = montarFiltro();
        if (filtro.categoria) dados = dados.filter((e) => e.categoria === filtro.categoria);
        if (filtro.publico) dados = dados.filter((e) => e.publico === filtro.publico);
        if (filtro.status) dados = dados.filter((e) => e.status === filtro.status);
        if (filtro.inscricoesAbertas === true) dados = dados.filter((e) => e.inscricoesAbertas);
        if (filtro.inscricoesAbertas === false) dados = dados.filter((e) => !e.inscricoesAbertas);
        if (filtro.busca) {
          const t = filtro.busca.toLowerCase();
          dados = dados.filter(
            (i) =>
              i.titulo.toLowerCase().includes(t) ||
              i.local?.toLowerCase().includes(t) ||
              i.descricao?.toLowerCase().includes(t),
          );
        }
      }
      setLista(dados);
    } catch {
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, [aba, montarFiltro, userId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (!eventoIdParam || carregando) return;
    const id = Number(eventoIdParam);
    if (Number.isNaN(id)) return;
    const evento = lista.find((e) => e.id === id);
    if (evento && podeEditar) {
      void abrirInscritos(evento);
      return;
    }
    if (evento) {
      setAba(evento.dataInicio && new Date(evento.dataInicio) < new Date() ? "passados" : "proximos");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoIdParam, carregando, lista.length]);

  const subtitulo = useMemo(() => {
    if (aba === "proximos") return `${lista.length} evento(s) futuro(s)`;
    if (aba === "passados") return `${lista.length} evento(s) passado(s)`;
    if (aba === "minhas") return `${lista.length} inscrição(ões) ativa(s)`;
    return `${lista.length} evento(s) na gestão`;
  }, [aba, lista.length]);

  const abrirNovo = () => {
    resetBanner();
    setForm(vazio());
    setEditandoId(null);
    setDialogAberto(true);
  };

  const abrirEditar = (item: EventoDTO) => {
    resetBanner();
    setForm({
      ...item,
      dataInicio: extrairData(item.dataInicio),
      dataFim: item.dataFim ? extrairData(item.dataFim) : undefined,
      horaInicio: extrairHora(item.dataInicio),
      horaFim: item.dataFim ? extrairHora(item.dataFim) : undefined,
      prazoCancelamentoInscricao: item.prazoCancelamentoInscricao
        ? extrairData(item.prazoCancelamentoInscricao)
        : undefined,
      horaPrazoCancelamento: item.prazoCancelamentoInscricao
        ? extrairHora(item.prazoCancelamentoInscricao)
        : undefined,
    });
    setEditandoId(item.id ?? null);
    setDialogAberto(true);
  };

  const handleSelecionarBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const permitidos = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!permitidos.includes(arquivo.type)) {
      toast.error("Formato não permitido. Use JPEG, PNG, GIF ou WebP.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagemBannerParaRecortar(reader.result as string);
      setCropperBannerAberto(true);
    };
    reader.readAsDataURL(arquivo);
    e.target.value = "";
  };

  const handleConfirmarBannerRecortado = async (arquivo: File) => {
    setBannerPreviewLocal((atual) => {
      if (atual) URL.revokeObjectURL(atual);
      return URL.createObjectURL(arquivo);
    });
    setBannerArquivo(arquivo);
    setRemoverBanner(false);
    setImagemBannerParaRecortar(null);
  };

  const handleRemoverBanner = () => {
    setBannerPreviewLocal((atual) => {
      if (atual) URL.revokeObjectURL(atual);
      return null;
    });
    setBannerArquivo(null);
    setRemoverBanner(true);
  };

  const salvar = async () => {
    if (!form.titulo.trim()) {
      toast.error("Informe o título do evento.");
      return;
    }
    setSalvando(true);
    try {
      const payload: FormEvento = {
        ...form,
        imagemUrl: removerBanner ? null : form.imagemUrl,
        prazoCancelamentoInscricao: form.prazoCancelamentoInscricao
          ? `${form.prazoCancelamentoInscricao}T${form.horaPrazoCancelamento ?? "23:59"}:00`
          : null,
      };
      let eventoSalvo: EventoDTO;
      if (editandoId) {
        eventoSalvo = await atualizarEvento(editandoId, payload);
      } else {
        eventoSalvo = await criarEvento({ ...payload, imagemUrl: null });
      }
      const eventoId = editandoId ?? eventoSalvo.id;
      if (eventoId) {
        if (bannerArquivo) {
          await uploadBannerEvento(eventoId, bannerArquivo);
        } else if (removerBanner && editandoId) {
          await removerBannerEvento(eventoId);
        }
      }
      resetBanner();
      toast.success(editandoId ? "Evento atualizado." : "Evento criado.");
      setDialogAberto(false);
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!excluirId) return;
    try {
      await excluirEvento(excluirId);
      toast.success("Evento excluído.");
      void carregar();
    } catch {
      toast.error("Não foi possível excluir.");
    } finally {
      setExcluirId(null);
    }
  };

  const podeInscrever = (item: EventoDTO) =>
    item.status === "PUBLICADO" &&
    item.inscricoesAbertas &&
    !item.inscricoesEncerradas &&
    !item.lotado &&
    item.dataInicio &&
    new Date(item.dataInicio) > new Date();

  const toggleInscricao = async (item: EventoDTO) => {
    if (!item.id) return;
    setInscrevendoId(item.id);
    try {
      if (item.inscrito) {
        await cancelarInscricaoEvento(item.id);
        toast.success("Inscrição cancelada.");
      } else {
        await inscreverEvento(item.id);
        toast.success("Inscrição realizada!");
      }
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro na inscrição.");
    } finally {
      setInscrevendoId(null);
    }
  };

  const abrirInscritos = async (evento: EventoDTO) => {
    if (!evento.id) return;
    setCarregandoInscritos(true);
    setInscritosEvento(evento);
    setSelecionadosCheckIn([]);
    setBuscaInscritos("");
    setFiltroInscritos("TODOS");
    try {
      const inscritos = await listarInscritosEvento(evento.id);
      setInscritosLista(inscritos ?? []);
    } catch {
      toast.error("Não foi possível carregar inscritos.");
      setInscritosEvento(null);
    } finally {
      setCarregandoInscritos(false);
    }
  };

  const recarregarInscritos = async () => {
    if (!inscritosEvento?.id) return;
    const inscritos = await listarInscritosEvento(inscritosEvento.id, filtroInscritos, buscaInscritos);
    setInscritosLista(inscritos ?? []);
  };

  useEffect(() => {
    if (!inscritosEvento?.id) return;
    const t = setTimeout(() => void recarregarInscritos(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroInscritos, buscaInscritos, inscritosEvento?.id]);

  const fazerCheckIn = async (inscricao: EventoInscricaoDTO) => {
    if (!inscritosEvento?.id || !inscricao.id) return;
    setCheckInId(inscricao.id);
    try {
      await confirmarCheckInInscricao(inscritosEvento.id, inscricao.id);
      toast.success("Check-in confirmado.");
      await recarregarInscritos();
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no check-in.");
    } finally {
      setCheckInId(null);
    }
  };

  const fazerCheckInLote = async () => {
    if (!inscritosEvento?.id || selecionadosCheckIn.length === 0) return;
    setCheckInLote(true);
    try {
      await confirmarCheckInLote(inscritosEvento.id, selecionadosCheckIn);
      toast.success("Check-in em lote realizado.");
      setSelecionadosCheckIn([]);
      await recarregarInscritos();
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no check-in em lote.");
    } finally {
      setCheckInLote(false);
    }
  };

  const toggleSelecaoCheckIn = (id: number) => {
    setSelecionadosCheckIn((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderCard = (item: EventoDTO) => (
    <Card key={item.id} className="overflow-hidden flex flex-col h-full">
      {item.imagemUrl && (
        <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
          <img src={resolverUrlApi(item.imagemUrl)} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap gap-1.5">
          {item.categoria && (
            <Badge variant="secondary">{LABEL_CATEGORIA_EVENTO[item.categoria]}</Badge>
          )}
          {item.status && (
            <Badge variant={badgeStatusVariant(item.status)}>{LABEL_STATUS_EVENTO[item.status]}</Badge>
          )}
          {item.inscrito && (
            <Badge className="gap-1">
              <UserCheck className="h-3 w-3" />
              Inscrito
            </Badge>
          )}
          {item.situacaoInscricao === "CANCELADA" && (
            <Badge variant="outline">Inscrição cancelada</Badge>
          )}
          {item.publico && <Badge variant="outline">{LABEL_PUBLICO_EVENTO[item.publico]}</Badge>}
          {item.lotado && <Badge variant="destructive">Lotado</Badge>}
          {item.inscricoesEncerradas && !item.lotado && (
            <Badge variant="outline">Inscrições encerradas</Badge>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <h3 className="font-semibold line-clamp-2">{item.titulo}</h3>
          {item.dataInicio && (
            <p className="text-sm text-muted-foreground">{formatarDataHoraEvento(item.dataInicio)}</p>
          )}
          {item.local && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{item.local}</span>
            </p>
          )}
          {item.descricao && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          )}
          {(item.totalInscritos != null || item.capacidade != null) && (
            <p className="text-xs text-muted-foreground">
              {item.totalInscritos ?? 0}
              {item.capacidade ? ` / ${item.capacidade} vagas` : " inscrito(s)"}
              {item.vagasDisponiveis != null && item.capacidade
                ? ` · ${item.vagasDisponiveis} disponível(is)`
                : ""}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {podeInscrever(item) && item.id && (
            <Button
              size="sm"
              variant={item.inscrito ? "outline" : "default"}
              disabled={inscrevendoId === item.id}
              onClick={() => void toggleInscricao(item)}
            >
              {inscrevendoId === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : item.inscrito ? (
                "Cancelar inscrição"
              ) : (
                "Inscrever-se"
              )}
            </Button>
          )}
          {item.inscrito && item.inscricoesEncerradas && (
            <p className="text-xs text-muted-foreground text-center">Você está inscrito neste evento.</p>
          )}
          {item.linkExterno && (
            <Button size="sm" variant="outline" className="gap-1" asChild>
              <a href={item.linkExterno} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Saiba mais
              </a>
            </Button>
          )}
          {podeEditar && item.id && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={() => void abrirInscritos(item)}>
                <Users className="h-3.5 w-3.5" />
                Inscritos
              </Button>
              <Button size="sm" variant="outline" onClick={() => abrirEditar(item)}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => setExcluirId(item.id ?? null)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Eventos</h1>
              <p className="text-sm text-muted-foreground">{subtitulo}</p>
            </div>
          </div>
          {podeEditar && (
            <Dialog
              open={dialogAberto}
              onOpenChange={(open) => {
                setDialogAberto(open);
                if (!open) resetBanner();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={abrirNovo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editandoId ? "Editar" : "Novo"} evento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      rows={3}
                      value={form.descricao ?? ""}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Data início *</Label>
                      <DatePicker
                        value={form.dataInicio ?? ""}
                        onChange={(v) => setForm({ ...form, dataInicio: v || undefined })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora início</Label>
                      <Input
                        type="time"
                        value={form.horaInicio ?? "09:00"}
                        onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data fim</Label>
                      <DatePicker
                        value={form.dataFim ?? ""}
                        onChange={(v) => setForm({ ...form, dataFim: v || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora fim</Label>
                      <Input
                        type="time"
                        value={form.horaFim ?? ""}
                        onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Local</Label>
                    <Input value={form.local ?? ""} onChange={(e) => setForm({ ...form, local: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={form.categoria ?? "OUTRO"}
                        onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaEvento })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {LABEL_CATEGORIA_EVENTO[c]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={form.status ?? "PUBLICADO"}
                        onValueChange={(v) => setForm({ ...form, status: v as StatusEvento })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_LIST.map((s) => (
                            <SelectItem key={s} value={s}>
                              {LABEL_STATUS_EVENTO[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Capacidade</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.capacidade ?? ""}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            capacidade: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Público</Label>
                      <Select
                        value={form.publico ?? "INTERNO"}
                        onValueChange={(v) => setForm({ ...form, publico: v as PublicoEvento })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INTERNO">{LABEL_PUBLICO_EVENTO.INTERNO}</SelectItem>
                          <SelectItem value="PUBLICO">{LABEL_PUBLICO_EVENTO.PUBLICO}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Banner do evento</Label>
                    <input
                      ref={inputBannerRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleSelecionarBanner}
                    />
                    {previewBanner ? (
                      <div className="space-y-2">
                        <div className="aspect-[16/7] w-full overflow-hidden rounded-lg border bg-muted">
                          <img src={previewBanner} alt="Banner do evento" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => inputBannerRef.current?.click()}
                          >
                            <Camera className="h-3.5 w-3.5" />
                            Trocar imagem
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={handleRemoverBanner}
                          >
                            Remover banner
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-4 text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Escolha uma foto do celular ou do computador. Você poderá ajustar o enquadramento antes de salvar.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2"
                          onClick={() => inputBannerRef.current?.click()}
                        >
                          <Camera className="h-4 w-4" />
                          Selecionar imagem
                        </Button>
                        <p className="text-xs text-muted-foreground">JPEG, PNG, GIF ou WebP · até 5 MB</p>
                      </div>
                    )}
                  </div>
                  <AvatarCropperModal
                    open={cropperBannerAberto}
                    onOpenChange={(aberto) => {
                      setCropperBannerAberto(aberto);
                      if (!aberto) setImagemBannerParaRecortar(null);
                    }}
                    imageSrc={imagemBannerParaRecortar}
                    onConfirm={handleConfirmarBannerRecortado}
                    title="Ajustar banner do evento"
                    description="Posicione a imagem dentro da área destacada. O banner aparece no topo do card do evento."
                    confirmLabel="Usar este banner"
                    outputFileName="banner-evento.jpg"
                    hint="Arraste para posicionar e use o zoom. A proporção segue o card do evento (16:7)."
                    showAppPreview
                    formatoRecorte="banner"
                    aspectRatio={PROPORCAO_BANNER}
                  />
                  <div className="space-y-2">
                    <Label>Link externo</Label>
                    <Input
                      placeholder="Formulário, transmissão, localização..."
                      value={form.linkExterno ?? ""}
                      onChange={(e) => setForm({ ...form, linkExterno: e.target.value || null })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Prazo p/ cancelar inscrição</Label>
                      <DatePicker
                        value={form.prazoCancelamentoInscricao ?? ""}
                        onChange={(v) => setForm({ ...form, prazoCancelamentoInscricao: v || null })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora do prazo</Label>
                      <Input
                        type="time"
                        value={form.horaPrazoCancelamento ?? "23:59"}
                        onChange={(e) => setForm({ ...form, horaPrazoCancelamento: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Inscrições abertas</Label>
                    <Switch
                      checked={form.inscricoesAbertas ?? true}
                      onCheckedChange={(v) => setForm({ ...form, inscricoesAbertas: v })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => void salvar()} disabled={salvando}>
                    {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={aba} onValueChange={(v) => setAba(v as AbaEventos)}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="passados">Passados</TabsTrigger>
            <TabsTrigger value="minhas">Minhas inscrições</TabsTrigger>
            {podeEditar && <TabsTrigger value="gestao">Gestão</TabsTrigger>}
          </TabsList>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, local ou descrição..."
                className="pl-10"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select
                value={filtroCategoria || "TODAS"}
                onValueChange={(v) => setFiltroCategoria(v === "TODAS" ? "" : (v as CategoriaEvento))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas categorias</SelectItem>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {LABEL_CATEGORIA_EVENTO[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filtroPublico || "TODOS"}
                onValueChange={(v) => setFiltroPublico(v === "TODOS" ? "" : (v as PublicoEvento))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos públicos</SelectItem>
                  <SelectItem value="INTERNO">{LABEL_PUBLICO_EVENTO.INTERNO}</SelectItem>
                  <SelectItem value="PUBLICO">{LABEL_PUBLICO_EVENTO.PUBLICO}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filtroInscricoes || "TODAS"}
                onValueChange={(v) =>
                  setFiltroInscricoes(v === "TODAS" ? "" : (v as "abertas" | "fechadas"))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Inscrições" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas inscrições</SelectItem>
                  <SelectItem value="abertas">Abertas</SelectItem>
                  <SelectItem value="fechadas">Fechadas</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filtroStatus || "TODOS"}
                onValueChange={(v) => setFiltroStatus(v === "TODOS" ? "" : (v as StatusEvento))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos status</SelectItem>
                  {STATUS_LIST.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LABEL_STATUS_EVENTO[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(["proximos", "passados", "minhas", "gestao"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {carregando ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : lista.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Nenhum evento encontrado.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{lista.map(renderCard)}</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={inscritosEvento != null} onOpenChange={() => setInscritosEvento(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscritos — {inscritosEvento?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar inscrito..."
                  className="pl-10"
                  value={buscaInscritos}
                  onChange={(e) => setBuscaInscritos(e.target.value)}
                />
              </div>
              <Select value={filtroInscritos} onValueChange={setFiltroInscritos}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="CONFIRMADOS">Confirmados</SelectItem>
                  <SelectItem value="PENDENTES">Pendentes</SelectItem>
                  <SelectItem value="CANCELADOS">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {selecionadosCheckIn.length > 0 && (
                <Button size="sm" disabled={checkInLote} onClick={() => void fazerCheckInLote()}>
                  {checkInLote ? <Loader2 className="h-4 w-4 animate-spin" /> : `Check-in (${selecionadosCheckIn.length})`}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={inscritosLista.length === 0}
                onClick={() => setRelatorioInscritosAberto(true)}
              >
                <Eye className="h-3.5 w-3.5" />
                Visualizar relatório
              </Button>
            </div>
          </div>
          {carregandoInscritos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : inscritosLista.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma inscrição encontrada.</p>
          ) : (
            <ul className="space-y-2">
              {inscritosLista.map((inscricao) => (
                <li
                  key={inscricao.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    {inscricao.status === "ATIVA" && !inscricao.confirmado && inscricao.id && (
                      <Checkbox
                        checked={selecionadosCheckIn.includes(inscricao.id)}
                        onCheckedChange={() => toggleSelecaoCheckIn(inscricao.id!)}
                        className="mt-0.5"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium">{inscricao.userNome ?? "Participante"}</p>
                      {inscricao.userEmail && (
                        <p className="text-xs text-muted-foreground truncate">{inscricao.userEmail}</p>
                      )}
                      {inscricao.userTelefone && (
                        <p className="text-xs text-muted-foreground">{inscricao.userTelefone}</p>
                      )}
                      {inscricao.criadoEm && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Inscrito em {new Date(inscricao.criadoEm).toLocaleString("pt-BR")}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant={inscricao.status === "CANCELADA" ? "outline" : "secondary"}>
                          {inscricao.status === "CANCELADA" ? "Cancelada" : "Ativa"}
                        </Badge>
                        {inscricao.status === "ATIVA" && (
                          <Badge variant={inscricao.confirmado ? "default" : "outline"}>
                            {inscricao.confirmado ? "Check-in feito" : "Check-in pendente"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {inscricao.status === "ATIVA" && !inscricao.confirmado && inscricao.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={checkInId === inscricao.id}
                      onClick={() => void fazerCheckIn(inscricao)}
                    >
                      {checkInId === inscricao.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Check-in
                        </>
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <ModalRelatorioInscritosEvento
        aberto={relatorioInscritosAberto}
        onFechar={() => setRelatorioInscritosAberto(false)}
        dados={dadosRelatorioInscritos}
        inscritos={inscritosLista}
      />

      <AlertDialog open={excluirId != null} onOpenChange={() => setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarExcluir()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutApp>
  );
}
