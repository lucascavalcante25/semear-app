import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { CalendarDays, CheckCircle2, Loader2, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import {
  listarDepartamentos,
  obterDepartamento,
  type DepartamentoDTO,
  type DepartamentoMembroDTO,
} from "@/modules/departamentos/api";
import {
  atualizarEscala,
  confirmarItemEscala,
  criarEscala,
  excluirEscala,
  listarEscalas,
  type EscalaDTO,
  type EscalaItemDTO,
} from "@/modules/escalas/api";
import {
  listarGeracoesEscalas,
  type EscalaGeracaoDTO,
} from "@/modules/escalas/automacao-api";
import {
  agruparEscalasPorCulto,
  formatarDataEscala,
  nomesCoincidem,
  usuarioEstaNoGrupo,
} from "@/modules/escalas/escala-agrupamento";
import { EscalasAutomacaoPanel } from "@/components/escalas/EscalasAutomacaoPanel";
import { EscalasLimpezaPanel } from "@/components/escalas/EscalasLimpezaPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ABA_ESCALAS,
  montarSubtituloEscalas,
  type AbaEscalas,
} from "@/modules/escalas/labels";

const vazio = (): EscalaDTO => ({
  titulo: "",
  data: new Date().toISOString().slice(0, 10),
  departamentoId: null,
  itens: [],
});

const idItem = (item: EscalaItemDTO) => item.userId ?? item.membroId;

