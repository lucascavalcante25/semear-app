import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type Role } from "@/auth/permissions";
import {
  enviarPreCadastro,
  type PreCadastroPayload,
  type SexoCadastro,
} from "@/modules/auth/preCadastro";

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

const perfisSolicitaveis: Role[] = [
  "membro",
  "visitante",
  "lider",
  "pastor",
  "secretaria",
  "tesouraria",
  "admin",
];

const opcoesSexo: Array<{ value: SexoCadastro; label: string }> = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
  { value: "OUTRO", label: "Outro" },
  { value: "NAO_INFORMADO", label: "Prefiro não informar" },
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
    sexo: "NAO_INFORMADO",
    dataNascimento: "",
    login: "",
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

  const atualizarCampo = (field: keyof PreCadastroPayload, value: string) => {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  };

  const atualizarEndereco = (field: keyof PreCadastroPayload["endereco"], value: string) => {
    setFormulario((prev) => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
  };

  const validarSenha = (senha: string) => {
    const minLength = senha.length >= 8;
    const temNumero = /\d/.test(senha);
    const temLetra = /[A-Za-z]/.test(senha);
    return minLength && temNumero && temLetra;
  };

  const enviarFormulario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    const loginInformado = formulario.login.trim() || formulario.cpf.trim() || formulario.email.trim();
    if (!loginInformado) {
      setErro("Informe o CPF ou e-mail para login.");
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
        login: loginInformado,
        email: formulario.email.trim().toLowerCase(),
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
                    <Label htmlFor="nomeCompleto">Nome completo</Label>
                    <Input
                      id="nomeCompleto"
                      value={formulario.nomeCompleto}
                      onChange={(event) => atualizarCampo("nomeCompleto", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formulario.cpf}
                      onChange={(event) => atualizarCampo("cpf", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formulario.email}
                      onChange={(event) => atualizarCampo("email", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      value={formulario.dataNascimento}
                      onChange={(event) => atualizarCampo("dataNascimento", event.target.value)}
                      required
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
                    <Label>Perfil solicitado</Label>
                    <Select
                      value={formulario.perfilSolicitado}
                      onValueChange={(value) => atualizarCampo("perfilSolicitado", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        {perfisSolicitaveis.map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Contato
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone principal</Label>
                    <Input
                      id="telefone"
                      value={formulario.telefone}
                      onChange={(event) => atualizarCampo("telefone", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefoneSecundario">Telefone secundario</Label>
                    <Input
                      id="telefoneSecundario"
                      value={formulario.telefoneSecundario}
                      onChange={(event) =>
                        atualizarCampo("telefoneSecundario", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefoneEmergencia">Telefone de emergencia</Label>
                    <Input
                      id="telefoneEmergencia"
                      value={formulario.telefoneEmergencia}
                      onChange={(event) =>
                        atualizarCampo("telefoneEmergencia", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeContatoEmergencia">
                      Nome do contato de emergencia
                    </Label>
                    <Input
                      id="nomeContatoEmergencia"
                      value={formulario.nomeContatoEmergencia}
                      onChange={(event) =>
                        atualizarCampo("nomeContatoEmergencia", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Endereco
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      value={formulario.endereco.logradouro}
                      onChange={(event) => atualizarEndereco("logradouro", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Numero</Label>
                    <Input
                      id="numero"
                      value={formulario.endereco.numero}
                      onChange={(event) => atualizarEndereco("numero", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formulario.endereco.complemento}
                      onChange={(event) => atualizarEndereco("complemento", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formulario.endereco.bairro}
                      onChange={(event) => atualizarEndereco("bairro", event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formulario.endereco.cidade}
                      onChange={(event) => atualizarEndereco("cidade", event.target.value)}
                      required
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
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formulario.endereco.cep}
                      onChange={(event) => atualizarEndereco("cep", event.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Credenciais
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="login">CPF ou e-mail (login)</Label>
                    <Input
                      id="login"
                      value={formulario.login}
                      onChange={(event) => atualizarCampo("login", event.target.value)}
                      placeholder="CPF ou seuemail@semear.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formulario.senha}
                      onChange={(event) => atualizarCampo("senha", event.target.value)}
                      placeholder="Minimo 8 caracteres"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={confirmarSenha}
                      onChange={(event) => setConfirmarSenha(event.target.value)}
                      placeholder="Repita a senha"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observacoes</Label>
                <Input
                  id="observacoes"
                  value={formulario.observacoes ?? ""}
                  onChange={(event) => atualizarCampo("observacoes", event.target.value)}
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
