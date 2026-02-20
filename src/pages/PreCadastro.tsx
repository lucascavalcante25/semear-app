import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Eye, EyeOff } from "lucide-react";
import {
  enviarPreCadastro,
  type PreCadastroPayload,
  type SexoCadastro,
} from "@/modules/auth/preCadastro";
import { buscarCep } from "@/lib/viacep";
import {
  aplicarMascaraCep,
  aplicarMascaraCpf,
  aplicarMascaraTelefone,
  validarCpf,
  validarEmail,
} from "@/lib/mascara-telefone";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

const estadosUf = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const opcoesSexo: Array<{ value: SexoCadastro; label: string }> = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
];

export default function PreCadastro() {
  const [formulario, setFormulario] = useState<PreCadastroPayload>({
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
    perfilSolicitado: "membro",
    observacoes: "",
    endereco: {
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "SP",
      cep: "",
    },
  });
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [erroCep, setErroCep] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const atualizarCampo = (field: keyof PreCadastroPayload, value: string) => {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  };

  const atualizarEndereco = (field: keyof PreCadastroPayload["endereco"], value: string) => {
    setFormulario((prev) => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
  };

  const buscarCepHandler = async () => {
    const cep = formulario.endereco.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setErroCep("Informe um CEP válido com 8 dígitos.");
      return;
    }
    setBuscandoCep(true);
    setErroCep(null);
    try {
      const dados = await buscarCep(cep);
      if (dados) {
        const cepFormatado = aplicarMascaraCep(dados.cep.replace(/\D/g, ""));
        setFormulario((prev) => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: cepFormatado,
            logradouro: dados.logradouro ?? prev.endereco.logradouro,
            bairro: dados.bairro ?? prev.endereco.bairro,
            cidade: dados.localidade ?? prev.endereco.cidade,
            estado: dados.uf ?? prev.endereco.estado,
          },
        }));
      } else {
        setErroCep("CEP não encontrado.");
      }
    } catch {
      setErroCep("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setBuscandoCep(false);
    }
  };

  const senhasNaoConferem =
    !!formulario.senha && !!confirmarSenha && formulario.senha !== confirmarSenha;

  const validarSenha = (senha: string) => {
    const minLength = senha.length >= 8;
    const temNumero = /\d/.test(senha);
    const temLetra = /[A-Za-z]/.test(senha);
    return minLength && temNumero && temLetra;
  };

  const enviarFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTentouEnviar(true);
    setErro(null);

    const cpfDigits = formulario.cpf.replace(/\D/g, "");
    if (!validarCpf(formulario.cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }
    if (!validarEmail(formulario.email)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (!validarSenha(formulario.senha)) {
      setErro("A senha deve ter ao menos 8 caracteres, incluindo letras e números.");
      return;
    }

    if (formulario.senha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setEnviando(true);
    try {
      await enviarPreCadastro({
        ...formulario,
        cpf: cpfDigits,
        email: formulario.email.trim().toLowerCase(),
        perfilSolicitado: "membro",
      });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao enviar pre-cadastro.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-start">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Pre-cadastro</h1>
            <p className="text-sm text-muted-foreground">
              Seus dados serao analisados. O acesso so sera liberado pelo administrador.
            </p>
          </div>

          {enviado ? (
            <div className="space-y-4 text-center">
              <p className="text-sm">
                Pre-cadastro enviado! Aguarde a aprovacao do administrador.
              </p>
              <Button asChild>
                <Link to="/login">Voltar para o login</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={enviarFormulario}>
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Dados pessoais
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nomeCompleto">Nome completo *</Label>
                    <Input
                      id="nomeCompleto"
                      value={formulario.nomeCompleto}
                      onChange={(event) => atualizarCampo("nomeCompleto", event.target.value)}
                      required
                      className={cn(
                        tentouEnviar && !formulario.nomeCompleto.trim() && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formulario.cpf}
                      onChange={(e) => atualizarCampo("cpf", aplicarMascaraCpf(e.target.value))}
                      required
                      className={cn(
                        tentouEnviar && (!formulario.cpf.trim() || !validarCpf(formulario.cpf)) && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={formulario.email}
                      onChange={(event) => atualizarCampo("email", event.target.value)}
                      required
                      className={cn(
                        tentouEnviar && (!formulario.email.trim() || !validarEmail(formulario.email)) && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                    <DatePicker
                      id="dataNascimento"
                      value={formulario.dataNascimento}
                      onChange={(v) => atualizarCampo("dataNascimento", v)}
                      placeholder="dd/mm/aaaa"
                      className={cn(
                        tentouEnviar && !formulario.dataNascimento && "[&_input]:border-destructive [&_input]:focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select
                      value={formulario.sexo}
                      onValueChange={(value) => atualizarCampo("sexo", value)}
                    >
                      <SelectTrigger id="sexo">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoesSexo.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Todo pré-cadastro entra como <span className="font-medium">Membro</span>. O administrador
                      definirá o perfil correto na aprovação.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Contato
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone principal *</Label>
                    <Input
                      id="telefone"
                      placeholder="(00) 00000-0000"
                      value={formulario.telefone}
                      onChange={(e) =>
                        atualizarCampo("telefone", aplicarMascaraTelefone(e.target.value))
                      }
                      required
                      className={cn(
                        tentouEnviar && !formulario.telefone.replace(/\D/g, "").length && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefoneSecundario">Telefone secundario</Label>
                    <Input
                      id="telefoneSecundario"
                      placeholder="(00) 00000-0000"
                      value={formulario.telefoneSecundario}
                      onChange={(e) =>
                        atualizarCampo("telefoneSecundario", aplicarMascaraTelefone(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefoneEmergencia">Telefone de emergencia</Label>
                    <Input
                      id="telefoneEmergencia"
                      placeholder="(00) 00000-0000"
                      value={formulario.telefoneEmergencia}
                      onChange={(e) =>
                        atualizarCampo("telefoneEmergencia", aplicarMascaraTelefone(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeContatoEmergencia">Nome do contato de emergencia *</Label>
                    <Input
                      id="nomeContatoEmergencia"
                      value={formulario.nomeContatoEmergencia}
                      onChange={(e) => atualizarCampo("nomeContatoEmergencia", e.target.value)}
                      required
                      className={cn(
                        tentouEnviar && !formulario.nomeContatoEmergencia.trim() && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Endereco
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={formulario.endereco.cep}
                        onChange={(e) =>
                          atualizarEndereco("cep", aplicarMascaraCep(e.target.value))
                        }
                        onBlur={() => {
                          if (formulario.endereco.cep.replace(/\D/g, "").length === 8) {
                            buscarCepHandler();
                          }
                        }}
                        required
                        className={cn(
                          tentouEnviar && formulario.endereco.cep.replace(/\D/g, "").length !== 8 && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        title="Buscar endereço pelo CEP"
                        onClick={buscarCepHandler}
                        disabled={buscandoCep || formulario.endereco.cep.replace(/\D/g, "").length !== 8}
                      >
                        {buscandoCep ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="text-xs text-destructive whitespace-nowrap">
                        {erroCep ?? ""}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                      id="logradouro"
                      value={formulario.endereco.logradouro}
                      onChange={(event) => atualizarEndereco("logradouro", event.target.value)}
                      required
                      className={cn(
                        tentouEnviar && !formulario.endereco.logradouro.trim() && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Numero *</Label>
                    <Input
                      id="numero"
                      value={formulario.endereco.numero}
                      onChange={(event) => atualizarEndereco("numero", event.target.value)}
                      required
                      className={cn(
                        tentouEnviar && !formulario.endereco.numero.trim() && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formulario.endereco.complemento ?? ""}
                      onChange={(event) => atualizarEndereco("complemento", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={formulario.endereco.bairro}
                      onChange={(event) => atualizarEndereco("bairro", event.target.value)}
                      required
                      className={cn(
                        tentouEnviar && !formulario.endereco.bairro.trim() && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={formulario.endereco.cidade}
                      onChange={(event) => atualizarEndereco("cidade", event.target.value)}
                      required
                      className={cn(
                        tentouEnviar && !formulario.endereco.cidade.trim() && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formulario.endereco.estado}
                      onValueChange={(value) => atualizarEndereco("estado", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadosUf.map((estado) => (
                          <SelectItem key={estado} value={estado}>
                            {estado}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Credenciais
                </h2>
                <p className="text-sm text-muted-foreground">
                  O login sera feito com o CPF informado acima.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={mostrarSenha ? "text" : "password"}
                        value={formulario.senha}
                        onChange={(event) => atualizarCampo("senha", event.target.value)}
                        placeholder="Minimo 8 caracteres, letras e numeros"
                        required
                        className={cn(
                          "pr-10",
                          (tentouEnviar && !formulario.senha) && "border-destructive focus-visible:ring-destructive",
                          senhasNaoConferem && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                        title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {mostrarSenha ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={mostrarConfirmarSenha ? "text" : "password"}
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder="Repita a senha"
                        required
                        className={cn(
                          "pr-10",
                          (tentouEnviar && !confirmarSenha) && "border-destructive focus-visible:ring-destructive",
                          senhasNaoConferem && "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmarSenha((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                        title={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {mostrarConfirmarSenha ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {senhasNaoConferem && (
                      <p className="text-sm text-destructive">As senhas não conferem.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observacoes</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Opcional"
                  value={formulario.observacoes ?? ""}
                  onChange={(event) => atualizarCampo("observacoes", event.target.value)}
                  rows={3}
                />
              </div>

              {erro && <p className="text-sm text-destructive">{erro}</p>}

              <Button className="w-full" type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar pre-cadastro"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
