import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Mail, Smartphone, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampoSenha } from "@/components/ui/password-input";
import { IndicadorValidacaoSenha } from "@/components/ui/indicador-validacao-senha";
import { aplicarMascaraCpf, validarCpf } from "@/lib/mascara-telefone";
import { MARCA } from "@/lib/plataforma";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import { cn } from "@/lib/utils";
import {
  concluirRecuperacaoSenha,
  consultarOpcoesRecuperacao,
  iniciarRecuperacaoSenha,
  validarCodigoRecuperacao,
  type CanalRecuperacao,
  type OpcoesRecuperacao,
} from "@/modules/auth/recuperacaoSenha";
import { toast } from "sonner";
import styles from "./Login.module.css";

type Etapa = "cpf" | "canal" | "codigo" | "senha" | "sucesso";

export default function EsqueciSenha() {
  useTituloDocumento({ area: "produto" });

  const [etapa, setEtapa] = useState<Etapa>("cpf");
  const [cpf, setCpf] = useState("");
  const [canalEscolhido, setCanalEscolhido] = useState<CanalRecuperacao | null>(null);
  const [opcoes, setOpcoes] = useState<OpcoesRecuperacao | null>(null);
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [infoEnvio, setInfoEnvio] = useState<{
    canal?: CanalRecuperacao;
    destino?: string;
  } | null>(null);

  const cpfDigitos = cpf.replace(/\D/g, "");

  const enviarCodigo = async (canal?: CanalRecuperacao) => {
    setErro(null);
    setCarregando(true);
    try {
      const resposta = await iniciarRecuperacaoSenha(cpfDigitos, canal);
      if (resposta.codigoEnviado) {
        setInfoEnvio({ canal: resposta.canal, destino: resposta.destinoMascarado });
        setEtapa("codigo");
        toast.success(resposta.mensagem);
      } else {
        setErro(resposta.mensagem);
        toast.error(resposta.mensagem);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível enviar o código.";
      setErro(msg);
      toast.error(msg);
    } finally {
      setCarregando(false);
    }
  };

  const continuarCpf = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!validarCpf(cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }
    setCarregando(true);
    try {
      const res = await consultarOpcoesRecuperacao(cpfDigitos);
      setOpcoes(res);

      if (!res.podeRecuperar) {
        setErro(res.mensagem);
        return;
      }

      // Push disponível: envia direto no celular (prioridade sobre e-mail/SMS)
      if (res.pushDisponivel) {
        setCanalEscolhido("PUSH");
        await enviarCodigo("PUSH");
        return;
      }

      if (res.escolhaNecessaria) {
        if (res.emailDisponivel && !res.smsDisponivel) {
          setCanalEscolhido("EMAIL");
        } else if (!res.emailDisponivel && res.smsDisponivel) {
          setCanalEscolhido("SMS");
        } else {
          setCanalEscolhido(null);
        }
        setEtapa("canal");
        return;
      }

      const canalUnico: CanalRecuperacao = res.emailDisponivel ? "EMAIL" : "SMS";
      setCanalEscolhido(canalUnico);
      setEtapa("canal");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível consultar o cadastro.");
    } finally {
      setCarregando(false);
    }
  };

  const canalEnvioDisponivel = (canal: CanalRecuperacao) => {
    if (canal === "PUSH") return Boolean(opcoes?.pushDisponivel);
    if (canal === "EMAIL") return Boolean(opcoes?.emailDisponivel);
    return Boolean(opcoes?.smsDisponivel);
  };

  const confirmarCanal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (opcoes?.escolhaNecessaria && !canalEscolhido) {
      setErro("Escolha e-mail ou SMS para receber o código.");
      return;
    }

    if (canalEscolhido && !canalEnvioDisponivel(canalEscolhido)) {
      setErro(
        canalEscolhido === "PUSH"
          ? "Notificação no celular indisponível. Escolha outro canal."
          : canalEscolhido === "SMS"
            ? "O envio por SMS não está disponível no momento. Escolha outro canal."
            : "O envio por e-mail não está disponível no momento. Escolha outro canal.",
      );
      return;
    }

    const canal =
      canalEscolhido ??
      (opcoes?.pushDisponivel ? "PUSH" : opcoes?.emailDisponivel ? "EMAIL" : "SMS");
    await enviarCodigo(canal);
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

  const titulos: Record<Etapa, string> = {
    cpf: "Recuperar senha",
    canal: "Como receber o código?",
    codigo: "Verificar código",
    senha: "Nova senha",
    sucesso: "Senha alterada",
  };

  const subtitulos: Record<Etapa, string> = {
    cpf: "Informe seu CPF para localizar seu cadastro.",
    canal: opcoes?.mensagem ?? "Escolha o canal de envio do código.",
    codigo: "Digite o código de 6 dígitos que enviamos para você.",
    senha: "Escolha uma nova senha para sua conta.",
    sucesso: "Tudo certo! Agora você pode entrar com a nova senha.",
  };

  return (
    <div className={styles.recoverRoot} role="main" aria-label="Recuperação de senha">
      <div className={styles.recoverShell}>
        <Link to="/login" className={styles.recoverBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar ao login
        </Link>

        <div className={styles.recoverCard}>
          <div className={styles.recoverLogoWrap}>
            <img src={MARCA.logoLogin} alt={MARCA.nome} className={styles.recoverLogo} />
          </div>

          <div className={styles.recoverHeader}>
            <div className={styles.recoverIconBadge} aria-hidden>
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className={styles.recoverTitle}>{titulos[etapa]}</h1>
            <p className={styles.recoverSubtitle}>{subtitulos[etapa]}</p>
          </div>

          {etapa === "cpf" && (
            <form className={styles.recoverForm} onSubmit={continuarCpf}>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(aplicarMascaraCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  autoFocus
                />
              </div>
              {erro && (
                <p className={styles.recoverError} role="alert">
                  {erro}
                </p>
              )}
              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? "Consultando..." : "Continuar"}
              </Button>
            </form>
          )}

          {etapa === "canal" && opcoes && (
            <form className={styles.recoverForm} onSubmit={confirmarCanal}>
              {opcoes.escolhaNecessaria ? (
                <div className={styles.canalGrid} role="radiogroup" aria-label="Canal de envio">
                  {opcoes.pushDisponivel && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={canalEscolhido === "PUSH"}
                      className={cn(
                        styles.canalOption,
                        canalEscolhido === "PUSH" && styles.canalOptionActive,
                      )}
                      onClick={() => setCanalEscolhido("PUSH")}
                    >
                      <Bell className="h-5 w-5 shrink-0" aria-hidden />
                      <span>
                        <strong>Notificação no celular</strong>
                        <small>
                          {opcoes.dispositivosPushAtivos ?? 1} dispositivo(s) — gratuito via app
                        </small>
                      </span>
                    </button>
                  )}
                  {opcoes.emailMascarado && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={canalEscolhido === "EMAIL"}
                      aria-disabled={!opcoes.emailDisponivel}
                      disabled={!opcoes.emailDisponivel}
                      className={cn(
                        styles.canalOption,
                        canalEscolhido === "EMAIL" && styles.canalOptionActive,
                        !opcoes.emailDisponivel && styles.canalOptionDisabled,
                      )}
                      onClick={() => opcoes.emailDisponivel && setCanalEscolhido("EMAIL")}
                    >
                      <Mail className="h-5 w-5 shrink-0" aria-hidden />
                      <span>
                        <strong>E-mail</strong>
                        <small>{opcoes.emailMascarado}</small>
                        {!opcoes.emailDisponivel && (
                          <small className={styles.canalIndisponivel}>Indisponível no momento</small>
                        )}
                      </span>
                    </button>
                  )}
                  {opcoes.telefoneMascarado && (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={canalEscolhido === "SMS"}
                      aria-disabled={!opcoes.smsDisponivel}
                      disabled={!opcoes.smsDisponivel}
                      className={cn(
                        styles.canalOption,
                        canalEscolhido === "SMS" && styles.canalOptionActive,
                        !opcoes.smsDisponivel && styles.canalOptionDisabled,
                      )}
                      onClick={() => opcoes.smsDisponivel && setCanalEscolhido("SMS")}
                    >
                      <Smartphone className="h-5 w-5 shrink-0" aria-hidden />
                      <span>
                        <strong>SMS</strong>
                        <small>{opcoes.telefoneMascarado}</small>
                        {!opcoes.smsDisponivel && (
                          <small className={styles.canalIndisponivel}>Indisponível no momento</small>
                        )}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.canalInfo}>
                  {opcoes.pushDisponivel ? (
                    <Bell className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  ) : opcoes.smsDisponivel ? (
                    <Smartphone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  )}
                  <p>{opcoes.mensagem}</p>
                </div>
              )}

              {erro && (
                <p className={styles.recoverError} role="alert">
                  {erro}
                </p>
              )}
              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? "Enviando..." : "Enviar código"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={carregando}
                onClick={() => {
                  setErro(null);
                  setOpcoes(null);
                  setEtapa("cpf");
                }}
              >
                Alterar CPF
              </Button>
            </form>
          )}

          {etapa === "codigo" && (
            <form className={styles.recoverForm} onSubmit={validarCodigo}>
              {infoEnvio && (
                <div className={styles.canalInfo}>
                  {infoEnvio.canal === "PUSH" ? (
                    <Bell className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  ) : infoEnvio.canal === "SMS" ? (
                    <Smartphone className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  )}
                  <p>
                    Código enviado para <strong>{infoEnvio.destino}</strong>
                  </p>
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
                  autoFocus
                  className="tracking-[0.35em] text-center text-xl font-semibold"
                />
              </div>
              {erro && (
                <p className={styles.recoverError} role="alert">
                  {erro}
                </p>
              )}
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
                  const canal = canalEscolhido ?? (opcoes?.emailDisponivel ? "EMAIL" : "SMS");
                  await enviarCodigo(canal);
                }}
              >
                Reenviar código
              </Button>
            </form>
          )}

          {etapa === "senha" && (
            <form className={styles.recoverForm} onSubmit={redefinirSenha}>
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
              {erro && (
                <p className={styles.recoverError} role="alert">
                  {erro}
                </p>
              )}
              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? "Salvando..." : "Definir nova senha"}
              </Button>
            </form>
          )}

          {etapa === "sucesso" && (
            <div className={styles.recoverForm}>
              <p className="text-sm text-center text-muted-foreground">
                Sua senha foi redefinida com sucesso.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Ir para o login</Link>
              </Button>
            </div>
          )}
        </div>

        <p className={styles.recoverFooter}>{MARCA.creditoRodape}</p>
      </div>
    </div>
  );
}
