import { useEffect, useState } from "react";
import { UserPlus, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listarVisitantesDoDia, type VisitanteApp } from "@/modules/visitors/api";
import { Link } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";

function ItemVisitante({ visitante }: { visitante: VisitanteApp }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-deep-blue/10 text-deep-blue">
        <UserPlus className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{visitante.name}</p>
        {visitante.phone && (
          <p className="text-xs text-muted-foreground">{visitante.phone}</p>
        )}
      </div>
    </div>
  );
}

export function VisitantesDoDia() {
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

  if (!temAcessoVisitantes) return null;
  if (carregando) return null;
  if (lista.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-blue/10 text-deep-blue">
              <UserPlus className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Visitantes do dia</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <Link to="/visitantes">
              Ver todos
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {lista.map((visitante) => (
          <ItemVisitante key={visitante.id} visitante={visitante} />
        ))}
      </CardContent>
    </Card>
  );
}
