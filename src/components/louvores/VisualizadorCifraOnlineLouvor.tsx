import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Minus, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CifraEstiloCifraClub, COR_ACORDE_CIFRA } from "@/components/louvores/CifraEstiloCifraClub";
import {
  estimarColunasMonospace,
  quebrarCifraParaLargura,
  sanitizarLinhasCifra,
  sanitizarTextoCifraColado,
  textoCifraDoClipboard,
} from "@/lib/cifra-linhas";
import {
  obterCifraOnlineLouvor,
  salvarCifraManualLouvor,
  type LouvorApp,
} from "@/modules/louvores/api";
import { toast } from "sonner";

const ESCALA_MIN = 0.85;
const ESCALA_MAX = 1.8;
const ESCALA_PADRAO = 1;
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
  const [larguraUtil, setLarguraUtil] = useState(0);
  const areaCifraRef = useRef<HTMLDivElement | null>(null);
  const onCacheAtualizadoRef = useRef(onCacheAtualizado);
  onCacheAtualizadoRef.current = onCacheAtualizado;
  const pedidoRef = useRef(0);

  const carregar = useCallback(async (louvorId: number) => {
    const pedido = ++pedidoRef.current;
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await obterCifraOnlineLouvor(louvorId);
      if (pedido !== pedidoRef.current) return;
      if (!resposta.disponivel || !resposta.linhas?.length) {
        setErro(resposta.mensagem ?? "Cifra não disponível.");
        setLinhas([]);
        return;
      }
      setLinhas(sanitizarLinhasCifra(resposta.linhas));
      setUrl(resposta.url ?? null);
      setFonte(resposta.fonte ?? null);
      setDoCache(resposta.doCache);
      if (!resposta.doCache) {
        onCacheAtualizadoRef.current?.();
      }
    } catch (e) {
      if (pedido !== pedidoRef.current) return;
      setErro(e instanceof Error ? e.message : "Erro ao carregar cifra.");
      setLinhas([]);
    } finally {
      if (pedido === pedidoRef.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!aberto) {
      pedidoRef.current += 1;
      setLinhas([]);
      setTextoEdicao("");
      setErro(null);
      setEscala(ESCALA_PADRAO);
      setModoEdicao(false);
      setLarguraUtil(0);
      setCarregando(false);
      return;
    }

    const louvorId = louvor?.idNum;
    if (!louvorId) return;

    const iniciar = async () => {
      if (modoEdicaoInicial && louvor?.temCifraApiSalva) {
        const pedido = ++pedidoRef.current;
        setCarregando(true);
        try {
          const resposta = await obterCifraOnlineLouvor(louvorId);
          if (pedido !== pedidoRef.current) return;
          const conteudo = sanitizarTextoCifraColado(resposta.linhas?.join("\n") ?? "");
          setLinhas(conteudo ? conteudo.split("\n") : []);
          setTextoEdicao(conteudo);
          setUrl(resposta.url ?? null);
          setFonte(resposta.fonte ?? null);
          setDoCache(resposta.doCache);
        } catch {
          if (pedido !== pedidoRef.current) return;
          setTextoEdicao("");
        } finally {
          if (pedido === pedidoRef.current) setCarregando(false);
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

      void carregar(louvorId);
    };

    void iniciar();
  }, [aberto, carregar, modoEdicaoInicial, louvor?.idNum, louvor?.temCifraApiSalva]);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const peAnterior = document.body.style.pointerEvents;
    document.body.style.pointerEvents = "";
    return () => {
      document.body.style.overflow = anterior;
      document.body.style.pointerEvents = peAnterior;
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

  useEffect(() => {
    if (!aberto || modoEdicao || carregando || erro || linhas.length === 0) return;
    const el = areaCifraRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const atualizar = () => {
      const w = el.clientWidth;
      if (w > 0) setLarguraUtil(w);
    };
    atualizar();
    const observer = new ResizeObserver(atualizar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aberto, modoEdicao, carregando, erro, linhas.length, escala]);

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
      const resposta = await salvarCifraManualLouvor(louvor.idNum, sanitizarTextoCifraColado(textoEdicao));
      setLinhas(sanitizarLinhasCifra(resposta.linhas ?? textoEdicao.split("\n")));
      setUrl(null);
      setFonte("manual");
      setDoCache(true);
      setModoEdicao(false);
      setErro(null);
      onCacheAtualizadoRef.current?.();
      toast.success("Cifra salva.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar cifra.");
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto || !louvor) return null;

  const tablet = larguraUtil >= 700 || (typeof window !== "undefined" && window.innerWidth >= 768);
  const duasColunas = tablet && larguraUtil >= 900;
  const tamanhoBase = tablet ? 17 : 15;
  const tamanhoFonte = Math.round(tamanhoBase * escala);
  const maxCols =
    larguraUtil > 0
      ? estimarColunasMonospace(duasColunas ? larguraUtil / 2 - 24 : larguraUtil, tamanhoFonte)
      : tablet
        ? 56
        : 40;
  const linhasExibicao = linhas.length > 0 ? quebrarCifraParaLargura(sanitizarLinhasCifra(linhas), maxCols) : [];

  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[100] flex flex-col bg-[#121212] text-[#f3f3f3]"
      role="dialog"
      aria-modal="true"
      aria-label={`Cifra: ${louvor.title}`}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 bg-[#121212] px-3 py-2 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-zinc-300 hover:bg-white/10 hover:text-white"
          onClick={onFechar}
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white sm:text-lg">{louvor.title}</p>
          <p className="truncate text-xs sm:text-sm" style={{ color: COR_ACORDE_CIFRA }}>
            {louvor.artist}
            {doCache && linhas.length > 0 && !modoEdicao && (
              <span className="ml-2 text-zinc-500">· salva no app</span>
            )}
          </p>
        </div>

        {!carregando && !modoEdicao && linhas.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-white/10"
              onClick={() => abrirEdicao()}
              aria-label="Editar cifra"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-white/10"
              onClick={() => setEscala((v) => Math.max(ESCALA_MIN, v - PASSO))}
              aria-label="Diminuir fonte"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-white/10"
              onClick={() => setEscala((v) => Math.min(ESCALA_MAX, v + PASSO))}
              aria-label="Aumentar fonte"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {modoEdicao && !carregando && (
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={() => void salvarManual()}
            disabled={salvando}
          >
            {salvando ? "Salvando…" : "Salvar"}
          </Button>
        )}
      </header>

      <div
        className="min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-y px-4 py-4 sm:px-8 sm:py-6 md:px-10 lg:px-16"
        data-scroll-lock-scrollable=""
      >
        {modoEdicao && carregando && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: COR_ACORDE_CIFRA }} />
            <p className="text-sm">Carregando…</p>
          </div>
        )}

        {modoEdicao && !carregando && (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
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
            <p className="text-sm text-zinc-400">
              Cole a cifra com acordes na linha de cima e a letra embaixo. A prévia abaixo já mostra o visual
              Cifra Club; ao salvar, não precisa sair da música.
            </p>
            <Textarea
              value={textoEdicao}
              onChange={(e) => setTextoEdicao(e.target.value)}
              onPaste={(e) => {
                const colado = textoCifraDoClipboard(e.clipboardData);
                if (!colado) return;
                e.preventDefault();
                const alvo = e.currentTarget;
                const inicio = alvo.selectionStart ?? textoEdicao.length;
                const fim = alvo.selectionEnd ?? textoEdicao.length;
                const misturado = textoEdicao.slice(0, inicio) + colado + textoEdicao.slice(fim);
                setTextoEdicao(sanitizarTextoCifraColado(misturado));
              }}
              placeholder={"[Intro] C  G  Am  F\n\nC              G\nPrimeira linha da letra\nAm             F\nSegunda linha..."}
              className="min-h-[28vh] resize-y border-zinc-700 bg-zinc-900 font-mono text-sm leading-relaxed text-zinc-100 md:min-h-[32vh]"
              autoFocus
            />
            {textoEdicao.trim() && (
              <div className="rounded-lg border border-white/10 bg-[#121212] px-3 py-3 md:px-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Prévia
                </p>
                <CifraEstiloCifraClub
                  linhas={quebrarCifraParaLargura(textoEdicao.replace(/\t/g, "    ").split("\n"), 42)}
                  tamanhoFonte={14}
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2 pb-4">
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
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: COR_ACORDE_CIFRA }} />
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
                onClick={() => louvor.idNum && void carregar(louvor.idNum)}
              >
                Tentar novamente
              </Button>
              <Button variant="default" onClick={() => abrirEdicao("")}>
                Inserir manualmente
              </Button>
            </div>
          </div>
        )}

        {!modoEdicao && !carregando && !erro && linhas.length > 0 && (
          <article className="mx-auto w-full max-w-3xl pb-10 md:max-w-4xl lg:max-w-5xl">
            {louvor.key?.trim() && (
              <p className="mb-4 font-mono text-[15px] text-[#f3f3f3] md:text-base">
                Tom:{" "}
                <span className="font-bold" style={{ color: COR_ACORDE_CIFRA }}>
                  {louvor.key}
                </span>
              </p>
            )}
            <div ref={areaCifraRef} className="w-full min-w-0">
              <CifraEstiloCifraClub
                linhas={linhasExibicao}
                tamanhoFonte={tamanhoFonte}
                duasColunas={duasColunas}
              />
            </div>
            {url && fonte !== "manual" && (
              <p className="mt-8 text-center text-xs text-zinc-500">
                Fonte:{" "}
                <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-300">
                  Cifra Club
                </a>
              </p>
            )}
            {fonte === "manual" && (
              <p className="mt-8 text-center text-xs text-zinc-500">Fonte: Manual</p>
            )}
          </article>
        )}
      </div>
    </div>,
    document.body,
  );
}
