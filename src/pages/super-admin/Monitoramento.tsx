import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Church,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  obterHistoricoMonitoramento,
  obterMonitoramento,
  type AdminMonitoramento,
  type MonitoramentoHistoricoPonto,
} from "@/modules/admin/monitoramento";
import { cn } from "@/lib/utils";
import { usarPollingInteligente } from "@/hooks/use-polling-inteligente";

const INTERVALO_ATUALIZACAO_MS = 60_000;

function formatarUptime(segundos: number) {
  const dias = Math.floor(segundos / 86400);
  const horas = Math.floor((segundos % 86400) / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  if (dias > 0) return `${dias}d ${horas}h`;
  if (horas > 0) return `${horas}h ${minutos}min`;
  return `${minutos}min`;
}

function formatarNumero(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function corStatus(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "UP") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  if (s === "DISABLED") return "bg-muted text-muted-foreground border-border";
  if (s === "DOWN" || s === "OUT_OF_SERVICE") return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30";
  return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
}

function iconeStatus(status?: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "UP") return "●";
  if (s === "DISABLED") return "○";
  if (s === "DOWN") return "✕";
  return "!";
}

function MetricaCard({
  titulo,
  valor,
  subtitulo,
  icon: Icon,
  destaque,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icon: React.ComponentType<{ className?: string }>;
  destaque?: "ok" | "alerta" | "neutro";
}) {
  const corValor =
    destaque === "alerta"
      ? "text-amber-600 dark:text-amber-400"
      : destaque === "ok"
        ? "text-emerald-600 dark:text-emerald-400"
        : "";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className={cn("text-2xl font-bold tabular-nums", corValor)}>{valor}</p>
        {subtitulo && <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>}
      </CardContent>
    </Card>
  );
}

