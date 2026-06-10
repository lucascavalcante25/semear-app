import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicPageShell } from "@/components/layout/PublicPageShell";
import { Lock, MessageCircle } from "lucide-react";

export default function AssinaturaBloqueada() {
  return (
    <PublicPageShell
      titulo="Acesso temporariamente bloqueado"
      subtitulo="O período de teste da sua igreja terminou. Para continuar usando a plataforma, entre em contato com o suporte e ative sua assinatura."
    >
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
            <Lock className="h-7 w-7 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Assinatura necessária</CardTitle>
          <CardDescription className="text-base">
            Seu teste grátis encerrou ou o acesso foi suspenso. Fale com nossa equipe para ativar o Plano Completo e
            continuar organizando sua igreja.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full gap-2">
            <Link to="/suporte">
              <MessageCircle className="h-4 w-4" />
              Falar com suporte
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Voltar ao login</Link>
          </Button>
        </CardContent>
      </Card>
    </PublicPageShell>
  );
}
