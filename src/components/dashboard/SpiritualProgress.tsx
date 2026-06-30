import { TrendingUp, Flame, BookOpen, Calendar, Check, X, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { livrosBiblia } from "@/data/bible-books";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { canWrite } from "@/auth/permissions";
import {
  getLeituraDoDia,
  obterDiasPlanoLeitura,
  obterProgressoLeitura,
  obterIdUsuario,
  obterDiasPassadosPlano,
  obterEstatisticasLeitura,
  formatarPercentualPlano,
  obterPercentualPlanoPreciso,
  alternarProgressoLeitura,
  definirInicioPlanoIgreja,
  marcarVariasLeiturasPlano,
} from "@/modules/bible/service";
import type { DiaPlanoLeitura, ProgressoLeituraUsuario, TrechoLeitura } from "@/modules/bible/types";
import { cn } from "@/lib/utils";

const LIMITE_DIAS_ATRASO_RESUMO = 3;

interface AnelProgressoProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function AnelProgresso({ progress, size = 80, strokeWidth = 6 }: AnelProgressoProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-border"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-primary transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">
          {progress < 1 && progress > 0
            ? progress.toLocaleString("pt-BR", { maximumFractionDigits: 1 })
            : Math.round(progress)}
          %
        </span>
      </div>
    </div>
  );
}

type VarianteEstatistica = "sequencia" | "leituras" | "ausencia" | "plano";

const ESTILO_ESTATISTICA: Record<VarianteEstatistica, string> = {
  sequencia:
    "bg-primary/15 text-primary border border-primary/25 shadow-sm",
  leituras:
    "bg-emerald-600/12 text-emerald-800 dark:text-emerald-300 border border-emerald-600/25 shadow-sm",
  ausencia:
    "bg-amber-600/12 text-amber-900 dark:text-amber-300 border border-amber-600/25 shadow-sm",
  plano:
    "bg-sky-700/10 text-sky-900 dark:text-sky-300 border border-sky-700/20 shadow-sm",
};

interface CartaoEstatisticaProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  variante?: VarianteEstatistica;
}

function CartaoEstatistica({
  icon: Icon,
  label,
  value,
  subtext,
  variante = "sequencia",
}: CartaoEstatisticaProps) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          ESTILO_ESTATISTICA[variante],
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}

const normalizarDataPlano = (valor?: string | null) => {
  if (!valor) return null;
  const data = new Date(`${valor.split("T")[0]}T00:00:00`);
  data.setHours(0, 0, 0, 0);
  return data;
};

interface LinhaLeituraPlanoProps {
  leitura: TrechoLeitura;
  concluida: boolean;
  compacto?: boolean;
  aoMarcar: (readingId: string, completed: boolean) => void;
  aoAbrir?: (leitura: TrechoLeitura) => void;
}

