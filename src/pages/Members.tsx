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
  type MembroApi,
  type AtualizarMembroPayload,
} from "@/modules/members/api";
import { listarCargos, type IgrejaCargo } from "@/modules/cargos/api";
import {
  type Role,
} from "@/auth/permissions";
import { BadgesCargos } from "@/components/membros/BadgesCargos";
import { useCargosIgreja } from "@/hooks/use-cargos-igreja";
import { membroCombinaBuscaCargos, obterRotulosCargos } from "@/lib/rotulos-cargos";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, canWrite } from "@/auth/permissions";
import { toast } from "sonner";
import { apiParaMascaraData, validarData } from "@/lib/mascara-telefone";
import { DatePicker } from "@/components/ui/date-picker";

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
  cargosIgreja: IgrejaCargo[];
  aoEditar: (membro: MembroApi) => void;
  aoExcluir: (membro: MembroApi) => void;
  podeEditar: boolean;
  isDependente?: boolean;
}

function CartaoMembro({ membro, cargosIgreja, aoEditar, aoExcluir, podeEditar, isDependente }: CartaoMembroProps) {
  const avatarUrl = useAvatarUrlByUserId(membro.idNum ?? membro.id);
  const rotulosCargos = obterRotulosCargos(
    { cargoIds: membro.cargoIds, authorities: membro.authorities, role: membro.role },
    cargosIgreja,
  );
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
                    <BadgesCargos rotulos={rotulosCargos} />
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

const CODIGO_POR_ROLE: Partial<Record<Role, string>> = {
  admin: "ADMIN_IGREJA",
  admin_igreja: "ADMIN_IGREJA",
  pastor: "PASTOR",
  copastor: "COPASTOR",
  secretaria: "SECRETARIA",
  tesouraria: "TESOURARIA",
  lider: "LIDER",
  membro: "MEMBRO",
  visitante: "VISITANTE",
};

function cargoIdsIniciais(membro: MembroApi, cargos: IgrejaCargo[]): number[] {
  if (membro.cargoIds?.length) return [...membro.cargoIds];
  const codigo = CODIGO_POR_ROLE[membro.role];
  if (!codigo) return [];
  const cargo = cargos.find((c) => c.codigo === codigo);
  return cargo?.id != null ? [cargo.id] : [];
}

function authorityPrincipalDosCargos(cargos: IgrejaCargo[], selecionados: number[]): string[] {
  const prioridade = [
    "ADMIN_IGREJA",
    "PASTOR",
    "COPASTOR",
    "SECRETARIA",
    "TESOURARIA",
    "LIDER",
    "MEMBRO",
    "VISITANTE",
  ];
  const codigos = cargos
    .filter((c) => c.id != null && selecionados.includes(c.id))
    .map((c) => c.codigo)
    .filter(Boolean) as string[];
  const authorities: string[] = [];
  for (const cod of prioridade) {
    if (codigos.includes(cod)) {
      authorities.push(cod === "ADMIN_IGREJA" ? "ROLE_ADMIN_IGREJA" : `ROLE_${cod}`);
    }
  }
  if (authorities.length === 0) {
    authorities.push("ROLE_MEMBRO");
  }
  return authorities;
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
  const [dataBatismo, setDataBatismo] = useState("");
  const [dataCasamento, setDataCasamento] = useState("");
  const [dataMembroSince, setDataMembroSince] = useState("");
  const [activated, setActivated] = useState(true);
  const [cargos, setCargos] = useState<IgrejaCargo[]>([]);
  const [cargoIdsSelecionados, setCargoIdsSelecionados] = useState<number[]>([]);
  const [salvando, setSalvando] = useState(false);

  const resetarForm = useCallback(() => {
    if (membroEdicao) {
      setLogin(membroEdicao.login);
      setFirstName(membroEdicao.firstName);
      setLastName(membroEdicao.lastName);
      setEmail(membroEdicao.email);
      setBirthDate(membroEdicao.birthDate ?? "");
      setDataBatismo(membroEdicao.dataBatismo ?? "");
      setDataCasamento(membroEdicao.dataCasamento ?? "");
      setDataMembroSince(membroEdicao.dataMembroSince ?? "");
      setSexo((membroEdicao.sexo as "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO") ?? "NAO_INFORMADO");
      setActivated(membroEdicao.activated);
      setCargoIdsSelecionados(cargoIdsIniciais(membroEdicao, cargos));
    } else {
      setLogin("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setBirthDate("");
      setDataBatismo("");
      setDataCasamento("");
      setDataMembroSince("");
      setSexo("NAO_INFORMADO");
      setActivated(true);
      setCargoIdsSelecionados([]);
    }
  }, [membroEdicao, cargos]);

  useEffect(() => {
    if (!aberto) return;
    listarCargos()
      .then(setCargos)
      .catch(() => toast.error("Não foi possível carregar os cargos."));
  }, [aberto]);

  useEffect(() => {
    if (aberto) {
      resetarForm();
    }
  }, [aberto, resetarForm]);

  useEffect(() => {
    if (aberto && membroEdicao && cargos.length > 0) {
      setCargoIdsSelecionados(cargoIdsIniciais(membroEdicao, cargos));
    }
  }, [aberto, membroEdicao, cargos]);

  const toggleCargo = (cargoId: number) => {
    setCargoIdsSelecionados((prev) =>
      prev.includes(cargoId) ? prev.filter((id) => id !== cargoId) : [...prev, cargoId],
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
    if (cargoIdsSelecionados.length === 0) {
      toast.error("Selecione ao menos um cargo para o membro.");
      return;
    }

    setSalvando(true);
    try {
      if (membroEdicao?.idNum) {
        const authorities = authorityPrincipalDosCargos(cargos, cargoIdsSelecionados);
        const payload: AtualizarMembroPayload = {
          id: membroEdicao.idNum,
          login: loginTrim,
          firstName: firstNameTrim,
          lastName: lastNameTrim,
          email: emailTrim || undefined,
          birthDate: birthDate.trim() || undefined,
          dataBatismo: dataBatismo.trim() || null,
          dataCasamento: dataCasamento.trim() || null,
          dataMembroSince: dataMembroSince.trim() || null,
          sexo: sexo !== "NAO_INFORMADO" ? sexo : undefined,
          activated,
          authorities,
          modules: [],
          cargoIds: cargoIdsSelecionados,
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
  const descricao = "Altere os dados do membro e os cargos de acesso no sistema.";

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <DatePicker
                id="birthDate"
                value={birthDate || undefined}
                onChange={setBirthDate}
                rejeitarFuturo
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataBatismo">Data de batismo</Label>
              <DatePicker
                id="dataBatismo"
                value={dataBatismo || undefined}
                onChange={setDataBatismo}
                rejeitarFuturo
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataCasamento">Data de casamento</Label>
              <DatePicker
                id="dataCasamento"
                value={dataCasamento || undefined}
                onChange={setDataCasamento}
                rejeitarFuturo
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataMembroSince">Membro desde</Label>
              <DatePicker
                id="dataMembroSince"
                value={dataMembroSince || undefined}
                onChange={setDataMembroSince}
                rejeitarFuturo
              />
            </div>
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
            <Label>Cargos na igreja</Label>
            <p className="text-sm text-muted-foreground">
              Selecione um ou mais cargos. As permissões de todos os cargos se combinam automaticamente.
            </p>
            <div className="grid gap-2 max-h-48 overflow-y-auto rounded-md border p-3">
              {cargos.map((cargo) => (
                <div key={cargo.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`cargo-${cargo.id}`}
                    checked={cargo.id != null && cargoIdsSelecionados.includes(cargo.id)}
                    onCheckedChange={() => cargo.id != null && toggleCargo(cargo.id)}
                  />
                  <label htmlFor={`cargo-${cargo.id}`} className="text-sm leading-snug cursor-pointer">
                    <span className="font-medium">{cargo.nome}</span>
                    {cargo.descricao && (
                      <span className="block text-muted-foreground text-xs">{cargo.descricao}</span>
                    )}
                  </label>
                </div>
              ))}
              {cargos.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cargo cadastrado. Configure em Configurações da Igreja → Cargos.
                </p>
              )}
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
    if (!dataNascimento) {
      toast.error("Data de nascimento é obrigatória.");
      return;
    }
    if (!validarData(apiParaMascaraData(dataNascimento))) {
      toast.error("Data de nascimento inválida.");
      return;
    }

    setSalvando(true);
    try {
      await cadastrarDependente({
        nome: nomeTrim,
        birthDate: dataNascimento,
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
      <DialogContent>
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
            <DatePicker
              id="dataNascimento-dep"
              value={dataNascimento || undefined}
              onChange={setDataNascimento}
              rejeitarFuturo
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
      setDataNascimento(dependente.birthDate ?? "");
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
    if (!dataNascimento) {
      toast.error("Data de nascimento é obrigatória.");
      return;
    }
    if (!validarData(apiParaMascaraData(dataNascimento))) {
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
        birthDate: dataNascimento,
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
      <DialogContent>
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
            <DatePicker
              id="dataNascimento-edit-dep"
              value={dataNascimento || undefined}
              onChange={setDataNascimento}
              rejeitarFuturo
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
  const cargosIgreja = useCargosIgreja();
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
      membroCombinaBuscaCargos(
        { cargoIds: m.cargoIds, authorities: m.authorities, role: m.role },
        cargosIgreja,
        buscaTexto,
      ) ||
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
            placeholder="Buscar por nome, login, e-mail ou cargo..."
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
                cargosIgreja={cargosIgreja}
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
