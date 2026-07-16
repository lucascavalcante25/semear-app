import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Loader2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModalResumoEvento } from "@/components/eventos/ModalResumoEvento";
import { resolverUrlApi } from "@/modules/api/client";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import {
  formatarDataHoraEvento,
  LABEL_CATEGORIA_EVENTO,
  listarEventosProximos,
  type EventoDTO,
} from "@/modules/eventos/api";

const LIMITE = 4;

function MiniaturaEvento({ imagemUrl, titulo }: { imagemUrl?: string | null; titulo: string }) {
  const [erroImagem, setErroImagem] = useState(false);
  const src = resolverUrlApi(imagemUrl);

  if (!imagemUrl || erroImagem || !src) {
    return (
      <div className="flex aspect-[16/7] w-full items-center justify-center bg-primary/10 text-primary">
        <Calendar className="h-8 w-8 opacity-70" />
      </div>
    );
  }

  return (
    <div className="aspect-[16/7] w-full overflow-hidden bg-muted">
      <img
        src={src}
        alt={titulo}
        className="h-full w-full object-cover"
        onError={() => setErroImagem(true)}
      />
    </div>
  );
}

export function DestaqueEventosProximos() {
  const { user } = usarAutenticacao();
  const { nomeExibicao } = useIgrejaConfiguracao();
  const userId = user?.id ? Number(user.id) : undefined;
  const [lista, setLista] = useState<EventoDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState<EventoDTO | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const dados = await listarEventosProximos(userId);
        setLista((dados ?? []).slice(0, LIMITE));
      } catch {
        setLista([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [userId]);

  const atualizarNaLista = (atualizado: EventoDTO) => {
    setLista((prev) => prev.map((e) => (e.id === atualizado.id ? atualizado : e)));
    setSelecionado(atualizado);
  };

  return (
    <>
      <Card className="shadow-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              <CardTitle className="text-base">Próximos eventos</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0 text-xs text-muted-foreground">
              <Link to="/eventos">
                Ver todos
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
          ) : lista.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nenhum evento futuro publicado.</p>
          ) : (
            lista.map((evento) => (
              <button
                key={evento.id}
                type="button"
                onClick={() => setSelecionado(evento)}
                className="w-full text-left block overflow-hidden rounded-lg border transition-colors hover:bg-muted/50 touch-manipulation"
              >
                <MiniaturaEvento imagemUrl={evento.imagemUrl} titulo={evento.titulo} />
                <div className="space-y-1 p-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-medium">{evento.titulo}</p>
                    {evento.inscrito && (
                      <Badge variant="secondary" className="text-[10px]">
                        Inscrito
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatarDataHoraEvento(evento.dataInicio)}</p>
                  {evento.categoria && (
                    <p className="text-[11px] text-muted-foreground">
                      {LABEL_CATEGORIA_EVENTO[evento.categoria]}
                    </p>
                  )}
                  {evento.local && (
                    <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {evento.local}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <ModalResumoEvento
        evento={selecionado}
        aberto={!!selecionado}
        onFechar={() => setSelecionado(null)}
        nomeIgreja={nomeExibicao}
        onAtualizado={atualizarNaLista}
      />
    </>
  );
}