function LinhaLeituraPlano({
  leitura,
  concluida,
  compacto = false,
  aoMarcar,
  aoAbrir,
}: LinhaLeituraPlanoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border border-border bg-background/70 transition-colors",
        compacto ? "px-2 py-1" : "px-3 py-2",
        concluida && "border-primary/25 bg-primary/5",
      )}
    >
      <div className="min-w-0 flex-1">
        {aoAbrir ? (
          <button
            type="button"
            onClick={() => aoAbrir(leitura)}
            className="text-left hover:text-primary transition-colors w-full"
          >
            <p className={cn("font-medium truncate", compacto ? "text-[11px]" : "text-sm")}>
              {leitura.reference}
            </p>
            {!compacto && leitura.book && (
              <p className="text-[10px] text-muted-foreground">{leitura.book}</p>
            )}
          </button>
        ) : (
          <p className={cn("font-medium truncate", compacto ? "text-[11px]" : "text-sm")}>
            {leitura.reference}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => aoMarcar(leitura.id, true)}
          className={cn(
            concluida
              ? "border-primary bg-primary text-primary-foreground pointer-events-none"
              : "border-border text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
          )}
          aria-label={`Marcar ${leitura.reference} como lido`}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => aoMarcar(leitura.id, false)}
          className={cn(
            concluida
              ? "border-border text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              : "border-transparent opacity-40 pointer-events-none",
          )}
          disabled={!concluida}
          aria-label={`Desmarcar ${leitura.reference}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProgressoEspiritual() {
  const { user } = usarAutenticacao();
  const { configuracao } = useIgrejaConfiguracao();
  const dataInicioPlano = configuracao?.dataInicioPlanoLeitura;
  const userId = obterIdUsuario(user?.id);
  const navigate = useNavigate();
  const [progressoLeitura, setProgressoLeitura] = useState<ProgressoLeituraUsuario[]>([]);
  const [totalDiasPlano, setTotalDiasPlano] = useState(365);
  const [planoId, setPlanoId] = useState<string>("");
  const [leiturasHoje, setLeiturasHoje] = useState<TrechoLeitura[]>([]);
  const [diaAtual, setDiaAtual] = useState<DiaPlanoLeitura | null>(null);
  const [diasPlano, setDiasPlano] = useState<DiaPlanoLeitura[]>([]);
  const [modalAtrasadosAberto, setModalAtrasadosAberto] = useState(false);

  useEffect(() => {
    definirInicioPlanoIgreja(dataInicioPlano ?? null);
  }, [dataInicioPlano]);

  useEffect(() => {
    const recarregar = () => setProgressoLeitura(obterProgressoLeitura(userId));
    recarregar();
    window.addEventListener("semear:progresso-leitura", recarregar);
    window.addEventListener("focus", recarregar);
    const onVisibilidade = () => {
      if (document.visibilityState === "visible") {
        recarregar();
      }
    };
    document.addEventListener("visibilitychange", onVisibilidade);
    return () => {
      window.removeEventListener("semear:progresso-leitura", recarregar);
      window.removeEventListener("focus", recarregar);
      document.removeEventListener("visibilitychange", onVisibilidade);
    };
  }, [userId]);

  useEffect(() => {
    setProgressoLeitura(obterProgressoLeitura(userId));
    const leitura = getLeituraDoDia(userId);
    if (leitura) {
      const dias = obterDiasPlanoLeitura(userId, leitura.plano.id);
      setTotalDiasPlano(dias.length || 365);
      setPlanoId(leitura.plano.id);
      setLeiturasHoje(leitura.dia.readings);
      setDiaAtual(leitura.dia);
      setDiasPlano(dias);
    } else {
      setLeiturasHoje([]);
      setDiaAtual(null);
      setDiasPlano([]);
    }
  }, [userId, dataInicioPlano]);

  const estatisticas = useMemo(
    () => obterEstatisticasLeitura(progressoLeitura, totalDiasPlano),
    [progressoLeitura, totalDiasPlano],
  );

  const percentualPlanoPreciso = useMemo(
    () => obterPercentualPlanoPreciso(totalDiasPlano),
    [totalDiasPlano],
  );

  const percentualPlanoTexto = useMemo(
    () => formatarPercentualPlano(totalDiasPlano),
    [totalDiasPlano],
  );

  const diasPassadosPlano = useMemo(
    () => obterDiasPassadosPlano(totalDiasPlano),
    [totalDiasPlano],
  );

  const planoInicio = useMemo(() => normalizarDataPlano(dataInicioPlano), [dataInicioPlano]);

  const planoConfigurado = Boolean(dataInicioPlano);
  const planoJaIniciou = useMemo(() => {
    if (!planoInicio) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje.getTime() >= planoInicio.getTime();
  }, [planoInicio]);

  const leiturasConcluidas = useMemo(() => {
    const concluido = new Set<string>();
    progressoLeitura
      .filter((progress) => progress.planId === planoId && progress.completed)
      .forEach((progress) => concluido.add(progress.dayId));
    return concluido;
  }, [planoId, progressoLeitura]);

  const progressoLeituraHoje = useMemo(() => {
    const total = leiturasHoje.length;
    const concluidas = leiturasHoje.filter((leitura) => leiturasConcluidas.has(leitura.id)).length;
    const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0;
    return { total, concluidas, percentual };
  }, [leiturasHoje, leiturasConcluidas]);

  const diasEmAtraso = useMemo(() => {
    if (!diaAtual) {
      return [];
    }
    const hojeNumero = diaAtual.dayNumber;
    return diasPlano
      .filter((dia) => dia.dayNumber < hojeNumero)
      .filter((dia) =>
        dia.readings.some((leitura) => !leiturasConcluidas.has(leitura.id)),
      )
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }, [diaAtual, diasPlano, leiturasConcluidas]);

  const marcarLeitura = (readingId: string, completed: boolean) => {
    if (!planoId) {
      return;
    }
    setProgressoLeitura(
      alternarProgressoLeitura(
        userId,
        planoId,
        readingId,
        new Date().toISOString(),
        completed,
      ),
    );
  };

  const marcarTodasLeiturasDia = (dia: DiaPlanoLeitura) => {
    if (!planoId) {
      return;
    }
    const pendentes = leiturasPendentesNoDia(dia).map((leitura) => leitura.id);
    if (pendentes.length === 0) {
      return;
    }
    setProgressoLeitura(marcarVariasLeiturasPlano(userId, planoId, pendentes, true));
  };

  const parsearReferencia = (leitura: TrechoLeitura) => {
    const raw = leitura.reference.trim();
    const match = raw.match(/(.+)\s(\d+)(?::(\d+)(?:\s*-\s*(\d+))?)?$/);
    const bookName = leitura.book ?? match?.[1]?.trim();
    const chapter = Number(match?.[2] ?? 0);
    const verseStart = Number(match?.[3] ?? 1);
    const verseEnd = Number(match?.[4] ?? match?.[3] ?? 1);
    if (!bookName || !chapter) {
      return null;
    }
    const book = livrosBiblia.find(
      (item) => item.name.toLowerCase() === bookName.toLowerCase(),
    );
    if (!book) {
      return null;
    }
    return {
      bookId: book.id,
      chapter,
      verseStart,
      verseEnd,
    };
  };

  const abrirLeitura = (leitura: TrechoLeitura) => {
    const referencia = parsearReferencia(leitura);
    if (!referencia) {
      return;
    }
    const params = new URLSearchParams({
      bookId: referencia.bookId,
      chapter: String(referencia.chapter),
      verseStart: String(referencia.verseStart),
      verseEnd: String(referencia.verseEnd),
      version: "almeida",
    });
    setModalAtrasadosAberto(false);
    navigate(`/biblia?${params.toString()}`);
  };

  const leiturasPendentesNoDia = (dia: DiaPlanoLeitura) =>
    dia.readings.filter((leitura) => !leiturasConcluidas.has(leitura.id));

  if (!planoConfigurado) {
    return (
      <Card className="overflow-hidden border border-border shadow-spiritual bg-card min-w-0">
        <CardContent className="p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/25">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="font-medium">Plano de leitura ainda não configurado</p>
          <p className="text-sm text-muted-foreground">
            O administrador da igreja deve definir a data de início em Configurações da Igreja.
          </p>
          {canWrite(user, "/configuracoes-igreja") && (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/configuracoes-igreja?aba=plano")}
            >
              Configurar plano
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!planoJaIniciou) {
    return (
      <Card className="overflow-hidden border border-border shadow-spiritual bg-card min-w-0">
        <CardContent className="p-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-600/12 text-amber-900 dark:text-amber-300 border border-amber-600/25">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="font-medium">Plano de leitura agendado</p>
          <p className="text-sm text-muted-foreground">
            O plano anual começa em{" "}
            <strong>{planoInicio?.toLocaleDateString("pt-BR") ?? "—"}</strong>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border shadow-spiritual bg-card min-w-0">
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/12 via-primary/8 to-transparent border-b border-primary/15">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Seu Progresso Espiritual</h3>
          <p className="text-xs text-muted-foreground">
            Continue firme na Palavra! Você está crescendo.
          </p>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="flex items-center gap-4">
            {/* Anel de progresso */}
            <div className="flex flex-col items-center">
              <AnelProgresso progress={percentualPlanoPreciso} size={72} strokeWidth={5} />
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                Plano Anual · {percentualPlanoTexto}%
              </p>
              <p className="text-[10px] text-muted-foreground text-center">
                {diasPassadosPlano}/{totalDiasPlano} dias · Início{" "}
                {planoInicio?.toLocaleDateString("pt-BR") ?? "—"}
              </p>
              <div className="w-full mt-2">
                <p className="text-[10px] text-muted-foreground text-center mb-1">
                  Leitura do dia (Plano anual) · {progressoLeituraHoje.percentual}%
                </p>
                <Progress value={progressoLeituraHoje.percentual} className="h-2" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-1.5">
              <CartaoEstatistica
                icon={Flame}
                label="Dias seguidos"
                value={estatisticas.sequenciaAtual}
                variante="sequencia"
              />
              <CartaoEstatistica
                icon={BookOpen}
                label="Leituras feitas"
                value={estatisticas.totalConcluido}
                variante="leituras"
              />
              <CartaoEstatistica
                icon={Calendar}
                label="Dias sem ler"
                value={estatisticas.diasSemLer}
                variante="ausencia"
              />
              <CartaoEstatistica
                icon={TrendingUp}
                label="Progresso do plano"
                value={`${percentualPlanoTexto}%`}
                variante="plano"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Leitura do dia (Plano anual)</span>
              <span>
                {progressoLeituraHoje.concluidas} de {progressoLeituraHoje.total} concluídas
              </span>
            </div>
            <Progress value={progressoLeituraHoje.percentual} className="h-2" />
            <div className="space-y-1.5">
              {leiturasHoje.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma leitura disponível para hoje.
                </p>
              ) : (
                leiturasHoje.map((reading) => (
                  <LinhaLeituraPlano
                    key={reading.id}
                    leitura={reading}
                    concluida={leiturasConcluidas.has(reading.id)}
                    aoMarcar={marcarLeitura}
                    aoAbrir={abrirLeitura}
                  />
                ))
              )}
            </div>

            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Dias em atraso:</span>
                  <span>{diasEmAtraso.length}</span>
                </div>
                {diasEmAtraso.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 border-dashed border-amber-600/35 text-amber-900 dark:text-amber-200 hover:bg-amber-600/10"
                    onClick={() => setModalAtrasadosAberto(true)}
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    Marcar atrasos
                  </Button>
                )}
              </div>
              {diasEmAtraso.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Você está em dia com o plano.
                </p>
              ) : (
                <>
                  {diasEmAtraso.slice(0, LIMITE_DIAS_ATRASO_RESUMO).map((dia) => {
                    const pendentes = leiturasPendentesNoDia(dia);
                    return (
                      <div
                        key={dia.id}
                        className="space-y-1 px-2 py-1.5 rounded-lg border border-dashed border-amber-600/25 bg-amber-600/5"
                      >
                        <p className="text-sm font-medium">Dia {dia.dayNumber}</p>
                        <div className="flex flex-col gap-1">
                          {pendentes.map((reading) => (
                            <LinhaLeituraPlano
                              key={reading.id}
                              leitura={reading}
                              concluida={false}
                              compacto
                              aoMarcar={marcarLeitura}
                              aoAbrir={abrirLeitura}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {diasEmAtraso.length > LIMITE_DIAS_ATRASO_RESUMO && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 border-dashed border-primary/30 text-primary hover:bg-primary/5"
                      onClick={() => setModalAtrasadosAberto(true)}
                    >
                      Ver todos ({diasEmAtraso.length} dias)
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={modalAtrasadosAberto} onOpenChange={setModalAtrasadosAberto}>
        <DialogContent className="max-h-[85vh] flex flex-col gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>Dias em atraso</DialogTitle>
            <DialogDescription>
              Marque os capítulos que você já leu para atualizar seu progresso. São{" "}
              <span className="font-medium text-foreground">{diasEmAtraso.length}</span>{" "}
              {diasEmAtraso.length === 1 ? "dia" : "dias"} com leituras pendentes.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 pb-6 max-h-[55vh] space-y-3">
            {diasEmAtraso.map((dia) => {
              const pendentes = leiturasPendentesNoDia(dia);
              return (
                <div
                  key={dia.id}
                  className="space-y-2 px-3 py-2.5 rounded-lg border border-dashed border-amber-600/25 bg-amber-600/5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Dia {dia.dayNumber}</p>
                    {pendentes.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-primary hover:bg-primary/10"
                        onClick={() => marcarTodasLeiturasDia(dia)}
                      >
                        Marcar dia inteiro
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {dia.readings.map((reading) => (
                      <LinhaLeituraPlano
                        key={reading.id}
                        leitura={reading}
                        concluida={leiturasConcluidas.has(reading.id)}
                        aoMarcar={marcarLeitura}
                        aoAbrir={abrirLeitura}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
