import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Church,
  KeyRound,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampoSenha } from "@/components/ui/password-input";
import { IndicadorValidacaoSenha } from "@/components/ui/indicador-validacao-senha";
import {
  enviarPreCadastro,
  type PreCadastroPayload,
  type SexoCadastro,
} from "@/modules/auth/preCadastro";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import {
  aplicarMascaraCep,
  aplicarMascaraCpf,
  aplicarMascaraTelefone,
  apiParaMascaraData,
  dataMascaraParaApi,
  mensagemErroData,
  validarCpf,
  validarData,
  validarEmail,
} from "@/lib/mascara-telefone";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { PLATAFORMA } from "@/lib/plataforma";
import { UFS_BRASIL } from "@/lib/ufs-brasil";
import { toast } from "sonner";
import { SeletorIgreja } from "@/components/igreja/SeletorIgreja";
import { listarIgrejasPublicas, type IgrejaPublica } from "@/modules/igreja/api";
import { Checkbox } from "@/components/ui/checkbox";
import {
  obterTokenFCM,
  solicitarPermissaoPush,
  verificarSuportePush,
} from "@/modules/notificacoes/push";

type ErrosPreCadastro = Partial<Record<keyof PreCadastroPayload | "confirmarSenha", string>>;

const FORM_INICIAL: PreCadastroPayload & { confirmarSenha: string } = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  telefoneSecundario: "",
  telefoneEmergencia: "",
  nomeContatoEmergencia: "",
  cpf: "",
  sexo: "MASCULINO",
  dataNascimento: "",
  senha: "",
  confirmarSenha: "",
  perfilSolicitado: "membro",
  igrejaId: undefined,
  observacoes: "",
  receberNotificacoes: false,
  endereco: {
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "SP",
    cep: "",
  },
};

