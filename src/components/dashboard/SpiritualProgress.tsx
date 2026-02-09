import { TrendingUp, Flame, BookOpen, Calendar, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { livrosBiblia } from "@/data/bible-books";
import { usarAutenticacao } from "@/contexts/AuthContext";
import {
  getLeituraDoDia,
  obterDiasPlanoLeitura,
  obterProgressoLeitura,
  obterIdUsuario,
  obterDiasPassadosPlano,
  obterEstatisticasLeitura,
  obterPlanoInicio,
  obterPercentualPlano,
  alternarProgressoLeitura,
} from "@/modules/bible/service";
import type { DiaPlanoLeitura, ProgressoLeituraUsuario, TrechoLeitura } from "@/modules/bible/types";

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
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-olive transition-all duration-500"
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
        <span className="text-lg font-bold text-foreground">{progress}%</span>
      </div>
    </div>
  );
}

interface CartaoEstatisticaProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function CartaoEstatistica({ icon: Icon, label, value, subtext, color }: CartaoEstatisticaProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}

export function ProgressoEspiritual() {
  const { user } = usarAutenticacao();
  const userId = obterIdUsuario(user?.id);
  const navigate = useNavigate();
  const [progressoLeitura, setProgressoLeitura] = useState<ProgressoLeituraUsuario[]>([]);
  const [totalDiasPlano, setTotalDiasPlano] = useState(365);
  const [planoId, setPlanoId] = useState<string>("");
  const [leiturasHoje, setLeiturasHoje] = useState<TrechoLeitura[]>([]);
  const [diaAtual, setDiaAtual] = useState<DiaPlanoLeitura | null>(null);
  const [diasPlano, setDiasPlano] = useState<DiaPlanoLeitura[]>([]);

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
    }
  }, [userId]);

  const estatisticas = useMemo(
    () => obterEstatisticasLeitura(progressoLeitura, totalDiasPlano),
    [progressoLeitura, totalDiasPlano],
  );

  const percentualPlano = useMemo(
    () => obterPercentualPlano(totalDiasPlano),
    [totalDiasPlano],
  );

  const diasPassadosPlano = useMemo(
    () => obterDiasPassadosPlano(totalDiasPlano),
    [totalDiasPlano],
  );

  const planoInicio = useMemo(() => obterPlanoInicio(), []);

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
      );
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
    navigate(`/biblia?${params.toString()}`);
  };

  return (
    <Card className="shadow-spiritual overflow-hidden">
      <div className="gradient-spiritual p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-white/90" />
          <h3 className="text-sm font-semibold text-white">Seu Progresso Espiritual</h3>
        </div>
        <p className="text-xs text-white/70">
          Continue firme na Palavra! Você está crescendo.
        </p>
      </div>

      <CardContent className="p-3">
        <div className="mt-6 grid gap-2 lg:grid-cols-[0.9fr_1.1fr] items-start">
          <div className="flex items-center gap-4">
            {/* Anel de progresso */}
            <div className="flex flex-col items-center">
              <AnelProgresso progress={percentualPlano} size={72} strokeWidth={5} />
              <p className="text-[10px] text-muted-foreground mt-1 text-center">
                Plano Anual · {percentualPlano}%
              </p>
              <p className="text-[10px] text-muted-foreground text-center">
                {diasPassadosPlano}/{totalDiasPlano} dias · Início {planoInicio.toLocaleDateString("pt-BR")}
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
                color="bg-gold/10 text-gold-dark"
              />
              <CartaoEstatistica
                icon={BookOpen}
                label="Leituras feitas"
                value={estatisticas.totalConcluido}
                color="bg-olive/10 text-olive"
              />
              <CartaoEstatistica
                icon={Calendar}
                label="Dias sem ler"
                value={estatisticas.diasSemLer}
                color="bg-deep-blue/10 text-deep-blue"
              />
            <CartaoEstatistica
              icon={BookOpen}
              label="Progresso do plano"
              value={`${percentualPlano}%`}
              color="bg-gold/10 text-gold-dark"
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
                  <div
                    key={reading.id}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border"
                  >
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => abrirLeitura(reading)}
                        className="text-left"
                      >
                        <p className="text-sm font-medium truncate">{reading.reference}</p>
                        <p className="text-[10px] text-muted-foreground">{reading.book}</p>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={leiturasConcluidas.has(reading.id) ? "reading-complete" : "reading"}
                        size="icon"
                        onClick={() => marcarLeitura(reading.id, true)}
                        className={leiturasConcluidas.has(reading.id) ? "pointer-events-none" : undefined}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={!leiturasConcluidas.has(reading.id) ? "reading-pending" : "reading"}
                        size="icon"
                        onClick={() => marcarLeitura(reading.id, false)}
                        className={!leiturasConcluidas.has(reading.id) ? "opacity-50" : undefined}
                        disabled={!leiturasConcluidas.has(reading.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-1.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Dias em atraso:</span>
                <span>{diasEmAtraso.length}</span>
              </div>
              {diasEmAtraso.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Você está em dia com o plano.
                </p>
              ) : (
                diasEmAtraso.slice(-3).map((dia) => (
                  <div
                    key={dia.id}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg border border-dashed"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Dia {dia.dayNumber}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {dia.readings.map((reading) => reading.reference).join(" · ")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
