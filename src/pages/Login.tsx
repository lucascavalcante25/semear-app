import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { aplicarMascaraCpf } from "@/lib/mascara-telefone";
import { MARCA } from "@/lib/plataforma";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import { Church, DoorOpen, Eye, EyeOff } from "lucide-react";
import styles from "./Login.module.css";

const PASSAGENS_BIBLICAS = [
  { texto: "Eu posso tudo naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "O Senhor é meu pastor; nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Não temas, porque eu sou contigo.", ref: "Isaías 41:10" },
  { texto: "Para Deus nada é impossível.", ref: "Lucas 1:37" },
  { texto: "Buscai primeiro o reino de Deus e a sua justiça.", ref: "Mateus 6:33" },
  { texto: "O amor é paciente, o amor é bondoso.", ref: "1 Coríntios 13:4" },
  { texto: "Confia no Senhor de todo o teu coração.", ref: "Provérbios 3:5" },
  { texto: "A paz de Deus guardará o vosso coração.", ref: "Filipenses 4:7" },
  { texto: "Deus é o nosso refúgio e fortaleza.", ref: "Salmos 46:1" },
  { texto: "Vinde a mim, todos os que estais cansados.", ref: "Mateus 11:28" },
];

function getPassagemDoDia() {
  const d = new Date();
  const idx = (d.getDate() + d.getMonth()) % PASSAGENS_BIBLICAS.length;
  return PASSAGENS_BIBLICAS[idx];
}

type LocationState = {
  from?: { pathname?: string };
};

export default function Entrar() {
  useTituloDocumento({ area: "produto" });
  const { login, user, defaultRoute } = usarAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSplash, setShowSplash] = useState(true);
  const [splashHiding, setSplashHiding] = useState(false);

  const passagemDoDia = useMemo(() => getPassagemDoDia(), []);
  const [typewriterText, setTypewriterText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (user) {
      navigate(defaultRoute, { replace: true });
    }
  }, [user, defaultRoute, navigate]);

  useEffect(() => {
    if (!showSplash) return;
    const t1 = setTimeout(() => setSplashHiding(true), 1200);
    const t2 = setTimeout(() => setShowSplash(false), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showSplash]);

  useEffect(() => {
    if (showSplash) return;
    const fullText = `"${passagemDoDia.texto}" — ${passagemDoDia.ref}`;
    const speed = 70;
    const pauseAfter = 3500;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = (idx: number) => {
      if (cancelled) return;
      if (idx <= fullText.length) {
        setTypewriterText(fullText.slice(0, idx));
        timeoutId = setTimeout(() => type(idx + 1), speed);
      } else {
        setIsTyping(false);
        timeoutId = setTimeout(() => {
          if (cancelled) return;
          setTypewriterText("");
          setIsTyping(true);
          timeoutId = setTimeout(() => type(0), 400);
        }, pauseAfter);
      }
    };

    timeoutId = setTimeout(() => type(0), 600);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [showSplash, passagemDoDia]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(identificador.trim(), password);
    if (!result.success) {
      setError(result.message ?? "Falha ao entrar.");
      setIsSubmitting(false);
      return;
    }

    const state = location.state as LocationState | null;
    const target = state?.from?.pathname || result.redirectTo || defaultRoute;
    navigate(target, { replace: true });
  };

  return (
    <div className={styles.root} role="main" aria-label="Página de login">
      {showSplash && (
        <div
          className={`${styles.splash} ${splashHiding ? styles.hiding : ""}`}
          aria-hidden="true"
        >
          <img
            src={MARCA.logoLogin}
            alt={MARCA.nome}
            className={styles.splashLogo}
          />
          <span className={styles.splashNome}>{MARCA.nome}</span>
        </div>
      )}

      {!showSplash && (
        <>
          <header className={styles.topNav}>
            <Link to="/" className={styles.navBrand}>
              <img
                src={MARCA.logoIcon}
                alt=""
                aria-hidden="true"
                className={styles.navBrandIcon}
              />
              <span>{MARCA.nome}</span>
            </Link>
            <nav className={styles.navLinks} aria-label="Navegação pública">
              <Link to="/" className={styles.navLink}>
                Início
              </Link>
              <Link
                to="/solicitar-acesso"
                className={styles.navLinkPrimary}
                title="Cadastro e teste grátis para pastor, tesoureiro ou responsável pela igreja"
              >
                Admin da igreja — teste grátis
              </Link>
            </nav>
          </header>

          <div className={`${styles.splitShell} ${styles.formWrapper}`}>
            <div className={styles.loginFrame}>
              <aside className={styles.brandPanel} aria-label="Sobre a plataforma">
                <div className={styles.brandPanelIconWrap} aria-hidden="true">
                  <Church className={styles.brandPanelChurchIcon} strokeWidth={1.75} />
                </div>
                <h1 className={styles.brandPanelTitle}>{MARCA.nome}</h1>
              <p className={styles.brandPanelSlogan}>{MARCA.slogan}</p>
              <p className={styles.brandPanelDesc}>{MARCA.descricaoCurta}</p>
              <p className={styles.brandPanelVerse} aria-live="polite">
                {typewriterText}
                {isTyping && <span className={styles.typewriterCursor} aria-hidden />}
              </p>
              </aside>

              <div className={styles.loginColumn}>
              <div className={styles.loginShell}>
                <div className={styles.card}>
                  <div className={styles.logoInCard}>
                    <img
                      src={MARCA.logoLogin}
                      alt={MARCA.nome}
                      className={styles.brandLogo}
                    />
                  </div>

                  <div className="space-y-1 text-center mb-6">
                    <h1 className={styles.cardTitle}>Login</h1>
                    <p className={styles.cardSubtitle}>
                      Entre com CPF e senha. Se você é membro, use os dados enviados pela igreja.
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className={styles.credentialsRow}>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="identificador" className="text-slate-700 text-sm font-medium">
                          CPF
                        </Label>
                        <Input
                          id="identificador"
                          type="text"
                          value={identificador}
                          onChange={(e) => setIdentificador(aplicarMascaraCpf(e.target.value))}
                          placeholder="000.000.000-00"
                          autoComplete="username"
                          maxLength={14}
                          required
                          aria-label="CPF"
                        />
                      </div>

                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                            Senha
                          </Label>
                          <Link
                            to="/esqueci-senha"
                            className="text-xs text-primary hover:text-primary/80 underline-offset-2 hover:underline shrink-0"
                          >
                            Esqueceu?
                          </Link>
                        </div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={mostrarSenha ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            aria-label="Senha"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-500 hover:bg-slate-100 transition-colors"
                            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                          >
                            {mostrarSenha ? (
                              <EyeOff className="h-4 w-4" aria-hidden />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className={styles.submitColumn}>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className={styles.submitButton}
                        >
                          {isSubmitting ? (
                            "Entrando..."
                          ) : (
                            <>
                              <DoorOpen className="h-4 w-4 shrink-0" aria-hidden />
                              Entrar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600" role="alert" aria-live="polite">
                        {error}
                      </p>
                    )}

                    <p className={styles.securityNote}>🔒 Seus dados estão protegidos</p>

                    <div className={styles.accessSection}>
                      <p className={styles.accessSectionTitle}>Ainda não tem acesso?</p>

                      <div className={styles.accessSectionGrid}>
                        <div className={styles.accessOption}>
                          <p className={styles.accessOptionLabel}>Sou membro da igreja</p>
                          <p className={styles.accessOptionHint}>
                            Primeiro acesso ou cadastro como membro da congregação.
                          </p>
                          <Button asChild variant="outline" className="w-full">
                            <Link to="/pre-cadastro">Pré-cadastro de membro</Link>
                          </Button>
                        </div>

                        <div className={styles.accessOptionAdmin}>
                          <p className={styles.accessOptionLabel}>Sou administrador da igreja</p>
                          <p className={styles.accessOptionHint}>
                            Pastor, tesoureiro ou responsável — solicite teste grátis de 7 dias.
                          </p>
                          <Button asChild variant="secondary" className="w-full">
                            <Link to="/solicitar-acesso">Teste grátis — admin da igreja</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              </div>
            </div>

            <div className={styles.typewriterMobile} aria-live="polite">
              <p className={styles.typewriterMobileText}>
                {typewriterText}
                {isTyping && <span className={styles.typewriterCursorDark} aria-hidden />}
              </p>
            </div>

            <p className={styles.platformFooter}>
              {MARCA.nome} · {MARCA.empresa}
            </p>
          </div>
        </>
      )}
    </div>
  );
}