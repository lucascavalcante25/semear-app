import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Headphones, Loader2, ArrowLeft } from "lucide-react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BadgeStatusSuporte } from "@/components/suporte/BadgeStatusSuporte";
import { BadgeQuantidadeAnexos, PainelAnexosSuporte } from "@/components/suporte/PainelAnexosSuporte";
import {
  ConversaSuporte,
  podeSuporteEnviarMensagem,
  podeSuporteFinalizar,
} from "@/components/suporte/ConversaSuporte";
import { listarIgrejasAdmin } from "@/modules/admin/igrejas";
import {
  atualizarStatusSolicitacao,
  enviarMensagemSuporte,
  finalizarSolicitacao,
  listarSolicitacoesAdmin,
  obterResumoSuporte,
  obterSolicitacaoAdmin,
  resolverSolicitacao,
  type SuporteResumo,
} from "@/modules/admin/suporte";
import {
  LABEL_TIPO,
  type PrioridadeSolicitacaoSuporte,
  type SolicitacaoSuporte,
  type StatusSolicitacaoSuporte,
  type TipoSolicitacaoSuporte,
} from "@/modules/suporte/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INTERVALO_RESUMO_MS = 30_000;

const TIPOS: TipoSolicitacaoSuporte[] = ["DUVIDA", "SUGESTAO", "RECLAMACAO", "MELHORIA", "ERRO", "OUTRO"];
const STATUS: StatusSolicitacaoSuporte[] = [
  "ABERTA",
  "EM_ANALISE",
  "RESPONDIDA",
  "RESOLVIDA",
  "FINALIZADA",
  "CANCELADA",
];
const PRIORIDADES: PrioridadeSolicitacaoSuporte[] = ["BAIXA", "MEDIA", "ALTA", "URGENTE"];

