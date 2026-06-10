import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampoSenha } from "@/components/ui/password-input";
import { IndicadorValidacaoSenha } from "@/components/ui/indicador-validacao-senha";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { PLATAFORMA } from "@/lib/plataforma";
import { enviarSolicitacaoAcesso } from "@/modules/igreja/solicitacao";
import { aplicarMascaraCnpj } from "@/lib/mascara-documento";
import {
  aplicarMascaraCep,
  aplicarMascaraCpf,
  aplicarMascaraTelefone,
  apiParaMascaraData,
  dataMascaraParaApi,
} from "@/lib/mascara-telefone";
import { DatePicker } from "@/components/ui/date-picker";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import { UFS_BRASIL } from "@/lib/ufs-brasil";
import {
  type ErrosSolicitacao,
  type FormSolicitacaoAcesso,
  normalizarPayloadSolicitacao,
  validarFormSolicitacao,
} from "@/lib/validacao-solicitacao";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FORM_INICIAL: FormSolicitacaoAcesso = {
  nomeSolicitante: "",
  cpf: "",
  email: "",
  dataNascimento: "",
  sexo: "MASCULINO",
  telefone: "",
  telefoneSecundario: "",
  telefoneEmergencia: "",
  nomeContatoEmergencia: "",
  cepPessoal: "",
  enderecoPessoal: "",
  numeroPessoal: "",
  complementoPessoal: "",
  bairroPessoal: "",
  cidadePessoal: "",
  estadoPessoal: "CE",
  senha: "",
  confirmarSenha: "",
  nomeIgreja: "",
  cnpjIgreja: "",
  quantidadeMembros: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "CE",
  mensagem: "",
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

type PrefixoEndereco = "Pessoal" | "Igreja";

export default function SolicitarAcesso() {
  const [form, setForm] = useState<FormSolicitacaoAcesso>(FORM_INICIAL);
  const [erros, setErros] = useState<ErrosSolicitacao>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState<PrefixoEndereco | null>(null);
  const [avisoCep, setAvisoCep] = useState<Partial<Record<PrefixoEndereco, string>>>({});
  const refs = useRef<Partial<Record<keyof FormSolicitacaoAcesso, HTMLElement | null>>>({});

  const set = useCallback(<K extends keyof FormSolicitacaoAcesso>(key: K, value: FormSolicitacaoAcesso[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErros((e) => ({ ...e, [key]: undefined }));
  }, []);

  const focarPrimeiroErro = (mapa: ErrosSolicitacao) => {
    const primeiro = (Object.keys(mapa) as (keyof FormSolicitacaoAcesso)[]).find((k) => mapa[k]);
    if (primeiro) refs.current[primeiro]?.focus();
  };

  const buscarCep = async (tipo: PrefixoEndereco, cepMascarado: string) => {
    const digits = cepMascarado.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setBuscandoCep(tipo);
    setAvisoCep((a) => ({ ...a, [tipo]: undefined }));
    try {
      const resultado = await buscarEnderecoPorCep(digits);
      if (!resultado.ok) {
        const msg =
          resultado.motivo === "nao_encontrado"
            ? "CEP não encontrado."
            : "Não foi possível buscar o CEP agora. Preencha manualmente.";
        setAvisoCep((a) => ({ ...a, [tipo]: msg }));
        return;
      }
      if (tipo === "Pessoal") {
        setForm((f) => ({
          ...f,
          enderecoPessoal: resultado.endereco.logradouro || f.enderecoPessoal,
          bairroPessoal: resultado.endereco.bairro || f.bairroPessoal,
          cidadePessoal: resultado.endereco.localidade || f.cidadePessoal,
          estadoPessoal: resultado.endereco.uf || f.estadoPessoal,
        }));
      } else {
        setForm((f) => ({
          ...f,
          endereco: resultado.endereco.logradouro || f.endereco,
          bairro: resultado.endereco.bairro || f.bairro,
          cidade: resultado.endereco.localidade || f.cidade,
          estado: resultado.endereco.uf || f.estado,
        }));
      }
    } finally {
      setBuscandoCep(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validacao = validarFormSolicitacao(form);
    if (Object.keys(validacao).length > 0) {
      setErros(validacao);
      focarPrimeiroErro(validacao);
      return;
    }

    setEnviando(true);
    try {
      await enviarSolicitacaoAcesso(normalizarPayloadSolicitacao(form));
      setEnviado(true);
      toast.success("Solicitação enviada com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar solicitação.");
    } finally {
      setEnviando(false);
    }
  };

  const campoCep = (
    tipo: PrefixoEndereco,
    cepKey: "cepPessoal" | "cep",
    label: string,
    obrigatorio?: boolean,
  ) => (
    <Campo id={cepKey} label={label} obrigatorio={obrigatorio} erro={erros[cepKey]}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={cepKey}
            inputMode="numeric"
            value={form[cepKey]}
            onChange={(e) => {
              const mascarado = aplicarMascaraCep(e.target.value);
              set(cepKey, mascarado);
              if (mascarado.replace(/\D/g, "").length === 8) void buscarCep(tipo, mascarado);
            }}
            onBlur={() => void buscarCep(tipo, form[cepKey])}
            aria-invalid={Boolean(erros[cepKey])}
            placeholder="00000-000"
          />
          {buscandoCep === tipo && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Buscar CEP"
          disabled={buscandoCep === tipo || form[cepKey].replace(/\D/g, "").length !== 8}
          onClick={() => void buscarCep(tipo, form[cepKey])}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {avisoCep[tipo] && <p className="text-sm text-muted-foreground">{avisoCep[tipo]}</p>}
    </Campo>
  );

  if (enviado) {
    return (
      <PublicPageShell
        titulo="Solicitação enviada com sucesso!"
        subtitulo="Vamos analisar os dados e liberar o teste grátis da sua igreja."
      >
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <Church className="h-7 w-7 text-blue-600" />
            </div>
            <CardDescription className="text-base text-center">
              Enviamos um e-mail de confirmação. Após aprovação, você receberá acesso ao teste grátis de 7 dias e
              poderá entrar com seu <strong>CPF</strong> e a <strong>senha definida</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Voltar ao login</Link>
            </Button>
          </CardContent>
        </Card>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      titulo="Teste grátis por 7 dias"
      subtitulo={`Solicite o teste grátis de 7 dias para sua igreja na plataforma ${PLATAFORMA.nome}. Você será o primeiro administrador.`}
    >
        <form onSubmit={handleSubmit} className="space-y-6 w-full" noValidate>
          {/* Admin — dados pessoais */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-olive" />
                <CardTitle className="text-lg">Primeiro administrador — dados pessoais</CardTitle>
              </div>
              <CardDescription>Esta pessoa será o admin da igreja após aprovação.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo id="nomeSolicitante" label="Nome completo" obrigatorio erro={erros.nomeSolicitante}>
                  <Input
                    id="nomeSolicitante"
                    ref={(el) => { refs.current.nomeSolicitante = el; }}
                    autoComplete="name"
                    value={form.nomeSolicitante}
                    onChange={(e) => set("nomeSolicitante", e.target.value)}
                    aria-invalid={Boolean(erros.nomeSolicitante)}
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
                  autoComplete="email"
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
                  className={erros.dataNascimento ? "[&_input]:border-destructive [&_input]:focus-visible:ring-destructive" : undefined}
                />
              </Campo>
              <Campo id="sexo" label="Sexo" obrigatorio>
                <Select value={form.sexo} onValueChange={(v) => set("sexo", v as FormSolicitacaoAcesso["sexo"])}>
                  <SelectTrigger id="sexo"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MASCULINO">Masculino</SelectItem>
                    <SelectItem value="FEMININO">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </Campo>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Contato do administrador</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo id="telefone" label="Telefone principal" obrigatorio erro={erros.telefone}>
                <Input
                  id="telefone"
                  inputMode="tel"
                  value={form.telefone}
                  onChange={(e) => set("telefone", aplicarMascaraTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  aria-invalid={Boolean(erros.telefone)}
                />
              </Campo>
              <Campo id="telefoneSecundario" label="Telefone secundário">
                <Input
                  id="telefoneSecundario"
                  inputMode="tel"
                  value={form.telefoneSecundario}
                  onChange={(e) => set("telefoneSecundario", aplicarMascaraTelefone(e.target.value))}
                />
              </Campo>
              <Campo id="telefoneEmergencia" label="Telefone de emergência">
                <Input
                  id="telefoneEmergencia"
                  inputMode="tel"
                  value={form.telefoneEmergencia}
                  onChange={(e) => set("telefoneEmergencia", aplicarMascaraTelefone(e.target.value))}
                />
              </Campo>
              <Campo id="nomeContatoEmergencia" label="Nome do contato de emergência" obrigatorio erro={erros.nomeContatoEmergencia}>
                <Input
                  id="nomeContatoEmergencia"
                  value={form.nomeContatoEmergencia}
                  onChange={(e) => set("nomeContatoEmergencia", e.target.value)}
                  aria-invalid={Boolean(erros.nomeContatoEmergencia)}
                />
              </Campo>
            </CardContent>
          </Card>

          {/* Endereço pessoal */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-olive" />
                <CardTitle className="text-lg">Endereço pessoal do administrador</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {campoCep("Pessoal", "cepPessoal", "CEP", true)}
              <Campo id="numeroPessoal" label="Número" obrigatorio erro={erros.numeroPessoal}>
                <Input id="numeroPessoal" value={form.numeroPessoal} onChange={(e) => set("numeroPessoal", e.target.value)} />
              </Campo>
              <div className="sm:col-span-2">
                <Campo id="enderecoPessoal" label="Logradouro" obrigatorio erro={erros.enderecoPessoal}>
                  <Input id="enderecoPessoal" value={form.enderecoPessoal} onChange={(e) => set("enderecoPessoal", e.target.value)} />
                </Campo>
              </div>
              <Campo id="complementoPessoal" label="Complemento">
                <Input id="complementoPessoal" value={form.complementoPessoal} onChange={(e) => set("complementoPessoal", e.target.value)} />
              </Campo>
              <Campo id="bairroPessoal" label="Bairro" obrigatorio erro={erros.bairroPessoal}>
                <Input id="bairroPessoal" value={form.bairroPessoal} onChange={(e) => set("bairroPessoal", e.target.value)} />
              </Campo>
              <Campo id="cidadePessoal" label="Cidade" obrigatorio erro={erros.cidadePessoal}>
                <Input id="cidadePessoal" value={form.cidadePessoal} onChange={(e) => set("cidadePessoal", e.target.value)} />
              </Campo>
              <Campo id="estadoPessoal" label="Estado" obrigatorio erro={erros.estadoPessoal}>
                <Select value={form.estadoPessoal} onValueChange={(v) => set("estadoPessoal", v)}>
                  <SelectTrigger id="estadoPessoal" className={cn(erros.estadoPessoal && "border-destructive")}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS_BRASIL.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
            </CardContent>
          </Card>

          {/* Credenciais */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-olive" />
                <CardTitle className="text-lg">Credenciais de acesso</CardTitle>
              </div>
              <CardDescription>
                O login será feito com o <strong>CPF</strong> informado acima. Escolha sua senha agora — após
                aprovação, use-a para entrar na plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo id="senha" label="Senha" obrigatorio erro={erros.senha}>
                <CampoSenha
                  id="senha"
                  value={form.senha}
                  onChange={(v) => set("senha", v)}
                  autoComplete="new-password"
                />
              </Campo>
              <Campo id="confirmarSenha" label="Confirmar senha" obrigatorio erro={erros.confirmarSenha}>
                <CampoSenha
                  id="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={(v) => set("confirmarSenha", v)}
                  autoComplete="new-password"
                />
              </Campo>
              <div className="sm:col-span-2">
                <IndicadorValidacaoSenha senha={form.senha} confirmarSenha={form.confirmarSenha} />
              </div>
            </CardContent>
          </Card>

          {/* Igreja */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-olive" />
                <CardTitle className="text-lg">Dados da igreja</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo id="nomeIgreja" label="Nome da igreja" obrigatorio erro={erros.nomeIgreja}>
                  <Input id="nomeIgreja" value={form.nomeIgreja} onChange={(e) => set("nomeIgreja", e.target.value)} />
                </Campo>
              </div>
              <Campo id="cnpjIgreja" label="CNPJ" erro={erros.cnpjIgreja}>
                <Input
                  id="cnpjIgreja"
                  value={form.cnpjIgreja}
                  onChange={(e) => set("cnpjIgreja", aplicarMascaraCnpj(e.target.value))}
                  placeholder="00.000.000/0000-00"
                />
              </Campo>
              <Campo id="quantidadeMembros" label="Qtd. aproximada de membros" erro={erros.quantidadeMembros}>
                <Input
                  id="quantidadeMembros"
                  inputMode="numeric"
                  value={form.quantidadeMembros}
                  onChange={(e) => set("quantidadeMembros", e.target.value.replace(/\D/g, ""))}
                />
              </Campo>
            </CardContent>
          </Card>

          {/* Endereço igreja */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-olive" />
                <CardTitle className="text-lg">Endereço da igreja</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {campoCep("Igreja", "cep", "CEP")}
              <Campo id="numero" label="Número">
                <Input id="numero" value={form.numero} onChange={(e) => set("numero", e.target.value)} />
              </Campo>
              <div className="sm:col-span-2">
                <Campo id="endereco" label="Logradouro">
                  <Input id="endereco" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
                </Campo>
              </div>
              <Campo id="complemento" label="Complemento">
                <Input id="complemento" value={form.complemento} onChange={(e) => set("complemento", e.target.value)} />
              </Campo>
              <Campo id="bairro" label="Bairro">
                <Input id="bairro" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
              </Campo>
              <Campo id="cidade" label="Cidade" obrigatorio erro={erros.cidade}>
                <Input id="cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
              </Campo>
              <Campo id="estado" label="Estado" obrigatorio erro={erros.estado}>
                <Select value={form.estado} onValueChange={(v) => set("estado", v)}>
                  <SelectTrigger id="estado" className={cn(erros.estado && "border-destructive")}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS_BRASIL.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Campo>
            </CardContent>
          </Card>

          {/* Mensagem */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-olive" />
                <CardTitle className="text-lg">Mensagem</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Campo id="mensagem" label="Mensagem (opcional)" erro={erros.mensagem}>
                <Textarea
                  id="mensagem"
                  rows={4}
                  value={form.mensagem}
                  onChange={(e) => set("mensagem", e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{form.mensagem.length}/500</p>
              </Campo>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg border border-olive/30 bg-olive/5 p-3 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-olive" />
            <p>
              Após análise, você receberá confirmação por e-mail. O acesso será liberado com seu CPF e a senha
              escolhida neste formulário.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-11 bg-olive hover:bg-olive/90 text-olive-foreground"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar solicitação"
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
