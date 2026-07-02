import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Minus, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { filtrarTablaturas, destacarAcordesNaLinha } from "@/lib/cifra-linhas";
import {
  obterCifraOnlineLouvor,
  salvarCifraManualLouvor,
  type LouvorApp,
} from "@/modules/louvores/api";
import { toast } from "sonner";

const ESCALA_MIN = 0.85;
const ESCALA_MAX = 1.8;
const ESCALA_PADRAO = 1.05;
const PASSO = 0.1;

type Props = {
  louvor: LouvorApp | null;
  aberto: boolean;
  onFechar: () => void;
  onCacheAtualizado?: () => void;
  modoEdicaoInicial?: boolean;
};

export function VisualizadorCifraOnlineLouvor({
  louvor,
  aberto,
  onFechar,
  onCacheAtualizado,
  modoEdicaoInicial = false,
}: Props) {
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<string[]>([]);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [fonte, setFonte] = useState<string | null>(null);
  const [doCache, setDoCache] = useState(false);
  const [escala, setEscala] = useState(ESCALA_PADRAO);
  const [modoEdicao, setModoEdicao] = useState(false);

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
      setFonte(resposta.fonte ?? null);
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
      setTextoEdicao("");
      setErro(null);
      setEscala(ESCALA_PADRAO);
      setModoEdicao(false);
      return;
    }

    const iniciar = async () => {
      if (modoEdicaoInicial && louvor?.temCifraApiSalva && louvor.idNum) {
        setCarregando(true);
        try {
          const resposta = await obterCifraOnlineLouvor(louvor.idNum);
          const conteudo = resposta.linhas?.join("\n") ?? "";
          setLinhas(resposta.linhas ?? []);
          setTextoEdicao(conteudo);
          setUrl(resposta.url ?? null);
          setFonte(resposta.fonte ?? null);
          setDoCache(resposta.doCache);
        } catch {
          setTextoEdicao("");
        } finally {
          setCarregando(false);
        }
        setModoEdicao(true);
        return;
      }

      if (modoEdicaoInicial) {
        setTextoEdicao("");
        setModoEdicao(true);
        setErro(null);
        return;
      }

      void carregar();
    };

    void iniciar();
  }, [aberto, carregar, modoEdicaoInicial, louvor?.idNum, louvor?.temCifraApiSalva]);

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
      if (event.key === "Escape" && !modoEdicao) onFechar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aberto, onFechar, modoEdicao]);

  const abrirEdicao = (conteudoInicial = "") => {
    setTextoEdicao(conteudoInicial || linhas.join("\n"));
    setModoEdicao(true);
    setErro(null);
  };

  const salvarManual = async () => {
    if (!louvor?.idNum || !textoEdicao.trim()) {
      toast.error("Informe o texto da cifra.");
      return;
    }
    setSalvando(true);
    try {
      const resposta = await salvarCifraManualLouvor(louvor.idNum, textoEdicao.trim());
      setLinhas(resposta.linhas ?? textoEdicao.split("\n"));
      setUrl(null);
      setFonte("manual");
      setDoCache(true);
      setModoEdicao(false);
      setErro(null);
      onCacheAtualizado?.();
      toast.success("Cifra salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar cifra.");
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto || !louvor) return null;

  const linhasExibidas = filtrarTablaturas(linhas);
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
            {doCache && linhas.length > 0 && !modoEdicao && (
              <span className="ml-2 text-zinc-500">· salva no app</span>
            )}
          </p>
        </div>

        {!carregando && !modoEdicao && linhas.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300"
              onClick={() => abrirEdicao()}
              aria-label="Editar cifra"
            >
              <Pencil className="h-4 w-4" />
            </Button>
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
        {modoEdicao && carregando && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Carregando…</p>
          </div>
        )}

        {modoEdicao && !carregando && (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <p className="text-sm text-zinc-400">
              Cole a cifra com acordes e letra (formato Cifra Club). Ela ficará salva no app.
            </p>
            <Textarea
              value={textoEdicao}
              onChange={(e) => setTextoEdicao(e.target.value)}
              placeholder={"[Intro] C  G  Am  F\n\nC              G\nPrimeira linha da letra\nAm             F\nSegunda linha..."}
              className="min-h-[50vh] resize-y bg-zinc-900 text-zinc-100 border-zinc-700 font-mono text-sm leading-relaxed"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void salvarManual()} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar cifra"}
              </Button>
              <Button
                variant="outline"
                className="border-zinc-500 bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                onClick={() => {
                  if (linhas.length > 0) {
                    setModoEdicao(false);
                  } else {
                    onFechar();
                  }
                }}
                disabled={salvando}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {!modoEdicao && carregando && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Buscando cifra…</p>
          </div>
        )}

        {!modoEdicao && !carregando && erro && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="max-w-md text-sm text-zinc-300">{erro}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="secondary"
                className="bg-zinc-100 text-zinc-900 hover:bg-white"
                onClick={() => void carregar()}
              >
                Tentar novamente
              </Button>
              <Button variant="default" onClick={() => abrirEdicao("")}>
                Inserir manualmente
              </Button>
            </div>
          </div>
        )}

        {!modoEdicao && !carregando && !erro && linhasExibidas.length > 0 && (
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
            {url && fonte !== "manual" && (
              <p className="mt-6 text-center text-xs text-zinc-500">
                Fonte:{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">
                  Cifra Club
                </a>
              </p>
            )}
            {fonte === "manual" && (
              <p className="mt-6 text-center text-xs text-zinc-500">Fonte: Manual</p>
            )}
          </article>
        )}
      </div>
    </div>,
    document.body,
  );
}