function formatarData(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export default function SuporteClientesSuperAdmin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumo, setResumo] = useState<SuporteResumo | null>(null);
  const [igrejas, setIgrejas] = useState<{ id: number; nome: string }[]>([]);
  const [lista, setLista] = useState<SolicitacaoSuporte[]>([]);
  const [detalhe, setDetalhe] = useState<SolicitacaoSuporte | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("TODOS");
  const [filtroIgreja, setFiltroIgreja] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");

  const idDetalheUrl = searchParams.get("id");

  const carregarResumo = useCallback(async () => {
    try {
      const r = await obterResumoSuporte();
      setResumo(r);
    } catch {
      setResumo(null);
    }
  }, []);

  const carregarLista = useCallback(async () => {
    setCarregando(true);
    try {
      let l = await listarSolicitacoesAdmin({
        igrejaId: filtroIgreja !== "TODOS" ? Number(filtroIgreja) : undefined,
        status:
          filtroStatus !== "TODOS" && filtroStatus !== "NAO_LIDAS"
            ? (filtroStatus as StatusSolicitacaoSuporte)
            : undefined,
        tipo: filtroTipo !== "TODOS" ? (filtroTipo as TipoSolicitacaoSuporte) : undefined,
        prioridade: filtroPrioridade !== "TODOS" ? (filtroPrioridade as PrioridadeSolicitacaoSuporte) : undefined,
        busca: busca || undefined,
      });
      if (filtroStatus === "NAO_LIDAS") {
        l = l.filter(
          (s) => !s.lidaPeloSuporte && s.status !== "FINALIZADA" && s.status !== "CANCELADA",
        );
      }
      setLista(l);
    } catch {
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, [filtroStatus, filtroTipo, filtroPrioridade, filtroIgreja, busca]);

  const atualizarPainel = useCallback(async () => {
    await Promise.all([carregarResumo(), carregarLista()]);
  }, [carregarResumo, carregarLista]);

  useEffect(() => {
    void carregarLista();
  }, [carregarLista]);

  useEffect(() => {
    void carregarResumo();
  }, [carregarResumo]);

  useEffect(() => {
    if (idDetalheUrl) return;

    const atualizar = () => void carregarResumo();
    const intervalo = setInterval(atualizar, INTERVALO_RESUMO_MS);
    window.addEventListener("focus", atualizar);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("focus", atualizar);
    };
  }, [idDetalheUrl, carregarResumo]);

  const carregarDetalhe = useCallback(
    async (id: number) => {
      try {
        const s = await obterSolicitacaoAdmin(id);
        setDetalhe(s);
      } catch {
        toast.error("Não foi possível carregar a solicitação.");
        setDetalhe(null);
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  const abrirDetalhe = useCallback(
    (id: number) => {
      setSearchParams({ id: String(id) });
    },
    [setSearchParams],
  );

  const voltarParaLista = useCallback(() => {
    setSearchParams({}, { replace: true });
    setDetalhe(null);
    void atualizarPainel();
  }, [setSearchParams, atualizarPainel]);

  useEffect(() => {
    void listarIgrejasAdmin()
      .then((lista) => setIgrejas(lista.map((i) => ({ id: i.id!, nome: i.nome ?? `Igreja ${i.id}` }))))
      .catch(() => setIgrejas([]));
  }, []);

  useEffect(() => {
    if (!idDetalheUrl) {
      setDetalhe(null);
      return;
    }
    const id = Number(idDetalheUrl);
    if (!Number.isNaN(id)) {
      void carregarDetalhe(id);
    }
  }, [idDetalheUrl, carregarDetalhe]);

  const sincronizarDetalhe = useCallback(
    (s: SolicitacaoSuporte) => {
      setDetalhe((prev) => {
        if (prev && prev.status !== s.status) {
          void carregarResumo();
        }
        return prev
          ? {
              ...prev,
              mensagens: s.mensagens,
              status: s.status,
              respostaAdmin: s.respostaAdmin,
              dataResposta: s.dataResposta,
              respondidoPorNome: s.respondidoPorNome,
            }
          : prev;
      });
    },
    [carregarResumo],
  );

  const mudarStatus = async (status: StatusSolicitacaoSuporte) => {
    if (!detalhe) return;
    setSalvando(true);
    try {
      await atualizarStatusSolicitacao(detalhe.id, { status });
      const msg =
        status === "RESOLVIDA"
          ? "Solicitação marcada como resolvida. O cliente foi notificado."
          : "Status atualizado.";
      toast.success(msg);
      voltarParaLista();
    } catch {
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setSalvando(false);
    }
  };

  if (idDetalheUrl) {
    if (!detalhe || detalhe.id !== Number(idDetalheUrl)) {
      return (
        <LayoutSuperAdmin>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </LayoutSuperAdmin>
      );
    }

    return (
      <LayoutSuperAdmin>
        <div className="space-y-6 max-w-3xl">
          <Button variant="ghost" className="gap-2 -ml-2" onClick={voltarParaLista}>
            <ArrowLeft className="h-4 w-4" />
            Voltar à lista
          </Button>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 items-start justify-between">
                <div>
                  <CardTitle>{detalhe.titulo}</CardTitle>
                  <CardDescription>
                    {detalhe.igrejaNome} · {detalhe.nomeSolicitante} · {formatarData(detalhe.createdDate)}
                  </CardDescription>
                </div>
                <BadgeStatusSuporte status={detalhe.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">E-mail:</span> {detalhe.emailSolicitante}
                </p>
                <p>
                  <span className="text-muted-foreground">Telefone:</span>{" "}
                  {detalhe.telefoneSolicitante || "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Tipo:</span> {LABEL_TIPO[detalhe.tipo]}
                </p>
                <p>
                  <span className="text-muted-foreground">Prioridade:</span> {detalhe.prioridade}
                </p>
              </div>
              {detalhe.anexos && detalhe.anexos.length > 0 && (
                <PainelAnexosSuporte solicitacaoId={detalhe.id} anexos={detalhe.anexos} visao="admin" />
              )}
              <ConversaSuporte
                solicitacao={detalhe}
                visao="suporte"
                podeEnviar={podeSuporteEnviarMensagem(detalhe.status)}
                placeholder="Responda ao cliente..."
                buscarAtualizacao={() => obterSolicitacaoAdmin(detalhe.id)}
                onSincronizar={sincronizarDetalhe}
                onEnviar={async (texto) => {
                  try {
                    const atualizado = await enviarMensagemSuporte(detalhe.id, texto);
                    sincronizarDetalhe(atualizado);
                    void carregarResumo();
                    toast.success("Resposta enviada. O cliente foi notificado.");
                    return atualizado;
                  } catch {
                    toast.error("Não foi possível enviar a resposta.");
                    throw new Error("envio-falhou");
                  }
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void mudarStatus("EM_ANALISE")} disabled={salvando}>
                  Em análise
                </Button>
                <Button
                  variant="outline"
                  disabled={salvando || detalhe.status === "FINALIZADA" || detalhe.status === "CANCELADA"}
                  onClick={async () => {
                    setSalvando(true);
                    try {
                      const atualizado = await resolverSolicitacao(detalhe.id);
                      sincronizarDetalhe(atualizado);
                      void carregarResumo();
                      toast.success("Solicitação marcada como resolvida. O cliente foi notificado.");
                    } catch {
                      toast.error("Não foi possível marcar como resolvida.");
                    } finally {
                      setSalvando(false);
                    }
                  }}
                >
                  Marcar resolvida
                </Button>
                {podeSuporteFinalizar(detalhe.status) && (
                  <Button
                    disabled={salvando}
                    onClick={async () => {
                      setSalvando(true);
                      try {
                        const atualizado = await finalizarSolicitacao(detalhe.id);
                        sincronizarDetalhe(atualizado);
                        void carregarResumo();
                        toast.success("Solicitação finalizada. O cliente foi notificado.");
                      } catch {
                        toast.error("Não foi possível finalizar.");
                      } finally {
                        setSalvando(false);
                      }
                    }}
                  >
                    Finalizar solicitação
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </LayoutSuperAdmin>
    );
  }

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="h-7 w-7" />
            Suporte dos Clientes
          </h1>
          <p className="text-muted-foreground">
            Acompanhe e responda solicitações das igrejas. Os números abaixo refletem o total na plataforma — clique para filtrar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
          {(
            [
              { label: "Abertas", val: resumo?.abertas, filtro: "ABERTA" as const },
              { label: "Em análise", val: resumo?.emAnalise, filtro: "EM_ANALISE" as const },
              { label: "Não lidas", val: resumo?.aguardandoRespostaSuporte, filtro: "NAO_LIDAS" as const },
              { label: "Respondidas", val: resumo?.respondidas, filtro: "RESPONDIDA" as const },
              { label: "Resolvidas", val: resumo?.resolvidas, filtro: "RESOLVIDA" as const },
              { label: "Finalizadas", val: resumo?.finalizadas, filtro: "FINALIZADA" as const },
              { label: "Canceladas", val: resumo?.canceladas, filtro: "CANCELADA" as const },
            ] as const
          ).map((c) => {
            const ativo =
              c.filtro === "NAO_LIDAS" ? filtroStatus === "NAO_LIDAS" : filtroStatus === c.filtro;
            return (
              <Card
                key={c.label}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/40",
                  ativo && "ring-2 ring-primary bg-muted/20",
                )}
                onClick={() => {
                  if (c.filtro === "NAO_LIDAS") {
                    setFiltroStatus(filtroStatus === "NAO_LIDAS" ? "TODOS" : "NAO_LIDAS");
                    return;
                  }
                  setFiltroStatus(filtroStatus === c.filtro ? "TODOS" : c.filtro);
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{c.val ?? 0}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Input
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="sm:max-w-xs"
              />
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="sm:w-36">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {LABEL_TIPO[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
                <SelectTrigger className="sm:w-36">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas</SelectItem>
                  {PRIORIDADES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroIgreja} onValueChange={setFiltroIgreja}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Igreja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas as igrejas</SelectItem>
                  {igrejas.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.nome}
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
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma solicitação encontrada.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lista.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => abrirDetalhe(s.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {formatarData(s.createdDate)} · {s.igrejaNome}
                      </p>
                      <p className="font-medium truncate">{s.titulo}</p>
                      <p className="text-sm text-muted-foreground">{s.nomeSolicitante}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Badge variant="outline">{LABEL_TIPO[s.tipo]}</Badge>
                      <Badge variant="secondary">{s.prioridade}</Badge>
                      <BadgeStatusSuporte status={s.status} />
                      <BadgeQuantidadeAnexos quantidade={s.quantidadeAnexos ?? (s.temAnexo ? 1 : 0)} />
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); abrirDetalhe(s.id); }}>
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
