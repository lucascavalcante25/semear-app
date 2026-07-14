import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Loader2,
  Plus,
  Trash2,
  Wand2,
  Church,
  Music,
  ChevronDown,
  ChevronRight,
  BookOpen,
  User,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import { cn } from "@/lib/utils";
import { ModalResumoCulto } from "@/components/cultos/ModalResumoCulto";
import { listarDepartamentos, type DepartamentoDTO } from "@/modules/departamentos/api";
import { listarGrupos, type GrupoLouvorApp } from "@/modules/grupos-louvor/api";
import { listarMembros, type MembroApi } from "@/modules/members/api";
import { listarLouvores, type LouvorApp } from "@/modules/louvores/api";
import {
  LABEL_DIA_SEMANA,
  LABEL_FREQUENCIA_CULTO,
  type DiaSemanaCulto,
  type FrequenciaCulto,
} from "@/modules/escalas/automacao-api";
import {
  listarAgendaCultos,
  listarModelosCulto,
  previewGrupoLouvorCulto,
  salvarModelosCulto,
  salvarOcorrenciaCulto,
  type CultoAgendaItemDTO,
  type CultoLouvorItemDTO,
  type CultoModeloDTO,
  type PapelCultoResponsavel,
  type TipoCulto,
} from "@/modules/cultos/api";

const DIAS: DiaSemanaCulto[] = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const cultoVazio = (): CultoModeloDTO => ({
  nome: "",
  diaSemana: "DOMINGO",
  horario: "09:00",
  tipo: "RECORRENTE",
  frequencia: "TODA_SEMANA",
  dataAncora: null,
  ativo: true,
  regras: [],
});

const ehPortariaOuRecepcao = (nome?: string) => {
  const n = (nome ?? "").toLowerCase();
  return n.includes("portaria") || n.includes("recep");
};

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const formatarData = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const data = new Date(y, m - 1, d);
  const diaSemana = DIAS_SEMANA[data.getDay()] ?? "";
  const dataFmt = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  return diaSemana ? `${diaSemana}, ${dataFmt}` : dataFmt;
};

const chaveMes = (iso: string) => iso.slice(0, 7); // yyyy-MM

const labelMes = (chave: string) => {
  const [y, m] = chave.split("-");
  const mesIdx = Number(m) - 1;
  if (!y || mesIdx < 0 || mesIdx > 11) return chave;
  return `${MESES[mesIdx]} ${y}`;
};

type GrupoMes = { chave: string; label: string; itens: CultoAgendaItemDTO[] };

