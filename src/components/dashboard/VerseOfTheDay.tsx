import { BookOpen, Share2, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { obterVersiculoDoDia, type Versiculo } from "@/data/verses";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { livrosBiblia } from "@/data/bible-books";
import { usarAutenticacao } from "@/contexts/AuthContext";
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
  const userId = obterIdUsuario(user?.id);
  const navigate = useNavigate();
  const [verse, setVerse] = useState<Versiculo>(fallbackVerse);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const inicioAno = new Date(ano, 0, 1);
    const diaDoAno = Math.floor((hoje.getTime() - inicioAno.getTime()) / 86400000);
    const indice = Math.max(0, Math.min(diaDoAno, 364));
    const refsKey = `semear.versoDia.${ano}.refs`;
    const cacheKey = `semear.versoDia.${ano}.cache`;

    const getAbibliaAbbrev = (bookId: string) => (bookId === "jo2" ? "jo" : bookId);

    const carregarRefs = () => {
      const cached = window.localStorage.getItem(refsKey);
      if (cached) {
        try {
          return JSON.parse(cached) as Array<{
            bookId: string;
            bookName: string;
            chapter: number;
            verse: number;
          }>;
        } catch {
          // ignore
        }
      }
      const chapters: Array<{ bookId: string; bookName: string; chapter: number; verse: number }> =
        [];
      livrosBiblia.forEach((book) => {
        for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
          chapters.push({
            bookId: book.id,
            bookName: book.name,
            chapter,
            verse: 1,
          });
        }
      });
      const refs = chapters.slice(0, 365);
      window.localStorage.setItem(refsKey, JSON.stringify(refs));
      return refs;
    };

    const refs = carregarRefs();
    const refDia = refs[indice];
    if (!refDia) {
      setVerse(fallbackVerse);
      return;
    }

    const cachedVerses = window.localStorage.getItem(cacheKey);
    if (cachedVerses) {
      try {
        const parsed = JSON.parse(cachedVerses) as Record<string, Versiculo>;
        const cachedVerse = parsed[String(indice)];
        if (cachedVerse) {
          setVerse(cachedVerse);
          return;
        }
      } catch {
        // ignore
      }
    }

    fetch(
      `https://www.abibliadigital.com.br/api/verses/acf/${getAbibliaAbbrev(refDia.bookId)}/${refDia.chapter}/${refDia.verse}`,
      { headers: { Accept: "application/json" } },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Falha ao buscar versículo do dia.");
        }
        return (await response.json()) as {
          book: { name: string };
          chapter: number;
          number: number;
          text: string;
        };
      })
      .then((data) => {
        const mapped: Versiculo = {
          reference: `${data.book.name} ${data.chapter}:${data.number}`,
          text: data.text,
          book: data.book.name,
          chapter: data.chapter,
          verse: data.number,
        };
        setVerse(mapped);
        const nextCache = cachedVerses ? JSON.parse(cachedVerses) as Record<string, Versiculo> : {};
        nextCache[String(indice)] = mapped;
        window.localStorage.setItem(cacheKey, JSON.stringify(nextCache));
      })
      .catch(() => {
        setVerse(fallbackVerse);
      });
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
    const text = `📖 ${verse.reference}\n\n"${verse.text}"\n\n— Enviado pelo app Semear`;
    
    if (navigator.share) {
      navigator.share({
        title: "Versiculo do Dia - Semear",
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-spiritual bg-gradient-to-br from-olive-light via-card to-gold-light">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-olive/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-olive-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-olive-dark">
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
              className="text-gold-dark hover:text-gold hover:bg-gold/10"
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-all",
                  isFavorite && "fill-gold text-gold"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              className="text-olive-dark hover:text-olive hover:bg-olive/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 relative">
          <Quote className="absolute top-3 left-3 h-8 w-8 text-gold/20" />
          <p className="text-base md:text-lg leading-relaxed text-foreground pl-4 italic">
            "{verse.text}"
          </p>
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={handleAbrirVersiculo}
              className="text-sm font-semibold text-olive-dark bg-olive/10 px-3 py-1 rounded-full hover:bg-olive/20 transition-colors"
            >
              {verse.reference}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