export default function Escalas() {
  const { user } = usarAutenticacao();
  const podeEditar = canWrite(user, "/escalas");
  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get("aba");
  const aba: AbaEscalas =
    podeEditar && (abaParam === "automacao" || abaParam === "limpeza") ? abaParam : "lista";
  const [lista, setLista] = useState<EscalaDTO[]>([]);
  const [infoCiclo, setInfoCiclo] = useState<EscalaGeracaoDTO | null>(null);
  const [departamentos, setDepartamentos] = useState<DepartamentoDTO[]>([]);
  const [membrosDepartamento, setMembrosDepartamento] = useState<DepartamentoMembroDTO[]>([]);
  const [carregandoMembrosDept, setCarregandoMembrosDept] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState<EscalaDTO>(vazio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null);
  const [confirmandoItem, setConfirmandoItem] = useState<string | null>(null);
  const escalaDestaqueId = searchParams.get("escalaId");
  const itemDestaqueId = searchParams.get("itemId");
  const chaveDestaque =
    escalaDestaqueId && itemDestaqueId ? `${escalaDestaqueId}-${itemDestaqueId}` : null;

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [escalas, geracoes] = await Promise.all([
        listarEscalas(),
        podeEditar ? listarGeracoesEscalas().catch(() => [] as EscalaGeracaoDTO[]) : Promise.resolve([] as EscalaGeracaoDTO[]),
      ]);
      const listaEscalas = escalas ?? [];
      setLista(listaEscalas);
      const geracaoId = listaEscalas.find((e) => e.geracaoId != null)?.geracaoId;
      if (geracaoId != null) {
        setInfoCiclo(geracoes?.find((g) => g.id === geracaoId) ?? null);
      } else {
        const rascunho = geracoes?.find((g) => g.status === "RASCUNHO");
        const publicada = geracoes?.find((g) => g.status === "PUBLICADA");
        setInfoCiclo(rascunho ?? publicada ?? null);
      }
    } catch {
      setLista([]);
      setInfoCiclo(null);
    } finally {
      setCarregando(false);
    }
  }, [podeEditar]);

  useEffect(() => {
    if (!chaveDestaque || carregando || lista.length === 0) return;
    const el = document.getElementById(`escala-item-${chaveDestaque}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [chaveDestaque, carregando, lista.length]);

  const carregarDepartamentos = useCallback(async () => {
    try {
      const deptos = await listarDepartamentos();
      setDepartamentos((deptos ?? []).filter((d) => d.ativo !== false));
    } catch {
      setDepartamentos([]);
    }
  }, []);

  const carregarMembrosDepartamento = useCallback(async (departamentoId: number) => {
    setCarregandoMembrosDept(true);
    try {
      const emCache = departamentos.find((d) => d.id === departamentoId);
      if (emCache?.membros && emCache.membros.length > 0) {
        setMembrosDepartamento(emCache.membros);
        return;
      }
      const detalhe = await obterDepartamento(departamentoId);
      setMembrosDepartamento(detalhe?.membros ?? []);
    } catch {
      setMembrosDepartamento([]);
    } finally {
      setCarregandoMembrosDept(false);
    }
  }, [departamentos]);

  useEffect(() => {
    void carregar();
  }, [carregar, aba]);

  useEffect(() => {
    if (!dialogAberto) return;
    void carregarDepartamentos();
  }, [dialogAberto, carregarDepartamentos]);

  useEffect(() => {
    if (!dialogAberto || !form.departamentoId) {
      setMembrosDepartamento([]);
      return;
    }
    void carregarMembrosDepartamento(form.departamentoId);
  }, [dialogAberto, form.departamentoId, carregarMembrosDepartamento]);

  const grupos = useMemo(() => {
    const agrupados = agruparEscalasPorCulto(lista);
    const t = busca.trim().toLowerCase();
    if (!t) return agrupados;
    return agrupados.filter(
      (g) =>
        g.titulo.toLowerCase().includes(t) ||
        g.funcoes.some(
          (f) => f.nome.toLowerCase().includes(t) || f.departamento.toLowerCase().includes(t),
        ),
    );
  }, [lista, busca]);

  const legadoSemCiclo = lista.length > 0 && lista.every((e) => e.geracaoId == null);

  const subtitulo = useMemo(
    () =>
      montarSubtituloEscalas({
        aba,
        infoCiclo,
        diasComEscala: grupos.length,
        totalEscalas: lista.length,
        legadoSemCiclo,
      }),
    [aba, infoCiclo, grupos.length, lista.length, legadoSemCiclo],
  );

  const idsEscalados = useMemo(
    () => new Set((form.itens ?? []).map((i) => idItem(i)).filter((id): id is number => id != null)),
    [form.itens],
  );

  const abrirEditar = (item: EscalaDTO) => {
    if (item.geracaoId != null) return;
    setForm({ ...item, itens: item.itens ?? [] });
    setEditandoId(item.id ?? null);
    setDialogAberto(true);
  };

  const alterarDepartamento = (valor: string) => {
    if (valor === "nenhum") {
      setForm((prev) => ({
        ...prev,
        departamentoId: null,
        departamentoNome: null,
        itens: [],
      }));
      return;
    }
    const depId = Number(valor);
    const dept = departamentos.find((d) => d.id === depId);
    setForm((prev) => ({
      ...prev,
      departamentoId: depId,
      departamentoNome: dept?.nome ?? null,
      itens: prev.departamentoId === depId ? prev.itens : [],
    }));
  };

  const alternarMembro = (membro: DepartamentoMembroDTO, marcado: boolean) => {
    if (marcado) {
      setForm((prev) => ({
        ...prev,
        itens: [
          ...(prev.itens ?? []),
          {
            userId: membro.userId,
            membroId: membro.userId,
            membroNome: membro.userNome,
            userNome: membro.userNome,
            funcao: membro.funcao ?? undefined,
          },
        ],
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      itens: (prev.itens ?? []).filter((i) => idItem(i) !== membro.userId),
    }));
  };

  const atualizarFuncaoItem = (userId: number, funcao: string) => {
    setForm((prev) => ({
      ...prev,
      itens: (prev.itens ?? []).map((i) => (idItem(i) === userId ? { ...i, funcao } : i)),
    }));
  };

  const salvar = async () => {
    if (!form.titulo.trim()) {
      toast.error("Informe o título da escala.");
      return;
    }
    if (!form.data?.trim()) {
      toast.error("Informe a data da escala.");
      return;
    }
    if (!form.departamentoId) {
      toast.error("Selecione um departamento.");
      return;
    }
    if ((form.itens?.length ?? 0) === 0) {
      toast.error("Selecione ao menos uma pessoa do departamento.");
      return;
    }
    setSalvando(true);
    try {
      if (editandoId) {
        const atualizada = await atualizarEscala(editandoId, form);
        setLista((prev) => prev.map((e) => (e.id === editandoId ? atualizada : e)));
        toast.success("Escala atualizada.");
      } else {
        const criada = await criarEscala(form);
        setLista((prev) => [criada, ...prev]);
        toast.success("Escala criada.");
      }
      setDialogAberto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!excluirId) return;
    try {
      await excluirEscala(excluirId);
      setLista((prev) => prev.filter((e) => e.id !== excluirId));
      toast.success("Escala excluída.");
    } catch {
      toast.error("Não foi possível excluir.");
    } finally {
      setExcluirId(null);
    }
  };

  const confirmarPresenca = async (escalaId: number, itemId: number) => {
    const chave = `${escalaId}-${itemId}`;
    setConfirmandoItem(chave);
    try {
      await confirmarItemEscala(escalaId, itemId);
      setLista((prev) =>
        prev.map((e) =>
          e.id !== escalaId
            ? e
            : {
                ...e,
                itens: (e.itens ?? []).map((i) =>
                  i.id === itemId ? { ...i, confirmado: true } : i,
                ),
              },
        ),
      );
      toast.success("Presença confirmada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao confirmar.");
    } finally {
      setConfirmandoItem(null);
    }
  };

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-white">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Escalas</h1>
              <p className="text-sm text-muted-foreground">{subtitulo}</p>
            </div>
          </div>
        </div>

        <Tabs
          value={aba}
          onValueChange={(v) => setSearchParams(v === "lista" ? {} : { aba: v })}
        >
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value={ABA_ESCALAS.lista.valor}>{ABA_ESCALAS.lista.rotulo}</TabsTrigger>
            {podeEditar && (
              <TabsTrigger value={ABA_ESCALAS.automacao.valor}>{ABA_ESCALAS.automacao.rotulo}</TabsTrigger>
            )}
            {podeEditar && (
              <TabsTrigger value={ABA_ESCALAS.limpeza.valor}>{ABA_ESCALAS.limpeza.rotulo}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="lista" className="space-y-4 mt-4">
            {podeEditar && (
              <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar escala</DialogTitle>
                  </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data *</Label>
                    <DatePicker
                      value={form.data ?? ""}
                      onChange={(v) => setForm({ ...form, data: v || undefined })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento *</Label>
                    <Select
                      value={form.departamentoId != null ? String(form.departamentoId) : "nenhum"}
                      onValueChange={alterarDepartamento}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Selecione...</SelectItem>
                        {departamentos.map((dept) => (
                          <SelectItem key={dept.id} value={String(dept.id)}>
                            {dept.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {departamentos.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Cadastre departamentos e membros em Ministério → Departamentos.
                      </p>
                    )}
                  </div>

                  {form.departamentoId != null && (
                    <div className="space-y-2 rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4" />
                        Pessoas do departamento
                      </div>
                      {carregandoMembrosDept ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : membrosDepartamento.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum membro neste departamento. Adicione pessoas em Departamentos.
                        </p>
                      ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                          {membrosDepartamento.map((membro) => {
                            const marcado = idsEscalados.has(membro.userId);
                            return (
                              <li
                                key={membro.userId}
                                className="flex items-start gap-3 rounded-md border border-transparent px-1 py-1 hover:bg-muted/40"
                              >
                                <Checkbox
                                  id={`membro-${membro.userId}`}
                                  checked={marcado}
                                  onCheckedChange={(checked) =>
                                    alternarMembro(membro, checked === true)
                                  }
                                />
                                <label
                                  htmlFor={`membro-${membro.userId}`}
                                  className="flex-1 cursor-pointer text-sm leading-tight"
                                >
                                  <span className="font-medium">{membro.userNome ?? "Membro"}</span>
                                  {membro.funcao && (
                                    <span className="block text-xs text-muted-foreground">
                                      {membro.funcao}
                                    </span>
                                  )}
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}

                  {(form.itens?.length ?? 0) > 0 && (
                    <div className="space-y-2 rounded-lg border p-3">
                      <Label>Função na escala</Label>
                      <ul className="space-y-2">
                        {form.itens!.map((item) => {
                          const userId = idItem(item);
                          if (userId == null) return null;
                          return (
                            <li key={userId} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                              <span className="text-sm font-medium shrink-0 sm:w-36 truncate">
                                {item.membroNome ?? item.userNome}
                              </span>
                              <Input
                                placeholder="Função (ex.: Portaria)"
                                value={item.funcao ?? ""}
                                onChange={(e) => atualizarFuncaoItem(userId, e.target.value)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      rows={3}
                      value={form.observacoes ?? ""}
                      onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => void salvar()} disabled={salvando}>
                    {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}

            {infoCiclo?.status === "RASCUNHO" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Rascunho do ciclo vigente — publique em Portaria e recepção para liberar aos voluntários.
              </div>
            )}

            <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar escala..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
            </div>

            {carregando ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : grupos.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {infoCiclo
                  ? "Nenhuma escala neste período. Gere portaria e recepção na aba correspondente."
                  : "Nenhuma escala cadastrada."}
              </p>
            ) : (
              <div className="flex w-full flex-col gap-3">
                {grupos.map((grupo) => {
                  const meuDia = usuarioEstaNoGrupo(grupo, user?.name);
                  return (
                    <div
                      key={grupo.chave}
                      className={cn(
                        "w-full rounded-lg border p-4 text-sm shadow-sm transition-colors",
                        meuDia
                          ? "border-primary/60 bg-primary/10 ring-1 ring-primary/25"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight">{grupo.titulo}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatarDataEscala(grupo.dataEvento)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {meuDia && (
                            <Badge variant="default" className="text-[10px]">
                              Você
                            </Badge>
                          )}
                          {legadoSemCiclo && grupo.escalas.length === 1 && podeEditar && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => abrirEditar(grupo.escalas[0])}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setExcluirId(grupo.escalas[0].id ?? null)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                        {grupo.funcoes.map((item, idx) => {
                          const souEu = nomesCoincidem(item.nome, user?.name);
                          return (
                            <div
                              key={`${grupo.chave}-${item.departamento}-${idx}`}
                              id={
                                item.escalaId && item.itemId
                                  ? `escala-item-${item.escalaId}-${item.itemId}`
                                  : undefined
                              }
                              className={cn(
                                "rounded-md px-3 py-2",
                                souEu ? "border border-primary/40 bg-primary/20" : "bg-muted/50",
                                item.escalaId &&
                                  item.itemId &&
                                  chaveDestaque === `${item.escalaId}-${item.itemId}` &&
                                  "ring-2 ring-primary/60",
                              )}
                            >
                              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {item.departamento}
                              </p>
                              <div className="mt-0.5 flex items-center justify-between gap-2">
                                <p className={cn("text-sm font-medium", souEu && "text-primary")}>
                                  {item.nome}
                                </p>
                                {item.confirmado ? (
                                  <Badge variant="outline" className="gap-1 shrink-0 text-[10px]">
                                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    Confirmado
                                  </Badge>
                                ) : item.escalaId && item.itemId ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 shrink-0 text-xs"
                                    disabled={confirmandoItem === `${item.escalaId}-${item.itemId}`}
                                    onClick={() =>
                                      void confirmarPresenca(item.escalaId!, item.itemId!)
                                    }
                                  >
                                    {confirmandoItem === `${item.escalaId}-${item.itemId}` ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      "Confirmar"
                                    )}
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {podeEditar && (
            <TabsContent value="automacao" className="mt-4">
              <EscalasAutomacaoPanel />
            </TabsContent>
          )}

          {podeEditar && (
            <TabsContent value="limpeza" className="mt-4">
              <EscalasLimpezaPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <AlertDialog open={excluirId != null} onOpenChange={() => setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir escala?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarExcluir()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutApp>
  );
}
