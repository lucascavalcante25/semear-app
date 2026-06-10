import { BookOpen, Share2, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { obterVersiculoDoDia, type Versiculo } from "@/data/verses";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { livrosBiblia } from "@/data/bible-books";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import {
  adicionarFavorito,
  obterFavoritos,
  obterIdUsuario,
  removerFavorito,
} from "@/modules/bible/service";
import type { ReferenciaBiblia } from "@/modules/bible/types";
import { useNavigate } from "react-router-dom";

export function VersiculoDoDia() {
  const fallbackVerse = obterVersiculoDoDia();
  const { user } = usarAutenticacao();
  const { nomeExibicao } = useIgrejaConfiguracao();
  const userId = obterIdUsuario(user?.id);
  const navigate = useNavigate();
  const [verse, setVerse] = useState<Versiculo>(fallbackVerse);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Mantém o recurso funcionando sem depender de API externa (evita erros/CORS/token).
    setVerse(fallbackVerse);
  }, [fallbackVerse]);

  const reference = useMemo(() => {
    const matchedBook = livrosBiblia.find(
      (book) => book.name.toLowerCase() === verse.book.toLowerCase(),
    );
    const verseRange = String(verse.verse).split("-").map((item) => Number(item));
    const start = verseRange[0] || Number(verse.verse) || 1;
    const end = verseRange[1] || start;
    const ref: ReferenciaBiblia = {
      bookId: matchedBook?.id ?? "unknown",
      bookName: verse.book,
      chapter: verse.chapter,
      verseRange: { start, end },
    };
    return ref;
  }, [verse]);

  useEffect(() => {
    const favorites = obterFavoritos(userId);
    const exists = favorites.some(
      (favorite) =>
        favorite.reference.bookName.toLowerCase() === reference.bookName.toLowerCase() &&
        favorite.reference.chapter === reference.chapter &&
        favorite.reference.verseRange.start === reference.verseRange.start &&
        favorite.reference.verseRange.end === reference.verseRange.end,
    );
    setIsFavorite(exists);
  }, [reference, userId]);

  const handleAbrirVersiculo = () => {
    if (reference.bookId === "unknown") {
      return;
    }
    const params = new URLSearchParams({
      bookId: reference.bookId,
      chapter: String(reference.chapter),
      verseStart: String(reference.verseRange.start),
      verseEnd: String(reference.verseRange.end),
      version: "almeida",
    });
    navigate(`/biblia?${params.toString()}`);
  };

  const handleShare = () => {
    const text = `📖 ${verse.reference}\n\n"${verse.text}"\n\n— Enviado pelo app ${nomeExibicao}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Versículo do Dia - ${nomeExibicao}`,
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="overflow-hidden border border-border shadow-spiritual verse-card-gradient">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/15">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Versículo do Dia
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
            onClick={() => {
              if (isFavorite) {
                const favorites = obterFavoritos(userId);
                const match = favorites.find(
                  (favorite) =>
                    favorite.reference.bookName.toLowerCase() ===
                      reference.bookName.toLowerCase() &&
                    favorite.reference.chapter === reference.chapter &&
                    favorite.reference.verseRange.start === reference.verseRange.start &&
                    favorite.reference.verseRange.end === reference.verseRange.end,
                );
                if (match) {
                  removerFavorito(userId, match.id);
                }
                setIsFavorite(false);
              } else {
                adicionarFavorito(userId, reference, "almeida");
                setIsFavorite(true);
              }
            }}
              className="text-secondary hover:text-secondary hover:bg-secondary/15"
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-all",
                  isFavorite && "fill-secondary text-secondary"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 relative">
          <Quote className="absolute top-3 left-3 h-8 w-8 text-primary/15" />
          <p className="text-base md:text-lg leading-relaxed text-foreground pl-4 italic">
            "{verse.text}"
          </p>
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={handleAbrirVersiculo}
              className="text-sm font-semibold text-primary-foreground bg-primary px-3 py-1 rounded-full hover:bg-primary/90 transition-colors"
            >
              {verse.reference}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
