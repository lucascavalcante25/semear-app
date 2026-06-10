import { Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { podeAcessarSuporte } from "@/auth/permissions";
import { TEXTO_SUPORTE } from "@/lib/plataforma";

export function CardAjudaSuporte() {
  const { user } = usarAutenticacao();
  if (!podeAcessarSuporte(user)) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">Precisa de ajuda?</p>
            <p className="text-sm text-muted-foreground">
              {TEXTO_SUPORTE.cardAjuda}
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/suporte">Abrir solicitação</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
