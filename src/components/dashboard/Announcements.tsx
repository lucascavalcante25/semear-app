import { Megaphone, Pin, AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Aviso } from "@/types";

// Avisos de exemplo
const avisosExemplo: Aviso[] = [
  {
    id: "1",
    title: "Culto de Santa Ceia",
    content: "Neste domingo teremos culto de Santa Ceia às 19h. Venha preparado para comungar com Cristo.",
    type: "fixed",
    startDate: new Date(),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Pastor João",
  },
  {
    id: "2",
    title: "Retiro Espiritual",
    content: "Inscrições abertas para o retiro de carnaval. Vagas limitadas!",
    type: "urgent",
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Secretaria",
  },
  {
    id: "3",
    title: "Ensaio do Louvor",
    content: "Ensaio do ministério de louvor toda quarta-feira às 20h.",
    type: "normal",
    startDate: new Date(),
    isActive: true,
    createdAt: new Date(),
    createdBy: "Líder de Louvor",
  },
];

interface ItemAvisoProps {
  aviso: Aviso;
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
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Ver todos
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {avisosExemplo.map((aviso) => (
          <ItemAviso key={aviso.id} aviso={aviso} />
        ))}
      </CardContent>
    </Card>
  );
}
