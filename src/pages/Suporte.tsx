import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { LifeBuoy, Loader2, Paperclip, Plus, ArrowLeft, X } from "lucide-react";
import { LayoutApp } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BadgeStatusSuporte } from "@/components/suporte/BadgeStatusSuporte";
import { BadgeQuantidadeAnexos, PainelAnexosSuporte } from "@/components/suporte/PainelAnexosSuporte";
import {
  ConversaSuporte,
  podeClienteCancelar,
  podeClienteEnviarMensagem,
} from "@/components/suporte/ConversaSuporte";
import { obterConta } from "@/modules/account/api";
import { formatarTelefone } from "@/lib/masks";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { podeAcessarSuporte } from "@/auth/permissions";
import { aplicarMascaraTelefone } from "@/lib/mascara-telefone";
import {
  type ErrosNovaSolicitacao,
  type FormNovaSolicitacao,
  telefoneParaApi,
  validarNovaSolicitacao,
} from "@/lib/validacao-suporte";
import {
  cancelarSolicitacao,
  criarSolicitacaoComAnexo,
  MAX_ANEXOS_SUPORTE,
  enviarMensagemCliente,
  LABEL_TIPO,
  listarMinhasSolicitacoes,
  marcarSolicitacaoLida,
  obterMinhaSolicitacao,
  type SolicitacaoSuporte,
  type StatusSolicitacaoSuporte,
  type TipoSolicitacaoSuporte,
} from "@/modules/suporte/api";
import { marcarNotificacaoComoVista } from "@/modules/notifications/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TEXTO_SUPORTE } from "@/lib/plataforma";
import { usarNotificacoes } from "@/contexts/NotificationsContext";

const TIPOS: TipoSolicitacaoSuporte[] = ["DUVIDA", "SUGESTAO", "RECLAMACAO", "MELHORIA", "ERRO", "OUTRO"];
const STATUS_FILTRO: (StatusSolicitacaoSuporte | "TODOS")[] = [
  "TODOS",
  "ABERTA",
  "EM_ANALISE",
  "RESPONDIDA",
  "RESOLVIDA",
  "FINALIZADA",
];

