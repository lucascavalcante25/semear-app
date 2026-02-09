import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usarAutenticacao } from "@/contexts/AuthContext";

type LocationState = {
  from?: { pathname?: string };
};

export default function Entrar() {
  const { login, user, defaultRoute } = usarAutenticacao();
  const navigate = useNavigate();
  const location = useLocation();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
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
            <h1 className="text-2xl font-bold">Bem-vindo(a)</h1>
            <p className="text-sm text-muted-foreground">
              Entre para acessar as áreas da igreja
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="identificador">CPF ou e-mail</Label>
              <Input
                id="identificador"
                type="text"
                value={identificador}
                onChange={(event) => setIdentificador(event.target.value)}
                placeholder="CPF ou seuemail@semear.com"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
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
