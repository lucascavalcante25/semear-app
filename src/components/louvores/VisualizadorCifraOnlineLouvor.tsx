import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { filtrarTablaturas, destacarAcordesNaLinha } from "@/lib/cifra-linhas";
import { obterCifraOnlineLouvor, type LouvorApp } from "@/modules/louvores/api";

const ESCALA_MIN = 0.85;
const ESCALA_MAX = 1.8;
const ESCALA_PADRAO = 1.05;
const PASSO = 0.1;

type Props = {
  louvor: LouvorApp | null;
  aberto: boolean;
  onFechar: () => void;
  onCacheAtualizado?: () => void;
};

export function VisualizadorCifraOnlineLouvor({ louvor, aberto, onFechar, onCacheAtualizado }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<string[]>([]);
  const [url, setUrl] = useState<string | null>(null);
  const [doCache, setDoCache] = useState(false);
  const [ocultarTablaturas, setOcultarTablaturas] = useState(true);
  const [escala, setEscala] = useState(ESCALA_PADRAO);

  const carregar = useCallback(async () => {
    if (!louvor?.idNum) return;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await obterCifraOnlineLouvor(louvor.idNum);
      if (!resposta.disponivel || !resposta.linhas?.length) {
        setErro(resposta.mensagem ?? "Cifra não disponível.");
        setLinhas([]);
        return;
      }
      setLinhas(resposta.linhas);
      setUrl(resposta.url ?? null);
      setDoCache(resposta.doCache);
      if (!resposta.doCache) {
        onCacheAtualizado?.();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar cifra.");
      setLinhas([]);
    } finally {
      setCarregando(false);
    }
  }, [louvor, onCacheAtualizado]);

  useEffect(() => {
    if (!aberto) {
      setLinhas([]);
      setErro(null);
      setEscala(ESCALA_PADRAO);
      return;
    }
    void carregar();
  }, [aberto, carregar]);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aberto, onFechar]);

  if (!aberto || !louvor) return null;

  const linhasExibidas = ocultarTablaturas ? filtrarTablaturas(linhas) : linhas;
  const tamanhoFonte = Math.round(15 * escala);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-zinc-100"
      role="dialog"
      aria-modal="true"
      aria-label={`Cifra: ${louvor.title}`}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur-sm sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={onFechar}
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold sm:text-base">{louvor.title}</p>
          <p className="truncate text-xs text-zinc-400">
            {louvor.artist}
            {doCache && linhas.length > 0 && (
              <span className="ml-2 text-zinc-500">· salva no app</span>
            )}
          </p>
        </div>

        {!carregando && linhas.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2 py-1">
              <Switch
                id="ocultar-tab"
                checked={ocultarTablaturas}
                onCheckedChange={setOcultarTablaturas}
                className="scale-90"
              />
              <Label htmlFor="ocultar-tab" className="text-xs text-zinc-300 cursor-pointer whitespace-nowrap">
                Sem tab
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300"
              onClick={() => setEscala((v) => Math.max(ESCALA_MIN, v - PASSO))}
              aria-label="Diminuir fonte"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300"
              onClick={() => setEscala((v) => Math.min(ESCALA_MAX, v + PASSO))}
              aria-label="Aumentar fonte"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-y px-3 py-4 sm:px-6 sm:py-6">
        {carregando && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Buscando cifra…</p>
          </div>
        )}

        {!carregando && erro && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="max-w-md text-sm text-zinc-300">{erro}</p>
            <Button variant="outline" onClick={() => void carregar()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!carregando && !erro && linhasExibidas.length > 0 && (
          <article
            className={cn(
              "mx-auto max-w-2xl rounded-lg bg-[#fffef8] px-4 py-5 text-zinc-900 shadow-2xl shadow-black/40",
              "sm:px-8 sm:py-8",
            )}
          >
            <pre
              className="whitespace-pre-wrap font-mono leading-relaxed break-words"
              style={{ fontSize: `${tamanhoFonte}px` }}
            >
              {linhasExibidas.map((linha, idx) => (
                <span key={idx} className="block">
                  {linha.trim() === "" ? "\u00A0" : destacarAcordesNaLinha(linha)}
                </span>
              ))}
            </pre>
            {url && (
              <p className="mt-6 text-center text-xs text-zinc-500">
                Fonte:{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
                  Cifra Club
                </a>
              </p>
            )}
          </article>
        )}
      </div>
    </div>,
    document.body,
  );
}
