import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import mammoth from "mammoth";
import {
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { obterCifraLouvor, type LouvorApp } from "@/modules/louvores/api";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const ESCALA_MIN = 0.6;
const ESCALA_MAX = 3;
const ESCALA_PADRAO = 1.15;
const PASSO_ZOOM = 0.15;

type ModoArquivo = "pdf" | "docx" | "nao-suportado";

function detectarModo(contentType: string, fileName: string): ModoArquivo {
  const tipo = contentType.toLowerCase();
  const nome = fileName.toLowerCase();
  if (tipo.includes("pdf") || nome.endsWith(".pdf")) return "pdf";
  if (
    tipo.includes("wordprocessingml") ||
    tipo.includes("officedocument") ||
    nome.endsWith(".docx")
  ) {
    return "docx";
  }
  return "nao-suportado";
}

type Props = {
  louvor: LouvorApp | null;
  aberto: boolean;
  onFechar: () => void;
};

export function VisualizadorCifraLouvor({ louvor, aberto, onFechar }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [htmlDocx, setHtmlDocx] = useState<string | null>(null);
  const [modo, setModo] = useState<ModoArquivo>("pdf");
  const [fileName, setFileName] = useState("");
  const [numPaginas, setNumPaginas] = useState(0);
  const [escala, setEscala] = useState(ESCALA_PADRAO);
  const [larguraPagina, setLarguraPagina] = useState<number | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const pdfUrlRef = useRef<string | null>(null);

  const limpar = useCallback(() => {
    setErro(null);
    setHtmlDocx(null);
    setNumPaginas(0);
    setEscala(ESCALA_PADRAO);
    setLarguraPagina(null);
    setModo("pdf");
    setFileName("");
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
    setPdfUrl(null);
  }, []);

  const carregar = useCallback(async () => {
    if (!louvor?.idNum || !louvor.cifraFileName) return;
    setCarregando(true);
    setErro(null);
    limpar();
    try {
      const arquivo = await obterCifraLouvor(louvor.idNum);
      const modoDetectado = detectarModo(arquivo.contentType, arquivo.fileName);
      setFileName(arquivo.fileName);
      setModo(modoDetectado);

      if (modoDetectado === "pdf") {
        const url = URL.createObjectURL(arquivo.blob);
        pdfUrlRef.current = url;
        setPdfUrl(url);
      } else if (modoDetectado === "docx") {
        const buffer = await arquivo.blob.arrayBuffer();
        const resultado = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setHtmlDocx(resultado.value);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar a cifra.");
    } finally {
      setCarregando(false);
    }
  }, [limpar, louvor]);

  useEffect(() => {
    if (!aberto) {
      limpar();
      return;
    }
    void carregar();
  }, [aberto, carregar, limpar]);

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
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setEscala((atual) => Math.min(ESCALA_MAX, atual + PASSO_ZOOM));
      }
      if (event.key === "-") {
        event.preventDefault();
        setEscala((atual) => Math.max(ESCALA_MIN, atual - PASSO_ZOOM));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [aberto, onFechar]);

  const ajustarLargura = useCallback(() => {
    if (!areaRef.current || !larguraPagina) return;
    const margem = 24;
    const disponivel = areaRef.current.clientWidth - margem;
    const novaEscala = Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, disponivel / larguraPagina));
    setEscala(Number(novaEscala.toFixed(2)));
  }, [larguraPagina]);

  const paginas = useMemo(
    () => Array.from({ length: numPaginas }, (_, i) => i + 1),
    [numPaginas],
  );

  if (!aberto || !louvor) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-zinc-100"
      role="dialog"
      aria-modal="true"
      aria-label={`Cifra: ${louvor.title}`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950/95 px-3 py-2 backdrop-blur-sm sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          onClick={onFechar}
          aria-label="Fechar visualizador"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight sm:text-base">{louvor.title}</p>
          <p className="truncate text-xs text-zinc-400">{louvor.artist}</p>
        </div>

        {(modo === "pdf" || modo === "docx") && !carregando && !erro && (
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={() => setEscala((atual) => Math.max(ESCALA_MIN, atual - PASSO_ZOOM))}
              aria-label="Diminuir zoom"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="hidden min-w-[3rem] text-center text-xs tabular-nums text-zinc-400 sm:inline">
              {Math.round(escala * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={() => setEscala((atual) => Math.min(ESCALA_MAX, atual + PASSO_ZOOM))}
              aria-label="Aumentar zoom"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {modo === "pdf" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={ajustarLargura}
                aria-label="Ajustar à largura"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </header>

      <div
        ref={areaRef}
        className="min-h-0 flex-1 overflow-auto overscroll-contain touch-pan-y"
      >
        {carregando && (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Carregando cifra...</p>
          </div>
        )}

        {!carregando && erro && (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="max-w-sm text-sm text-zinc-300">{erro}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void carregar()}>
                Tentar novamente
              </Button>
              <Button variant="ghost" onClick={onFechar}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {!carregando && !erro && modo === "nao-suportado" && (
          <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-400" />
            <p className="max-w-sm text-sm text-zinc-300">
              Este formato de arquivo não pode ser visualizado no app. Use a opção &quot;Cifra online&quot; no
              cadastro do louvor.
            </p>
            <Button variant="ghost" onClick={onFechar}>
              Fechar
            </Button>
          </div>
        )}

        {!carregando && !erro && modo === "pdf" && pdfUrl && (
          <div className="flex flex-col items-center gap-4 px-2 py-4 sm:px-4 sm:py-6">
            <Document
              file={pdfUrl}
              onLoadSuccess={({ numPages }) => setNumPaginas(numPages)}
              loading={
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-gold" />
                </div>
              }
              error={
                <p className="py-8 text-center text-sm text-destructive">
                  Não foi possível renderizar o PDF.
                </p>
              }
              className="flex flex-col items-center gap-4"
            >
              {paginas.map((numero) => (
                <div
                  key={numero}
                  className={cn(
                    "overflow-hidden rounded-sm bg-white shadow-2xl shadow-black/40",
                    "ring-1 ring-zinc-200/10",
                  )}
                >
                  <Page
                    pageNumber={numero}
                    scale={escala}
                    renderTextLayer
                    renderAnnotationLayer
                    onLoadSuccess={(page) => {
                      if (numero === 1 && !larguraPagina) {
                        setLarguraPagina(page.originalWidth);
                      }
                    }}
                  />
                </div>
              ))}
            </Document>
            {numPaginas > 1 && (
              <p className="pb-4 text-xs text-zinc-500">
                {numPaginas} {numPaginas === 1 ? "página" : "páginas"} — role para ler
              </p>
            )}
          </div>
        )}

        {!carregando && !erro && modo === "docx" && htmlDocx && (
          <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-8">
            <article
              className="cifra-docx rounded-lg bg-[#fffef8] px-5 py-6 text-zinc-900 shadow-2xl shadow-black/40 ring-1 ring-zinc-200 sm:px-8 sm:py-10"
              style={{
                fontSize: `${Math.round(15 * escala)}px`,
                lineHeight: 1.65,
              }}
              dangerouslySetInnerHTML={{ __html: htmlDocx }}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
