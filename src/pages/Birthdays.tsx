import { useEffect, useMemo, useState } from "react";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvatarUrlByUserId } from "@/hooks/use-avatar-url";
import {
  agruparAniversariantesPorMes,
  ehAniversarioHoje,
  listarCalendarioAniversariantes,
  obterDiasAteAniversario,
  obterIdadeQueCompleta,
  obterIniciaisAniversariante,
  type AniversarianteApp,
} from "@/modules/members/birthdays";

interface ItemAniversarianteProps {
  aniversariante: AniversarianteApp;
}

function ItemAniversariante({ aniversariante }: ItemAniversarianteProps) {
  const ehHoje = ehAniversarioHoje(aniversariante.date);
  const diasAte = obterDiasAteAniversario(aniversariante.date);
  const idade = obterIdadeQueCompleta(aniversariante.date);
  const avatarUrl = useAvatarUrlByUserId(aniversariante.id);

  const formatarData = (iso?: string) =>
    iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR") : null;

  const datasExtras = [
    aniversariante.dataBatismo && { rotulo: "Batismo", data: formatarData(aniversariante.dataBatismo) },
    aniversariante.dataCasamento && { rotulo: "Casamento", data: formatarData(aniversariante.dataCasamento) },
    aniversariante.membroDesde && { rotulo: "Membro desde", data: formatarData(aniversariante.membroDesde) },
  ].filter((d): d is { rotulo: string; data: string } => Boolean(d?.data));

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-3 transition-shadow hover:shadow-sm",
        ehHoje && "border-gold/50 bg-gold/5",
      )}
    >
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={avatarUrl ?? undefined} alt={aniversariante.name} />
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            ehHoje ? "bg-gold text-gold-foreground" : "bg-olive-light text-olive-dark",
          )}
        >
          {obterIniciaisAniversariante(aniversariante.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{aniversariante.name}</p>
        <p className="text-sm text-muted-foreground">
          {aniversariante.date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
          {" · "}
          {ehHoje ? `completa ${idade} anos` : `${idade} anos`}
        </p>
        {datasExtras.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {datasExtras.map((d) => `${d.rotulo}: ${d.data}`).join(" · ")}
          </p>
        )}
      </div>

      {ehHoje ? (
        <Badge className="shrink-0 gap-1 border-0 bg-gold text-gold-foreground">
          <Gift className="h-3 w-3" />
          Hoje!
        </Badge>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
          em {diasAte} {diasAte === 1 ? "dia" : "dias"}
        </span>
      )}
    </div>
  );
}

export default function AniversariantesPagina() {
  const [lista, setLista] = useState<AniversarianteApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarCalendarioAniversariantes();
        setLista(dados);
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return lista;
    return lista.filter((a) => a.name.toLowerCase().includes(termo));
  }, [lista, busca]);

  const gruposPorMes = useMemo(() => {
    const semHoje = listaFiltrada.filter((a) => !ehAniversarioHoje(a.date));
    return agruparAniversariantesPorMes(semHoje);
  }, [listaFiltrada]);

  const aniversariantesHoje = useMemo(() => listaFiltrada.filter((a) => ehAniversarioHoje(a.date)), [listaFiltrada]);

  const mesAtual = new Date().getMonth();

  return (
    <LayoutApp>
      <div className="animate-fade-in min-w-0 space-y-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold text-gold-foreground">
            <Cake className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold">Aniversariantes</h1>
            <p className="text-sm text-muted-foreground">
              {carregando
                ? "Carregando..."
                : `${lista.length} ${lista.length === 1 ? "aniversariante" : "aniversariantes"} no calendário`}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : lista.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum membro com data de nascimento cadastrada.
            </CardContent>
          </Card>
        ) : listaFiltrada.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum aniversariante encontrado para &quot;{busca}&quot;.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {aniversariantesHoje.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-gold-dark" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-dark">
                    Aniversariantes de hoje
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {aniversariantesHoje.length}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {aniversariantesHoje.map((aniversariante) => (
                    <ItemAniversariante key={aniversariante.id} aniversariante={aniversariante} />
                  ))}
                </div>
              </section>
            )}

            {gruposPorMes.map(({ mes, nomeMes, aniversariantes }) => (
              <section key={mes} className="space-y-3">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-1 py-0.5",
                    mes === mesAtual && "text-gold-dark",
                  )}
                >
                  <h2 className="text-base font-semibold">{nomeMes}</h2>
                  {mes === mesAtual && (
                    <Badge className="border-0 bg-gold/15 text-xs text-gold-dark">Mês atual</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {aniversariantes.length}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {aniversariantes.map((aniversariante) => (
                    <ItemAniversariante key={aniversariante.id} aniversariante={aniversariante} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </LayoutApp>
  );
}
