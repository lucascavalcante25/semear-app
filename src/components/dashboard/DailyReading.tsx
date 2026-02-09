import { BookMarked, Check, X, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatarData, type TrechoLeitura } from "@/data/daily-reading";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import {
  alternarProgressoLeitura,
  getLeituraDoDia,
  obterIdUsuario,
  obterProgressoLeitura,
} from "@/modules/bible/service";
import type { ProgressoLeituraUsuario } from "@/modules/bible/types";

interface ItemLeituraProps {
  leitura: TrechoLeitura;
  concluida: boolean;
  aoMarcar: (id: string, concluida: boolean) => void;
}

function ItemLeitura({ leitura, concluida, aoMarcar }: ItemLeituraProps) {
  const coresTipo = {
    gospel: "bg-deep-blue/10 text-deep-blue border-deep-blue/20",
    oldTestament: "bg-olive/10 text-olive border-olive/20",
    psalm: "bg-gold/10 text-gold-dark border-gold/20",
    proverb: "bg-gold/10 text-gold-dark border-gold/20",
    epistle: "bg-deep-blue/10 text-deep-blue border-deep-blue/20",
  };

  const rotulosTipo = {
    gospel: "Evangelho",
    oldTestament: "Antigo Testamento",
    psalm: "Salmo",
    proverb: "Provérbio",
    epistle: "Epístola",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200",
        concluida
          ? "bg-olive/5 border-olive/30"
          : "bg-card border-border hover:border-muted-foreground/30"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border",
              coresTipo[leitura.type]
            )}
          >
            {rotulosTipo[leitura.type]}
          </span>
        </div>
        <p
          className={cn(
            "text-sm font-medium truncate",
            concluida && "line-through text-muted-foreground"
          )}
        >
          {leitura.reference}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant={concluida ? "reading-complete" : "reading"}
          size="icon-sm"
          onClick={() => aoMarcar(leitura.id, true)}
          className={cn(concluida && "pointer-events-none")}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant={!concluida ? "reading-pending" : "reading"}
          size="icon-sm"
          onClick={() => aoMarcar(leitura.id, false)}
          className={cn(!concluida && "opacity-50")}
          disabled={!concluida}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function LeituraDiaria() {
  const { user } = usarAutenticacao();
  const userId = obterIdUsuario(user?.id);
  const [progressoLeitura, setProgressoLeitura] = useState<ProgressoLeituraUsuario[]>([]);
  const [planoId, setPlanoId] = useState<string>("");
  const [leiturasHoje, setLeiturasHoje] = useState<TrechoLeitura[]>([]);

  useEffect(() => {
    setProgressoLeitura(obterProgressoLeitura(userId));
    const leitura = getLeituraDoDia(userId);
    if (leitura) {
      setPlanoId(leitura.plano.id);
      setLeiturasHoje(leitura.dia.readings);
    }
  }, [userId]);

  const leiturasConcluidas = useMemo(() => {
    const concluidas = new Set<string>();
    progressoLeitura
      .filter((progress) => progress.planId === planoId && progress.completed)
      .forEach((progress) => concluidas.add(progress.dayId));
    return concluidas;
  }, [planoId, progressoLeitura]);

  const marcarConcluida = (id: string, concluida: boolean) => {
    if (!planoId) {
      return;
    }
    setProgressoLeitura(
      alternarProgressoLeitura(
        userId,
        planoId,
        id,
        new Date().toISOString(),
        concluida,
      ),
    );
  };

  const totalLeituras = leiturasHoje.length || 0;
  const totalConcluidas = leiturasConcluidas.size;
  const progresso = totalLeituras > 0 ? (totalConcluidas / totalLeituras) * 100 : 0;

  const leituras = leiturasHoje.length > 0 ? leiturasHoje : [
    { id: "r1", book: "João", reference: "João 18:38 - 19:16", type: "gospel" as const },
  ];

  return (
    <Card className="shadow-spiritual">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-deep-blue text-deep-blue-foreground">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Leitura do Dia</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {formatarData(new Date())}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Ver plano
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Progresso */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {totalConcluidas} de {totalLeituras} concluídas
            </span>
            <span className="font-medium text-olive">{Math.round(progresso)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {leituras.map((leitura) => (
          <ItemLeitura
            key={leitura.id}
            leitura={leitura}
            concluida={leiturasConcluidas.has(leitura.id)}
            aoMarcar={marcarConcluida}
          />
        ))}
      </CardContent>
    </Card>
  );
}
