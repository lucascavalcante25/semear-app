import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { aplicarMascaraCpf } from "@/lib/mascara-telefone";
import { Eye, EyeOff } from "lucide-react";

type LocationState = {
  from?: { pathname?: string };
};

export default function Entrar() {
  const { login, user, defaultRoute } = usarAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(defaultRoute, { replace: true });
    }
  }, [user, defaultRoute, navigate]);

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive-light/60 ring-1 ring-olive/20">
                <img
                  src="/logo-semear.png"
                  alt="Semear"
                  className="h-8 w-8 object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo(a)</h1>
            <p className="text-sm text-muted-foreground">
              Entre para acessar as áreas da igreja
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="identificador">CPF</Label>
              <Input
                id="identificador"
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(aplicarMascaraCpf(e.target.value))}
                placeholder="000.000.000-00"
                autoComplete="username"
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={mostrarSenha ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pr-10"
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link to="/pre-cadastro">Primeiro acesso / Pre-cadastro</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