function Campo({
  id,
  label,
  obrigatorio,
  erro,
  children,
}: {
  id: string;
  label: string;
  obrigatorio?: boolean;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

function validarFormulario(form: typeof FORM_INICIAL): ErrosPreCadastro {
  const erros: ErrosPreCadastro = {};

  if (!form.igrejaId) erros.igrejaId = "Selecione a igreja à qual deseja se vincular.";

  if (!form.nomeCompleto.trim()) erros.nomeCompleto = "Informe o nome completo.";
  if (!validarCpf(form.cpf)) erros.cpf = "Informe um CPF válido.";
  if (!validarEmail(form.email)) erros.email = "Informe um e-mail válido.";

  const erroData = mensagemErroData(form.dataNascimento, true);
  if (erroData) erros.dataNascimento = erroData;

  if (!form.telefone.replace(/\D/g, "").length) erros.telefone = "Informe o telefone principal.";
  if (!form.nomeContatoEmergencia.trim()) {
    erros.nomeContatoEmergencia = "Informe o nome do contato de emergência.";
  }

  const cep = form.endereco.cep.replace(/\D/g, "");
  if (cep.length !== 8) {
    erros.endereco = "Informe um CEP válido.";
  } else if (!form.endereco.logradouro.trim()) {
    erros.endereco = "Informe o logradouro.";
  } else if (!form.endereco.numero.trim()) {
    erros.endereco = "Informe o número.";
  } else if (!form.endereco.bairro.trim()) {
    erros.endereco = "Informe o bairro.";
  } else if (!form.endereco.cidade.trim()) {
    erros.endereco = "Informe a cidade.";
  }

  if (!form.senha) erros.senha = "Informe a senha.";
  else if (form.senha.length < 8) erros.senha = "A senha deve ter ao menos 8 caracteres.";
  if (!form.confirmarSenha) erros.confirmarSenha = "Confirme a senha.";
  else if (form.senha !== form.confirmarSenha) erros.confirmarSenha = "As senhas não conferem.";

  return erros;
}

export default function PreCadastro() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [erros, setErros] = useState<ErrosPreCadastro>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [avisoCep, setAvisoCep] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [igrejas, setIgrejas] = useState<IgrejaPublica[]>([]);
  const [carregandoIgrejas, setCarregandoIgrejas] = useState(true);
  const refs = useRef<Partial<Record<keyof typeof FORM_INICIAL, HTMLElement | null>>>({});

  useEffect(() => {
    let ativo = true;
    void (async () => {
      setCarregandoIgrejas(true);
      const lista = await listarIgrejasPublicas();
      if (!ativo) return;
      setIgrejas(lista);
      setCarregandoIgrejas(false);
      if (lista.length === 1 && lista[0].id != null) {
        setForm((f) => (f.igrejaId ? f : { ...f, igrejaId: lista[0].id }));
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const set = useCallback(<K extends keyof typeof FORM_INICIAL>(key: K, value: (typeof FORM_INICIAL)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErros((e) => ({ ...e, [key]: undefined }));
  }, []);

  const setEndereco = useCallback(
    (field: keyof PreCadastroPayload["endereco"], value: string) => {
      setForm((f) => ({ ...f, endereco: { ...f.endereco, [field]: value } }));
      setErros((e) => ({ ...e, endereco: undefined }));
    },
    [],
  );

  const focarPrimeiroErro = (mapa: ErrosPreCadastro) => {
    const ordem: (keyof typeof FORM_INICIAL)[] = [
      "igrejaId",
      "nomeCompleto",
      "cpf",
      "email",
      "dataNascimento",
      "telefone",
      "nomeContatoEmergencia",
      "senha",
      "confirmarSenha",
    ];
    const primeiro = ordem.find((k) => mapa[k]);
    if (primeiro) refs.current[primeiro]?.focus();
  };

  const buscarCep = async (cepMascarado: string) => {
    const digits = cepMascarado.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setBuscandoCep(true);
    setAvisoCep(null);
    try {
      const resultado = await buscarEnderecoPorCep(digits);
      if (!resultado.ok) {
        const msg =
          resultado.motivo === "nao_encontrado"
            ? "CEP não encontrado."
            : "Não foi possível buscar o CEP agora. Preencha manualmente.";
        setAvisoCep(msg);
        return;
      }
      setForm((f) => ({
        ...f,
        endereco: {
          ...f.endereco,
          cep: aplicarMascaraCep(digits),
          logradouro: resultado.endereco.logradouro || f.endereco.logradouro,
          bairro: resultado.endereco.bairro || f.endereco.bairro,
          cidade: resultado.endereco.localidade || f.endereco.cidade,
          estado: resultado.endereco.uf || f.endereco.estado,
        },
      }));
    } finally {
      setBuscandoCep(false);
    }
  };

  const enviarFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validacao = validarFormulario(form);
    if (Object.keys(validacao).length > 0) {
      setErros(validacao);
      focarPrimeiroErro(validacao);
      return;
    }

    setEnviando(true);
    try {
      const { confirmarSenha: _, ...payloadBase } = form;
      let pushToken: string | null = null;
      let pushPlataforma: string | null = null;
      let pushNavegador: string | null = null;

      if (form.receberNotificacoes) {
        try {
          const suporte = await verificarSuportePush();
          if (suporte) {
            const permissao = await solicitarPermissaoPush();
            if (permissao === "granted") {
              pushToken = await obterTokenFCM();
              const ua = navigator.userAgent.toLowerCase();
              pushPlataforma = /iphone|ipad|ipod|android/.test(ua) ? "WEB_PWA" : "WEB_PWA";
              pushNavegador = navigator.userAgent.includes("Edg/")
                ? "Edge"
                : navigator.userAgent.includes("Chrome/")
                  ? "Chrome"
                  : navigator.userAgent.includes("Firefox/")
                    ? "Firefox"
                    : "Outro";
            } else {
              toast.message(
                "Permissão de notificação não concedida. Seu pré-cadastro será enviado sem ativar o alerta no aparelho.",
              );
            }
          }
        } catch {
          toast.message(
            "Não foi possível ativar as notificações agora. Seu pré-cadastro será enviado normalmente.",
          );
        }
      }

      await enviarPreCadastro({
        ...payloadBase,
        cpf: form.cpf.replace(/\D/g, ""),
        email: form.email.trim().toLowerCase(),
        dataNascimento: dataMascaraParaApi(form.dataNascimento),
        perfilSolicitado: "membro",
        receberNotificacoes: Boolean(form.receberNotificacoes),
        pushToken,
        pushPlataforma,
        pushNavegador,
      });
      setEnviado(true);
      toast.success("Pré-cadastro enviado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar pré-cadastro.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <PublicPageShell
        titulo="Pré-cadastro enviado!"
        subtitulo="Aguarde a análise do administrador da igreja."
      >
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive/10">
              <User className="h-7 w-7 text-olive" />
            </div>
            <CardDescription className="text-base text-center">
              Seu pré-cadastro foi recebido. Após aprovação, você poderá entrar com seu{" "}
              <strong>CPF</strong> e a <strong>senha definida</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-olive hover:bg-olive/90 text-olive-foreground">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </CardContent>
        </Card>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      titulo="Pré-cadastro"
      subtitulo={`Solicite acesso à sua igreja na plataforma ${PLATAFORMA.nome}. O administrador analisará seus dados.`}
    >
      <form onSubmit={enviarFormulario} className="space-y-6 w-full" noValidate>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Church className="h-5 w-5 text-olive" />
              <CardTitle className="text-lg">Sua igreja</CardTitle>
            </div>
            <CardDescription>
              Selecione a igreja à qual você deseja se vincular. O administrador dessa igreja analisará
              seu pré-cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Campo id="igreja" label="Igreja" obrigatorio erro={erros.igrejaId}>
              <SeletorIgreja
                id="igreja"
                igrejas={igrejas}
                value={form.igrejaId}
                carregando={carregandoIgrejas}
                erro={erros.igrejaId}
                onChange={(id) => set("igrejaId", id)}
              />
            </Campo>
            {!carregandoIgrejas && igrejas.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Nenhuma igreja disponível no momento. Entre em contato com a secretaria ou cadastre sua igreja
                na plataforma.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-olive" />
              <CardTitle className="text-lg">Dados pessoais</CardTitle>
            </div>
            <CardDescription>
              Todo pré-cadastro entra como <strong>Membro</strong>. O administrador definirá o perfil
              correto na aprovação.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Campo id="nomeCompleto" label="Nome completo" obrigatorio erro={erros.nomeCompleto}>
                <Input
                  id="nomeCompleto"
                  ref={(el) => { refs.current.nomeCompleto = el; }}
                  autoComplete="name"
                  value={form.nomeCompleto}
                  onChange={(e) => set("nomeCompleto", e.target.value)}
                  aria-invalid={Boolean(erros.nomeCompleto)}
                />
              </Campo>
            </div>
            <Campo id="cpf" label="CPF" obrigatorio erro={erros.cpf}>
              <Input
                id="cpf"
                ref={(el) => { refs.current.cpf = el; }}
                autoComplete="username"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => set("cpf", aplicarMascaraCpf(e.target.value))}
                aria-invalid={Boolean(erros.cpf)}
              />
            </Campo>
            <Campo id="email" label="E-mail" obrigatorio erro={erros.email}>
              <Input
                id="email"
                type="email"
                ref={(el) => { refs.current.email = el; }}
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                aria-invalid={Boolean(erros.email)}
              />
            </Campo>
            <Campo id="dataNascimento" label="Data de nascimento" obrigatorio erro={erros.dataNascimento}>
              <DatePicker
                id="dataNascimento"
                value={dataMascaraParaApi(form.dataNascimento) || undefined}
                onChange={(v) => set("dataNascimento", v ? apiParaMascaraData(v) : "")}
                rejeitarFuturo
                className={
                  erros.dataNascimento
                    ? "[&_input]:border-destructive [&_input]:focus-visible:ring-destructive"
                    : undefined
                }
              />
            </Campo>
            <Campo id="sexo" label="Sexo">
              <Select
                value={form.sexo}
                onValueChange={(v) => set("sexo", v as SexoCadastro)}
              >
                <SelectTrigger id="sexo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMININO">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contato</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo id="telefone" label="Telefone principal" obrigatorio erro={erros.telefone}>
              <Input
                id="telefone"
                ref={(el) => { refs.current.telefone = el; }}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => set("telefone", aplicarMascaraTelefone(e.target.value))}
                aria-invalid={Boolean(erros.telefone)}
              />
            </Campo>
            <Campo id="telefoneSecundario" label="Telefone secundário">
              <Input
                id="telefoneSecundario"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={form.telefoneSecundario}
                onChange={(e) => set("telefoneSecundario", aplicarMascaraTelefone(e.target.value))}
              />
            </Campo>
            <Campo id="telefoneEmergencia" label="Telefone de emergência">
              <Input
                id="telefoneEmergencia"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={form.telefoneEmergencia}
                onChange={(e) => set("telefoneEmergencia", aplicarMascaraTelefone(e.target.value))}
              />
            </Campo>
            <Campo
              id="nomeContatoEmergencia"
              label="Nome do contato de emergência"
              obrigatorio
              erro={erros.nomeContatoEmergencia}
            >
              <Input
                id="nomeContatoEmergencia"
                ref={(el) => { refs.current.nomeContatoEmergencia = el; }}
                autoComplete="name"
                value={form.nomeContatoEmergencia}
                onChange={(e) => set("nomeContatoEmergencia", e.target.value)}
                aria-invalid={Boolean(erros.nomeContatoEmergencia)}
              />
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-olive" />
              <CardTitle className="text-lg">Endereço</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo id="cep" label="CEP" obrigatorio erro={erros.endereco}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="cep"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    value={form.endereco.cep}
                    onChange={(e) => {
                      const mascarado = aplicarMascaraCep(e.target.value);
                      setEndereco("cep", mascarado);
                      if (mascarado.replace(/\D/g, "").length === 8) void buscarCep(mascarado);
                    }}
                    onBlur={() => void buscarCep(form.endereco.cep)}
                    aria-invalid={Boolean(erros.endereco)}
                  />
                  {buscandoCep && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Buscar endereço pelo CEP"
                  disabled={buscandoCep || form.endereco.cep.replace(/\D/g, "").length !== 8}
                  onClick={() => void buscarCep(form.endereco.cep)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {avisoCep && <p className="text-sm text-muted-foreground">{avisoCep}</p>}
            </Campo>
            <Campo id="numero" label="Número" obrigatorio erro={erros.endereco}>
              <Input
                id="numero"
                autoComplete="off"
                value={form.endereco.numero}
                onChange={(e) => setEndereco("numero", e.target.value)}
                aria-invalid={Boolean(erros.endereco)}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo id="logradouro" label="Logradouro" obrigatorio erro={erros.endereco}>
                <Input
                  id="logradouro"
                  autoComplete="street-address"
                  value={form.endereco.logradouro}
                  onChange={(e) => setEndereco("logradouro", e.target.value)}
                  aria-invalid={Boolean(erros.endereco)}
                />
              </Campo>
            </div>
            <Campo id="complemento" label="Complemento">
              <Input
                id="complemento"
                value={form.endereco.complemento ?? ""}
                onChange={(e) => setEndereco("complemento", e.target.value)}
              />
            </Campo>
            <Campo id="bairro" label="Bairro" obrigatorio erro={erros.endereco}>
              <Input
                id="bairro"
                autoComplete="address-level3"
                value={form.endereco.bairro}
                onChange={(e) => setEndereco("bairro", e.target.value)}
                aria-invalid={Boolean(erros.endereco)}
              />
            </Campo>
            <Campo id="cidade" label="Cidade" obrigatorio erro={erros.endereco}>
              <Input
                id="cidade"
                autoComplete="address-level2"
                value={form.endereco.cidade}
                onChange={(e) => setEndereco("cidade", e.target.value)}
                aria-invalid={Boolean(erros.endereco)}
              />
            </Campo>
            <Campo id="estado" label="Estado">
              <Select
                value={form.endereco.estado}
                onValueChange={(v) => setEndereco("estado", v)}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {UFS_BRASIL.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-olive" />
              <CardTitle className="text-lg">Credenciais</CardTitle>
            </div>
            <CardDescription>
              O login será feito com o <strong>CPF</strong> informado acima.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo id="senha" label="Senha" obrigatorio erro={erros.senha}>
              <CampoSenha
                id="senha"
                value={form.senha}
                onChange={(v) => set("senha", v)}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                inputClassName={cn(erros.senha && "border-destructive focus-visible:ring-destructive")}
              />
            </Campo>
            <Campo id="confirmarSenha" label="Confirmar senha" obrigatorio erro={erros.confirmarSenha}>
              <CampoSenha
                id="confirmarSenha"
                value={form.confirmarSenha}
                onChange={(v) => set("confirmarSenha", v)}
                autoComplete="new-password"
                placeholder="Repita a senha"
                aria-label="Confirmar senha"
                inputClassName={cn(
                  erros.confirmarSenha && "border-destructive focus-visible:ring-destructive",
                )}
              />
            </Campo>
            <div className="sm:col-span-2">
              <IndicadorValidacaoSenha senha={form.senha} confirmarSenha={form.confirmarSenha} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-olive" />
              <CardTitle className="text-lg">Notificações</CardTitle>
            </div>
            <CardDescription>
              Ative para receber avisos no celular, como a aprovação do cadastro e lembretes de culto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label
              htmlFor="receberNotificacoes"
              className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/40"
            >
              <Checkbox
                id="receberNotificacoes"
                checked={Boolean(form.receberNotificacoes)}
                onCheckedChange={(v) => set("receberNotificacoes", v === true)}
                className="mt-0.5"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-foreground">
                  Quero receber notificações neste dispositivo
                </span>
                <span className="block text-xs text-muted-foreground">
                  Ao marcar, o navegador pedirá permissão. Você será avisado quando o cadastro for aprovado e
                  antes dos cultos.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-olive" />
              <CardTitle className="text-lg">Observações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Campo id="observacoes" label="Observações (opcional)">
              <Textarea
                id="observacoes"
                placeholder="Opcional"
                value={form.observacoes ?? ""}
                onChange={(e) => set("observacoes", e.target.value)}
                rows={3}
              />
            </Campo>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-lg border border-olive/30 bg-olive/5 p-3 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 shrink-0 mt-0.5 text-olive" />
          <p>
            Após análise, o administrador da igreja aprovará ou rejeitará seu pré-cadastro. Você poderá
            acompanhar o status tentando fazer login com seu CPF.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            type="submit"
            className="w-full h-11 bg-olive hover:bg-olive/90 text-olive-foreground"
            disabled={enviando || carregandoIgrejas || igrejas.length === 0}
          >
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar pré-cadastro"
            )}
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/login" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </div>
      </form>
    </PublicPageShell>
  );
}
