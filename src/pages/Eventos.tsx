import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Calendar, CheckCircle2, Loader2, MapPin, Plus, Search, Trash2, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import {
  atualizarEvento,
  cancelarInscricaoEvento,
  confirmarCheckInInscricao,
  criarEvento,
  excluirEvento,
  inscreverEvento,
  LABEL_PUBLICO_EVENTO,
  listarEventos,
  obterEvento,
  type EventoDTO,
  type EventoInscricaoDTO,
  type PublicoEvento,
} from "@/modules/eventos/api";

const formatarDataEvento = (data?: string | null) => {
  if (!data) return "";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
};

const dataParaPicker = (data?: string | null) => {
  if (!data) return "";
  return data.slice(0, 10);
};

const vazio = (): EventoDTO => ({
  titulo: "",
  descricao: "",
  dataInicio: new Date().toISOString().slice(0, 10),
  publico: "INTERNO",
  inscricoesAbertas: true,
});

export default function Eventos() {
  const { user } = usarAutenticacao();
  const userId = user?.id ? Number(user.id) : undefined;
  const podeEditar = canWrite(user, "/eventos");
  const [lista, setLista] = useState<EventoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState<EventoDTO>(vazio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null);
  const [inscrevendoId, setInscrevendoId] = useState<number | null>(null);
  const [inscritosEvento, setInscritosEvento] = useState<EventoDTO | null>(null);
  const [carregandoInscritos, setCarregandoInscritos] = useState(false);
  const [checkInId, setCheckInId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLista((await listarEventos(userId)) ?? []);
    } catch {
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, [userId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return lista;
    return lista.filter(
      (i) =>
        i.titulo.toLowerCase().includes(t) ||
        i.local?.toLowerCase().includes(t) ||
        i.descricao?.toLowerCase().includes(t),
    );
  }, [lista, busca]);

  const abrirNovo = () => {
    setForm(vazio());
    setEditandoId(null);
    setDialogAberto(true);
  };

  const abrirEditar = (item: EventoDTO) => {
    setForm({
      ...item,
      dataInicio: dataParaPicker(item.dataInicio),
      dataFim: dataParaPicker(item.dataFim),
    });
    setEditandoId(item.id ?? null);
    setDialogAberto(true);
  };

  const salvar = async () => {
    if (!form.titulo.trim()) {
      toast.error("Informe o título do evento.");
      return;
    }
    setSalvando(true);
    try {
      if (editandoId) {
        await atualizarEvento(editandoId, form);
        toast.success("Evento atualizado.");
      } else {
        await criarEvento(form);
        toast.success("Evento criado.");
      }
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
    try {
      const detalhe = await obterEvento(evento.id, userId);
      setInscritosEvento(detalhe);
    } catch {
      toast.error("Não foi possível carregar inscritos.");
      setInscritosEvento(null);
    } finally {
      setCarregandoInscritos(false);
    }
  };

  const fazerCheckIn = async (inscricao: EventoInscricaoDTO) => {
    if (!inscritosEvento?.id || !inscricao.id) return;
    setCheckInId(inscricao.id);
    try {
      await confirmarCheckInInscricao(inscritosEvento.id, inscricao.id);
      toast.success("Check-in confirmado.");
      const detalhe = await obterEvento(inscritosEvento.id, userId);
      setInscritosEvento(detalhe);
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro no check-in.");
    } finally {
      setCheckInId(null);
    }
  };

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
              <p className="text-sm text-muted-foreground">{lista.length} eventos</p>
            </div>
          </div>
          {podeEditar && (
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button onClick={abrirNovo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                      rows={4}
                      value={form.descricao ?? ""}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Data início</Label>
                      <DatePicker
                        value={form.dataInicio ?? ""}
                        onChange={(v) => setForm({ ...form, dataInicio: v || undefined })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data fim</Label>
                      <DatePicker
                        value={form.dataFim ?? ""}
                        onChange={(v) => setForm({ ...form, dataFim: v || null })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Local</Label>
                    <Input
                      value={form.local ?? ""}
                      onChange={(e) => setForm({ ...form, local: e.target.value })}
                    />
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar evento..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum evento cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {filtrados.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      {item.inscrito && (
                        <Badge className="gap-1">
                          <UserCheck className="h-3 w-3" />
                          Inscrito
                        </Badge>
                      )}
                      {item.publico && (
                        <Badge variant="outline">{LABEL_PUBLICO_EVENTO[item.publico]}</Badge>
                      )}
                      {item.inscricoesAbertas && (
                        <Badge variant="outline">Inscrições abertas</Badge>
                      )}
                      {item.totalInscritos != null && item.totalInscritos > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {item.totalInscritos}
                          {item.capacidade ? ` / ${item.capacidade}` : ""}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{item.titulo}</h3>
                    {item.dataInicio && (
                      <p className="text-sm text-muted-foreground">{formatarDataEvento(item.dataInicio)}</p>
                    )}
                    {item.local && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {item.local}
                      </p>
                    )}
                    {item.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {item.inscricoesAbertas && item.id && (
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
                    {podeEditar && item.id && (item.totalInscritos ?? 0) > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => void abrirInscritos(item)}
                      >
                        <Users className="h-3.5 w-3.5" />
                        Inscritos
                      </Button>
                    )}
                    {podeEditar && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => abrirEditar(item)}>
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setExcluirId(item.id ?? null)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={inscritosEvento != null} onOpenChange={() => setInscritosEvento(null)}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inscritos — {inscritosEvento?.titulo}</DialogTitle>
          </DialogHeader>
          {carregandoInscritos ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (inscritosEvento?.inscricoes?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma inscrição.</p>
          ) : (
            <ul className="space-y-2">
              {inscritosEvento?.inscricoes?.map((inscricao) => (
                <li
                  key={inscricao.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{inscricao.userNome ?? "Participante"}</p>
                    {inscricao.confirmado && (
                      <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Check-in feito
                      </p>
                    )}
                  </div>
                  {!inscricao.confirmado && inscricao.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={checkInId === inscricao.id}
                      onClick={() => void fazerCheckIn(inscricao)}
                    >
                      {checkInId === inscricao.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Check-in"
                      )}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

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
