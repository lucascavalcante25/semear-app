import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  gerarProximoCicloEscalas,
  LABEL_DIA_SEMANA,
  LABEL_MODO_LIMPEZA,
  obterConfigAutomacao,
  salvarConfigAutomacao,
  type DiaSemanaCulto,
  type EscalaConfigAutomaticaDTO,
  type ModoLimpezaEscala,
} from "@/modules/escalas/automacao-api";
import { ModalGerarCicloEscalas } from "@/components/escalas/ModalGerarCicloEscalas";
import { EscalasLimpezaHistorico } from "@/components/escalas/EscalasLimpezaHistorico";

const DIAS: DiaSemanaCulto[] = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];

const MODOS: { value: ModoLimpezaEscala; descricao: string }[] = [
  { value: "MENSAL", descricao: "Uma escala por mês, no dia escolhido." },
  { value: "SEMANAL", descricao: "Uma escala por semana, no dia escolhido." },
  { value: "POR_CULTO", descricao: "Escalar limpeza em cada culto cadastrado." },
];

const normalizarModoLimpeza = (cfg?: EscalaConfigAutomaticaDTO): ModoLimpezaEscala => {
  if (cfg?.modoLimpeza) return cfg.modoLimpeza;
  if (cfg?.limpezaMensal === false) return "POR_CULTO";
  return "MENSAL";
};

export function EscalasLimpezaPanel() {
  const [config, setConfig] = useState<EscalaConfigAutomaticaDTO>({
    mesesCiclo: 3,
    diasAntecedencia: 14,
    ativo: true,
    gerarLimpeza: true,
    modoLimpeza: "MENSAL",
    diaSemanaLimpeza: "DOMINGO",
  });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [modalGerarAberto, setModalGerarAberto] = useState(false);
  const [substituirLimpeza, setSubstituirLimpeza] = useState(false);
  const [historicoKey, setHistoricoKey] = useState(0);

  const modoAtual = normalizarModoLimpeza(config);

  const textoDiaLimpeza = useMemo(() => {
    if (modoAtual === "POR_CULTO") {
      return "No modo por culto, a limpeza segue os dias dos cultos cadastrados em Portaria e recepção.";
    }
    if (modoAtual === "SEMANAL") {
      return "No modo semanal, gera escala em todos os dias escolhidos dentro do ciclo.";
    }
    return "No modo mensal, usa a primeira ocorrência desse dia em cada mês do ciclo.";
  }, [modoAtual]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const cfg = await obterConfigAutomacao();
      const modoLimpeza = normalizarModoLimpeza(cfg);
      setConfig({
        mesesCiclo: 3,
        diasAntecedencia: 14,
        ativo: true,
        diaSemanaLimpeza: "DOMINGO",
        ...cfg,
        gerarLimpeza: true,
        modoLimpeza,
        limpezaMensal: modoLimpeza === "MENSAL",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar configuração de limpeza.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const recarregarHistorico = () => setHistoricoKey((k) => k + 1);

  const payloadLimpeza = (): EscalaConfigAutomaticaDTO => {
    const modo = normalizarModoLimpeza(config);
    return {
      ...config,
      gerarLimpeza: true,
      modoLimpeza: modo,
      limpezaMensal: modo === "MENSAL",
    };
  };

  const salvarLimpeza = async () => {
    setSalvando(true);
    try {
      const salva = await salvarConfigAutomacao(payloadLimpeza());
      setConfig({
        mesesCiclo: 3,
        diasAntecedencia: 14,
        ativo: true,
        gerarLimpeza: true,
        diaSemanaLimpeza: "DOMINGO",
        ...salva,
        modoLimpeza: normalizarModoLimpeza(salva),
      });
      toast.success("Configuração de limpeza salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarGerar = async () => {
    setGerando(true);
    try {
      // Não desliga portaria/recepção: a config é compartilhada e o escopo LIMPEZA
      // já ignora esses departamentos na geração.
      await salvarConfigAutomacao(payloadLimpeza());
      await gerarProximoCicloEscalas({
        escopo: "LIMPEZA",
        substituirLimpezaExistente: substituirLimpeza,
      });
      setModalGerarAberto(false);
      setSubstituirLimpeza(false);
      toast.success("Rascunho de limpeza gerado. Revise as escalas e publique quando estiver pronto.");
      recarregarHistorico();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar escalas de limpeza.");
    } finally {
      setGerando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escala de limpeza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure quando a limpeza será sorteada. Ao gerar, cria um rascunho para você revisar e publicar.
          </p>

          <div className="space-y-2">
            <Label>Frequência</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {MODOS.map((modo) => (
                <button
                  key={modo.value}
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      modoLimpeza: modo.value,
                      limpezaMensal: modo.value === "MENSAL",
                    })
                  }
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    modoAtual === modo.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <p className="text-sm font-medium">{LABEL_MODO_LIMPEZA[modo.value]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{modo.descricao}</p>
                </button>
              ))}
            </div>
          </div>

          {modoAtual !== "POR_CULTO" && (
            <div className="space-y-2">
              <Label>Dia da limpeza</Label>
              <Select
                value={config.diaSemanaLimpeza ?? "DOMINGO"}
                onValueChange={(v) => setConfig({ ...config, diaSemanaLimpeza: v as DiaSemanaCulto })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {LABEL_DIA_SEMANA[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{textoDiaLimpeza}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={() => void salvarLimpeza()} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
            <Button variant="secondary" onClick={() => setModalGerarAberto(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar rascunho de limpeza
            </Button>
          </div>
        </CardContent>
      </Card>

      <EscalasLimpezaHistorico key={historicoKey} onRecarregar={recarregarHistorico} />

      <ModalGerarCicloEscalas
        aberto={modalGerarAberto}
        onAbertoChange={setModalGerarAberto}
        escopo="LIMPEZA"
        config={config}
        onConfigChange={setConfig}
        onConfirmar={confirmarGerar}
        gerando={gerando}
        substituirLimpezaExistente={substituirLimpeza}
        onSubstituirLimpezaChange={setSubstituirLimpeza}
      />
    </div>
  );
}
