import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { aplicarMascaraCpf } from "@/lib/mascara-telefone";
import { Eye, EyeOff } from "lucide-react";
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
  const { login, user, defaultRoute } = usarAutenticacao();
  const { publica, logoUrl, nomeExibicao } = useIgrejaConfiguracao();
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
    const target = state?.from?.pathname || defaultRoute;
    navigate(target, { replace: true });
  };

  return (
    <div className={styles.root} role="main" aria-label="Página de login">
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      {showSplash && (
        <div
          className={`${styles.splash} ${splashHiding ? styles.hiding : ""}`}
          aria-hidden="true"
        >
          <img
            src={logoUrl}
            alt={nomeExibicao}
            className={styles.splashLogo}
          />
        </div>
      )}

      {!showSplash && (
        <div className={`${styles.content} ${styles.formWrapper}`}>
          <div className={styles.card}>
            <div className="space-y-2 text-center mb-6">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <img
                    src={logoUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-8 w-8 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">Bem-vindo(a)</h1>
              <p className="text-sm text-white/80">
                Entre para acessar as áreas da igreja
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="identificador"
                  className="text-white/90 text-sm font-medium"
                >
                  CPF
                </Label>
                <Input
                  id="identificador"
                  type="text"
                  value={identificador}
                  onChange={(e) =>
                    setIdentificador(aplicarMascaraCpf(e.target.value))
                  }
                  placeholder="000.000.000-00"
                  autoComplete="username"
                  maxLength={14}
                  required
                  aria-label="CPF"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/40 focus-visible:border-white/30"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-white/90 text-sm font-medium"
                  >
                    Senha
                  </Label>
                  <Link
                    to="/esqueci-senha"
                    className="text-xs text-white/70 hover:text-white underline-offset-2 hover:underline"
                  >
                    Esqueceu sua senha?
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
                    className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/40 focus-visible:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-black/20 text-white hover:bg-black/30 transition-colors"
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
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

              {error && (
                <p
                  className="text-sm text-red-300"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}

              <Button
                className="w-full bg-[hsl(80,40%,35%)] text-white hover:bg-[hsl(80,45%,28%)] shadow-md border-0"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>

              <p className={styles.securityNote}>
                🔒 Seus dados estão protegidos
              </p>

              <Button
                asChild
                variant="outline"
                className="w-full !bg-transparent border-2 border-white/50 !text-white hover:!bg-white/15 hover:!text-white hover:border-white/70"
              >
                <Link to="/pre-cadastro">Primeiro acesso / Pre-cadastro</Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full !text-white/90 hover:!bg-white/10 hover:!text-white"
              >
                <Link to="/solicitar-acesso">Quero cadastrar minha igreja</Link>
              </Button>
            </form>
          </div>

          <div className={styles.typewriterWrapper} aria-live="polite">
            <p className={styles.typewriterText}>
              {typewriterText}
              {isTyping && <span className={styles.typewriterCursor} aria-hidden />}
            </p>
          </div>

          <p className={styles.churchName}>{publica.nome || nomeExibicao}</p>
          {publica.descricaoIgreja && (
            <p className={styles.churchSlogan}>{publica.descricaoIgreja}</p>
          )}
        </div>
      )}
    </div>
  );
}
