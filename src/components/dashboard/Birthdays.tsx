import { useEffect, useState } from "react";
import { Cake, Gift, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { listarAniversariantes } from "@/modules/members/birthdays";

type Aniversario = {
  id: string;
  name: string;
  date: Date;
  photoUrl?: string;
};

function obterIniciais(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function obterDiasAte(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(today.getFullYear() + 1);
  }
  return Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface ItemAniversarioProps {
  aniversario: Aniversario;
}

function ItemAniversario({ aniversario }: ItemAniversarioProps) {
  const diasAte = obterDiasAte(aniversario.date);
  const ehHoje = diasAte === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        ehHoje ? "bg-gold/10" : "hover:bg-muted/50"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={aniversario.photoUrl} alt={aniversario.name} />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          ehHoje ? "bg-gold text-gold-foreground" : "bg-olive-light text-olive-dark"
        )}>
          {obterIniciais(aniversario.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{aniversario.name}</p>
        <p className="text-xs text-muted-foreground">
          {aniversario.date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
        </p>
      </div>
      {ehHoje ? (
        <Badge className="bg-gold text-gold-foreground border-0 gap-1">
          <Gift className="h-3 w-3" />
          Hoje!
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          em {diasAte} {diasAte === 1 ? "dia" : "dias"}
        </span>
      )}
    </div>
  );
}

export function Aniversariantes() {
  const [lista, setLista] = useState<Aniversario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarAniversariantes(14);
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
              <Cake className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Aniversariantes</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Ver todos
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {carregando ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length > 0 ? (
          lista.map((aniversario) => (
            <ItemAniversario key={aniversario.id} aniversario={aniversario} />
          ))
        ) : (
          <div className="text-sm text-muted-foreground py-4">
            Nenhum aniversariante nos próximos dias.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
