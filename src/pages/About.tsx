import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Church } from "lucide-react";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { MARCA, PLATAFORMA } from "@/lib/plataforma";
import { CreditoEmpresa } from "@/components/brand/CreditoEmpresa";

export default function Sobre() {
  const { nomeExibicao, configuracao, publica } = useIgrejaConfiguracao();
  const descricao =
    configuracao?.descricaoIgreja?.trim() || publica.descricaoIgreja?.trim() || "";

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Church className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">{nomeExibicao}</h1>
          <p className="text-sm text-muted-foreground">
            Aplicativo da igreja · {MARCA.nome}
          </p>
        </div>

        {descricao && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {descricao}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">Sobre o app</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {MARCA.descricaoCurta}
            </p>
            <p className="text-xs text-muted-foreground">Versão 1.1.0</p>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <CreditoEmpresa />
          <p className="text-xs text-muted-foreground mt-2">
            {PLATAFORMA.contato.telefoneExibicao} · {PLATAFORMA.contato.email}
          </p>
        </div>
      </div>
    </LayoutApp>
  );
}