export default function MonitoramentoSuperAdmin() {
  const [dados, setDados] = useState<AdminMonitoramento | null>(null);
  const [historico, setHistorico] = useState<MonitoramentoHistoricoPonto[]>([]);
  const [horasHistorico, setHorasHistorico] = useState(24);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const [res, hist] = await Promise.all([
        obterMonitoramento(),
        obterHistoricoMonitoramento(horasHistorico),
      ]);
      setDados(res);
      setHistorico(hist ?? []);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os dados de monitoramento.");
    } finally {
      setCarregando(false);
    }
  }, [horasHistorico]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  usarPollingInteligente({
    ativo: true,
    aoAtualizar: () => void carregar(),
    intervaloVisivelMs: INTERVALO_ATUALIZACAO_MS,
    intervaloOcultoMs: INTERVALO_ATUALIZACAO_MS * 2,
  });

  const chartIgrejas = (dados?.topIgrejasPorUsuarios ?? []).map((i) => ({
    nome: i.nome.length > 18 ? `${i.nome.slice(0, 16)}…` : i.nome,
    usuarios: i.usuariosAtivos,
  }));

  const chartTabelas = (dados?.volumesTabela ?? []).slice(0, 8).map((t) => ({
    nome: t.tabela.replace(/_/g, " "),
    registros: t.registrosEstimados,
  }));

  const chartHistorico = historico.map((p) => ({
    hora: new Date(p.coletadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    memoria: p.memoriaPercentual,
    cpu: p.cpuPercentual,
    reqMin: p.requisicoesPorMinuto,
    latencia: p.latenciaMediaMs,
    conexoes: p.conexoesAtivas,
  }));

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Monitoramento da Plataforma</h1>
            <p className="text-muted-foreground">
              Saúde dos serviços, uso de recursos e volume de dados em tempo real.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void carregar()} disabled={carregando}>
            <RefreshCw className={cn("h-4 w-4 mr-2", carregando && "animate-spin")} />
            Atualizar
          </Button>
        </div>

        {erro && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="pt-6 flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {erro}
            </CardContent>
          </Card>
        )}

        {/* Status geral */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="sm:col-span-2 lg:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                    dados?.statusGeral === "UP"
                      ? "bg-emerald-500/20 text-emerald-600"
                      : "bg-amber-500/20 text-amber-600"
                  )}
                >
                  {iconeStatus(dados?.statusGeral)}
                </div>
                <div>
                  <p className="text-xl font-bold">{dados?.statusGeral ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    Uptime: {dados ? formatarUptime(dados.uptimeSegundos) : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MetricaCard
            titulo="Requisições/min"
            valor={dados ? dados.requisicoesPorMinuto.toFixed(1) : "—"}
            subtitulo={`${formatarNumero(dados?.totalRequisicoes ?? 0)} total desde o boot`}
            icon={Wifi}
            destaque={(dados?.requisicoesPorMinuto ?? 0) > 120 ? "alerta" : "neutro"}
          />
          <MetricaCard
            titulo="Latência média"
            valor={dados ? `${dados.latenciaMediaMs} ms` : "—"}
            subtitulo="Tempo de resposta da API"
            icon={Zap}
          />
          <MetricaCard
            titulo="Threads JVM"
            valor={dados?.threadsAtivas ?? "—"}
            subtitulo="Processamento paralelo"
            icon={Cpu}
          />
        </div>

        {/* Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Serviços integrados
            </CardTitle>
            <CardDescription>Backend, banco, armazenamento e push notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(dados?.servicos ?? []).map((s) => (
                <div
                  key={s.nome}
                  className="flex items-start justify-between gap-3 rounded-lg border p-4 bg-card/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.nome}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.detalhe}</p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", corStatus(s.status))}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de tendências */}
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tendência ao longo do tempo</CardTitle>
              <CardDescription>
                Coleta automática a cada 5 min — alertas por e-mail quando limites são ultrapassados
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {[6, 24, 72].map((h) => (
                <Button
                  key={h}
                  size="sm"
                  variant={horasHistorico === h ? "default" : "outline"}
                  onClick={() => setHorasHistorico(h)}
                >
                  {h}h
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {chartHistorico.length > 1 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-64">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Memória e CPU (%)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartHistorico}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 8 }} />
                      <Legend />
                      <Line type="monotone" dataKey="memoria" name="Memória" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="cpu" name="CPU" stroke="hsl(var(--chart-2, #f59e0b))" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-64">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Requisições/min e latência (ms)</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartHistorico}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 8 }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="reqMin" name="Req/min" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="latencia" name="Latência" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                O histórico será preenchido após algumas coletas automáticas (aguarde ~5 minutos).
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recursos JVM + Pool */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Memória e CPU
              </CardTitle>
              <CardDescription>Recursos do servidor backend (Render)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memória JVM</span>
                  <span className="font-medium tabular-nums">
                    {dados?.memoriaUsadaMb ?? 0} / {dados?.memoriaMaxMb ?? 0} MB ({dados?.memoriaPercentual ?? 0}%)
                  </span>
                </div>
                <Progress
                  value={dados?.memoriaPercentual ?? 0}
                  className={cn((dados?.memoriaPercentual ?? 0) >= 85 && "[&>div]:bg-amber-500")}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU do processo</span>
                  <span className="font-medium tabular-nums">{dados?.cpuPercentual ?? 0}%</span>
                </div>
                <Progress value={Math.min(dados?.cpuPercentual ?? 0, 100)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Pool de conexões
              </CardTitle>
              <CardDescription>PostgreSQL (Supabase / Neon)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold text-primary tabular-nums">{dados?.conexoesAtivas ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Ativas</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums">{dados?.conexoesIdle ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Ociosas</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-2xl font-bold tabular-nums">{dados?.conexoesMax ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Máximo</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      (dados?.conexoesPendentes ?? 0) > 0 && "text-amber-600"
                    )}
                  >
                    {dados?.conexoesPendentes ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Aguardando</p>
                </div>
              </div>
              {dados && dados.conexoesMax > 0 && (
                <Progress value={Math.round((dados.conexoesAtivas / dados.conexoesMax) * 100)} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plataforma */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricaCard titulo="Igrejas" valor={dados?.totalIgrejas ?? "—"} subtitulo={`${dados?.igrejasAtivas ?? 0} ativas`} icon={Church} />
          <MetricaCard titulo="Usuários" valor={dados?.totalUsuarios ?? "—"} subtitulo={`${dados?.usuariosAtivos ?? 0} ativos`} icon={Users} />
          <MetricaCard titulo="Comunicados" valor={formatarNumero(dados?.totalComunicados ?? 0)} icon={Activity} />
          <MetricaCard
            titulo="Push (24h)"
            valor={formatarNumero(dados?.notificacoesEnviadas24h ?? 0)}
            subtitulo={`${dados?.dispositivosPushAtivos ?? 0} dispositivos · ${dados?.pushHabilitado ? "ativo" : "desligado"}`}
            icon={Bell}
            destaque={dados?.pushHabilitado ? "ok" : "neutro"}
          />
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top igrejas por usuários</CardTitle>
              <CardDescription>Igrejas com mais membros ativos</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {chartIgrejas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartIgrejas} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="nome" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => [formatarNumero(v), "Usuários"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="usuarios" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-16">Sem dados ainda</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Maiores tabelas no banco
              </CardTitle>
              <CardDescription>Estimativa de registros (pg_stat)</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {chartTabelas.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartTabelas} margin={{ bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => [formatarNumero(v), "Registros"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="registros" fill="hsl(var(--chart-2, var(--primary)))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-16">Sem dados de volume</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {(dados?.alertas?.length ?? 0) > 0 && (
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Alertas e recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dados!.alertas.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {dados?.coletadoEm && (
          <p className="text-xs text-center text-muted-foreground">
            Última coleta: {new Date(dados.coletadoEm).toLocaleString("pt-BR")}
            {" · "}Atualização automática a cada {INTERVALO_ATUALIZACAO_MS / 1000}s
          </p>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
