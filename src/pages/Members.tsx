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
  Baby,
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
  cadastrarDependente,
  roleParaAuthority,
  type MembroApi,
  type AtualizarMembroPayload,
} from "@/modules/members/api";
import {
  MODULE_LABELS,
  modulesToKeys,
  permissionsToModules,
  ROLE_ALLOWED_MODULES,
  ROLE_DEFAULT_MODULES,
  ROLE_LABELS,
  type ModuleKey,
  type Role,
} from "@/auth/permissions";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, canWrite } from "@/auth/permissions";
import { toast } from "sonner";
import { aplicarMascaraData, dataMascaraParaApi, validarData } from "@/lib/mascara-telefone";

const PERFIS_PODE_CADASTRAR_DEPENDENTE: Role[] = ["admin", "pastor", "copastor", "lider"];

const PERFIS_DISPONIVEIS: Role[] = [
  "membro",
  "lider",
  "pastor",
  "copastor",
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
  podeEditar: boolean;
  isDependente?: boolean;
}

function CartaoMembro({ membro, aoEditar, aoExcluir, podeEditar, isDependente }: CartaoMembroProps) {
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
                  {isDependente ? (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Criança/Jovem
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {ROLE_LABELS[membro.role]}
                    </Badge>
                  )}
                  {!membro.activated && !isDependente && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </div>
              </div>

              {podeEditar && (
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
              )}
            </div>

            <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
              {!isDependente && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground/80">Login:</span>
                  {membro.login}
                </span>
              )}
              {isDependente && "paiNome" in membro && membro.paiNome && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground/80">Pai:</span>
                  {membro.paiNome}
                </span>
              )}
              {isDependente && "maeNome" in membro && membro.maeNome && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground/80">Mãe:</span>
                  {membro.maeNome}
                </span>
              )}
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
  const [birthDate, setBirthDate] = useState("");
  const [sexo, setSexo] = useState<"MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO">("NAO_INFORMADO");
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
      const bd = membroEdicao.birthDate;
      setBirthDate(bd ? (() => { const [y, m, d] = bd.split("-"); return `${d}/${m}/${y}`; })() : "");
      setSexo((membroEdicao.sexo as "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO") ?? "NAO_INFORMADO");
      setActivated(membroEdicao.activated);
      setPerfil(membroEdicao.role);
      setModulesSelecionados(
        membroEdicao.modules?.length
          ? modulesToKeys(membroEdicao.modules as string[])
          : defaultForRole
      );
    } else {
      setLogin("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setBirthDate("");
      setSexo("NAO_INFORMADO");
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

  useEffect(() => {
    const allowed = ROLE_ALLOWED_MODULES[perfil] ?? [];
    setModulesSelecionados((prev) => prev.filter((m) => allowed.includes(m)));
  }, [perfil]);

  const toggleModulo = (mod: ModuleKey) => {
    setModulesSelecionados((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const allowedForPerfil = ROLE_ALLOWED_MODULES[perfil] ?? [];

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
        const access = perfil === "membro" ? "READ" as const : "WRITE" as const;
        const modulesParaApi = permissionsToModules(
          modulesSelecionados.map((m) => ({ module: m, access })),
        );
        const birthDateApi = birthDate.trim() ? (dataMascaraParaApi(birthDate.trim()) || undefined) : undefined;
        const payload: AtualizarMembroPayload = {
          id: membroEdicao.idNum,
          login: loginTrim,
          firstName: firstNameTrim,
          lastName: lastNameTrim,
          email: emailTrim || undefined,
          birthDate: birthDateApi,
          sexo: sexo !== "NAO_INFORMADO" ? sexo : undefined,
          activated,
          authorities: [roleParaAuthority(perfil)],
          modules: modulesParaApi,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input
                id="birthDate"
                autoComplete="bday"
                placeholder="dd/mm/aaaa"
                value={birthDate}
                onChange={(e) => setBirthDate(aplicarMascaraData(e.target.value))}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={sexo} onValueChange={(v) => setSexo(v as typeof sexo)}>
                <SelectTrigger id="sexo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                  <SelectItem value="OUTRO">Outro</SelectItem>
                  <SelectItem value="NAO_INFORMADO">Não informado</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              {allowedForPerfil.map((mod) => (
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

interface FormDependenteProps {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onSucesso: () => void;
  membrosParaPaiMae: MembroApi[];
}

function FormDependente({
  aberto,
  onAbertoChange,
  onSucesso,
  membrosParaPaiMae,
}: FormDependenteProps) {
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [paiId, setPaiId] = useState<string>("");
  const [maeId, setMaeId] = useState<string>("");
  const [salvando, setSalvando] = useState(false);

  const resetarForm = useCallback(() => {
    setNome("");
    setDataNascimento("");
    setPaiId("");
    setMaeId("");
  }, []);

  useEffect(() => {
    if (aberto) {
      resetarForm();
    }
  }, [aberto, resetarForm]);

  const handleSalvar = async () => {
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      toast.error("Nome é obrigatório.");
      return;
    }
    if (!dataNascimento || dataNascimento.replace(/\D/g, "").length !== 8) {
      toast.error("Data de nascimento é obrigatória (dd/mm/aaaa).");
      return;
    }
    if (!validarData(dataNascimento)) {
      toast.error("Data de nascimento inválida.");
      return;
    }

    const birthDateApi = dataMascaraParaApi(dataNascimento);
    if (!birthDateApi) {
      toast.error("Data de nascimento inválida.");
      return;
    }

    setSalvando(true);
    try {
      await cadastrarDependente({
        nome: nomeTrim,
        birthDate: birthDateApi,
        paiId: paiId && paiId !== "__nenhum__" ? Number(paiId) : undefined,
        maeId: maeId && maeId !== "__nenhum__" ? Number(maeId) : undefined,
      });
      toast.success("Criança/jovem cadastrado com sucesso.");
      onAbertoChange(false);
      onSucesso();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setSalvando(false);
    }
  };

  const membrosNaoDependentes = membrosParaPaiMae.filter((m) => !m.isDependente);
  const membrosMasculinos = membrosNaoDependentes.filter((m) => m.sexo === "MASCULINO");
  const membrosFemininos = membrosNaoDependentes.filter((m) => m.sexo === "FEMININO");

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar criança/adolescente</DialogTitle>
          <DialogDescription>
            Cadastro simplificado para crianças e jovens que não possuem celular ou login.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nome-dep">Nome *</Label>
            <Input
              id="nome-dep"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataNascimento-dep">Data de nascimento *</Label>
            <Input
              id="dataNascimento-dep"
              placeholder="dd/mm/aaaa"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(aplicarMascaraData(e.target.value))}
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pai-dep">Pai</Label>
            <Select value={paiId || "__nenhum__"} onValueChange={(v) => setPaiId(v === "__nenhum__" ? "" : v)}>
              <SelectTrigger id="pai-dep">
                <SelectValue placeholder="Selecione o pai (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__nenhum__">Nenhum</SelectItem>
                {membrosMasculinos.map((m) => (
                  <SelectItem key={m.id} value={String(m.idNum ?? m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mae-dep">Mãe</Label>
            <Select value={maeId || "__nenhum__"} onValueChange={(v) => setMaeId(v === "__nenhum__" ? "" : v)}>
              <SelectTrigger id="mae-dep">
                <SelectValue placeholder="Selecione a mãe (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__nenhum__">Nenhum</SelectItem>
                {membrosFemininos.map((m) => (
                  <SelectItem key={m.id} value={String(m.idNum ?? m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

interface FormDependenteEdicaoProps {
  dependente: MembroApi | null;
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  onSucesso: () => void;
  membrosParaPaiMae: MembroApi[];
}

function FormDependenteEdicao({
  dependente,
  aberto,
  onAbertoChange,
  onSucesso,
  membrosParaPaiMae,
}: FormDependenteEdicaoProps) {
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [paiId, setPaiId] = useState<string>("");
  const [maeId, setMaeId] = useState<string>("");
  const [salvando, setSalvando] = useState(false);

  const membrosNaoDependentes = membrosParaPaiMae.filter((m) => !m.isDependente);
  const membrosMasculinos = membrosNaoDependentes.filter((m) => m.sexo === "MASCULINO");
  const membrosFemininos = membrosNaoDependentes.filter((m) => m.sexo === "FEMININO");

  useEffect(() => {
    if (aberto && dependente) {
      setNome(dependente.name);
      const bd = dependente.birthDate;
      if (bd) {
        const [y, m, d] = bd.split("-");
        setDataNascimento(`${d}/${m}/${y}`);
      } else {
        setDataNascimento("");
      }
      setPaiId(dependente.paiId ? String(dependente.paiId) : "");
      setMaeId(dependente.maeId ? String(dependente.maeId) : "");
    }
  }, [aberto, dependente]);

  const handleSalvar = async () => {
    if (!dependente?.idNum) return;
    const nomeTrim = nome.trim();
    if (!nomeTrim) {
      toast.error("Nome é obrigatório.");
      return;
    }
    if (!dataNascimento || dataNascimento.replace(/\D/g, "").length !== 8) {
      toast.error("Data de nascimento é obrigatória (dd/mm/aaaa).");
      return;
    }
    if (!validarData(dataNascimento)) {
      toast.error("Data de nascimento inválida.");
      return;
    }
    const birthDateApi = dataMascaraParaApi(dataNascimento);
    if (!birthDateApi) {
      toast.error("Data de nascimento inválida.");
      return;
    }
    const [firstName, ...rest] = nomeTrim.split(/\s+/);
    const lastName = rest.join(" ") || "";

    setSalvando(true);
    try {
      await atualizarMembro({
        id: dependente.idNum,
        login: dependente.login,
        firstName,
        lastName,
        birthDate: birthDateApi,
        paiId: paiId && paiId !== "__nenhum__" ? Number(paiId) : undefined,
        maeId: maeId && maeId !== "__nenhum__" ? Number(maeId) : undefined,
        authorities: [],
        modules: [],
      });
      toast.success("Criança/jovem atualizado com sucesso.");
      onAbertoChange(false);
      onSucesso();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  if (!dependente) return null;

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar criança/adolescente</DialogTitle>
          <DialogDescription>
            Altere os dados da criança ou do adolescente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nome-edit-dep">Nome *</Label>
            <Input
              id="nome-edit-dep"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataNascimento-edit-dep">Data de nascimento *</Label>
            <Input
              id="dataNascimento-edit-dep"
              placeholder="dd/mm/aaaa"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(aplicarMascaraData(e.target.value))}
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pai-edit-dep">Pai</Label>
            <Select value={paiId || "__nenhum__"} onValueChange={(v) => setPaiId(v === "__nenhum__" ? "" : v)}>
              <SelectTrigger id="pai-edit-dep">
                <SelectValue placeholder="Selecione o pai (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__nenhum__">Nenhum</SelectItem>
                {membrosMasculinos.map((m) => (
                  <SelectItem key={m.id} value={String(m.idNum ?? m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mae-edit-dep">Mãe</Label>
            <Select value={maeId || "__nenhum__"} onValueChange={(v) => setMaeId(v === "__nenhum__" ? "" : v)}>
              <SelectTrigger id="mae-edit-dep">
                <SelectValue placeholder="Selecione a mãe (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__nenhum__">Nenhum</SelectItem>
                {membrosFemininos.map((m) => (
                  <SelectItem key={m.id} value={String(m.idNum ?? m.id)}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

export default function Members() {
  const { user } = usarAutenticacao();
  const podeEscreverMembros = canWrite(user, "/membros");
  const [modalAberto, setModalAberto] = useState(false);
  const [membros, setMembros] = useState<MembroApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [membroEmEdicao, setMembroEmEdicao] = useState<MembroApi | null>(null);
  const [dependenteEmEdicao, setDependenteEmEdicao] = useState<MembroApi | null>(null);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogEditarDependenteAberto, setDialogEditarDependenteAberto] = useState(false);
  const [membroParaExcluir, setMembroParaExcluir] = useState<MembroApi | null>(null);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [dialogDependenteAberto, setDialogDependenteAberto] = useState(false);

  const podeCadastrarDependente =
    user?.role && PERFIS_PODE_CADASTRAR_DEPENDENTE.includes(user.role);

  const carregarMembros = useCallback(async () => {
    if (!canAccess(user, "/membros")) return;
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
      ROLE_LABELS[m.role].toLowerCase().includes(buscaTexto.toLowerCase()) ||
      (m.isDependente && ("criança jovem dependente".includes(buscaTexto.toLowerCase()) || buscaTexto === ""))
  );

  const editarMembro = (membro: MembroApi) => {
    if (membro.isDependente) {
      setDependenteEmEdicao(membro);
      setDialogEditarDependenteAberto(true);
    } else {
      setMembroEmEdicao(membro);
      setDialogEditarAberto(true);
    }
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

  if (!canAccess(user, "/membros")) {
    return (
      <LayoutApp>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Você não tem acesso a este módulo.
          </p>
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
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

          <div className="flex flex-wrap gap-2">
            {podeCadastrarDependente && (
              <Button
                variant="outline"
                onClick={() => setDialogDependenteAberto(true)}
              >
                <Baby className="h-4 w-4 mr-2" />
                Adicionar criança/adolescente
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/aprovar-pre-cadastros">Aprovar pré-cadastros</Link>
            </Button>
          </div>
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
                podeEditar={podeEscreverMembros}
                isDependente={membro.isDependente}
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

      <FormDependente
        aberto={dialogDependenteAberto}
        onAbertoChange={setDialogDependenteAberto}
        onSucesso={carregarMembros}
        membrosParaPaiMae={membros}
      />

      <FormDependenteEdicao
        dependente={dependenteEmEdicao}
        aberto={dialogEditarDependenteAberto}
        onAbertoChange={(aberto) => {
          setDialogEditarDependenteAberto(aberto);
          if (!aberto) setDependenteEmEdicao(null);
        }}
        onSucesso={carregarMembros}
        membrosParaPaiMae={membros}
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
