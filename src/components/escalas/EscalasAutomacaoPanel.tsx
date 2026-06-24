import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { listarDepartamentos, type DepartamentoDTO } from "@/modules/departamentos/api";
import {
  gerarProximoCicloEscalas,
  LABEL_DIA_SEMANA,
  LABEL_REGRA_GENERO,
  listarCultosRegistro,
  listarGeracoesEscalas,
  obterConfigAutomacao,
  salvarConfigAutomacao,
  salvarCultosRegistro,
  type CultoRegistroDTO,
  type DiaSemanaCulto,
  type EscalaConfigAutomaticaDTO,
  type EscalaGeracaoDTO,
  type RegraGeneroEscala,
} from "@/modules/escalas/automacao-api";
import { ModalGerarCicloEscalas } from "@/components/escalas/ModalGerarCicloEscalas";
import { EscalasCiclosGerados } from "@/components/escalas/EscalasCiclosGerados";

const DIAS: DiaSemanaCulto[] = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];

const cultoVazio = (): CultoRegistroDTO => ({
  nome: "",
  diaSemana: "DOMINGO",
  horario: "09:00",
  ativo: true,
  regras: [],
});

const ehPortariaOuRecepcao = (nome?: string) => {
  const n = (nome ?? "").toLowerCase();
  return n.includes("portaria") || n.includes("recep");
};

