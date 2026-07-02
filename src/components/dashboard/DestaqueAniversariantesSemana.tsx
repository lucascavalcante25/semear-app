import { useEffect, useMemo, useState } from "react";
import { Cake, ChevronRight, Gift, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAvatarUrlByUserId } from "@/hooks/use-avatar-url";
import {
  ehAniversarioHoje,
  filtrarAniversariantesSemanaAtual,
  listarCalendarioAniversariantes,
  obterDataAniversarioNaSemanaAtual,
  obterIdadeQueCompleta,
  obterIniciaisAniversariante,
  type AniversarianteApp,
} from "@/modules/members/birthdays";

interface ItemDestaqueProps {
  aniversariante: AniversarianteApp;
}

function ItemDestaqueAniversariante({ aniversariante }: ItemDestaqueProps) {
  const ehHoje = ehAniversarioHoje(aniversariante.date);
  const dataNaSemana = obterDataAniversarioNaSemanaAtual(aniversariante.date)!;
  const avatarUrl = useAvatarUrlByUserId(aniversariante.id);
  const idade = obterIdadeQueCompleta(aniversariante.date);

  const textoData = dataNaSemana.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 shadow-sm",
        ehHoje ? "border-gold/50 bg-gold/10" : "border-gold/25 bg-card",
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={avatarUrl ?? undefined} alt={aniversariante.name} />
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            ehHoje ? "bg-gold text-gold-foreground" : "bg-gold/20 text-gold-dark",
          )}
        >
          {obterIniciaisAniversariante(aniversariante.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="text-base leading-snug text-foreground sm:text-lg">
          <span className="font-semibold">{aniversariante.name}</span>
          {ehHoje ? (
            <>
              {" "}
              faz aniversário{" "}
              <Badge className="align-middle border-0 bg-gold text-xs font-bold text-gold-foreground">
                HOJE!
              </Badge>
            </>
          ) : (
            <> — aniversário {textoData}</>
          )}
        </div>
        <p className="mt-1 text-sm text-foreground/75">
          {ehHoje ? `Completa ${idade} anos` : `Completa ${idade} anos · lembre de cantar parabéns no culto`}
        </p>
      </div>

      {ehHoje && <Gift className="mt-1 h-5 w-5 shrink-0 text-gold-dark" aria-hidden />}
    </div>
  );
}

export function DestaqueAniversariantesSemana() {
  const [lista, setLista] = useState<AniversarianteApp[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const todos = await listarCalendarioAniversariantes();
        setLista(filtrarAniversariantesSemanaAtual(todos));
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  const aniversariantesHoje = useMemo(() => lista.filter((a) => ehAniversarioHoje(a.date)), [lista]);
  const ehDomingo = new Date().getDay() === 0;

  if (carregando || lista.length === 0) return null;

  const titulo =
    aniversariantesHoje.length > 0
      ? aniversariantesHoje.length === 1
        ? "Aniversariante hoje — cantem parabéns!"
        : `${aniversariantesHoje.length} aniversariantes hoje — cantem parabéns!`
      : ehDomingo
        ? lista.length === 1
          ? "1 aniversariante esta semana — cantem parabéns no culto!"
          : `${lista.length} aniversariantes esta semana — cantem parabéns no culto!`
        : lista.length === 1
          ? "1 aniversariante esta semana"
          : `${lista.length} aniversariantes esta semana`;

  return (
    <Card className="overflow-hidden border-2 border-gold/40 shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-gold/25 bg-gold/15 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-gold-foreground shadow-sm">
            {ehDomingo || aniversariantesHoje.length > 0 ? (
              <Music className="h-5 w-5" />
            ) : (
              <Cake className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
              {ehDomingo ? "Culto de domingo" : "Aniversariantes da semana"}
            </p>
            <h2 className="text-lg font-bold leading-tight text-foreground">{titulo}</h2>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 border-gold/40 text-xs text-gold-dark hover:bg-gold/10"
        >
          <Link to="/aniversariantes">
            Ver todos
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>

      <CardContent className="space-y-3 bg-gold/[0.06] p-4 sm:p-5">
        {(ehDomingo || aniversariantesHoje.length > 0) && aniversariantesHoje.length === 0 && (
          <p className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-foreground/85">
            No culto de hoje, lembre de cantar parabéns para quem faz aniversário esta semana.
          </p>
        )}
        {lista.map((aniversariante) => (
          <ItemDestaqueAniversariante key={aniversariante.id} aniversariante={aniversariante} />
        ))}
      </CardContent>
    </Card>
  );
}
