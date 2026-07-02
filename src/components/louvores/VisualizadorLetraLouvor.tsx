import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Minus, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { obterLetraLouvor, salvarLetraManualLouvor, type LouvorApp } from "@/modules/louvores/api";
import { toast } from "sonner";

const ESCALA_MIN = 0.9;
const ESCALA_MAX = 1.8;
const ESCALA_PADRAO = 1.1;
const PASSO = 0.08;

type Props = {
  louvor: LouvorApp | null;
  aberto: boolean;
  onFechar: () => void;
  onCacheAtualizado?: () => void;
  modoEdicaoInicial?: boolean;
};

export function VisualizadorLetraLouvor({
  louvor,
  aberto,
  onFechar,
  onCacheAtualizado,
  modoEdicaoInicial = false,
}: Props) {
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [textoEdicao, setTextoEdicao] = useState("");
  const [fonte, setFonte] = useState<string | null>(null);
  const [doCache, setDoCache] = useState(false);
  const [escala, setEscala] = useState(ESCALA_PADRAO);
  const [modoEdicao, setModoEdicao] = useState(false);

  const carregar = useCallback(async () => {
    if (!louvor?.idNum) return;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await obterLetraLouvor(louvor.idNum);
      if (!resposta.disponivel || !resposta.texto?.trim()) {
        setErro(resposta.mensagem ?? "Letra não disponível.");
        setTexto("");
        return;
      }
      setTexto(resposta.texto);
      setFonte(resposta.fonte ?? null);
      setDoCache(resposta.doCache);
      if (!resposta.doCache) {
        onCacheAtualizado?.();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar letra.");
      setTexto("");
    } finally {
      setCarregando(false);
    }
  }, [louvor, onCacheAtualizado]);

  useEffect(() => {
    if (!aberto) {
      setTexto("");
      setTextoEdicao("");
      setFonte(null);
      setErro(null);
      setEscala(ESCALA_PADRAO);
      setModoEdicao(false);
      return;
    }

    const iniciar = async () => {
      if (modoEdicaoInicial && louvor?.temLetraSalva && louvor.idNum) {
        setCarregando(true);
        try {
          const resposta = await obterLetraLouvor(louvor.idNum);
          const conteudo = resposta.texto?.trim() ?? "";
          setTexto(conteudo);
          setTextoEdicao(conteudo);
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
  }, [aberto, carregar, modoEdicaoInicial, louvor?.idNum, louvor?.temLetraSalva]);

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
    setTextoEdicao(conteudoInicial || texto);
    setModoEdicao(true);
    setErro(null);
  };

  const salvarManual = async () => {
    if (!louvor?.idNum || !textoEdicao.trim()) {
      toast.error("Informe o texto da letra.");
      return;
    }
    setSalvando(true);
    try {
      const resposta = await salvarLetraManualLouvor(louvor.idNum, textoEdicao.trim());
      setTexto(resposta.texto ?? textoEdicao.trim());
      setFonte("manual");
      setDoCache(true);
      setModoEdicao(false);
      setErro(null);
      onCacheAtualizado?.();
      toast.success("Letra salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar letra.");
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto || !louvor) return null;

  const tamanhoFonte = Math.round(17 * escala);
  const linhas = texto.split("\n");
  const rotuloFonte =
    fonte === "manual"
      ? "Manual"
      : fonte === "lrclib"
        ? "LRCLIB"
        : fonte === "genius"
          ? "Genius"
          : fonte === "cifraclub"
            ? "Cifra Club"
            : fonte === "salva"
              ? "Salva no app"
              : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-zinc-100"
      role="dialog"
      aria-modal="true"
      aria-label={`Letra: ${louvor.title}`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur-sm sm:px-4">
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
            {doCache && texto && !modoEdicao && <span className="ml-2 text-zinc-500">· salva no app</span>}
          </p>
        </div>

        {!carregando && !modoEdicao && texto && (
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300"
              onClick={() => abrirEdicao()}
              aria-label="Editar letra"
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

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-y px-3 py-4 sm:px-8 sm:py-8">
        {modoEdicao && carregando && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Carregando…</p>
          </div>
        )}

        {modoEdicao && !carregando && (
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            <p className="text-sm text-zinc-400">
              Cole ou digite a letra. Ela ficará salva no app para este louvor.
            </p>
            <Textarea
              value={textoEdicao}
              onChange={(e) => setTextoEdicao(e.target.value)}
              placeholder={"[Refrão]\n\nPrimeira linha da letra\nSegunda linha..."}
              className="min-h-[50vh] resize-y bg-zinc-900 text-zinc-100 border-zinc-700 font-sans text-base leading-relaxed"
              autoFocus
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void salvarManual()} disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar letra"}
              </Button>
              <Button
                variant="outline"
                className="border-zinc-500 bg-zinc-800/90 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                onClick={() => {
                  if (texto) {
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
            <p className="text-sm">Buscando letra…</p>
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

        {!modoEdicao && !carregando && !erro && texto && (
          <article
            className="mx-auto max-w-xl rounded-lg bg-[#fffef8] px-5 py-6 text-zinc-900 shadow-2xl shadow-black/40 sm:px-10 sm:py-10"
          >
            <div
              className="whitespace-pre-wrap leading-[1.75] tracking-wide"
              style={{ fontSize: `${tamanhoFonte}px` }}
            >
              {linhas.map((linha, idx) => (
                <p key={idx} className={linha.trim() === "" ? "h-[0.6em]" : "mb-1"}>
                  {linha || "\u00A0"}
                </p>
              ))}
            </div>
            {rotuloFonte && (
              <p className="mt-8 text-center text-xs text-zinc-500">Fonte: {rotuloFonte}</p>
            )}
          </article>
        )}
      </div>
    </div>,
    document.body,
  );
}
