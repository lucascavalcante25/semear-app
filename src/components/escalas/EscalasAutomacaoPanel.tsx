import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  gerarProximoCicloEscalas,
  listarCultosRegistro,
  listarGeracoesEscalas,
  obterConfigAutomacao,
  salvarConfigAutomacao,
  type CultoRegistroDTO,
  type EscalaConfigAutomaticaDTO,
  type EscalaGeracaoDTO,
} from "@/modules/escalas/automacao-api";
import { ModalGerarCicloEscalas } from "@/components/escalas/ModalGerarCicloEscalas";
import { EscalasCiclosGerados } from "@/components/escalas/EscalasCiclosGerados";

export function EscalasAutomacaoPanel() {
  const [config, setConfig] = useState<EscalaConfigAutomaticaDTO>({
    mesesCiclo: 3,
    diasAntecedencia: 14,
    ativo: true,
    gerarPortaria: true,
    gerarRecepcao: true,
    gerarLimpeza: false,
    agruparPortariaRecepcao: false,
  });
  const [cultos, setCultos] = useState<CultoRegistroDTO[]>([]);
  const [geracoes, setGeracoes] = useState<EscalaGeracaoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [modalGerarAberto, setModalGerarAberto] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [cfg, listaCultos, listaGeracoes] = await Promise.all([
        obterConfigAutomacao(),
        listarCultosRegistro(),
        listarGeracoesEscalas(),
      ]);
      setConfig({
        mesesCiclo: 3,
        diasAntecedencia: 14,
        ativo: true,
        gerarPortaria: true,
        gerarRecepcao: true,
        gerarLimpeza: false,
        agruparPortariaRecepcao: false,
        ...cfg,
      });
      setCultos((listaCultos ?? []).filter((c) => !c.tipo || c.tipo === "RECORRENTE"));
      setGeracoes(listaGeracoes ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível carregar a automação.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const confirmarGerar = async () => {
    setGerando(true);
    try {
      const cfgSalva = await salvarConfigAutomacao({
        ...config,
        gerarLimpeza: false,
      });
      setConfig({
        mesesCiclo: 3,
        diasAntecedencia: 14,
        ativo: true,
        gerarPortaria: true,
        gerarRecepcao: true,
        gerarLimpeza: false,
        agruparPortariaRecepcao: false,
        ...cfgSalva,
      });
      const geracao = await gerarProximoCicloEscalas({ escopo: "PORTARIA_RECEPCAO" });
      setModalGerarAberto(false);
      toast.success("Ciclo gerado em rascunho. Revise e publique.");
      if (geracao) {
        setGeracoes((prev) => [geracao, ...prev.filter((g) => g.id !== geracao.id)]);
        setConfig((c) => ({
          ...c,
          podeGerarProximoCiclo: false,
          motivoBloqueioGeracao: "Há um ciclo em rascunho. Publique ou descarte antes de gerar outro.",
        }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar ciclo.");
    } finally {
      setGerando(false);
    }
  };

  const geracaoBloqueada = config.podeGerarProximoCiclo === false;

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
          <CardTitle className="text-base">Cultos para escala</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Os cultos recorrentes são cadastrados no menu{" "}
            <Link to="/cultos" className="text-primary underline underline-offset-2 font-medium">
              Culto
            </Link>
            . Aqui você gera as escalas de portaria e recepção a partir deles.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {cultos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum culto recorrente cadastrado. Vá em Culto e cadastre Domingo, Terça, Quinta etc.
            </p>
          ) : (
            <ul className="text-sm space-y-1">
              {cultos.map((c) => (
                <li key={c.id ?? c.nome}>
                  <span className="font-medium">{c.nome}</span>
                  <span className="text-muted-foreground"> — {c.diaSemana} às {c.horario}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void carregar()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={cultos.length === 0 || geracaoBloqueada || gerando}
              onClick={() => setModalGerarAberto(true)}
            >
              Gerar próximo ciclo
            </Button>
          </div>
          {geracaoBloqueada && config.motivoBloqueioGeracao && (
            <p className="text-xs text-amber-700">{config.motivoBloqueioGeracao}</p>
          )}
        </CardContent>
      </Card>

      <EscalasCiclosGerados
        geracoes={geracoes}
        onGeracoesChange={setGeracoes}
        onConfigPatch={(patch) => setConfig((c) => ({ ...c, ...patch }))}
      />

      <ModalGerarCicloEscalas
        aberto={modalGerarAberto}
        onAbertoChange={setModalGerarAberto}
        escopo="PORTARIA_RECEPCAO"
        config={config}
        onConfigChange={setConfig}
        gerando={gerando}
        onConfirmar={async () => {
          await confirmarGerar();
        }}
        bloqueado={geracaoBloqueada}
        motivoBloqueio={config.motivoBloqueioGeracao}
      />
    </div>
  );
}
