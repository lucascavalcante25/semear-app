import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Building2, Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import { listarMembros, type MembroApi } from "@/modules/members/api";
import {
  adicionarMembroDepartamento,
  atualizarDepartamento,
  criarDepartamento,
  excluirDepartamento,
  listarDepartamentos,
  obterDepartamento,
  removerMembroDepartamento,
  type DepartamentoDTO,
} from "@/modules/departamentos/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const vazio = (): DepartamentoDTO => ({ nome: "", descricao: "", ativo: true, codigo: "OUTRO" });

const SEXO_LIDER_POR_CODIGO: Record<
  NonNullable<DepartamentoDTO["codigo"]>,
  "MASCULINO" | "FEMININO" | null
> = {
  PORTARIA: "MASCULINO",
  RECEPCAO: "FEMININO",
  LIMPEZA: "FEMININO",
  OUTRO: null,
};

const MENSAGEM_FILTRO_LIDER: Record<NonNullable<DepartamentoDTO["codigo"]>, string | null> = {
  PORTARIA: "Portaria: apenas homens.",
  RECEPCAO: "Recepção: apenas mulheres.",
  LIMPEZA: "Limpeza: apenas mulheres.",
  OUTRO: "Outro: todos os membros ativos.",
};

const ORIENTACOES_PADRAO: Partial<Record<NonNullable<DepartamentoDTO["codigo"]>, string>> = {
  PORTARIA: `Orientações Gerais — Portaria:
- Chegue com 15 minutos de antecedência e permaneça até o final do culto.
- Caso precise trocar de data, avise com antecedência.
Agradecemos o empenho de todos! Que Deus abençoe ricamente cada vida!`,
  RECEPCAO: `Orientações Gerais — Recepção:
- Fique na recepção até o final do louvor com cordialidade e sorriso no rosto.
- Ajude os visitantes a encontrarem assentos.
- Após o louvor, leve ao pastor as anotações feitas na recepção.
Agradecemos o empenho de todos! Que Deus abençoe ricamente cada vida!`,
  LIMPEZA: `Orientações Gerais — Limpeza:
- Organize o ambiente antes e após o culto conforme orientação do líder.
- Verifique salas, banheiros e áreas comuns.
- Caso precise trocar de data, avise com antecedência.`,
};

const idMembro = (m: MembroApi) => m.idNum ?? Number(m.id);

const alterarTipoDepartamento = (
  form: DepartamentoDTO,
  membros: MembroApi[],
  codigo: DepartamentoDTO["codigo"],
): DepartamentoDTO => {
  const sexoRequerido = codigo ? SEXO_LIDER_POR_CODIGO[codigo] : null;
  let liderId = form.liderId ?? null;
  let liderNome = form.liderNome ?? null;
  if (liderId != null) {
    const lider = membros.find((m) => idMembro(m) === liderId);
    if (lider && sexoRequerido && lider.sexo !== sexoRequerido) {
      liderId = null;
      liderNome = null;
    }
  }
  const orientacoesServico =
    !form.orientacoesServico?.trim() && codigo && ORIENTACOES_PADRAO[codigo]
      ? ORIENTACOES_PADRAO[codigo]
      : form.orientacoesServico;
  return { ...form, codigo, liderId, liderNome, orientacoesServico };
};