function agruparPorMes(itens: CultoAgendaItemDTO[]): GrupoMes[] {
  const map = new Map<string, CultoAgendaItemDTO[]>();
  for (const item of itens) {
    const k = chaveMes(item.data);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return Array.from(map.entries()).map(([chave, lista]) => ({
    chave,
    label: labelMes(chave),
    itens: lista,
  }));
}

type RespEdit = { papel: PapelCultoResponsavel; userId: number; nome: string };

function SeletorMembro({
  label,
  valor,
  membros,
  onSelecionar,
  onLimpar,
}: {
  label: string;
  valor: RespEdit | null;
  membros: MembroApi[];
  onSelecionar: (m: MembroApi) => void;
  onLimpar: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-1">
        <Popover open={aberto} onOpenChange={setAberto}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="flex-1 justify-between font-normal h-9"
            >
              <span className="truncate">
                {valor ? valor.nome : `Selecionar ${label.toLowerCase()}…`}
              </span>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(100vw-2rem,20rem)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar por nome…" />
              <CommandList className="max-h-56">
                <CommandEmpty>Nenhum membro encontrado.</CommandEmpty>
                <CommandGroup>
                  {membros.map((m) => (
                    <CommandItem
                      key={m.idNum}
                      value={m.name || m.login}
                      onSelect={() => {
                        onSelecionar(m);
                        setAberto(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          valor?.userId === m.idNum ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {m.name || m.login}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {valor && (
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onLimpar}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Cultos() {
  const { user } = usarAutenticacao();
  const [searchParams, setSearchParams] = useSearchParams();
  const podeEditar = canWrite(user, "/cultos");
  const podeLouvores = canWrite(user, "/louvores");

  const [aba, setAba] = useState("agenda");
  const [carregando, setCarregando] = useState(true);
  const [salvandoModelos, setSalvandoModelos] = useState(false);
  const [modelos, setModelos] = useState<CultoModeloDTO[]>([]);
  const [proximos, setProximos] = useState<CultoAgendaItemDTO[]>([]);
  const [passados, setPassados] = useState<CultoAgendaItemDTO[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDTO[]>([]);
  const [grupos, setGrupos] = useState<GrupoLouvorApp[]>([]);
  const [membros, setMembros] = useState<MembroApi[]>([]);
  const [repertorio, setRepertorio] = useState<LouvorApp[]>([]);

  const mesAtualChave = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const [mesesAbertosProximos, setMesesAbertosProximos] = useState<Set<string>>(() => new Set([mesAtualChave]));
  const [mesesAbertosPassados, setMesesAbertosPassados] = useState<Set<string>>(() => new Set());

  const [resumo, setResumo] = useState<CultoAgendaItemDTO | null>(null);
  const [detalhe, setDetalhe] = useState<CultoAgendaItemDTO | null>(null);
  const [salvandoDetalhe, setSalvandoDetalhe] = useState(false);
  const [editPregador, setEditPregador] = useState("");
  const [editTitulo, setEditTitulo] = useState("");
  const [editVersiculo, setEditVersiculo] = useState("");
  const [editObs, setEditObs] = useState("");
  const [editLouvores, setEditLouvores] = useState<CultoLouvorItemDTO[]>([]);
  const [editGrupoId, setEditGrupoId] = useState<string>("");
  const [editResponsaveis, setEditResponsaveis] = useState<RespEdit[]>([]);
  const [responsaveisAlterados, setResponsaveisAlterados] = useState(false);
  const [popoverLouvorAberto, setPopoverLouvorAberto] = useState(false);

  const deptosPortariaRecep = useMemo(
    () => departamentos.filter((d) => ehPortariaOuRecepcao(d.nome)),
    [departamentos],
  );

  const gruposProximos = useMemo(() => {
    const hoje = new Date();
    const chaveAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
    const proxMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    const chaveProx = `${proxMes.getFullYear()}-${String(proxMes.getMonth() + 1).padStart(2, "0")}`;
    const filtrados = proximos.filter((i) => {
      const k = chaveMes(i.data);
      return k === chaveAtual || k === chaveProx;
    });
    return agruparPorMes(filtrados);
  }, [proximos]);
  const gruposPassados = useMemo(() => agruparPorMes(passados), [passados]);
  const proximoCultoChave = proximos[0] ? `${proximos[0].cultoRegistroId}-${proximos[0].data}` : null;

  const portariaAtual = editResponsaveis.find((r) => r.papel === "PORTARIA") ?? null;
  const recepcaoAtual = editResponsaveis.find((r) => r.papel === "RECEPCAO") ?? null;
  const limpezaAtual = editResponsaveis.find((r) => r.papel === "LIMPEZA") ?? null;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      // Agenda + modelos liberam a tela; o resto carrega em background.
      const [mods, agenda] = await Promise.all([listarModelosCulto(), listarAgendaCultos()]);
      setModelos(mods ?? []);
      const prox = agenda?.proximos ?? [];
      setProximos(prox);
      setPassados(agenda?.passados ?? []);
      if (prox.length > 0) {
        const hoje = new Date();
        const chaveAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
        const proxMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
        const chaveProx = `${proxMes.getFullYear()}-${String(proxMes.getMonth() + 1).padStart(2, "0")}`;
        const abertos = new Set<string>();
        for (const item of prox) {
          const k = chaveMes(item.data);
          if (k === chaveAtual || k === chaveProx) abertos.add(k);
        }
        setMesesAbertosProximos(abertos.size > 0 ? abertos : new Set([chaveMes(prox[0].data)]));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar cultos.");
    } finally {
      setCarregando(false);
    }

    void (async () => {
      try {
        const secundarios: Promise<void>[] = [
          listarDepartamentos({ resumo: true })
            .catch(() => [] as DepartamentoDTO[])
            .then((deptos) => setDepartamentos(deptos ?? [])),
        ];
        if (podeLouvores) {
          secundarios.push(
            Promise.all([
              listarGrupos().catch(() => [] as GrupoLouvorApp[]),
              listarLouvores().catch(() => [] as LouvorApp[]),
            ]).then(([g, louvores]) => {
              setGrupos(g ?? []);
              setRepertorio(louvores ?? []);
            }),
          );
        }
        if (podeEditar) {
          secundarios.push(
            listarMembros()
              .catch(() => [] as MembroApi[])
              .then((m) => setMembros((m ?? []).filter((x) => x.activated !== false && x.idNum != null))),
          );
        }
        await Promise.all(secundarios);
      } catch {
        /* secundário: não bloqueia a tela */
      }
    })();
  }, [podeEditar, podeLouvores]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const toggleMes = (set: Dispatch<SetStateAction<Set<string>>>, chave: string) => {
    set((prev) => {
      const next = new Set(prev);
      if (next.has(chave)) next.delete(chave);
      else next.add(chave);
      return next;
    });
  };

  const abrirResumo = (item: CultoAgendaItemDTO) => {
    setResumo(item);
  };

  const preencherFormEdicao = useCallback((item: CultoAgendaItemDTO) => {
    setDetalhe(item);
    setEditPregador(item.pregador ?? "");
    setEditTitulo(item.tituloMensagem ?? "");
    setEditVersiculo(item.versiculoCentral ?? "");
    setEditObs(item.observacoes ?? "");
    setEditLouvores(item.louvores ?? []);
    setEditGrupoId(item.grupoLouvorOrigemId != null ? String(item.grupoLouvorOrigemId) : "");
    setEditResponsaveis(
      (item.responsaveis ?? []).map((r) => ({
        papel: r.papel,
        userId: r.userId,
        nome: r.nome,
      })),
    );
    setResponsaveisAlterados(Boolean(item.temOverrideResponsaveis));
  }, []);

  useEffect(() => {
    if (carregando || !podeEditar) return;
    const cultoId = searchParams.get("editar");
    const data = searchParams.get("data");
    if (!cultoId || !data) return;
    const idNum = Number(cultoId);
    if (!Number.isFinite(idNum)) return;
    const item = [...proximos, ...passados].find(
      (i) => i.cultoRegistroId === idNum && i.data === data,
    );
    if (!item) return;
    setResumo(null);
    preencherFormEdicao(item);
    setSearchParams({}, { replace: true });
  }, [carregando, podeEditar, proximos, passados, searchParams, setSearchParams, preencherFormEdicao]);

  const abrirEdicaoDoResumo = () => {
    if (!resumo) return;
    const item = resumo;
    setResumo(null);
    preencherFormEdicao(item);
  };

  const puxarGrupo = async (grupoId: string) => {
    if (!grupoId || grupoId === "__none__") {
      setEditGrupoId("");
      return;
    }
    setEditGrupoId(grupoId);
    try {
      const preview = await previewGrupoLouvorCulto(Number(grupoId));
      setEditLouvores(preview ?? []);
      toast.success("Louvores do grupo copiados para este culto (o grupo original não muda).");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar grupo.");
    }
  };

  const adicionarLouvorRepertorio = (louvor: LouvorApp) => {
    if (!louvor.idNum) return;
    if (editLouvores.some((l) => l.louvorId === louvor.idNum)) {
      toast.error("Este louvor já está neste culto.");
      return;
    }
    setEditLouvores((prev) => [
      ...prev,
      {
        louvorId: louvor.idNum!,
        titulo: louvor.title,
        artista: louvor.artist,
        ordem: prev.length,
      },
    ]);
    setPopoverLouvorAberto(false);
  };

  const setResponsavelPapel = (papel: PapelCultoResponsavel, m: MembroApi | null) => {
    setResponsaveisAlterados(true);
    setEditResponsaveis((prev) => {
      const semPapel = prev.filter((r) => r.papel !== papel);
      if (!m?.idNum) return semPapel;
      return [...semPapel, { papel, userId: m.idNum, nome: m.name || m.login }];
    });
  };

  const atualizarItemNaLista = (atualizado: CultoAgendaItemDTO) => {
    const mesmaOcorrencia = (i: CultoAgendaItemDTO) =>
      i.cultoRegistroId === atualizado.cultoRegistroId && i.data === atualizado.data;
    setProximos((prev) => prev.map((i) => (mesmaOcorrencia(i) ? atualizado : i)));
    setPassados((prev) => prev.map((i) => (mesmaOcorrencia(i) ? atualizado : i)));
    setResumo((prev) =>
      prev && mesmaOcorrencia(prev) ? atualizado : prev,
    );
  };

  const salvarOrdemLouvoresResumo = async (louvores: CultoLouvorItemDTO[]) => {
    if (!resumo || !podeEditar) return;
    try {
      const atualizado = await salvarOcorrenciaCulto({
        cultoRegistroId: resumo.cultoRegistroId,
        data: resumo.data,
        pregador: resumo.pregador ?? null,
        tituloMensagem: resumo.tituloMensagem ?? null,
        versiculoCentral: resumo.versiculoCentral ?? null,
        observacoes: resumo.observacoes ?? null,
        grupoLouvorOrigemId: resumo.grupoLouvorOrigemId ?? null,
        louvorIds: louvores.map((l) => l.louvorId),
        responsaveisManuais: resumo.temOverrideResponsaveis
          ? (resumo.responsaveis ?? []).map((r) => ({ papel: r.papel, userId: r.userId }))
          : undefined,
      });
      atualizarItemNaLista(atualizado);
      toast.success("Ordem dos louvores atualizada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao reordenar.");
      throw e;
    }
  };

  const salvarDetalhe = async () => {
    if (!detalhe || !podeEditar) return;
    setSalvandoDetalhe(true);
    try {
      const atualizado = await salvarOcorrenciaCulto({
        cultoRegistroId: detalhe.cultoRegistroId,
        data: detalhe.data,
        pregador: editPregador.trim() || null,
        tituloMensagem: editTitulo.trim() || null,
        versiculoCentral: editVersiculo.trim() || null,
        observacoes: editObs.trim() || null,
        grupoLouvorOrigemId: editGrupoId ? Number(editGrupoId) : null,
        louvorIds: editLouvores.map((l) => l.louvorId),
        responsaveisManuais: responsaveisAlterados
          ? editResponsaveis.map((r) => ({ papel: r.papel, userId: r.userId }))
          : undefined,
      });
      toast.success("Culto atualizado.");
      atualizarItemNaLista(atualizado);
      setDetalhe(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvandoDetalhe(false);
    }
  };

  const salvarModelos = async () => {
    for (const m of modelos) {
      if ((m.tipo ?? "RECORRENTE") !== "RECORRENTE") continue;
      if ((m.frequencia ?? "TODA_SEMANA") !== "SEMANAS_ALTERNADAS") continue;
      if (!m.dataAncora) {
        toast.error(`Informe a primeira ocorrência de "${m.nome || "culto"}".`);
        return;
      }
      const d = new Date(`${m.dataAncora}T12:00:00`);
      const map: Record<number, DiaSemanaCulto> = {
        0: "DOMINGO",
        1: "SEGUNDA",
        2: "TERCA",
        3: "QUARTA",
        4: "QUINTA",
        5: "SEXTA",
        6: "SABADO",
      };
      if (map[d.getDay()] !== m.diaSemana) {
        toast.error(
          `A primeira ocorrência de "${m.nome || "culto"}" precisa ser em ${LABEL_DIA_SEMANA[m.diaSemana]}.`,
        );
        return;
      }
    }
    setSalvandoModelos(true);
    try {
      // Sorteio usa quem está no departamento; filtro por sexo não é configurado aqui.
      const payload = modelos.map((m) => ({
        ...m,
        frequencia: (m.tipo ?? "RECORRENTE") === "RECORRENTE" ? (m.frequencia ?? "TODA_SEMANA") : "TODA_SEMANA",
        dataAncora:
          (m.tipo ?? "RECORRENTE") === "RECORRENTE" && (m.frequencia ?? "TODA_SEMANA") === "SEMANAS_ALTERNADAS"
            ? m.dataAncora
            : null,
        regras: (m.regras ?? []).map((r) => ({ ...r, regraGenero: "QUALQUER" as const })),
      }));
      const salvos = await salvarModelosCulto(payload);
      setModelos(salvos ?? []);
      toast.success("Modelos de culto salvos.");
      // Só a agenda precisa ser recalculada (datas projetadas); sem spinner de tela cheia.
      const agenda = await listarAgendaCultos();
      setProximos(agenda?.proximos ?? []);
      setPassados(agenda?.passados ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar modelos.");
    } finally {
      setSalvandoModelos(false);
    }
  };

  const aplicarModeloPadrao = () => {
    const portaria = deptosPortariaRecep.find((d) => d.nome.toLowerCase().includes("portaria"));
    const recepcao = deptosPortariaRecep.find((d) => d.nome.toLowerCase().includes("recep"));
    const regras = () => {
      const r: CultoModeloDTO["regras"] = [];
      if (portaria?.id) r.push({ departamentoId: portaria.id, regraGenero: "QUALQUER", ativo: true });
      if (recepcao?.id) r.push({ departamentoId: recepcao.id, regraGenero: "QUALQUER", ativo: true });
      return r;
    };
    const sugeridos: CultoModeloDTO[] = [
      { nome: "Culto de quinta", diaSemana: "QUINTA", horario: "19:00", tipo: "RECORRENTE", ativo: true, regras: regras() },
      { nome: "Culto de domingo", diaSemana: "DOMINGO", horario: "09:00", tipo: "RECORRENTE", ativo: true, regras: regras() },
    ];
    setModelos((atuais) => {
      const dias = new Set(sugeridos.map((s) => s.diaSemana));
      const mantidos = atuais.filter((c) => c.tipo === "EXTRAORDINARIO" || !dias.has(c.diaSemana));
      return [...mantidos, ...sugeridos];
    });
    toast.success("Modelo padrão aplicado. Clique em Salvar modelos.");
  };

  const CardAgenda = ({ item, destacar }: { item: CultoAgendaItemDTO; destacar?: boolean }) => {
    const portaria = item.responsaveis.find((r) => r.papel === "PORTARIA");
    const recepcao = item.responsaveis.find((r) => r.papel === "RECEPCAO");
    const limpeza = item.responsaveis.find((r) => r.papel === "LIMPEZA");
    const linhaResponsaveis = [
      portaria ? `Portaria: ${portaria.nome}` : null,
      recepcao ? `Recepção: ${recepcao.nome}` : null,
      limpeza ? `Limpeza: ${limpeza.nome}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      <button
        type="button"
        className={cn(
          "w-full text-left rounded-lg border p-2.5 sm:p-3 transition-colors touch-manipulation",
          destacar
            ? "bg-olive/10 border-olive/40 ring-1 ring-olive/30 shadow-sm"
            : "bg-card hover:bg-muted/40 active:bg-muted/60",
        )}
        onClick={() => abrirResumo(item)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-semibold text-sm sm:text-base leading-snug break-words">{item.nome}</p>
              {destacar && (
                <Badge className="bg-olive text-white text-[10px] hover:bg-olive shrink-0">Próximo</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatarData(item.data)} · {item.horario}
            </p>
            {item.pregador && (
              <p className="text-xs flex items-start gap-1 text-foreground/90">
                <User className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="break-words">{item.pregador}</span>
              </p>
            )}
            {item.tituloMensagem && (
              <p className="text-xs flex items-start gap-1 text-muted-foreground">
                <BookOpen className="h-3 w-3 shrink-0 mt-0.5" />
                <span className="break-words line-clamp-2">{item.tituloMensagem}</span>
              </p>
            )}
            {item.versiculoCentral && (
              <p className="text-[11px] italic text-muted-foreground line-clamp-2">
                {item.versiculoCentral}
              </p>
            )}
            {linhaResponsaveis && (
              <p className="text-[11px] text-muted-foreground break-words pt-0.5">{linhaResponsaveis}</p>
            )}
            {(item.louvores?.length ?? 0) > 0 && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Music className="h-3 w-3 shrink-0" />
                {item.louvores.length} louvor{item.louvores.length !== 1 ? "es" : ""}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="outline" className="text-[10px] whitespace-nowrap">
              {item.tipo === "EXTRAORDINARIO" ? "Extra" : "Recorrente"}
            </Badge>
            {item.temEscalaGerada && (
              <Badge variant="secondary" className="text-[10px]">
                Escala
              </Badge>
            )}
          </div>
        </div>
      </button>
    );
  };

  const ListaPorMes = ({
    grupos,
    abertos,
    onToggle,
    onExpandir,
    onRecolher,
    destacarProximo,
  }: {
    grupos: GrupoMes[];
    abertos: Set<string>;
    onToggle: (chave: string) => void;
    onExpandir: () => void;
    onRecolher: () => void;
    destacarProximo?: boolean;
  }) => {
    if (grupos.length === 0) {
      return <p className="text-sm text-muted-foreground py-4">Nenhum culto neste período.</p>;
    }
    const total = grupos.reduce((a, g) => a + g.itens.length, 0);
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground px-0.5">
          <span className="min-w-0">
            {total} culto{total !== 1 ? "s" : ""} em {grupos.length} mês{grupos.length !== 1 ? "es" : ""}
          </span>
          <div className="flex gap-1 shrink-0">
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs touch-manipulation" onClick={onExpandir}>
              Expandir
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs touch-manipulation" onClick={onRecolher}>
              Recolher
            </Button>
          </div>
        </div>
        {grupos.map((grupo) => {
          const aberto = abertos.has(grupo.chave);
          return (
            <div key={grupo.chave} className="rounded-lg border overflow-hidden bg-card">
              <button
                type="button"
                onClick={() => onToggle(grupo.chave)}
                className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-muted/30 active:bg-muted/50 transition-colors touch-manipulation min-h-11"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {aberto ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-sm truncate">{grupo.label}</span>
                  <Badge variant="outline" className="text-[10px] font-normal shrink-0">
                    {grupo.itens.length}
                  </Badge>
                </div>
              </button>
              {aberto && (
                <div className="border-t bg-muted/10 p-2 grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {grupo.itens.map((item) => {
                    const chave = `${item.cultoRegistroId}-${item.data}`;
                    return (
                      <CardAgenda
                        key={chave}
                        item={item}
                        destacar={destacarProximo && chave === proximoCultoChave}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const louvoresDisponiveis = repertorio.filter(
    (l) => l.idNum != null && !editLouvores.some((e) => e.louvorId === l.idNum),
  );

  return (
    <LayoutApp>
      <div className="space-y-4 min-w-0 px-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Church className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            Culto
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Cultos recorrentes e extraordinários, mensagem, louvores e responsáveis.
          </p>
        </div>

        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={aba} onValueChange={setAba}>
            <TabsList className="h-auto w-full flex flex-wrap gap-1 justify-start sm:justify-center">
              <TabsTrigger value="agenda" className="flex-1 min-w-[7rem] text-xs sm:text-sm">
                Próximos
              </TabsTrigger>
              <TabsTrigger value="passados" className="flex-1 min-w-[7rem] text-xs sm:text-sm">
                Passados
              </TabsTrigger>
              {podeEditar && (
                <TabsTrigger value="modelos" className="flex-1 min-w-[7rem] text-xs sm:text-sm">
                  Cadastro
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="agenda" className="space-y-3 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Cultos dos próximos 2 meses. Toque em um card para ver o resumo; use Editar culto para alterar.
              </p>
              <ListaPorMes
                grupos={gruposProximos}
                abertos={mesesAbertosProximos}
                onToggle={(k) => toggleMes(setMesesAbertosProximos, k)}
                onExpandir={() => setMesesAbertosProximos(new Set(gruposProximos.map((g) => g.chave)))}
                onRecolher={() => setMesesAbertosProximos(new Set())}
                destacarProximo
              />
            </TabsContent>

            <TabsContent value="passados" className="space-y-3 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Histórico recente de cultos. Agrupados por mês.
              </p>
              <ListaPorMes
                grupos={gruposPassados}
                abertos={mesesAbertosPassados}
                onToggle={(k) => toggleMes(setMesesAbertosPassados, k)}
                onExpandir={() => setMesesAbertosPassados(new Set(gruposPassados.map((g) => g.chave)))}
                onRecolher={() => setMesesAbertosPassados(new Set())}
              />
            </TabsContent>

            {podeEditar && (
              <TabsContent value="modelos" className="mt-4 space-y-4">
                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6">
                    <div className="min-w-0">
                      <CardTitle className="text-base">Modelos de culto</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Recorrentes (Domingo, Terça…) e extraordinários. Usados nas Escalas.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap w-full sm:w-auto">
                      <Button type="button" variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={aplicarModeloPadrao}>
                        <Wand2 className="h-4 w-4 mr-1" />
                        Modelo padrão
                      </Button>
                      <Button type="button" size="sm" className="flex-1 sm:flex-none" onClick={() => setModelos((p) => [...p, cultoVazio()])}>
                        <Plus className="h-4 w-4 mr-1" />
                        Culto
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 px-3 sm:px-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                      {modelos.map((culto, idx) => (
                        <div key={idx} className="rounded-lg border p-3 space-y-3">
                          <div className="flex justify-between gap-2">
                            <Input
                              placeholder="Nome do culto"
                              value={culto.nome}
                              onChange={(e) => {
                                const copia = [...modelos];
                                copia[idx] = { ...culto, nome: e.target.value };
                                setModelos(copia);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setModelos((p) => p.filter((_, i) => i !== idx))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Tipo</Label>
                              <Select
                                value={culto.tipo ?? "RECORRENTE"}
                                onValueChange={(v) => {
                                  const tipo = v as TipoCulto;
                                  const copia = [...modelos];
                                  copia[idx] = {
                                    ...culto,
                                    tipo,
                                    ...(tipo === "EXTRAORDINARIO"
                                      ? { frequencia: "TODA_SEMANA", dataAncora: null }
                                      : {}),
                                  };
                                  setModelos(copia);
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="RECORRENTE">Recorrente</SelectItem>
                                  <SelectItem value="EXTRAORDINARIO">Extraordinário</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Horário</Label>
                              <Input
                                value={culto.horario}
                                onChange={(e) => {
                                  const copia = [...modelos];
                                  copia[idx] = { ...culto, horario: e.target.value };
                                  setModelos(copia);
                                }}
                              />
                            </div>
                          </div>
                          {(culto.tipo ?? "RECORRENTE") === "RECORRENTE" ? (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs">Dia da semana</Label>
                                <Select
                                  value={culto.diaSemana}
                                  onValueChange={(v) => {
                                    const copia = [...modelos];
                                    copia[idx] = { ...culto, diaSemana: v as DiaSemanaCulto };
                                    setModelos(copia);
                                  }}
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {DIAS.map((d) => (
                                      <SelectItem key={d} value={d}>{LABEL_DIA_SEMANA[d]}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Frequência</Label>
                                <Select
                                  value={culto.frequencia ?? "TODA_SEMANA"}
                                  onValueChange={(v) => {
                                    const freq = v as FrequenciaCulto;
                                    const copia = [...modelos];
                                    copia[idx] = {
                                      ...culto,
                                      frequencia: freq,
                                      dataAncora: freq === "SEMANAS_ALTERNADAS" ? (culto.dataAncora ?? null) : null,
                                    };
                                    setModelos(copia);
                                  }}
                                >
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {(Object.keys(LABEL_FREQUENCIA_CULTO) as FrequenciaCulto[]).map((f) => (
                                      <SelectItem key={f} value={f}>{LABEL_FREQUENCIA_CULTO[f]}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {(culto.frequencia ?? "TODA_SEMANA") === "SEMANAS_ALTERNADAS" && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Primeira ocorrência</Label>
                                  <Input
                                    type="date"
                                    value={culto.dataAncora ?? ""}
                                    onChange={(e) => {
                                      const copia = [...modelos];
                                      copia[idx] = { ...culto, dataAncora: e.target.value || null };
                                      setModelos(copia);
                                    }}
                                  />
                                  <p className="text-[11px] text-muted-foreground">
                                    Informe a primeira {LABEL_DIA_SEMANA[culto.diaSemana].toLowerCase()} deste culto.
                                    A outra série (semana seguinte) fica para o culto alternado.
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="space-y-1">
                              <Label className="text-xs">Data</Label>
                              <Input
                                type="date"
                                value={culto.dataEspecifica ?? ""}
                                onChange={(e) => {
                                  const copia = [...modelos];
                                  copia[idx] = { ...culto, dataEspecifica: e.target.value || null };
                                  setModelos(copia);
                                }}
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label className="text-xs">Portaria / Recepção (para gerar escalas)</Label>
                            <p className="text-[11px] text-muted-foreground">
                              O sorteio usa os membros do departamento escolhido (sem filtro por sexo).
                            </p>
                            {(culto.regras ?? []).map((regra, rIdx) => (
                              <div key={rIdx} className="flex gap-2">
                                <Select
                                  value={regra.departamentoId != null ? String(regra.departamentoId) : ""}
                                  onValueChange={(v) => {
                                    const copia = [...modelos];
                                    const regras = [...(culto.regras ?? [])];
                                    regras[rIdx] = { ...regra, departamentoId: Number(v), regraGenero: "QUALQUER" };
                                    copia[idx] = { ...culto, regras };
                                    setModelos(copia);
                                  }}
                                >
                                  <SelectTrigger className="flex-1"><SelectValue placeholder="Departamento" /></SelectTrigger>
                                  <SelectContent>
                                    {deptosPortariaRecep.map((d) => (
                                      <SelectItem key={d.id} value={String(d.id)}>{d.nome}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => {
                                    const copia = [...modelos];
                                    copia[idx] = {
                                      ...culto,
                                      regras: (culto.regras ?? []).filter((_, i) => i !== rIdx),
                                    };
                                    setModelos(copia);
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
                                const copia = [...modelos];
                                copia[idx] = {
                                  ...culto,
                                  regras: [...(culto.regras ?? []), { regraGenero: "QUALQUER", ativo: true }],
                                };
                                setModelos(copia);
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Departamento
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => void salvarModelos()} disabled={salvandoModelos}>
                      {salvandoModelos && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Salvar modelos
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}

        <ModalResumoCulto
          item={resumo}
          aberto={!!resumo}
          onFechar={() => setResumo(null)}
          podeEditar={podeEditar}
          onEditar={abrirEdicaoDoResumo}
          onReordenarLouvores={podeEditar ? salvarOrdemLouvoresResumo : undefined}
          destacandoProximo={
            !!resumo && `${resumo.cultoRegistroId}-${resumo.data}` === proximoCultoChave
          }
        />

        <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto w-[calc(100vw-1.5rem)] max-w-lg p-4 sm:p-6">
            {detalhe && (
              <>
                <DialogHeader className="pr-6">
                  <DialogTitle className="text-left text-base sm:text-lg leading-snug break-words">
                    {detalhe.nome}
                  </DialogTitle>
                  <DialogDescription className="text-left text-xs sm:text-sm">
                    {formatarData(detalhe.data)} · {detalhe.horario}
                    {detalhe.temEscalaGerada ? " · Escala gerada" : ""}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div className="space-y-1">
                    <Label>Pregador da palavra</Label>
                    <Input
                      value={editPregador}
                      onChange={(e) => setEditPregador(e.target.value)}
                      disabled={!podeEditar}
                      placeholder="Nome do pregador"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Título da mensagem</Label>
                    <Input
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      disabled={!podeEditar}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Versículo central</Label>
                    <Input
                      value={editVersiculo}
                      onChange={(e) => setEditVersiculo(e.target.value)}
                      disabled={!podeEditar}
                      placeholder="Ex.: João 3:16"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Observações</Label>
                    <Textarea
                      value={editObs}
                      onChange={(e) => setEditObs(e.target.value)}
                      disabled={!podeEditar}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Label className="flex items-center gap-1">
                        <Music className="h-4 w-4" /> Louvores deste culto
                      </Label>
                      {podeEditar && podeLouvores && (
                        <Popover open={popoverLouvorAberto} onOpenChange={setPopoverLouvorAberto}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline" size="sm" className="h-9 w-full sm:w-auto touch-manipulation">
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Do repertório
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[min(100vw-2rem,22rem)] p-0" align="end">
                            <Command>
                              <CommandInput placeholder="Buscar louvor…" />
                              <CommandList className="max-h-56">
                                <CommandEmpty>Nenhum louvor disponível.</CommandEmpty>
                                <CommandGroup>
                                  {louvoresDisponiveis.map((l) => (
                                    <CommandItem
                                      key={l.id}
                                      value={`${l.title} ${l.artist}`}
                                      onSelect={() => adicionarLouvorRepertorio(l)}
                                    >
                                      <div className="min-w-0">
                                        <p className="truncate text-sm">{l.title}</p>
                                        <p className="truncate text-xs text-muted-foreground">{l.artist}</p>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    {podeEditar && podeLouvores && (
                      <Select value={editGrupoId || "__none__"} onValueChange={(v) => void puxarGrupo(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Puxar de um grupo de louvor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Sem grupo</SelectItem>
                          {grupos.map((g) => (
                            <SelectItem key={g.id} value={String(g.idNum)}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {editLouvores.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum louvor definido para este culto.</p>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {editLouvores.map((l, i) => (
                          <li key={l.louvorId} className="flex items-center justify-between gap-2">
                            <span>
                              {i + 1}. {l.titulo}
                              {l.artista ? ` — ${l.artista}` : ""}
                            </span>
                            {podeEditar && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setEditLouvores((p) => p.filter((x) => x.louvorId !== l.louvorId))}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Alterações aqui valem só para este culto; o grupo em Louvores permanece intacto.
                    </p>
                  </div>

                  <div className="space-y-3 border-t pt-3">
                    <Label>Responsáveis</Label>
                    {!detalhe.temOverrideResponsaveis && detalhe.temEscalaGerada && (
                      <p className="text-xs text-muted-foreground">
                        Nomes vindos da escala gerada (portaria, recepção e limpeza). Ao alterar e salvar,
                        o ajuste fica só neste culto — a escala original não muda.
                      </p>
                    )}
                    {detalhe.temOverrideResponsaveis && (
                      <p className="text-xs text-muted-foreground">
                        Este culto tem ajuste manual de responsáveis (não altera a escala gerada).
                      </p>
                    )}
                    {podeEditar ? (
                      <div className="space-y-3">
                        <SeletorMembro
                          label="Portaria"
                          valor={portariaAtual}
                          membros={membros}
                          onSelecionar={(m) => setResponsavelPapel("PORTARIA", m)}
                          onLimpar={() => setResponsavelPapel("PORTARIA", null)}
                        />
                        <SeletorMembro
                          label="Recepção"
                          valor={recepcaoAtual}
                          membros={membros}
                          onSelecionar={(m) => setResponsavelPapel("RECEPCAO", m)}
                          onLimpar={() => setResponsavelPapel("RECEPCAO", null)}
                        />
                        <SeletorMembro
                          label="Limpeza"
                          valor={limpezaAtual}
                          membros={membros}
                          onSelecionar={(m) => setResponsavelPapel("LIMPEZA", m)}
                          onLimpar={() => setResponsavelPapel("LIMPEZA", null)}
                        />
                      </div>
                    ) : (
                      <ul className="text-sm space-y-1">
                        {editResponsaveis.length === 0 ? (
                          <li className="text-muted-foreground">Nenhum responsável definido.</li>
                        ) : (
                          editResponsaveis.map((r, i) => (
                            <li key={`${r.papel}-${r.userId}-${i}`}>
                              <Badge variant="outline" className="mr-2 text-[10px]">
                                {r.papel === "PORTARIA" ? "Portaria" : r.papel === "RECEPCAO" ? "Recepção" : "Limpeza"}
                              </Badge>
                              {r.nome}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                {podeEditar && (
                  <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDetalhe(null)}>
                      Cancelar
                    </Button>
                    <Button className="w-full sm:w-auto" onClick={() => void salvarDetalhe()} disabled={salvandoDetalhe}>
                      {salvandoDetalhe && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutApp>
  );
}
