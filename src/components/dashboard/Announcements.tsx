import { useEffect, useState } from "react";
import { Megaphone, Pin, AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { listarAvisos, type AvisoApp } from "@/modules/announcements/api";
import { Link } from "react-router-dom";

interface ItemAvisoProps {
  aviso: AvisoApp;
}

function ItemAviso({ aviso }: ItemAvisoProps) {
  const typeConfig = {
    fixed: {
      icon: Pin,
      badge: "Fixo",
      badgeClass: "bg-olive/10 text-olive border-olive/20",
    },
    urgent: {
      icon: AlertTriangle,
      badge: "Urgente",
      badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    },
    normal: {
      icon: Megaphone,
      badge: null,
      badgeClass: "",
    },
  };

  const config = typeConfig[aviso.type];
  const Icon = config.icon;

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          aviso.type === "urgent" ? "bg-destructive/10 text-destructive" :
          aviso.type === "fixed" ? "bg-olive/10 text-olive" :
          "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold truncate">{aviso.title}</h4>
          {config.badge && (
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", config.badgeClass)}>
              {config.badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {aviso.content}
        </p>
      </div>
    </div>
  );
}

export function Avisos() {
  const [lista, setLista] = useState<AvisoApp[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarAvisos(true, 3);
        setLista(dados);
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold-dark">
              <Megaphone className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Avisos</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <Link to="/avisos">
              Ver todos
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {carregando ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length > 0 ? (
          lista.map((aviso) => <ItemAviso key={aviso.id} aviso={aviso} />)
        ) : (
          <div className="text-sm text-muted-foreground py-4">
            Nenhum aviso cadastrado ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