export default function Departamentos() {
  const { user } = usarAutenticacao();
  const podeEditar = canWrite(user, "/departamentos");
  const [lista, setLista] = useState<DepartamentoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [form, setForm] = useState<DepartamentoDTO>(vazio());
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null);
  const [membros, setMembros] = useState<MembroApi[]>([]);
  const [deptoMembros, setDeptoMembros] = useState<DepartamentoDTO | null>(null);
  const [novaFuncao, setNovaFuncao] = useState("");
  const [salvandoMembro, setSalvandoMembro] = useState(false);
  const [selecionadosAdicionar, setSelecionadosAdicionar] = useState<number[]>([]);
  const [selecionadosRemover, setSelecionadosRemover] = useState<number[]>([]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [deptos, listaMembros] = await Promise.all([listarDepartamentos(), listarMembros()]);
      setLista(deptos ?? []);
      setMembros(listaMembros.filter((m) => !m.isDependente && m.activated));
    } catch {
      setLista([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return lista;
    return lista.filter(
      (i) => i.nome.toLowerCase().includes(t) || i.liderNome?.toLowerCase().includes(t),
    );
  }, [lista, busca]);

  const sexoLiderRequerido = form.codigo ? SEXO_LIDER_POR_CODIGO[form.codigo] : null;
  const mensagemFiltroLider = form.codigo ? MENSAGEM_FILTRO_LIDER[form.codigo] : null;

  const lideresElegiveis = useMemo(() => {
    const elegiveis = membros.filter((m) => {
      if (!sexoLiderRequerido) return true;
      return m.sexo === sexoLiderRequerido;
    });
    if (
      form.liderId != null &&
      !elegiveis.some((m) => idMembro(m) === form.liderId)
    ) {
      const liderAtual = membros.find((m) => idMembro(m) === form.liderId);
      if (liderAtual) return [liderAtual, ...elegiveis];
    }
    return elegiveis;
  }, [membros, sexoLiderRequerido, form.liderId]);

  const abrirNovo = () => {
    setForm(vazio());
    setEditandoId(null);
    setDialogAberto(true);
  };

  const abrirEditar = (item: DepartamentoDTO) => {
    setForm({ ...item });
    setEditandoId(item.id ?? null);
    setDialogAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do departamento.");
      return;
    }
    setSalvando(true);
    try {
      if (editandoId) {
        await atualizarDepartamento(editandoId, form);
        toast.success("Departamento atualizado.");
      } else {
        await criarDepartamento(form);
        toast.success("Departamento criado.");
      }
      setDialogAberto(false);
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExcluir = async () => {
    if (!excluirId) return;
    try {
      await excluirDepartamento(excluirId);
      toast.success("Departamento excluído.");
      void carregar();
    } catch {
      toast.error("Não foi possível excluir.");
    } finally {
      setExcluirId(null);
    }
  };

  const abrirMembros = async (item: DepartamentoDTO) => {
    if (!item.id) return;
    try {
      const detalhe = await obterDepartamento(item.id);
      setDeptoMembros(detalhe);
      setNovaFuncao("");
      setSelecionadosAdicionar([]);
      setSelecionadosRemover([]);
    } catch {
      toast.error("Não foi possível carregar membros.");
    }
  };

  const membrosDisponiveis = useMemo(() => {
    if (!deptoMembros) return [];
    const idsNoDepto = new Set((deptoMembros.membros ?? []).map((m) => m.userId));
    return membros.filter((m) => !idsNoDepto.has(idMembro(m)));
  }, [deptoMembros, membros]);

  const alternarSelecaoAdicionar = (userId: number, marcado: boolean) => {
    setSelecionadosAdicionar((prev) =>
      marcado ? [...prev, userId] : prev.filter((id) => id !== userId),
    );
  };

  const alternarSelecaoRemover = (userId: number, marcado: boolean) => {
    setSelecionadosRemover((prev) =>
      marcado ? [...prev, userId] : prev.filter((id) => id !== userId),
    );
  };

  const adicionarMembrosSelecionados = async () => {
    if (!deptoMembros?.id || selecionadosAdicionar.length === 0) return;
    setSalvandoMembro(true);
    try {
      const funcao = novaFuncao.trim() || undefined;
      for (const userId of selecionadosAdicionar) {
        await adicionarMembroDepartamento(deptoMembros.id, userId, funcao);
      }
      const detalhe = await obterDepartamento(deptoMembros.id);
      setDeptoMembros(detalhe);
      setSelecionadosAdicionar([]);
      setNovaFuncao("");
      toast.success(
        selecionadosAdicionar.length === 1
          ? "Membro adicionado."
          : `${selecionadosAdicionar.length} membros adicionados.`,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar membros.");
    } finally {
      setSalvandoMembro(false);
    }
  };

  const removerMembrosSelecionados = async () => {
    if (!deptoMembros?.id || selecionadosRemover.length === 0) return;
    setSalvandoMembro(true);
    try {
      for (const userId of selecionadosRemover) {
        await removerMembroDepartamento(deptoMembros.id, userId);
      }
      const detalhe = await obterDepartamento(deptoMembros.id);
      setDeptoMembros(detalhe);
      setSelecionadosRemover([]);
      toast.success(
        selecionadosRemover.length === 1
          ? "Membro removido."
          : `${selecionadosRemover.length} membros removidos.`,
      );
    } catch {
      toast.error("Não foi possível remover os membros selecionados.");
    } finally {
      setSalvandoMembro(false);
    }
  };

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-deep-blue text-deep-blue-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Departamentos</h1>
              <p className="text-sm text-muted-foreground">{lista.length} departamentos</p>
            </div>
          </div>
          {podeEditar && (
            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
              <DialogTrigger asChild>
                <Button onClick={abrirNovo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editandoId ? "Editar" : "Novo"} departamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={form.codigo ?? "OUTRO"}
                      onValueChange={(v) =>
                        setForm(
                          alterarTipoDepartamento(form, membros, v as DepartamentoDTO["codigo"]),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PORTARIA">Portaria</SelectItem>
                        <SelectItem value="RECEPCAO">Recepção</SelectItem>
                        <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                        <SelectItem value="OUTRO">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Orientações de serviço</Label>
                    <Textarea
                      rows={6}
                      placeholder="Instruções exibidas ao membro escalado no login..."
                      value={form.orientacoesServico ?? ""}
                      onChange={(e) => setForm({ ...form, orientacoesServico: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sugestão automática ao criar Portaria/Recepção/Limpeza. Edite conforme sua igreja.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Líder</Label>
                    <Select
                      value={form.liderId != null ? String(form.liderId) : undefined}
                      onValueChange={(v) => {
                        if (v === "__nenhum__") {
                          setForm({ ...form, liderId: null, liderNome: null });
                          return;
                        }
                        const membro = membros.find((m) => String(idMembro(m)) === v);
                        setForm({
                          ...form,
                          liderId: Number(v),
                          liderNome: membro?.name ?? null,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o líder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__nenhum__">Nenhum</SelectItem>
                        {lideresElegiveis.map((m) => (
                          <SelectItem key={m.id} value={String(idMembro(m))}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lideresElegiveis.length === 0 && sexoLiderRequerido && (
                      <p className="text-xs text-amber-600">
                        Nenhum membro com sexo cadastrado para este tipo de departamento.
                      </p>
                    )}
                    {mensagemFiltroLider && (
                      <p className="text-xs text-muted-foreground">{mensagemFiltroLider}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      rows={3}
                      value={form.descricao ?? ""}
                      onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label>Ativo</Label>
                    <Switch
                      checked={form.ativo ?? true}
                      onCheckedChange={(v) => setForm({ ...form, ativo: v })}
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
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar departamento..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhum departamento cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {filtrados.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={item.ativo ? "default" : "secondary"}>
                        {item.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{item.nome}</h3>
                    {item.liderNome && (
                      <p className="text-sm text-muted-foreground">Líder: {item.liderNome}</p>
                    )}
                    {item.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
                    )}
                  </div>
                  {podeEditar && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => void abrirMembros(item)}>
                        <Users className="h-3.5 w-3.5" />
                        Membros
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => abrirEditar(item)}>
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setExcluirId(item.id ?? null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={excluirId != null} onOpenChange={() => setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir departamento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmarExcluir()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={deptoMembros != null} onOpenChange={() => setDeptoMembros(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Membros — {deptoMembros?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2 rounded-lg border p-3">
              <Label className="text-sm font-medium">Adicionar voluntários</Label>
              <p className="text-xs text-muted-foreground">
                Marque vários membros e adicione de uma vez. A função abaixo vale para todos neste lote.
              </p>
              <Input
                placeholder="Função (opcional)"
                value={novaFuncao}
                onChange={(e) => setNovaFuncao(e.target.value)}
              />
              {membrosDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Todos os membros já estão neste departamento.</p>
              ) : (
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                  {membrosDisponiveis.map((m) => {
                    const userId = idMembro(m);
                    return (
                      <li key={m.id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/50">
                          <Checkbox
                            checked={selecionadosAdicionar.includes(userId)}
                            onCheckedChange={(v) => alternarSelecaoAdicionar(userId, v === true)}
                          />
                          <span>{m.name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Button
                className="w-full"
                onClick={() => void adicionarMembrosSelecionados()}
                disabled={selecionadosAdicionar.length === 0 || salvandoMembro}
              >
                {salvandoMembro ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar {selecionadosAdicionar.length > 0 ? `(${selecionadosAdicionar.length})` : "selecionados"}
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">No departamento</Label>
                {(deptoMembros?.membros?.length ?? 0) > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/40"
                    disabled={selecionadosRemover.length === 0 || salvandoMembro}
                    onClick={() => void removerMembrosSelecionados()}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Remover {selecionadosRemover.length > 0 ? `(${selecionadosRemover.length})` : ""}
                  </Button>
                )}
              </div>
              {(deptoMembros?.membros?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro no departamento.</p>
              ) : (
                <ul className="space-y-1">
                  {deptoMembros?.membros?.map((m) => (
                    <li
                      key={m.id ?? m.userId}
                      className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                    >
                      <Checkbox
                        checked={selecionadosRemover.includes(m.userId)}
                        onCheckedChange={(v) => alternarSelecaoRemover(m.userId, v === true)}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{m.userNome ?? `Membro #${m.userId}`}</span>
                        {m.funcao && <p className="text-xs text-muted-foreground">{m.funcao}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LayoutApp>
  );
}
