import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { listarEscalas } from "@/modules/escalas/api";
import {
  agruparEscalasPorCulto,
  formatarDataEscala,
  nomesCoincidem,
  type GrupoEscalasCulto,
} from "@/modules/escalas/escala-agrupamento";

const LIMITE = 4;
const DIAS_A_FRENTE = 14;

function filtrarMinhasEscalasFuturas(grupos: GrupoEscalasCulto[], nomeUsuario?: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + DIAS_A_FRENTE);

  return grupos
    .filter((grupo) => {
      if (!grupo.dataEvento) return false;
      const data = new Date(grupo.dataEvento);
      if (data < hoje || data > limite) return false;
      return grupo.funcoes.some((f) => nomesCoincidem(f.nome, nomeUsuario));
    })
    .slice(0, LIMITE);
}

export function DestaqueMinhasEscalas() {
  const { user } = usarAutenticacao();
  const [carregando, setCarregando] = useState(true);
  const [grupos, setGrupos] = useState<GrupoEscalasCulto[]>([]);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const escalas = await listarEscalas();
        const agrupados = agruparEscalasPorCulto(escalas ?? []);
        setGrupos(filtrarMinhasEscalasFuturas(agrupados, user?.name));
      } catch {
        setGrupos([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [user?.name]);

  const subtitulo = useMemo(() => {
    if (grupos.length === 0) return "Portaria, recepção e limpeza";
    return grupos.length === 1 ? "1 serviço nos próximos dias" : `${grupos.length} serviços nos próximos dias`;
  }, [grupos.length]);

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-olive/10 text-olive">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base">Minhas escalas</CardTitle>
              <p className="text-xs text-muted-foreground truncate">{subtitulo}</p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs text-muted-foreground">
            <Link to="/escalas">
              Ver escalas
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {carregando ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : grupos.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Você não está escalado(a) para portaria, recepção ou limpeza nos próximos {DIAS_A_FRENTE} dias.
          </p>
        ) : (
          grupos.map((grupo) => {
            const minhasFuncoes = grupo.funcoes.filter((f) => nomesCoincidem(f.nome, user?.name));
            return (
              <Link
                key={grupo.chave}
                to="/escalas"
                className={cn(
                  "block rounded-lg border p-3 transition-colors hover:bg-muted/50",
                  "border-primary/30 bg-primary/5",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{grupo.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatarDataEscala(grupo.dataEvento)}
                    </p>
                  </div>
                  <Badge variant="default" className="shrink-0 text-[10px]">
                    Você
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {minhasFuncoes.map((funcao, idx) => (
                    <Badge key={`${grupo.chave}-${funcao.departamento}-${idx}`} variant="outline" className="text-[10px]">
                      {funcao.departamento}
                      {funcao.confirmado ? " · confirmado" : ""}
                    </Badge>
                  ))}
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
