import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Loader2, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModalResumoEvento, podeInscreverEvento } from "@/components/eventos/ModalResumoEvento";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { canAccess } from "@/auth/permissions";
import { resolverUrlApi } from "@/modules/api/client";
import {
  formatarDataHoraEvento,
  LABEL_CATEGORIA_EVENTO,
  listarEventosProximos,
  type EventoDTO,
} from "@/modules/eventos/api";

const labelDiaRelativo = (iso?: string | null) => {
  if (!iso) return null;
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  const diff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff > 1 && diff <= 7) return `Em ${diff} dias`;
  return null;
};

export function DestaqueProximoEvento() {
  const { user } = usarAutenticacao();
  const { nomeExibicao } = useIgrejaConfiguracao();
  const podeVer = canAccess(user, "/eventos");
  const userId = user?.id ? Number(user.id) : undefined;

  const [evento, setEvento] = useState<EventoDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [erroBanner, setErroBanner] = useState(false);

  useEffect(() => {
    if (!podeVer) {
      setCarregando(false);
      return;
    }
    const carregar = async () => {
      setCarregando(true);
      try {
        const lista = await listarEventosProximos(userId);
        const proximo = (lista ?? []).find((e) => e.status === "PUBLICADO") ?? (lista ?? [])[0] ?? null;
        setEvento(proximo);
        setErroBanner(false);
      } catch {
        setEvento(null);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [podeVer, userId]);

  if (!podeVer) return null;

  if (carregando) {
    return (
      <Card className="overflow-hidden shadow-sm border-olive/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!evento) return null;

  const bannerSrc = resolverUrlApi(evento.imagemUrl);
  const relativo = labelDiaRelativo(evento.dataInicio);
  const podeInscrever = podeInscreverEvento(evento);

  return (
    <>
      <Card className="overflow-hidden shadow-md border-olive/25">
        <button
          type="button"
          className="w-full text-left touch-manipulation"
          onClick={() => setModalAberto(true)}
        >
          {bannerSrc && !erroBanner ? (
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
              <img
                src={bannerSrc}
                alt={evento.titulo}
                className="h-full w-full object-cover"
                onError={() => setErroBanner(true)}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-3.5 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <Badge className="bg-white text-olive hover:bg-white/90 text-[10px] px-1.5 py-0">
                    Próximo evento
                  </Badge>
                  {relativo && (
                    <Badge className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0 hover:bg-white/25">
                      {relativo}
                    </Badge>
                  )}
                  {evento.inscrito && (
                    <Badge className="bg-olive text-white text-[10px] px-1.5 py-0 hover:bg-olive">Inscrito</Badge>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-tight break-words drop-shadow">
                  {evento.titulo}
                </h2>
                {evento.dataInicio && (
                  <p className="text-sm text-white/90 mt-0.5">{formatarDataHoraEvento(evento.dataInicio)}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden bg-gradient-to-br from-olive/90 via-olive to-olive/75 text-white px-3.5 py-3.5 sm:px-5 sm:py-4">
              <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/85">
                    Próximo evento
                  </p>
                  <Badge className="bg-white text-olive hover:bg-white/90 text-[10px] px-1.5 py-0">Próximo</Badge>
                  {relativo && (
                    <Badge variant="secondary" className="bg-white/15 text-white border-0 text-[10px] px-1.5 py-0">
                      {relativo}
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold leading-tight break-words">{evento.titulo}</h2>
                {evento.dataInicio && (
                  <p className="text-sm text-white/90">{formatarDataHoraEvento(evento.dataInicio)}</p>
                )}
              </div>
            </div>
          )}

          <CardContent className="space-y-2 p-3.5 sm:p-4 pointer-events-none">
            <div className="flex flex-wrap gap-1.5">
              {evento.categoria && (
                <Badge variant="secondary" className="text-[10px]">
                  {LABEL_CATEGORIA_EVENTO[evento.categoria]}
                </Badge>
              )}
              {podeInscrever && !evento.inscrito && (
                <Badge variant="outline" className="text-[10px]">
                  Inscrições abertas
                </Badge>
              )}
            </div>
            {evento.local && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{evento.local}</span>
              </p>
            )}
            {evento.descricao?.trim() && (
              <p className="text-sm text-muted-foreground line-clamp-2">{evento.descricao.trim()}</p>
            )}
            {(evento.totalInscritos != null || evento.capacidade != null) && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {evento.totalInscritos ?? 0}
                {evento.capacidade ? ` / ${evento.capacidade} vagas` : " inscrito(s)"}
              </p>
            )}
            <p className="text-xs text-olive inline-flex items-center gap-0.5 font-medium pt-0.5">
              Toque para ver detalhes e se inscrever
              <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </CardContent>
        </button>

        <div className="border-t px-3.5 py-2.5 sm:px-4 flex items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground h-8 px-2">
            <Link to="/eventos">
              Ver todos os eventos
              <ChevronRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          <Button size="sm" className="h-8" onClick={() => setModalAberto(true)}>
            {evento.inscrito ? "Ver inscrição" : podeInscrever ? "Inscrever-se" : "Ver detalhes"}
          </Button>
        </div>
      </Card>

      <ModalResumoEvento
        evento={evento}
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        nomeIgreja={nomeExibicao}
        onAtualizado={setEvento}
      />
    </>
  );
}
