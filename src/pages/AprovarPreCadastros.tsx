import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  listarPreCadastrosParaAprovacao,
  obterPreCadastroPorId,
  aprovarPreCadastro,
  rejeitarPreCadastro,
  excluirPreCadastro,
  type PreCadastroCompleto,
} from "@/modules/auth/preCadastro";
import {
  MODULES,
  MODULE_LABELS,
  ROLE_DEFAULT_MODULES,
  ROLE_LABELS,
  type ModuleKey,
  type Role,
} from "@/auth/permissions";
import { usarAutenticacao } from "@/contexts/AuthContext";
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
import { Check, X, User, ChevronLeft, Loader2, Trash2 } from "lucide-react";

const PERFIS_APROVACAO: Role[] = [
  "membro",
  "lider",
  "pastor",
  "secretaria",
  "tesouraria",
  "admin",
];

export default function AprovarPreCadastros() {
  const { user } = usarAutenticacao();
  const navigate = useNavigate();
  const [lista, setLista] = useState<PreCadastroCompleto[]>([]);
  const [detalhe, setDetalhe] = useState<PreCadastroCompleto | null>(null);
  const [perfilSelecionado, setPerfilSelecionado] = useState<Role>("membro");
  const [modulesSelecionados, setModulesSelecionados] = useState<ModuleKey[]>(
    ROLE_DEFAULT_MODULES.membro,
  );
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarPreCadastrosParaAprovacao();
        setLista(dados);
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [user?.role, navigate]);

  const abrirDetalhe = async (id: string | number) => {
    const item = await obterPreCadastroPorId(id);
    setDetalhe(item ?? null);
  };

  const voltarLista = () => setDetalhe(null);

  useEffect(() => {
    if (!detalhe) return;
    const perfil = (detalhe.perfilSolicitado ?? "").toString().toLowerCase();
    if (PERFIS_APROVACAO.includes(perfil as Role)) {
      setPerfilSelecionado(perfil as Role);
      return;
    }
    setPerfilSelecionado("membro");
  }, [detalhe]);

  useEffect(() => {
    // sempre que o perfil muda, sugere módulos padrão (admin pode ajustar nos checkboxes)
    setModulesSelecionados(ROLE_DEFAULT_MODULES[perfilSelecionado] ?? ROLE_DEFAULT_MODULES.membro);
  }, [perfilSelecionado]);

  const handleAprovar = async (id: string | number, perfil: Role) => {
    setProcessando(String(id));
    try {
      await aprovarPreCadastro(id, perfil, modulesSelecionados);
      setLista((prev) => prev.filter((i) => String(i.id) !== String(id)));
      setDetalhe(null);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(null);
    }
  };

  const handleRejeitar = async (id: string | number) => {
    setProcessando(String(id));
    try {
      await rejeitarPreCadastro(id);
      setLista((prev) => prev.filter((i) => String(i.id) !== String(id)));
      setDetalhe(null);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(null);
    }
  };

  const handleExcluir = async (id: string | number) => {
    setProcessando(String(id));
    try {
      await excluirPreCadastro(id);
      setLista((prev) => prev.filter((i) => String(i.id) !== String(id)));
      setDetalhe(null);
      setConfirmarExclusao(false);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessando(null);
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  const formatarCpf = (cpf?: string) => {
    if (!cpf) return "-";
    const d = cpf.replace(/\D/g, "");
    if (d.length < 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  if (detalhe) {
    return (
      <LayoutApp>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={voltarLista}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Dados do solicitante</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm text-muted-foreground">Nome completo</span>
                <p className="font-medium">{detalhe.nomeCompleto ?? "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">CPF</span>
                <p className="font-medium">{formatarCpf(detalhe.cpf)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">E-mail</span>
                <p className="font-medium">{detalhe.email ?? "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Telefone</span>
                <p className="font-medium">{detalhe.telefone ?? "-"}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Perfil solicitado</span>
                <p className="font-medium">
                  {detalhe.perfilSolicitado
                    ? ROLE_LABELS[(detalhe.perfilSolicitado.toLowerCase() as Role) ?? "membro"] ??
                      detalhe.perfilSolicitado
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Data de nascimento</span>
                <p className="font-medium">{detalhe.dataNascimento ?? "-"}</p>
              </div>
            </div>
            {detalhe.endereco && (
              <div>
                <span className="text-sm text-muted-foreground">Endereço</span>
                <p className="font-medium">
                  {detalhe.endereco.logradouro}, {detalhe.endereco.numero} -{" "}
                  {detalhe.endereco.bairro}, {detalhe.endereco.cidade}/{detalhe.endereco.estado} -{" "}
                  {detalhe.endereco.cep}
                </p>
              </div>
            )}
            {detalhe.observacoes && (
              <div>
                <span className="text-sm text-muted-foreground">Observações</span>
                <p className="font-medium">{detalhe.observacoes}</p>
              </div>
            )}
            <div className="grid gap-4 pt-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Perfil a conceder</Label>
                  <Select
                    value={perfilSelecionado}
                    onValueChange={(value) => setPerfilSelecionado(value as Role)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERFIS_APROVACAO.map((perfil) => (
                        <SelectItem key={perfil} value={perfil}>
                          {ROLE_LABELS[perfil]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Módulos de acesso</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MODULES.map((mod) => {
                      const checked = modulesSelecionados.includes(mod);
                      return (
                        <label
                          key={mod}
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const isChecked = value === true;
                              setModulesSelecionados((prev) => {
                                const next = new Set(prev);
                                if (isChecked) next.add(mod);
                                else next.delete(mod);
                                return Array.from(next);
                              });
                            }}
                          />
                          <span>{MODULE_LABELS[mod]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
                <Button
                  className="sm:flex-1"
                  onClick={() => handleAprovar(detalhe.id!, perfilSelecionado)}
                  disabled={!!processando}
                >
                  {processando === String(detalhe.id) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejeitar(detalhe.id!)}
                  disabled={!!processando}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmarExclusao(true)}
                  disabled={!!processando}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmarExclusao} onOpenChange={setConfirmarExclusao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta solicitação de pré-cadastro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleExcluir(detalhe.id!)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pré-cadastros pendentes</h1>
        <p className="text-muted-foreground">
          Solicitações aguardando sua aprovação. Clique para ver os dados e aprovar ou rejeitar.
        </p>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum pré-cadastro pendente no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lista.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => abrirDetalhe(item.id!)}
            >
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{item.nomeCompleto ?? "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.email ?? formatarCpf(item.cpf)} • Perfil:{" "}
                      {item.perfilSolicitado ?? "-"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{item.status ?? "PENDENTE"}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </LayoutApp>
  );
}
