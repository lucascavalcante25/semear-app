import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { extrairIdYoutube } from "@/lib/youtube";
import { toast } from "sonner";

export type YoutubePlayerSize = "pip" | "medio" | "grande";

export type YoutubePlayerState = {
  videoId: string;
  titulo: string;
  urlOriginal: string;
  tamanho: YoutubePlayerSize;
  minimizado: boolean;
};

type Ctx = {
  player: YoutubePlayerState | null;
  abrir: (opts: { url: string; titulo?: string }) => void;
  fechar: () => void;
  minimizar: () => void;
  expandir: () => void;
  setTamanho: (t: YoutubePlayerSize) => void;
};

const YoutubeMiniPlayerContext = createContext<Ctx | null>(null);

export function ProvedorYoutubeMiniPlayer({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<YoutubePlayerState | null>(null);

  const abrir = useCallback((opts: { url: string; titulo?: string }) => {
    const videoId = extrairIdYoutube(opts.url);
    if (!videoId) {
      toast.error("Link do YouTube inválido.");
      return;
    }
    setPlayer({
      videoId,
      titulo: opts.titulo?.trim() || "YouTube",
      urlOriginal: opts.url,
      tamanho: "pip",
      minimizado: false,
    });
  }, []);

  const fechar = useCallback(() => setPlayer(null), []);
  const minimizar = useCallback(() => {
    setPlayer((p) => (p ? { ...p, minimizado: true } : null));
  }, []);
  const expandir = useCallback(() => {
    setPlayer((p) => (p ? { ...p, minimizado: false } : null));
  }, []);
  const setTamanho = useCallback((tamanho: YoutubePlayerSize) => {
    setPlayer((p) => (p ? { ...p, tamanho, minimizado: false } : null));
  }, []);

  const value = useMemo(
    () => ({ player, abrir, fechar, minimizar, expandir, setTamanho }),
    [player, abrir, fechar, minimizar, expandir, setTamanho],
  );

  return <YoutubeMiniPlayerContext.Provider value={value}>{children}</YoutubeMiniPlayerContext.Provider>;
}

export function useYoutubeMiniPlayer() {
  const ctx = useContext(YoutubeMiniPlayerContext);
  if (!ctx) {
    throw new Error("useYoutubeMiniPlayer deve ser usado dentro de ProvedorYoutubeMiniPlayer");
  }
  return ctx;
}