const sugerirModeloPadraoCultos = (deptos: DepartamentoDTO[]): CultoRegistroDTO[] => {
  const portaria = deptos.find((d) => d.nome.toLowerCase().includes("portaria"));
  const recepcao = deptos.find((d) => d.nome.toLowerCase().includes("recep"));
  const regras = (portariaId?: number, recepId?: number) => {
    const r = [];
    if (portariaId) {
      r.push({ departamentoId: portariaId, regraGenero: "MASCULINO" as RegraGeneroEscala, ativo: true });
    }
    if (recepId) {
      r.push({ departamentoId: recepId, regraGenero: "FEMININO" as RegraGeneroEscala, ativo: true });
    }
    return r;
  };
  return [
    {
      nome: "Culto de quinta",
      diaSemana: "QUINTA",
      horario: "19:00",
      ativo: true,
      regras: regras(portaria?.id, recepcao?.id),
    },
    {
      nome: "Culto de domingo",
      diaSemana: "DOMINGO",
      horario: "09:00",
      ativo: true,
      regras: regras(portaria?.id, recepcao?.id),
    },
  ];
};

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
  const [departamentos, setDepartamentos] = useState<DepartamentoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [modalGerarAberto, setModalGerarAberto] = useState(false);

  const deptosPortariaRecep = useMemo(
    () => departamentos.filter((d) => ehPortariaOuRecepcao(d.nome)),
    [departamentos],
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [cfg, listaCultos, listaGeracoes, deptos] = await Promise.all([
        obterConfigAutomacao(),
        listarCultosRegistro(),
        listarGeracoesEscalas(),
        listarDepartamentos(),
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
      setCultos(listaCultos ?? []);
      setGeracoes(listaGeracoes ?? []);
      setDepartamentos(deptos ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível carregar a automação.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const salvarCultos = async () => {
    setSalvando(true);
    try {
      await salvarCultosRegistro(cultos);
      toast.success("Cultos salvos.");
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar cultos.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarGerar = async () => {
    setGerando(true);
    try {
      await salvarConfigAutomacao({
        ...config,
        gerarLimpeza: false,
      });
      await salvarCultosRegistro(cultos);
      await gerarProximoCicloEscalas({ escopo: "PORTARIA_RECEPCAO" });
      setModalGerarAberto(false);
      toast.success("Ciclo gerado em rascunho. Revise e publique.");
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar ciclo.");
    } finally {
      setGerando(false);
    }
  };

  const adicionarCulto = () => setCultos((prev) => [...prev, cultoVazio()]);

  const aplicarModeloPadrao = () => {
    const sugeridos = sugerirModeloPadraoCultos(deptosPortariaRecep);
    if (sugeridos.some((c) => (c.regras?.length ?? 0) === 0)) {
      toast.error("Cadastre departamentos Portaria e Recepção com membros antes.");
      return;
    }
    setCultos((atuais) => {
      const diasModelo = new Set(sugeridos.map((s) => s.diaSemana));
      const mantidos = atuais.filter((c) => !diasModelo.has(c.diaSemana));
      const mesclados = sugeridos.map((sug) => {
        const existente = atuais.find((c) => c.diaSemana === sug.diaSemana);
        if (existente) {
          return { ...existente, nome: sug.nome, horario: sug.horario, regras: sug.regras, ativo: true };
        }
        return sug;
      });
      return [...mantidos, ...mesclados];
    });
    toast.success("Modelo aplicado (quinta 19h e domingo 9h). Salve os cultos para confirmar.");
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
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Cultos da igreja</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Defina os cultos regulares e quem escala em portaria e recepção. A limpeza fica na aba Limpeza.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={aplicarModeloPadrao}>
              <Wand2 className="h-4 w-4 mr-1" />
              Modelo padrão
            </Button>
            <Button type="button" size="sm" onClick={adicionarCulto}>
              <Plus className="h-4 w-4 mr-1" />
              Culto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cultos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Cadastre os cultos ou aplique o modelo padrão para começar.
            </p>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {cultos.map((culto, idx) => (
            <div key={culto.id ?? `novo-${idx}`} className="rounded-lg border p-3 space-y-3">
              <div className="flex justify-between gap-2">
                <Input
                  placeholder="Nome do culto"
                  value={culto.nome}
                  onChange={(e) => {
                    const copia = [...cultos];
                    copia[idx] = { ...culto, nome: e.target.value };
                    setCultos(copia);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0"
                  onClick={() => setCultos(cultos.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Dia</Label>
                  <Select
                    value={culto.diaSemana}
                    onValueChange={(v) => {
                      const copia = [...cultos];
                      copia[idx] = { ...culto, diaSemana: v as DiaSemanaCulto };
                      setCultos(copia);
                    }}
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
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Horário</Label>
                  <Input
                    placeholder="19:00"
                    value={culto.horario}
                    onChange={(e) => {
                      const copia = [...cultos];
                      copia[idx] = { ...culto, horario: e.target.value };
                      setCultos(copia);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Portaria / Recepção neste culto</Label>
                {(culto.regras ?? []).map((regra, rIdx) => (
                  <div key={rIdx} className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={regra.departamentoId != null ? String(regra.departamentoId) : ""}
                      onValueChange={(v) => {
                        const copia = [...cultos];
                        const regras = [...(culto.regras ?? [])];
                        regras[rIdx] = { ...regra, departamentoId: Number(v) };
                        copia[idx] = { ...culto, regras };
                        setCultos(copia);
                      }}
                    >
                      <SelectTrigger className="sm:flex-1">
                        <SelectValue placeholder="Departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {deptosPortariaRecep.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={regra.regraGenero ?? "QUALQUER"}
                      onValueChange={(v) => {
                        const copia = [...cultos];
                        const regras = [...(culto.regras ?? [])];
                        regras[rIdx] = { ...regra, regraGenero: v as RegraGeneroEscala };
                        copia[idx] = { ...culto, regras };
                        setCultos(copia);
                      }}
                    >
                      <SelectTrigger className="sm:w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(LABEL_REGRA_GENERO) as RegraGeneroEscala[]).map((g) => (
                          <SelectItem key={g} value={g}>
                            {LABEL_REGRA_GENERO[g]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const copia = [...cultos];
                        copia[idx] = {
                          ...culto,
                          regras: (culto.regras ?? []).filter((_, i) => i !== rIdx),
                        };
                        setCultos(copia);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copia = [...cultos];
                    copia[idx] = {
                      ...culto,
                      regras: [...(culto.regras ?? []), { regraGenero: "QUALQUER", ativo: true }],
                    };
                    setCultos(copia);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Departamento
                </Button>
              </div>
            </div>
          ))}
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={() => void salvarCultos()} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar cultos
            </Button>
            <Button variant="secondary" onClick={() => setModalGerarAberto(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar próximo ciclo
            </Button>
          </div>
        </CardContent>
      </Card>

      <EscalasCiclosGerados geracoes={geracoes} onRecarregar={carregar} />

      <ModalGerarCicloEscalas
        aberto={modalGerarAberto}
        onAbertoChange={setModalGerarAberto}
        escopo="PORTARIA_RECEPCAO"
        config={config}
        onConfigChange={setConfig}
        onConfirmar={confirmarGerar}
        gerando={gerando}
        bloqueado={geracaoBloqueada}
        motivoBloqueio={config.motivoBloqueioGeracao}
      />
    </div>
  );
}