function formatarData(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export default function Suporte() {
  const { user } = usarAutenticacao();
  const { refreshNotificacoes } = usarNotificacoes();
  const navigate = useNavigate();
  const { id: idParam } = useParams<{ id?: string }>();
  const detalheId = idParam ? Number(idParam) : null;

  const [lista, setLista] = useState<SolicitacaoSuporte[]>([]);
  const [detalhe, setDetalhe] = useState<SolicitacaoSuporte | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState<FormNovaSolicitacao>({
    tipo: "",
    titulo: "",
    descricao: "",
    emailSolicitante: "",
    telefoneSolicitante: "",
  });
  const [erros, setErros] = useState<ErrosNovaSolicitacao>({});
  const [anexos, setAnexos] = useState<File[]>([]);
  const inputAnexoRef = useRef<HTMLInputElement>(null);

  const carregarLista = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await listarMinhasSolicitacoes({
        status: filtroStatus !== "TODOS" ? (filtroStatus as StatusSolicitacaoSuporte) : undefined,
        tipo: filtroTipo !== "TODOS" ? (filtroTipo as TipoSolicitacaoSuporte) : undefined,
        busca: busca || undefined,
      });
      setLista(dados);
    } catch {
      setLista([]);
      toast.error("Não foi possível carregar suas solicitações. Tente atualizar a página.");
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus, filtroTipo, busca]);

  const sincronizarDetalhe = useCallback((s: SolicitacaoSuporte) => {
    setDetalhe((prev) =>
      prev
        ? {
            ...prev,
            mensagens: s.mensagens,
            status: s.status,
            respostaAdmin: s.respostaAdmin,
            dataResposta: s.dataResposta,
            respondidoPorNome: s.respondidoPorNome,
          }
        : prev,
    );
  }, []);

  const carregarDetalhe = useCallback(async (id: number) => {
    try {
      const s = await obterMinhaSolicitacao(id);
      setDetalhe(s);
      await marcarSolicitacaoLida(id).catch(() => undefined);
      await marcarNotificacaoComoVista("SUPORTE", id).catch(() => undefined);
      void refreshNotificacoes();
    } catch {
      setDetalhe(null);
      toast.error("Solicitação não encontrada.");
      navigate("/suporte");
    }
  }, [navigate, refreshNotificacoes]);

  useEffect(() => {
    void carregarLista();
  }, [carregarLista]);

  useEffect(() => {
    if (detalheId && !Number.isNaN(detalheId)) {
      void carregarDetalhe(detalheId);
    } else {
      setDetalhe(null);
    }
  }, [detalheId, carregarDetalhe]);

  useEffect(() => {
    if (!user || !modalAberto) return;
    void (async () => {
      let telefone = "";
      try {
        const conta = await obterConta();
        telefone = conta.phone ? formatarTelefone(conta.phone) : "";
      } catch {
        telefone = "";
      }
      setForm((f) => ({
        ...f,
        emailSolicitante: user.email ?? f.emailSolicitante,
        telefoneSolicitante: telefone || f.telefoneSolicitante,
      }));
    })();
  }, [user, modalAberto]);

  if (!podeAcessarSuporte(user)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  const abrirNova = () => {
    setForm({
      tipo: "",
      titulo: "",
      descricao: "",
      emailSolicitante: user?.email ?? "",
      telefoneSolicitante: "",
    });
    setErros({});
    setAnexos([]);
    setModalAberto(true);
  };

  const enviar = async () => {
    const errs = validarNovaSolicitacao(form, anexos);
    setErros(errs);
    if (Object.keys(errs).length > 0) return;

    setEnviando(true);
    try {
      await criarSolicitacaoComAnexo(
        {
          tipo: form.tipo as TipoSolicitacaoSuporte,
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim(),
          emailSolicitante: form.emailSolicitante.trim() || undefined,
          telefoneSolicitante: telefoneParaApi(form.telefoneSolicitante),
        },
        anexos.length > 0 ? anexos : undefined,
      );
      toast.success(TEXTO_SUPORTE.sucessoEnvio);
      setModalAberto(false);
      void carregarLista();
    } catch {
      toast.error("Não foi possível enviar sua solicitação. Verifique os dados e tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (detalhe) {
    return (
      <LayoutApp>
        <div className="mx-auto max-w-3xl space-y-4">
          <Button variant="ghost" className="gap-2 -ml-2" onClick={() => navigate("/suporte")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="space-y-4 border-b bg-muted/20 pb-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-xl leading-snug">{detalhe.titulo}</CardTitle>
                  <CardDescription>Aberta em {formatarData(detalhe.createdDate)}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Badge variant="outline">{LABEL_TIPO[detalhe.tipo]}</Badge>
                  <BadgeStatusSuporte status={detalhe.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              {detalhe.anexos && detalhe.anexos.length > 0 && (
                <div className="border-b px-5 py-4 sm:px-6">
                  <PainelAnexosSuporte solicitacaoId={detalhe.id} anexos={detalhe.anexos} visao="cliente" />
                </div>
              )}
              <div className="px-5 py-5 sm:px-6">
                <ConversaSuporte
                  solicitacao={detalhe}
                  visao="cliente"
                  podeEnviar={podeClienteEnviarMensagem(detalhe.status)}
                  placeholder="Escreva uma complementação ou tréplica..."
                  buscarAtualizacao={() => obterMinhaSolicitacao(detalhe.id)}
                  onSincronizar={async (atualizado) => {
                    sincronizarDetalhe(atualizado);
                    if (detalheId === atualizado.id) {
                      await marcarSolicitacaoLida(atualizado.id).catch(() => undefined);
                      await marcarNotificacaoComoVista("SUPORTE", atualizado.id).catch(() => undefined);
                    }
                    void refreshNotificacoes();
                  }}
                  onEnviar={async (texto) => {
                    try {
                      const atualizado = await enviarMensagemCliente(detalhe.id, texto);
                      sincronizarDetalhe(atualizado);
                      toast.success("Mensagem enviada.");
                      return atualizado;
                    } catch {
                      toast.error("Não foi possível enviar a mensagem.");
                      throw new Error("envio-falhou");
                    }
                  }}
                />
              </div>
              {podeClienteCancelar(detalhe.status) && (
                <div className="flex justify-end border-t bg-muted/10 px-5 py-4 sm:px-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/40 hover:bg-destructive/5"
                    onClick={async () => {
                      try {
                        const atualizado = await cancelarSolicitacao(detalhe.id);
                        setDetalhe(atualizado);
                        toast.success("Solicitação cancelada.");
                      } catch {
                        toast.error("Não foi possível cancelar a solicitação.");
                      }
                    }}
                  >
                    Cancelar solicitação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LifeBuoy className="h-7 w-7 text-primary" />
              Central de Suporte
            </h1>
            <p className="text-muted-foreground">{TEXTO_SUPORTE.subtituloCentral}</p>
          </div>
          <Button className="gap-2 shrink-0" onClick={abrirNova}>
            <Plus className="h-4 w-4" />
            Nova solicitação
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Input
                placeholder="Buscar por título ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTRO.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "TODOS" ? "Todos os status" : s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os tipos</SelectItem>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LABEL_TIPO[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">Você ainda não abriu nenhuma solicitação de suporte.</p>
              <Button onClick={abrirNova}>Abrir primeira solicitação</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lista.map((s) => (
              <Card
                key={s.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/30",
                  s.lidaPeloCliente === false && "border-primary/40 bg-primary/5",
                )}
                onClick={() => navigate(`/suporte/${s.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{s.titulo}</p>
                        {s.lidaPeloCliente === false && (
                          <Badge className="shrink-0 bg-primary text-primary-foreground">Nova resposta</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatarData(s.createdDate)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{LABEL_TIPO[s.tipo]}</Badge>
                      <BadgeStatusSuporte status={s.status} />
                      <BadgeQuantidadeAnexos quantidade={s.quantidadeAnexos ?? (s.temAnexo ? 1 : 0)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo *</Label>
              <Select
                value={form.tipo || undefined}
                onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoSolicitacaoSuporte }))}
              >
                <SelectTrigger className={cn(erros.tipo && "border-destructive")}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LABEL_TIPO[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {erros.tipo && <p className="text-sm text-destructive mt-1">{erros.tipo}</p>}
            </div>
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                className={cn(erros.titulo && "border-destructive")}
                maxLength={120}
              />
              {erros.titulo && <p className="text-sm text-destructive mt-1">{erros.titulo}</p>}
            </div>
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                rows={5}
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                className={cn(erros.descricao && "border-destructive")}
                maxLength={2000}
              />
              {erros.descricao && <p className="text-sm text-destructive mt-1">{erros.descricao}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.emailSolicitante}
                  onChange={(e) => setForm((f) => ({ ...f, emailSolicitante: e.target.value }))}
                  className={cn(erros.emailSolicitante && "border-destructive")}
                />
                {erros.emailSolicitante && (
                  <p className="text-sm text-destructive mt-1">{erros.emailSolicitante}</p>
                )}
              </div>
              <div>
                <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                <Input
                  id="telefone"
                  value={form.telefoneSolicitante}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefoneSolicitante: aplicarMascaraTelefone(e.target.value) }))
                  }
                  className={cn(erros.telefoneSolicitante && "border-destructive")}
                />
                {erros.telefoneSolicitante && (
                  <p className="text-sm text-destructive mt-1">{erros.telefoneSolicitante}</p>
                )}
              </div>
            </div>
            <div>
              <Label>Anexos (opcional, até {MAX_ANEXOS_SUPORTE})</Label>
              <input
                ref={inputAnexoRef}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  const novos = Array.from(e.target.files ?? []);
                  setAnexos((atual) => [...atual, ...novos].slice(0, MAX_ANEXOS_SUPORTE));
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 mt-1"
                disabled={anexos.length >= MAX_ANEXOS_SUPORTE}
                onClick={() => inputAnexoRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
                {anexos.length > 0
                  ? `${anexos.length} arquivo(s) selecionado(s)`
                  : "Selecionar PNG, JPG ou PDF (máx. 5 MB cada)"}
              </Button>
              {anexos.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {anexos.map((arquivo, idx) => (
                    <li key={`${arquivo.name}-${idx}`} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate">{arquivo.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => setAnexos((lista) => lista.filter((_, i) => i !== idx))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {erros.anexo && <p className="text-sm text-destructive mt-1">{erros.anexo}</p>}
            </div>
            <Button className="w-full" onClick={() => void enviar()} disabled={enviando}>
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar solicitação"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LayoutApp>
  );
}
