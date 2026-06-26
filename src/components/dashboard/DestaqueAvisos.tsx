import { useEffect, useState } from "react";
import { Megaphone, Pin, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { listarComunicados, type ComunicadoApp } from "@/modules/comunicados/api";
import { filtrarComunicadosVigentes, ordenarComunicadosPorDestaque } from "@/lib/comunicado-vigencia";
import { Link } from "react-router-dom";

const LIMITE_DESTAQUE = 5;

const typeConfig: Record<
  ComunicadoApp["type"],
  { icon: typeof Megaphone; badge: string | null; badgeClass: string; cardClass: string; iconClass: string }
> = {
  fixed: {
    icon: Pin,
    badge: "Fixo",
    badgeClass: "bg-olive/10 text-olive border-olive/20",
    cardClass: "border-olive/30 bg-olive/5",
    iconClass: "bg-olive/10 text-olive",
  },
  urgent: {
    icon: AlertTriangle,
    badge: "Urgente",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    cardClass: "border-destructive/40 bg-destructive/5",
    iconClass: "bg-destructive/10 text-destructive",
  },
  normal: {
    icon: Megaphone,
    badge: null,
    badgeClass: "",
    cardClass: "border-gold/30 bg-gold/5",
    iconClass: "bg-gold/10 text-gold-dark",
  },
  campanha: {
    icon: Megaphone,
    badge: "Campanha",
    badgeClass: "bg-gold/10 text-gold-dark border-gold/20",
    cardClass: "border-gold/30 bg-gold/5",
    iconClass: "bg-gold/10 text-gold-dark",
  },
  boas_vindas: {
    icon: Megaphone,
    badge: "Boas-vindas",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    cardClass: "border-primary/20 bg-primary/5",
    iconClass: "bg-primary/10 text-primary",
  },
  sistema: {
    icon: Megaphone,
    badge: null,
    badgeClass: "",
    cardClass: "border-gold/30 bg-gold/5",
    iconClass: "bg-gold/10 text-gold-dark",
  },
};

function ItemComunicadoDestaque({ item }: { item: ComunicadoApp }) {
  const config = typeConfig[item.type] ?? typeConfig.normal;
  const Icon = config.icon;

  return (
    <div className={cn("flex gap-3 rounded-lg border px-4 py-3", config.cardClass)}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          config.iconClass,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">{item.title}</h3>
          {config.badge && (
            <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
              {config.badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{item.content}</p>
      </div>
    </div>
  );
}

export function DestaqueAvisos() {
  const [lista, setLista] = useState<ComunicadoApp[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarComunicados(true, 50);
        const vigentes = ordenarComunicadosPorDestaque(filtrarComunicadosVigentes(dados));
        setLista(vigentes.slice(0, LIMITE_DESTAQUE));
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  if (carregando) {
    return (
      <Card className="border-gold/30 bg-gold/5">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (lista.length === 0) return null;

  return (
    <Card className="border-gold/40 bg-gradient-to-br from-gold/10 via-background to-background shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-gold-foreground shadow-sm">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                Comunicados de hoje
              </p>
              <h2 className="text-lg font-bold text-foreground">
                {lista.length === 1 ? "1 comunicado em exibição" : `${lista.length} comunicados em exibição`}
              </h2>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 text-xs">
            <Link to="/comunicados">
              Ver todos
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {lista.map((item) => (
            <ItemComunicadoDestaque key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
