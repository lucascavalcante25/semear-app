import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import {
  confirmarComunicado,
  listarComunicadosBanner,
  LABEL_TIPO,
  type ComunicadoDTO,
} from "@/modules/comunicados/api";

export function BannerInformativoDashboard() {
  const { user } = usarAutenticacao();
  const [lista, setLista] = useState<ComunicadoDTO[]>([]);
  const [fechados, setFechados] = useState<Set<number>>(new Set());

  const carregar = useCallback(async () => {
    if (!user) return;
    try {
      const dados = await listarComunicadosBanner();
      setLista((dados ?? []).filter((i) => !i.obrigatorio && i.ativo !== false));
    } catch {
      setLista([]);
    }
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const visiveis = lista.filter((i) => i.id != null && !fechados.has(i.id));

  if (visiveis.length === 0) return null;

  const fechar = async (item: ComunicadoDTO) => {
    if (item.id) {
      setFechados((prev) => new Set(prev).add(item.id!));
      try {
        await confirmarComunicado(item.id);
      } catch {
        // dispensar silenciosamente
      }
    }
  };

  return (
    <div className="space-y-2">
      {visiveis.map((item) => {
        const tipoLabel = item.tipo ? LABEL_TIPO[item.tipo] : "Comunicado";
        return (
          <div
            key={item.id}
            className={cn(
              "relative rounded-xl border p-4 shadow-sm",
              item.tipo === "URGENTE"
                ? "border-destructive/30 bg-destructive/5"
                : item.tipo === "CAMPANHA"
                  ? "border-gold/40 bg-gold/5"
                  : "border-primary/20 bg-primary/5",
            )}
          >
            <button
              type="button"
              onClick={() => void fechar(item)}
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-background/80"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.tipo === "URGENTE" ? "destructive" : "secondary"}>
                    {tipoLabel}
                  </Badge>
                </div>
                <h3 className="font-semibold">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-3">
                  {item.conteudo}
                </p>
                {item.ctaRotulo && item.ctaRota && (
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link to={item.ctaRota}>
                      {item.ctaRotulo}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
