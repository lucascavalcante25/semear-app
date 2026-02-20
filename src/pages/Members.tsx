import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrlByUserId } from "@/hooks/use-avatar-url";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Search,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listarMembros,
  atualizarMembro,
  excluirMembro,
  roleParaAuthority,
  type MembroApi,
  type AtualizarMembroPayload,
} from "@/modules/members/api";
import {
  MODULES,
  MODULE_LABELS,
  ROLE_DEFAULT_MODULES,
  ROLE_LABELS,
  type ModuleKey,
  type Role,
} from "@/auth/permissions";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PERFIS_DISPONIVEIS: Role[] = [
  "membro",
  "lider",
  "pastor",
  "secretaria",
  "tesouraria",
  "admin",
  "visitante",
];

function obterIniciais(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface CartaoMembroProps {
  membro: MembroApi;
  aoEditar: (membro: MembroApi) => void;
  aoExcluir: (membro: MembroApi) => void;
}

function CartaoMembro({ membro, aoEditar, aoExcluir }: CartaoMembroProps) {
  const avatarUrl = useAvatarUrlByUserId(membro.idNum ?? membro.id);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl ?? undefined} alt={membro.name} />
            <AvatarFallback className="bg-olive-light text-olive-dark font-medium">
              {obterIniciais(membro.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold truncate">{membro.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {ROLE_LABELS[membro.role]}
                  </Badge>
                  {!membro.activated && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => aoEditar(membro)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => aoExcluir(membro)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-foreground/80">Login:</span>
                {membro.login}
              </span>
              {membro.email && (
                <a
                  href={`mailto:${membro.email}`}
                  className="flex items-center gap-1.5 hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {membro.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FormMembroProps {
  membroEdicao?: MembroApi | null;
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onSucesso: () => void;
}

function FormMembro({
  membroEdicao,
  aberto,
  onAbertoChange,
  onSucesso,
}: FormMembroProps) {
  const [login, setLogin] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [activated, setActivated] = useState(true);
  const [perfil, setPerfil] = useState<Role>("membro");
  const [modulesSelecionados, setModulesSelecionados] = useState<ModuleKey[]>([]);
  const [salvando, setSalvando] = useState(false);

  const resetarForm = useCallback(() => {
    if (membroEdicao) {
      const defaultForRole = ROLE_DEFAULT_MODULES[membroEdicao.role] ?? ROLE_DEFAULT_MODULES.membro;
      setLogin(membroEdicao.login);
      setFirstName(membroEdicao.firstName);
      setLastName(membroEdicao.lastName);
      setEmail(membroEdicao.email);
      setActivated(membroEdicao.activated);
      setPerfil(membroEdicao.role);
      setModulesSelecionados(
        membroEdicao.modules?.length ? [...membroEdicao.modules] : defaultForRole
      );
    } else {
      setLogin("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setActivated(true);
      setPerfil("membro");
      setModulesSelecionados(ROLE_DEFAULT_MODULES.membro);
    }
  }, [membroEdicao]);

  useEffect(() => {
    if (aberto) {
      resetarForm();
    }
  }, [aberto, resetarForm]);

  const toggleModulo = (mod: ModuleKey) => {
    setModulesSelecionados((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSalvar = async () => {
    const loginTrim = login.trim().toLowerCase();
    const firstNameTrim = firstName.trim();
    const lastNameTrim = lastName.trim();
    const emailTrim = email.trim();

    if (!loginTrim) return;
    if (!firstNameTrim || !lastNameTrim) {
      toast.error("Nome e sobrenome são obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      if (membroEdicao?.idNum) {
        const payload: AtualizarMembroPayload = {
          id: membroEdicao.idNum,
          login: loginTrim,
          firstName: firstNameTrim,
          lastName: lastNameTrim,
          email: emailTrim || undefined,
          activated,
          authorities: [roleParaAuthority(perfil)],
          modules: modulesSelecionados,
        };
        await atualizarMembro(payload);
        toast.success("Membro atualizado com sucesso.");
      }
      onAbertoChange(false);
      onSucesso();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar membro.");
    } finally {
      setSalvando(false);
    }
  };

  const titulo = "Editar Membro";
  const descricao = "Altere os dados do membro e os módulos de acesso.";

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                placeholder="Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome *</Label>
              <Input
                id="lastName"
                placeholder="Sobrenome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login">Login (usuário para acesso) *</Label>
            <Input
              id="login"
              placeholder="ex: joao.silva ou CPF"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              disabled
            />
            <p className="text-xs text-muted-foreground">O login não pode ser alterado.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Perfil</Label>
            <Select value={perfil} onValueChange={(v) => setPerfil(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERFIS_DISPONIVEIS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {ROLE_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="activated">Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Usuários inativos não conseguem acessar o sistema.
              </p>
            </div>
            <Switch id="activated" checked={activated} onCheckedChange={setActivated} />
          </div>
          <div className="space-y-3">
            <Label>Módulos de acesso</Label>
            <p className="text-sm text-muted-foreground">
              Selecione exatamente quais módulos este membro poderá acessar.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-md border p-3">
              {MODULES.map((mod) => (
                <div key={mod} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mod-${mod}`}
                    checked={modulesSelecionados.includes(mod)}
                    onCheckedChange={() => toggleModulo(mod)}
                  />
                  <label
                    htmlFor={`mod-${mod}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {MODULE_LABELS[mod]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onAbertoChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Membros() {
  const { user } = usarAutenticacao();
  const [buscaTexto, setBuscaTexto] = useState("");
  const [membros, setMembros] = useState<MembroApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [membroEmEdicao, setMembroEmEdicao] = useState<MembroApi | null>(null);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [membroParaExcluir, setMembroParaExcluir] = useState<MembroApi | null>(null);

  const carregarMembros = useCallback(async () => {
    if (user?.role !== "admin") return;
    setCarregando(true);
    try {
      const lista = await listarMembros();
      setMembros(lista);
    } catch {
      setMembros([]);
      toast.error("Erro ao carregar membros.");
    } finally {
      setCarregando(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void carregarMembros();
  }, [carregarMembros]);

  const membrosFiltrados = membros.filter(
    (m) =>
      m.name.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      m.login.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (m.email?.toLowerCase().includes(buscaTexto.toLowerCase()) ?? false) ||
      ROLE_LABELS[m.role].toLowerCase().includes(buscaTexto.toLowerCase())
  );

  const editarMembro = (membro: MembroApi) => {
    setMembroEmEdicao(membro);
    setDialogEditarAberto(true);
  };

  const abrirExcluir = (membro: MembroApi) => {
    setMembroParaExcluir(membro);
  };

  const confirmarExcluir = async () => {
    if (!membroParaExcluir) return;
    try {
      await excluirMembro(membroParaExcluir.login);
      toast.success("Membro excluído com sucesso.");
      setMembroParaExcluir(null);
      void carregarMembros();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir membro.");
    }
  };

  if (user?.role !== "admin") {
    return (
      <LayoutApp>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar membros.
          </p>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-olive-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Membros</h1>
              <p className="text-sm text-muted-foreground">
                {carregando ? "Carregando..." : `${membros.length} membros cadastrados`}
              </p>
            </div>
          </div>

          <Button asChild variant="outline">
            <Link to="/aprovar-pre-cadastros">Aprovar pré-cadastros</Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, login, e-mail ou perfil..."
            className="pl-10"
            value={buscaTexto}
            onChange={(e) => setBuscaTexto(e.target.value)}
          />
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {membrosFiltrados.map((membro) => (
              <CartaoMembro
                key={membro.id}
                membro={membro}
                aoEditar={editarMembro}
                aoExcluir={abrirExcluir}
              />
            ))}

            {membrosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {membros.length === 0
                    ? "Nenhum membro cadastrado. Clique em Novo para adicionar."
                    : "Nenhum membro encontrado na busca."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <FormMembro
        membroEdicao={membroEmEdicao}
        aberto={dialogEditarAberto}
        onAbertoChange={(aberto) => {
          setDialogEditarAberto(aberto);
          if (!aberto) setMembroEmEdicao(null);
        }}
        onSucesso={carregarMembros}
      />

      <AlertDialog open={!!membroParaExcluir} onOpenChange={() => setMembroParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{membroParaExcluir?.name}</strong>? Esta ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExcluir}
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
