import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Minus,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { urlEmbedYoutube } from "@/lib/youtube";
import {
  useYoutubeMiniPlayer,
  type YoutubePlayerSize,
} from "@/contexts/YoutubeMiniPlayerContext";

const TAMANHOS: Record<YoutubePlayerSize, { w: number; h: number; label: string }> = {
  pip: { w: 320, h: 180, label: "Pequeno" },
  medio: { w: 480, h: 270, label: "Médio" },
  grande: { w: 640, h: 360, label: "Grande" },
};

const MARGEM = 12;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function YoutubeMiniPlayerHost() {
  const { player, fechar, minimizar, expandir, setTamanho } = useYoutubeMiniPlayer();
  const [pos, setPos] = useState({ x: MARGEM, y: MARGEM });
  const [pronto, setPronto] = useState(false);
  const arrastando = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const videoIdAnterior = useRef<string | null>(null);

  const dim = player
    ? player.minimizado
      ? { w: Math.min(320, typeof window !== "undefined" ? window.innerWidth - MARGEM * 2 : 320), h: 44 }
      : TAMANHOS[player.tamanho]
    : TAMANHOS.pip;

  // Posiciona no canto inferior direito ao abrir / trocar vídeo
  useEffect(() => {
    if (!player) {
      setPronto(false);
      videoIdAnterior.current = null;
      return;
    }
    if (videoIdAnterior.current === player.videoId && pronto) return;
    videoIdAnterior.current = player.videoId;
    const w = TAMANHOS.pip.w;
    const h = TAMANHOS.pip.h;
    setPos({
      x: Math.max(MARGEM, window.innerWidth - w - MARGEM),
      y: Math.max(MARGEM, window.innerHeight - h - 56),
    });
    setPronto(true);
  }, [player, pronto]);

  // Mantém dentro da viewport ao redimensionar janela / tamanho do player
  useEffect(() => {
    if (!player || !pronto) return;
    const ajustar = () => {
      setPos((p) => ({
        x: clamp(p.x, MARGEM, window.innerWidth - dim.w - MARGEM),
        y: clamp(p.y, MARGEM, window.innerHeight - dim.h - MARGEM),
      }));
    };
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, [player, pronto, dim.w, dim.h]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    arrastando.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos.x, pos.y]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!arrastando.current) return;
      setPos({
        x: clamp(e.clientX - offset.current.x, MARGEM, window.innerWidth - dim.w - MARGEM),
        y: clamp(e.clientY - offset.current.y, MARGEM, window.innerHeight - dim.h - MARGEM),
      });
    },
    [dim.w, dim.h],
  );

  const onPointerUp = useCallback(() => {
    arrastando.current = false;
  }, []);

  if (!player || !pronto) return null;

  const cicloTamanho = () => {
    const ordem: YoutubePlayerSize[] = ["pip", "medio", "grande"];
    const idx = ordem.indexOf(player.tamanho);
    setTamanho(ordem[(idx + 1) % ordem.length]);
  };

  return createPortal(
    <div
      role="dialog"
      aria-label={`Player: ${player.titulo}`}
      className={cn(
        "fixed z-[90] flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl",
        "ring-1 ring-black/10 dark:ring-white/10",
      )}
      style={{
        left: pos.x,
        top: pos.y,
        width: dim.w,
        height: dim.h,
      }}
    >
      <div
        className="flex h-10 shrink-0 cursor-grab items-center gap-1.5 border-b border-border bg-muted/80 px-2 active:cursor-grabbing touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Youtube className="h-4 w-4 shrink-0 text-red-500" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium">{player.titulo}</span>
        <div className="flex shrink-0 items-center gap-0.5">
          {!player.minimizado && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={`Tamanho: ${TAMANHOS[player.tamanho].label}`}
              onClick={cicloTamanho}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={player.minimizado ? "Expandir" : "Minimizar"}
            onClick={player.minimizado ? expandir : minimizar}
          >
            {player.minimizado ? <Minimize2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" asChild title="Abrir no YouTube">
            <a href={player.urlOriginal} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" title="Fechar" onClick={fechar}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!player.minimizado && (
        <div className="relative min-h-0 flex-1 bg-black">
          <iframe
            key={player.videoId}
            title={player.titulo}
            src={urlEmbedYoutube(player.videoId, true)}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
    </div>,
    document.body,
  );
}
