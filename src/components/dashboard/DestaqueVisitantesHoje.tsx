import { useEffect, useState } from "react";
import { UserPlus, ChevronRight, Church } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listarVisitantesDoDia, textoFormaChegada, type VisitanteApp } from "@/modules/visitors/api";
import { Link } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";

export function DestaqueVisitantesHoje() {
  const { user } = usarAutenticacao();
  const [lista, setLista] = useState<VisitanteApp[]>([]);
  const [carregando, setCarregando] = useState(true);

  const temAcessoVisitantes = canAccess(user, "/visitantes");

  useEffect(() => {
    if (!temAcessoVisitantes) {
      setCarregando(false);
      return;
    }
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarVisitantesDoDia();
        setLista(dados);
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [temAcessoVisitantes]);

  if (!temAcessoVisitantes || carregando || lista.length === 0) return null;

  return (
    <Card className="overflow-hidden border-2 border-deep-blue/35 shadow-md">
      {/* Faixa superior com cor sólida — melhor contraste que gradiente claro */}
      <div className="flex items-start justify-between gap-3 border-b border-deep-blue/20 bg-deep-blue-light/80 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-deep-blue text-deep-blue-foreground shadow-sm">
            <Church className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-deep-blue">
              Culto de hoje
            </p>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              {lista.length === 1
                ? "Temos um visitante na igreja!"
                : `${lista.length} visitantes na igreja hoje`}
            </h2>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 text-xs border-deep-blue/40 text-deep-blue hover:bg-deep-blue/10"
        >
          <Link to="/visitantes">
            Ver todos
            <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </div>

      <CardContent className="space-y-3 bg-deep-blue/[0.06] p-4 sm:p-5">
        {lista.map((visitante) => {
          const chegada = textoFormaChegada(visitante);
          return (
            <div
              key={visitante.id}
              className="flex items-start gap-3 rounded-lg border border-deep-blue/25 bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-deep-blue/20 text-deep-blue mt-0.5">
                <UserPlus className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg text-foreground leading-snug">
                  <span className="font-semibold">{visitante.name}</span>{" "}
                  está nos visitando{" "}
                  <Badge className="align-middle bg-gold text-gold-foreground border-0 text-xs font-bold">
                    HOJE!
                  </Badge>
                </p>
                {chegada && (
                  <p className="text-sm text-foreground/75 mt-1">{chegada}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
