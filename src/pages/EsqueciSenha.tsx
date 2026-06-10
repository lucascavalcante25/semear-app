import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampoSenha } from "@/components/ui/password-input";
import { IndicadorValidacaoSenha } from "@/components/ui/indicador-validacao-senha";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { aplicarMascaraCpf, validarCpf } from "@/lib/mascara-telefone";
import {
  concluirRecuperacaoSenha,
  iniciarRecuperacaoSenha,
  validarCodigoRecuperacao,
} from "@/modules/auth/recuperacaoSenha";
import { toast } from "sonner";

type Etapa = "cpf" | "codigo" | "senha" | "sucesso";

export default function EsqueciSenha() {
  const [etapa, setEtapa] = useState<Etapa>("cpf");
  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [infoEnvio, setInfoEnvio] = useState<{
    canal?: "EMAIL" | "SMS";
    destino?: string;
  } | null>(null);

  const cpfDigitos = cpf.replace(/\D/g, "");

  const enviarCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!validarCpf(cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }
    setCarregando(true);
    try {
      const resposta = await iniciarRecuperacaoSenha(cpfDigitos);
      if (resposta.codigoEnviado) {
        setInfoEnvio({ canal: resposta.canal, destino: resposta.destinoMascarado });
        setEtapa("codigo");
        toast.success(resposta.mensagem);
      } else {
        setErro(resposta.mensagem);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar o código.");
    } finally {
      setCarregando(false);
    }
  };

  const validarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (codigo.replace(/\D/g, "").length !== 6) {
      setErro("Informe o código de 6 dígitos.");
      return;
    }
    setCarregando(true);
    try {
      const resposta = await validarCodigoRecuperacao(cpfDigitos, codigo);
      if (resposta.codigoEnviado) {
        setEtapa("senha");
      } else {
        setErro(resposta.mensagem);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Código inválido.");
    } finally {
      setCarregando(false);
    }
  };

  const redefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (novaSenha.length < 6) {
      setErro("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }
    setCarregando(true);
    try {
      const resposta = await concluirRecuperacaoSenha(cpfDigitos, codigo, novaSenha);
      toast.success(resposta.mensagem);
      setEtapa("sucesso");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível alterar a senha.");
    } finally {
      setCarregando(false);
    }
  };

  const tituloEtapa = {
    cpf: "Recuperar senha",
    codigo: "Verificar código",
    senha: "Nova senha",
    sucesso: "Senha alterada",
  }[etapa];

  const subtituloEtapa = {
    cpf: "Informe seu CPF para receber um código de verificação.",
    codigo: "Digite o código de 6 dígitos que enviamos para você.",
    senha: "Escolha uma nova senha para sua conta.",
    sucesso: "Tudo certo! Agora você pode entrar com a nova senha.",
  }[etapa];

  return (
    <PublicPageShell titulo={tituloEtapa} subtitulo={subtituloEtapa}>
      <Card className="w-full shadow-lg">
        <CardContent className="pt-6 space-y-4">
          {etapa === "cpf" && (
            <form className="space-y-4" onSubmit={enviarCpf}>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(aplicarMascaraCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
              {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          )}

          {etapa === "codigo" && (
            <form className="space-y-4" onSubmit={validarCodigo}>
              {infoEnvio && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm flex items-start gap-2">
                  {infoEnvio.canal === "SMS" ? (
                    <Smartphone className="h-4 w-4 mt-0.5 shrink-0" />
                  ) : (
                    <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <span>
                    Código enviado para <strong>{infoEnvio.destino}</strong>
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de verificação</Label>
                <Input
                  id="codigo"
                  inputMode="numeric"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="tracking-[0.3em] text-center text-lg"
                />
              </div>
              {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? "Verificando..." : "Continuar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={carregando}
                onClick={async () => {
                  setErro(null);
                  setCodigo("");
                  setCarregando(true);
                  try {
                    const resposta = await iniciarRecuperacaoSenha(cpfDigitos);
                    if (resposta.codigoEnviado) {
                      setInfoEnvio({ canal: resposta.canal, destino: resposta.destinoMascarado });
                      toast.success("Novo código enviado!");
                    } else {
                      setErro(resposta.mensagem);
                    }
                  } catch (err) {
                    setErro(err instanceof Error ? err.message : "Não foi possível reenviar.");
                  } finally {
                    setCarregando(false);
                  }
                }}
              >
                Reenviar código
              </Button>
            </form>
          )}

          {etapa === "senha" && (
            <form className="space-y-4" onSubmit={redefinirSenha}>
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <CampoSenha
                  id="novaSenha"
                  value={novaSenha}
                  onChange={setNovaSenha}
                  autoComplete="new-password"
                  aria-label="Nova senha"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar senha</Label>
                <CampoSenha
                  id="confirmarSenha"
                  value={confirmarSenha}
                  onChange={setConfirmarSenha}
                  autoComplete="new-password"
                  aria-label="Confirmar senha"
                />
              </div>
              <IndicadorValidacaoSenha senha={novaSenha} confirmarSenha={confirmarSenha} />
              {erro && <p className="text-sm text-destructive" role="alert">{erro}</p>}
              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? "Salvando..." : "Definir nova senha"}
              </Button>
            </form>
          )}

          {etapa === "sucesso" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Sua senha foi redefinida com sucesso.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Ir para o login</Link>
              </Button>
            </div>
          )}

          {etapa !== "sucesso" && (
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </PublicPageShell>
  );
}
