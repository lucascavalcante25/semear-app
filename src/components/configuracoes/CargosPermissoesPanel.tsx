import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MODULES, MODULE_LABELS, type ModuleKey } from "@/auth/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  atualizarCargo,
  criarCargo,
  excluirCargo,
  listarCargos,
  type IgrejaCargo,
  type NivelAcessoModulo,
} from "@/modules/cargos/api";

type NivelOpcao = "NONE" | NivelAcessoModulo;

const nivelLabel: Record<NivelOpcao, string> = {
  NONE: "Sem acesso",
  READ: "Visualizar",
  WRITE: "Editar",
};

function cargoVazio(): IgrejaCargo {
  return { nome: "", descricao: "", modulos: [] };
}

function nivelDoModulo(cargo: IgrejaCargo, modulo: ModuleKey): NivelOpcao {
  const item = cargo.modulos.find((m) => m.modulo === modulo);
  return item?.nivel ?? "NONE";
}

function definirNivelModulo(cargo: IgrejaCargo, modulo: ModuleKey, nivel: NivelOpcao): IgrejaCargo {
  const restantes = cargo.modulos.filter((m) => m.modulo !== modulo);
  if (nivel === "NONE") {
    return { ...cargo, modulos: restantes };
  }
  return { ...cargo, modulos: [...restantes, { modulo, nivel }] };
}

function resumoPermissoes(cargo: IgrejaCargo): string {
  const write = cargo.modulos.filter((m) => m.nivel === "WRITE").length;
  const read = cargo.modulos.filter((m) => m.nivel === "READ").length;
  if (write === MODULES.length) return "Acesso total";
  if (write === 0 && read === 0) return "Sem módulos";
  const partes: string[] = [];
  if (write > 0) partes.push(`${write} editar`);
  if (read > 0) partes.push(`${read} visualizar`);
  return partes.join(" · ");
}

interface Props {
  somenteLeitura?: boolean;
}

export function CargosPermissoesPanel({ somenteLeitura = false }: Props) {
  const [cargos, setCargos] = useState<IgrejaCargo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [cargoEdicao, setCargoEdicao] = useState<IgrejaCargo | null>(null);
  const [form, setForm] = useState<IgrejaCargo>(cargoVazio());
  const [salvando, setSalvando] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarCargos();
      setCargos(lista);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar cargos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setCargoEdicao(null);
    setForm(cargoVazio());
    setDialogAberto(true);
  };

  const abrirEditar = (cargo: IgrejaCargo) => {
    setCargoEdicao(cargo);
    setForm({ ...cargo, modulos: [...cargo.modulos] });
    setDialogAberto(true);
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do cargo.");
      return;
    }
    setSalvando(true);
    try {
      if (cargoEdicao?.id) {
        await atualizarCargo(cargoEdicao.id, form);
        toast.success("Cargo atualizado.");
      } else {
        await criarCargo(form);
        toast.success("Cargo criado.");
      }
      setDialogAberto(false);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar cargo.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async () => {
    if (excluirId == null) return;
    try {
      await excluirCargo(excluirId);
      toast.success("Cargo excluído.");
      setExcluirId(null);
      await carregar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir cargo.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cargos e permissões
          </h3>
          <p className="text-sm text-muted-foreground">
            Defina o que cada cargo pode ver ou editar. Um membro pode ter vários cargos — editar prevalece sobre
            visualizar.
          </p>
        </div>
        {!somenteLeitura && (
          <Button onClick={abrirNovo} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Novo cargo
          </Button>
        )}
      </div>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3">
          {cargos.map((cargo) => (
            <Card key={cargo.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                      {cargo.nome}
                      {cargo.sistema && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          Padrão
                        </Badge>
                      )}
                    </CardTitle>
                    {cargo.descricao && (
                      <CardDescription className="mt-1">{cargo.descricao}</CardDescription>
                    )}
                  </div>
                  {!somenteLeitura && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => abrirEditar(cargo)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!cargo.sistema && cargo.id != null && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExcluirId(cargo.id!)}
                          title="Excluir"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{resumoPermissoes(cargo)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>{cargoEdicao ? "Editar cargo" : "Novo cargo"}</DialogTitle>
            <DialogDescription>
              Escolha o nível de acesso para cada tela. &quot;Editar&quot; inclui visualização.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cargo-nome">Nome do cargo *</Label>
              <Input
                id="cargo-nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Coordenador de louvor"
                disabled={cargoEdicao?.sistema === true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-desc">Descrição</Label>
              <Textarea
                id="cargo-desc"
                value={form.descricao ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissões por módulo</Label>
              <div className="rounded-md border divide-y max-h-64 overflow-y-auto">
                {MODULES.map((mod) => (
                  <div key={mod} className="flex items-center justify-between gap-2 px-3 py-2">
                    <span className="text-sm">{MODULE_LABELS[mod]}</span>
                    <Select
                      value={nivelDoModulo(form, mod)}
                      onValueChange={(v) =>
                        setForm((f) => definirNivelModulo(f, mod, v as NivelOpcao))
                      }
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(nivelLabel) as NivelOpcao[]).map((n) => (
                          <SelectItem key={n} value={n}>
                            {nivelLabel[n]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={excluirId != null} onOpenChange={(aberto) => !aberto && setExcluirId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cargo?</AlertDialogTitle>
            <AlertDialogDescription>
              Membros com este cargo perderão as permissões associadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
