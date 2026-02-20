import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Search, 
  Star, 
  Share2, 
  ChevronRight,
  BookMarked,
  Highlighter,
  NotebookPen,
  History,
  ListChecks,
  Copy,
  Settings,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";
import {
  livrosBiblia,
  livrosAntigoTestamento,
  livrosNovoTestamento,
  type LivroBiblia,
} from "@/data/bible-books";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import {
  adicionarFavorito,
  adicionarNota,
  alternarLeituraCapitulo,
  alternarProgressoLeitura,
  calcularProgressoLivro,
  foiCapituloLido,
  obterCapituloCache,
  obterDestaquePorVersiculo,
  obterDestaques,
  obterDiasPlanoLeitura,
  obterFavoritoCorrespondente,
  obterFavoritos,
  obterHistoricoLeitura,
  obterIdUsuario,
  obterLeiturasCapitulos,
  obterNotas,
  obterPlanosLeitura,
  obterPreferencias,
  obterProgressoLeitura,
  obterProgressoLeituraPorDia,
  obterReferenciaSelecao,
  registrarHistoricoLeitura,
  removerDestaque,
  removerFavorito,
  removerHistorico,
  removerNota,
  resolverRotuloIntervalo,
  salvarCapituloCache,
  salvarDestaque,
  salvarPreferencias,
  buscarNoCache,
  atualizarNota,
} from "@/modules/bible/service";
import { versiculoNoIntervalo } from "@/modules/bible/utils";
import type {
  CorDestaque,
  DestaqueBiblia,
  FavoritoBiblia,
  HistoricoLeituraBiblia,
  LeituraCapitulo,
  NotaBiblia,
  PlanoLeitura,
  DiaPlanoLeitura,
  PreferenciaBibliaUsuario,
  ProgressoLeituraUsuario,
  ResultadoBuscaBiblia,
} from "@/modules/bible/types";

const URL_API_BIBLIA = "https://bible-api.com";
const VERSAO_PADRAO = "almeida";

const IDS_VERSOES_PREFERIDAS = [
  "almeida",
  "kjv",
];

const NOMES_LIVROS_INGLES: Record<string, string> = {
  gn: "Genesis",
  ex: "Exodus",
  lv: "Leviticus",
  nm: "Numbers",
  dt: "Deuteronomy",
  js: "Joshua",
  jz: "Judges",
  rt: "Ruth",
  "1sm": "1 Samuel",
  "2sm": "2 Samuel",
  "1rs": "1 Kings",
  "2rs": "2 Kings",
  "1cr": "1 Chronicles",
  "2cr": "2 Chronicles",
  ed: "Ezra",
  ne: "Nehemiah",
  et: "Esther",
  jo: "Job",
  sl: "Psalms",
  pv: "Proverbs",
  ec: "Ecclesiastes",
  ct: "Song of Solomon",
  is: "Isaiah",
  jr: "Jeremiah",
  lm: "Lamentations",
  ez: "Ezekiel",
  dn: "Daniel",
  os: "Hosea",
  jl: "Joel",
  am: "Amos",
  ob: "Obadiah",
  jn: "Jonah",
  mq: "Micah",
  na: "Nahum",
  hc: "Habakkuk",
  sf: "Zephaniah",
  ag: "Haggai",
  zc: "Zechariah",
  ml: "Malachi",
  mt: "Matthew",
  mc: "Mark",
  lc: "Luke",
  jo2: "John",
  at: "Acts",
  rm: "Romans",
  "1co": "1 Corinthians",
  "2co": "2 Corinthians",
  gl: "Galatians",
  ef: "Ephesians",
  fp: "Philippians",
  cl: "Colossians",
  "1ts": "1 Thessalonians",
  "2ts": "2 Thessalonians",
  "1tm": "1 Timothy",
  "2tm": "2 Timothy",
  tt: "Titus",
  fm: "Philemon",
  hb: "Hebrews",
  tg: "James",
  "1pe": "1 Peter",
  "2pe": "2 Peter",
  "1jo": "1 John",
  "2jo": "2 John",
  "3jo": "3 John",
  jd: "Jude",
  ap: "Revelation",
};

type VersiculoCapitulo = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

type RespostaCapitulo = {
  verses: VersiculoCapitulo[];
  reference: string;
  translation_id: string;
  translation_name: string;
};

type InfoVersao = {
  identifier: string;
  name: string;
  language: string;
  language_code: string;
};

type RespostaVersao = {
  translations: InfoVersao[];
};

const VERSOES_FALLBACK: InfoVersao[] = [
  {
    identifier: "almeida",
    name: "João Ferreira de Almeida",
    language: "Portuguese",
    language_code: "por",
  },
  {
    identifier: "kjv",
    name: "King James Version",
    language: "English",
    language_code: "eng",
  },
  {
    identifier: "bbe",
    name: "Bible in Basic English",
    language: "English",
    language_code: "eng",
  },
  {
    identifier: "web",
    name: "World English Bible",
    language: "English",
    language_code: "eng",
  },
];

const CLASSES_MARCACAO: Record<CorDestaque, string> = {
  yellow: "bg-yellow-100/70 dark:bg-yellow-400/20",
  green: "bg-green-100/70 dark:bg-green-400/20",
  blue: "bg-blue-100/70 dark:bg-blue-400/20",
  red: "bg-red-100/70 dark:bg-red-400/20",
  purple: "bg-purple-100/70 dark:bg-purple-400/20",
};

const obterRotuloVersao = (version: string, versions: InfoVersao[]) => {
  const match = versions.find((item) => item.identifier === version);
  return match?.name ?? version.toUpperCase();
};

const obterNomeLivroParaVersao = (book: LivroBiblia, version?: InfoVersao) => {
  if (!version || version.language_code === "por") {
    return book.name;
  }

  return NOMES_LIVROS_INGLES[book.id] ?? book.name;
};

const montarConsultaApiBiblia = (bookName: string, chapter: number) => {
  const rawQuery = `${bookName} ${chapter}`;
  return encodeURIComponent(rawQuery).replace(/%20/g, "+");
};

function CartaoLivro({ book, onClick }: { book: LivroBiblia; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-muted transition-all text-left w-full group"
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
        book.testament === "old" 
          ? "bg-olive/10 text-olive" 
          : "bg-deep-blue/10 text-deep-blue"
      )}>
        {book.abbrev}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{book.name}</p>
        <p className="text-xs text-muted-foreground">{book.chapters} capítulos</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </button>
  );
}

export default function Biblia() {
  const [searchParams] = useSearchParams();
  const { user } = usarAutenticacao();
  const userId = obterIdUsuario(user?.id);
  const [buscaLivro, setBuscaLivro] = useState("");
  const [selectedBook, setSelectedBook] = useState<LivroBiblia | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState(VERSAO_PADRAO);
  const [availableVersions, setAvailableVersions] = useState<InfoVersao[]>([]);
  const [chapterData, setChapterData] = useState<RespostaCapitulo | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoritoBiblia[]>([]);
  const [highlights, setHighlights] = useState<DestaqueBiblia[]>([]);
  const [notes, setNotes] = useState<NotaBiblia[]>([]);
  const [history, setHistory] = useState<HistoricoLeituraBiblia[]>([]);
  const [preferences, setPreferences] = useState<PreferenciaBibliaUsuario | null>(null);
  const [planList, setPlanList] = useState<PlanoLeitura[]>([]);
  const [planDays, setPlanDays] = useState<DiaPlanoLeitura[]>([]);
  const [readingProgress, setReadingProgress] = useState<ProgressoLeituraUsuario[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [leiturasCapitulos, setLeiturasCapitulos] = useState<LeituraCapitulo[]>([]);
  const [versiculoAtivo, setVersiculoAtivo] = useState<number | null>(null);
  const [versoInicio, setVersoInicio] = useState<number>(1);
  const [versoFim, setVersoFim] = useState<number>(1);
  const [corMarcacao, setCorMarcacao] = useState<CorDestaque>("yellow");
  const [rascunhoNota, setRascunhoNota] = useState("");
  const [idNotaEditando, setIdNotaEditando] = useState<string | null>(null);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [buscaLivroId, setBuscaLivroId] = useState("");
  const [buscaTestamento, setBuscaTestamento] = useState("");
  const [resultadosBusca, setResultadosBusca] = useState<ResultadoBuscaBiblia[]>([]);
  const [shareIncludeReference, setShareIncludeReference] = useState(true);
  const [shareIncludeVersion, setShareIncludeVersion] = useState(true);
  const [shareIncludeChurch, setShareIncludeChurch] = useState(true);
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);
  const [abaPainelEstudo, setAbaPainelEstudo] = useState("favorites");
  const [painelEstudoAberto, setPainelEstudoAberto] = useState(false);
  const painelEstudoRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const controller = new AbortController();

    const loadVersions = async () => {
      try {
        const response = await fetch(`${URL_API_BIBLIA}/data`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as versões.");
        }

        const data = (await response.json()) as RespostaVersao;
        const translations = Array.isArray(data?.translations)
          ? data.translations
          : [];

        const preferredSet = new Set(IDS_VERSOES_PREFERIDAS);
        const filtered = translations.filter(
          (version) =>
            preferredSet.has(version.identifier) || version.language_code === "por",
        );
        const sorted = filtered.sort((a, b) => {
          const aPreferred = preferredSet.has(a.identifier) ? 0 : 1;
          const bPreferred = preferredSet.has(b.identifier) ? 0 : 1;
          if (aPreferred !== bPreferred) {
            return aPreferred - bPreferred;
          }
          return a.name.localeCompare(b.name);
        });
        const versionsToUse = sorted.length > 0 ? sorted : VERSOES_FALLBACK;

        const referenceBook = livrosBiblia[0];
        const referenceChapter = 1;
        const validated = await Promise.all(
          versionsToUse.map(async (version) => {
            const bookName = obterNomeLivroParaVersao(referenceBook, version);
            const query = montarConsultaApiBiblia(bookName, referenceChapter);
            try {
              const validationResponse = await fetch(
                `${URL_API_BIBLIA}/${query}?translation=${version.identifier}`,
                { signal: controller.signal },
              );
              if (!validationResponse.ok) {
                return null;
              }
              const validationData = (await validationResponse.json()) as RespostaCapitulo;
              if (!Array.isArray(validationData.verses) || validationData.verses.length === 0) {
                return null;
              }
              return version;
            } catch (error) {
              if ((error as Error).name === "AbortError") {
                return null;
              }
              return null;
            }
          }),
        );

        const workingVersions = validated.filter(
          (version): version is InfoVersao => Boolean(version),
        );
        const combined = [...workingVersions, ...VERSOES_FALLBACK];
        const uniqueMap = new Map<string, InfoVersao>();
        combined.forEach((version) => {
          if (!uniqueMap.has(version.identifier)) {
            uniqueMap.set(version.identifier, version);
          }
        });
        const versionsFinal = Array.from(uniqueMap.values());

        setAvailableVersions(versionsFinal);
        setSelectedVersion((previous) =>
          versionsFinal.some((version) => version.identifier === previous)
            ? previous
            : VERSAO_PADRAO,
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAvailableVersions([VERSOES_FALLBACK[0]]);
          setSelectedVersion(VERSAO_PADRAO);
        }
      }
    };

    loadVersions();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const bookId = searchParams.get("bookId");
    const chapterParam = searchParams.get("chapter");
    if (!bookId || !chapterParam) {
      return;
    }
    const book = livrosBiblia.find((item) => item.id === bookId);
    const chapter = Number(chapterParam);
    const verseStart = Number(searchParams.get("verseStart") ?? "1");
    const verseEnd = Number(searchParams.get("verseEnd") ?? verseStart);
    const version = searchParams.get("version");
    if (book && chapter) {
      setSelectedBook(book);
      setSelectedChapter(chapter);
      setVersoInicio(verseStart);
      setVersoFim(verseEnd);
      setVersiculoAtivo(verseStart);
    }
    if (version) {
      setSelectedVersion(version);
    }
  }, [searchParams]);

  useEffect(() => {
    setFavorites(obterFavoritos(userId));
    setHighlights(obterDestaques(userId));
    setNotes(obterNotas(userId));
    setHistory(obterHistoricoLeitura(userId));
    setPreferences(obterPreferencias(userId));
    setLeiturasCapitulos(obterLeiturasCapitulos(userId));
    const plans = obterPlanosLeitura(userId);
    setPlanList(plans);
    const activePlan = plans.find((plan) => plan.isActive) ?? plans[0];
    if (activePlan) {
      setSelectedPlanId(activePlan.id);
      setPlanDays(obterDiasPlanoLeitura(userId, activePlan.id));
    }
    setReadingProgress(obterProgressoLeitura(userId));
  }, [userId]);

  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
      return;
    }

    const controller = new AbortController();

    const loadChapter = async () => {
      setIsLoadingChapter(true);
      setChapterError(null);

      try {
        const selectedVersionInfo = versionsForSelect.find(
          (version) => version.identifier === selectedVersion,
        );
        const bookName = obterNomeLivroParaVersao(selectedBook, selectedVersionInfo);
        const query = montarConsultaApiBiblia(bookName, selectedChapter);
        const response = await fetch(
          `${URL_API_BIBLIA}/${query}?translation=${selectedVersion}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar este capítulo.");
        }

        const data = (await response.json()) as RespostaCapitulo;
        setChapterData(data);
        if (selectedBook) {
          salvarCapituloCache(
            userId,
            selectedBook,
            selectedChapter,
            selectedVersion,
            data.verses.map((verse) => ({ verse: verse.verse, text: verse.text })),
          );
          setHistory(
            registrarHistoricoLeitura(
              userId,
              obterReferenciaSelecao(selectedBook, selectedChapter, 1, 1),
              selectedVersion,
            ),
          );
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setChapterError(
            "Falha ao buscar os versículos. Verifique sua conexão ou tente outra versão.",
          );
          setChapterData(null);
        }
      } finally {
        setIsLoadingChapter(false);
      }
    };

    loadChapter();

    return () => controller.abort();
  }, [selectedBook, selectedChapter, selectedVersion]);

  // Rola até o versículo quando vem de link (ex: Jeremias 29:11)
  useEffect(() => {
    const verseFromUrl = searchParams.get("verseStart");
    if (!chapterData || versiculoAtivo == null || !verseFromUrl) return;
    const el = document.querySelector(`[data-verse="${versiculoAtivo}"]`);
    if (el) {
      const timer = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chapterData, versiculoAtivo, searchParams]);

  useEffect(() => {
    if (!selectedPlanId) {
      return;
    }
    setPlanDays(obterDiasPlanoLeitura(userId, selectedPlanId));
  }, [selectedPlanId, userId]);

  const versionsForSelect =
    availableVersions.length > 0 ? availableVersions : VERSOES_FALLBACK;

  useEffect(() => {
    if (!chapterData?.verses.length) {
      return;
    }
    const firstVerse = chapterData.verses[0].verse;
    setVersoInicio(firstVerse);
    setVersoFim(firstVerse);
  }, [chapterData]);

  const filteredOldTestament = livrosAntigoTestamento.filter((book) =>
    book.name.toLowerCase().includes(buscaLivro.toLowerCase())
  );

  const filteredNewTestament = livrosNovoTestamento.filter((book) =>
    book.name.toLowerCase().includes(buscaLivro.toLowerCase())
  );

  const handleBookSelect = (book: LivroBiblia) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setChapterData(null);
    setChapterError(null);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    setChapterData(null);
  };

  const handleBack = () => {
    if (selectedChapter) {
      setSelectedChapter(null);
    } else if (selectedBook) {
      setSelectedBook(null);
    }
  };

  const handleSelecionarVersiculo = (verso: number) => {
    setVersiculoAtivo((anterior) => (anterior === verso ? null : verso));
    setVersoInicio(verso);
    setVersoFim(verso);
  };

  const handleAlternarLeituraCapitulo = () => {
    if (!selectedBook || !selectedChapter) {
      return;
    }
    setLeiturasCapitulos(
      alternarLeituraCapitulo(userId, selectedBook, selectedChapter, selectedVersion),
    );
  };

  const selectionReference = useMemo(() => {
    if (!selectedBook || !selectedChapter) {
      return null;
    }
    return obterReferenciaSelecao(selectedBook, selectedChapter, versoInicio, versoFim);
  }, [selectedBook, selectedChapter, versoInicio, versoFim]);

  const isSelectionFavorite = useMemo(() => {
    if (!selectionReference) {
      return false;
    }
    return favorites.some(
      (favorite) =>
        favorite.version === selectedVersion &&
        favorite.reference.bookId === selectionReference.bookId &&
        favorite.reference.chapter === selectionReference.chapter &&
        favorite.reference.verseRange.start === selectionReference.verseRange.start &&
        favorite.reference.verseRange.end === selectionReference.verseRange.end,
    );
  }, [favorites, selectionReference, selectedVersion]);

  const progressoLivro = useMemo(() => {
    if (!selectedBook || !selectedChapter) {
      return { lidos: 0, total: 0, percentual: 0 };
    }
    return calcularProgressoLivro(
      leiturasCapitulos,
      selectedBook.id,
      selectedVersion,
      selectedBook.chapters,
    );
  }, [leiturasCapitulos, selectedBook, selectedChapter, selectedVersion]);

  const capituloLido = useMemo(() => {
    if (!selectedBook || !selectedChapter) {
      return false;
    }
    return foiCapituloLido(
      leiturasCapitulos,
      selectedBook.id,
      selectedChapter,
      selectedVersion,
    );
  }, [leiturasCapitulos, selectedBook, selectedChapter, selectedVersion]);

  const handleAlternarFavorito = () => {
    if (!selectionReference) {
      return;
    }
    const existing = favorites.find(
      (favorite) =>
        favorite.version === selectedVersion &&
        favorite.reference.bookId === selectionReference.bookId &&
        favorite.reference.chapter === selectionReference.chapter &&
        favorite.reference.verseRange.start === selectionReference.verseRange.start &&
        favorite.reference.verseRange.end === selectionReference.verseRange.end,
    );
    const next = existing
      ? removerFavorito(userId, existing.id)
      : adicionarFavorito(userId, selectionReference, selectedVersion);
    setFavorites(next);
  };

  const handleMarcarTexto = () => {
    if (!selectionReference) {
      return;
    }
    setHighlights(salvarDestaque(userId, selectionReference, selectedVersion, corMarcacao));
  };

  const handleSalvarNota = () => {
    if (!rascunhoNota.trim()) {
      return;
    }
    const next = idNotaEditando
      ? atualizarNota(userId, idNotaEditando, rascunhoNota.trim())
      : selectionReference
        ? adicionarNota(userId, selectionReference, selectedVersion, rascunhoNota.trim())
        : notes;
    setNotes(next);
    setRascunhoNota("");
    setIdNotaEditando(null);
  };

  const handleEditarNota = (note: NotaBiblia) => {
    setIdNotaEditando(note.id);
    setRascunhoNota(note.content);
  };

  const handleExcluirNota = (noteId: string) => {
    setNotes(removerNota(userId, noteId));
  };

  const handleCompartilharSelecao = async () => {
    if (!selectionReference || !chapterData) {
      return;
    }
    const verseTexts = chapterData.verses
      .filter((verse) =>
        verse.verse >= selectionReference.verseRange.start &&
        verse.verse <= selectionReference.verseRange.end,
      )
      .map((verse) => `${verse.verse}. ${verse.text}`)
      .join(" ");
    const parts = [`"${verseTexts}"`];
    if (shareIncludeReference) {
      parts.push(resolverRotuloIntervalo(selectionReference));
    }
    if (shareIncludeVersion) {
      parts.push(obterRotuloVersao(selectedVersion, versionsForSelect));
    }
    if (shareIncludeChurch) {
      parts.push("Comunidade evangelica Semear");
    }
    const text = `📖 ${parts.join(" — ")}`;
    if (navigator.share) {
      await navigator.share({ title: "Biblia Semear", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleBuscar = () => {
    let results = buscarNoCache(userId, {
      query: buscaTexto,
      bookId: buscaLivroId || undefined,
      version: selectedVersion,
    });
    if (buscaTestamento) {
      const testamentMap = new Map(livrosBiblia.map((book) => [book.id, book.testament]));
      results = results.filter((result) => testamentMap.get(result.reference.bookId) === buscaTestamento);
    }
    setResultadosBusca(results);
  };

  const handleAbrirPainelEstudo = (aba: string) => {
    setAbaPainelEstudo(aba);
    setPainelEstudoAberto(true);
    if (painelEstudoRef.current) {
      painelEstudoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavegarParaReferencia = (reference: FavoritoBiblia["reference"], version: string) => {
    const book = livrosBiblia.find((item) => item.id === reference.bookId);
    if (!book) {
      return;
    }
    setSelectedBook(book);
    setSelectedChapter(reference.chapter);
    setSelectedVersion(version);
    setVersoInicio(reference.verseRange.start);
    setVersoFim(reference.verseRange.end);
  };

  const atualizarPreferencias = (partial: Partial<PreferenciaBibliaUsuario>) => {
    if (!preferences) {
      return;
    }
    const next = { ...preferences, ...partial };
    setPreferences(salvarPreferencias(userId, next));
  };

  // Chapter selection view
  if (selectedBook && !selectedChapter) {
    return (
      <LayoutApp>
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              ← Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold">{selectedBook.name}</h1>
              <p className="text-sm text-muted-foreground">
                Selecione um capítulo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Versão</span>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Selecione a versão" />
              </SelectTrigger>
              <SelectContent>
                {versionsForSelect.map((version) => (
                  <SelectItem key={version.identifier} value={version.identifier}>
                    {obterRotuloVersao(version.identifier, versionsForSelect)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
              (chapter) => (
                <Button
                  key={chapter}
                  variant="outline"
                  className="h-12 text-lg font-medium hover:bg-olive hover:text-olive-foreground hover:border-olive"
                  onClick={() => handleChapterSelect(chapter)}
                >
                  {chapter}
                </Button>
              )
            )}
          </div>
        </div>
      </LayoutApp>
    );
  }

  // Chapter reading view
  if (selectedBook && selectedChapter) {
    return (
      <LayoutApp>
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                ← Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {selectedBook.name} {selectedChapter}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {obterRotuloVersao(selectedVersion, versionsForSelect)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={handleAlternarFavorito}>
                <Star className={cn("h-4 w-4", isSelectionFavorite && "fill-gold text-gold")} />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={handleCompartilharSelecao}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setMostrarConfiguracoes(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Versão</span>
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Selecione a versão" />
              </SelectTrigger>
              <SelectContent>
                {versionsForSelect.map((version) => (
                  <SelectItem key={version.identifier} value={version.identifier}>
                    {obterRotuloVersao(version.identifier, versionsForSelect)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {preferences && (
            <Dialog open={mostrarConfiguracoes} onOpenChange={setMostrarConfiguracoes}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações de leitura</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.mode === "study"}
                        onCheckedChange={(checked) =>
                          atualizarPreferencias({ mode: checked ? "study" : "reading" })
                        }
                      />
                      <Label className="text-sm">Modo estudo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Tamanho da fonte</Label>
                      <Select
                        value={preferences.fontSize}
                        onValueChange={(value) =>
                          atualizarPreferencias({ fontSize: value as PreferenciaBibliaUsuario["fontSize"] })
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sm">Pequena</SelectItem>
                          <SelectItem value="md">Normal</SelectItem>
                          <SelectItem value="lg">Grande</SelectItem>
                          <SelectItem value="xl">Muito grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.showHighlights}
                        onCheckedChange={(checked) =>
                        atualizarPreferencias({ showHighlights: checked })
                        }
                      />
                      <Label className="text-sm">Mostrar marcações</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.showNotes}
                      onCheckedChange={(checked) => atualizarPreferencias({ showNotes: checked })}
                      />
                      <Label className="text-sm">Mostrar notas</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preferences.showFavorites}
                      onCheckedChange={(checked) => atualizarPreferencias({ showFavorites: checked })}
                      />
                      <Label className="text-sm">Mostrar favoritos</Label>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={shareIncludeReference}
                        onCheckedChange={setShareIncludeReference}
                      />
                      <Label className="text-sm">Incluir referência</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={shareIncludeVersion}
                        onCheckedChange={setShareIncludeVersion}
                      />
                      <Label className="text-sm">Incluir versão</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={shareIncludeChurch}
                        onCheckedChange={setShareIncludeChurch}
                      />
                      <Label className="text-sm">Incluir igreja</Label>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso do livro</span>
                <span className="font-medium text-olive">
                  {progressoLivro.lidos}/{progressoLivro.total} · {progressoLivro.percentual}%
                </span>
              </div>
              <Progress value={progressoLivro.percentual} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              {isLoadingChapter ? (
                <p className="text-sm text-muted-foreground">Carregando capítulo...</p>
              ) : chapterError ? (
                <p className="text-sm text-destructive">{chapterError}</p>
              ) : (
                <div
                  className={cn(
                    "space-y-4 leading-relaxed",
                    preferences?.fontSize === "sm" && "text-sm",
                    preferences?.fontSize === "md" && "text-base",
                    preferences?.fontSize === "lg" && "text-lg",
                    preferences?.fontSize === "xl" && "text-xl",
                  )}
                >
                  {chapterData?.verses.map((verse, index) => (
                    (() => {
                      const highlight = preferences?.showHighlights
                        ? obterDestaquePorVersiculo(
                            highlights,
                            selectedVersion,
                            selectedBook.id,
                            selectedChapter,
                            verse.verse,
                          )
                        : undefined;
                      const favorite = preferences?.showFavorites
                        ? obterFavoritoCorrespondente(
                            favorites,
                            selectedVersion,
                            selectedBook.id,
                            selectedChapter,
                            verse.verse,
                          )
                        : undefined;
                      const verseNotes =
                        preferences?.showNotes
                          ? notes.filter(
                              (note) =>
                                note.version === selectedVersion &&
                                note.reference.bookId === selectedBook.id &&
                                note.reference.chapter === selectedChapter &&
                                versiculoNoIntervalo(verse.verse, note.reference.verseRange),
                            )
                          : [];
                      const ativo = versiculoAtivo === verse.verse;
                      return (
                    <div
                      key={verse.verse}
                      data-verse={verse.verse}
                      className={cn(
                        "rounded-md p-2 transition-colors",
                        ativo && "bg-muted/40",
                      )}
                    >
                      <p
                        onClick={() => handleSelecionarVersiculo(verse.verse)}
                        className={cn(
                          "cursor-pointer",
                          index === 0 && "verse-highlight",
                          highlight && CLASSES_MARCACAO[highlight.color],
                          favorite && "border-l-4 border-gold pl-2",
                        )}
                      >
                        <sup className="text-xs text-olive font-bold mr-1">
                          {verse.verse}
                        </sup>
                        {verse.text}
                      </p>
                      {verseNotes.length > 0 && (
                        <span className="mt-2 block text-xs text-muted-foreground">
                          Nota: {verseNotes.map((note) => note.content).join(" · ")}
                        </span>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {ativo && (
                          <>
                            <Button variant="outline" size="sm" onClick={handleAlternarFavorito}>
                              <Star className="h-4 w-4 mr-2" />
                              Favoritar
                            </Button>
                            <Select
                              value={corMarcacao}
                              onValueChange={(value) => setCorMarcacao(value as CorDestaque)}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Cor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yellow">Amarelo</SelectItem>
                                <SelectItem value="green">Verde</SelectItem>
                                <SelectItem value="blue">Azul</SelectItem>
                                <SelectItem value="red">Vermelho</SelectItem>
                                <SelectItem value="purple">Roxo</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={handleMarcarTexto}>
                              <Highlighter className="h-4 w-4 mr-2" />
                              Marcar
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <NotebookPen className="h-4 w-4 mr-2" />
                                  Anotar
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Nova anotação</DialogTitle>
                                </DialogHeader>
                                <Textarea
                                  placeholder="Escreva sua observação..."
                                  value={rascunhoNota}
                                  onChange={(event) => setRascunhoNota(event.target.value)}
                                  className="min-h-[120px]"
                                />
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setRascunhoNota("")}>
                                    Limpar
                                  </Button>
                                  <Button onClick={handleSalvarNota}>Salvar</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={handleCompartilharSelecao}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartilhar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await navigator.clipboard.writeText(verse.text);
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                      );
                    })()
                  ))}
                  {!chapterData && (
                    <p className="text-sm text-muted-foreground">
                      Selecione a versão e aguarde o carregamento do capítulo.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {capituloLido ? "Capítulo concluído" : "Concluir leitura do capítulo"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Marque este capítulo como lido para atualizar seu progresso.
                </p>
              </div>
              <Button
                variant={capituloLido ? "reading-complete" : "outline"}
                onClick={handleAlternarLeituraCapitulo}
              >
                {capituloLido ? "Lido" : "Marcar capítulo como lido"}
              </Button>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={selectedChapter === 1}
              onClick={() => setSelectedChapter((prev) => (prev || 1) - 1)}
            >
              ← Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Capítulo {selectedChapter} de {selectedBook.chapters}
            </span>
            <Button
              variant="outline"
              disabled={selectedChapter === selectedBook.chapters}
              onClick={() => setSelectedChapter((prev) => (prev || 1) + 1)}
            >
              Próximo →
            </Button>
          </div>
        </div>
      </LayoutApp>
    );
  }

  // Book list view
  return (
    <LayoutApp>
      <div className="space-y-3 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-olive-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Bíblia Sagrada</h1>
            <p className="text-sm text-muted-foreground">
              {obterRotuloVersao(selectedVersion, versionsForSelect)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Versão</span>
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Selecione a versão" />
            </SelectTrigger>
            <SelectContent>
              {versionsForSelect.map((version) => (
                <SelectItem key={version.identifier} value={version.identifier}>
                  {obterRotuloVersao(version.identifier, versionsForSelect)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card
          ref={painelEstudoRef}
          className="sticky top-4 z-30 bg-card/95 backdrop-blur border"
        >
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Painel de estudo</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPainelEstudoAberto((prev) => !prev)}
              >
                {painelEstudoAberto ? (
                  <>
                    Recolher
                    <ChevronUp className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Expandir
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {painelEstudoAberto && (
              <Tabs value={abaPainelEstudo} onValueChange={setAbaPainelEstudo} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
                  <TabsTrigger value="favorites" className="gap-2">
                    <Star className="h-4 w-4" />
                    Favoritos
                  </TabsTrigger>
                  <TabsTrigger value="highlights" className="gap-2">
                    <Highlighter className="h-4 w-4" />
                    Marcações
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-2">
                    <NotebookPen className="h-4 w-4" />
                    Anotações
                  </TabsTrigger>
                  <TabsTrigger value="plan" className="gap-2">
                    <ListChecks className="h-4 w-4" />
                    Plano
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <History className="h-4 w-4" />
                    Histórico
                  </TabsTrigger>
                  <TabsTrigger value="search" className="gap-2">
                    <Search className="h-4 w-4" />
                    Busca
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="favorites" className="mt-3 space-y-2">
                  {favorites.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum favorito salvo ainda.
                    </p>
                  ) : (
                    favorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg border"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {resolverRotuloIntervalo(favorite.reference)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {obterRotuloVersao(favorite.version, versionsForSelect)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavegarParaReferencia(favorite.reference, favorite.version)}
                          >
                            Abrir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFavorites(removerFavorito(userId, favorite.id))}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="highlights" className="mt-3 space-y-2">
                  {highlights.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma marcação registrada.
                    </p>
                  ) : (
                    highlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg border"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {resolverRotuloIntervalo(highlight.reference)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {obterRotuloVersao(highlight.version, versionsForSelect)} · {highlight.color}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavegarParaReferencia(highlight.reference, highlight.version)}
                          >
                            Abrir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHighlights(removerDestaque(userId, highlight.id))}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="notes" className="mt-3 space-y-2">
                  {notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma anotação salva.</p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="flex flex-wrap items-start justify-between gap-2 p-2 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {resolverRotuloIntervalo(note.reference)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {obterRotuloVersao(note.version, versionsForSelect)}
                          </p>
                          <p className="text-sm">{note.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavegarParaReferencia(note.reference, note.version)}
                          >
                            Abrir
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEditarNota(note)}>
                                Editar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar anotação</DialogTitle>
                              </DialogHeader>
                              <Textarea
                                value={rascunhoNota}
                                onChange={(event) => setRascunhoNota(event.target.value)}
                                className="min-h-[120px]"
                              />
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setRascunhoNota("")}>
                                  Limpar
                                </Button>
                                <Button onClick={handleSalvarNota}>Salvar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm" onClick={() => handleExcluirNota(note.id)}>
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="plan" className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Label className="text-sm">Plano ativo</Label>
                    <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="Selecionar plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {planList.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    {planDays.map((day) => {
                      const progressItem = obterProgressoLeituraPorDia(
                        readingProgress,
                        selectedPlanId,
                        day.id,
                      );
                      return (
                        <div
                          key={day.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {day.title ?? `Dia ${day.dayNumber}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {day.readings.map((reading) => reading.reference).join(" · ")}
                            </p>
                          </div>
                          <Button
                            variant={progressItem?.completed ? "reading-complete" : "outline"}
                            size="sm"
                            onClick={() =>
                              setReadingProgress(
                                alternarProgressoLeitura(
                                  userId,
                                  selectedPlanId,
                                  day.id,
                                  new Date().toISOString(),
                                  !progressItem?.completed,
                                ),
                              )
                            }
                          >
                            {progressItem?.completed ? "Concluído" : "Marcar leitura"}
                          </Button>
                        </div>
                      );
                    })}
                    {planDays.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nenhum plano disponível no momento.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-3 space-y-2">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma leitura registrada ainda.
                    </p>
                  ) : (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg border"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {resolverRotuloIntervalo(entry.reference)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.readAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistory(removerHistorico(userId, entry.id))}
                            aria-label="Remover histórico"
                            title="Remover histórico"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavegarParaReferencia(entry.reference, entry.version)}
                          >
                            Continuar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="search" className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      placeholder="Buscar texto nos versículos já carregados..."
                      value={buscaTexto}
                      onChange={(event) => setBuscaTexto(event.target.value)}
                      className="flex-1 min-w-[240px]"
                    />
                    <Select value={buscaTestamento} onValueChange={setBuscaTestamento}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Testamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="old">Antigo</SelectItem>
                        <SelectItem value="new">Novo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={buscaLivroId} onValueChange={setBuscaLivroId}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Livro" />
                      </SelectTrigger>
                      <SelectContent>
                        {livrosBiblia.map((book) => (
                          <SelectItem key={`search-${book.id}`} value={book.id}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleBuscar}>
                      Buscar
                    </Button>
                  </div>
                  {resultadosBusca.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum resultado encontrado. Carregue capítulos para indexar.
                    </p>
                  ) : (
                    resultadosBusca.map((result) => (
                      <div key={result.id} className="p-3 rounded-lg border space-y-1">
                        <p className="text-sm font-medium">
                          {resolverRotuloIntervalo(result.reference)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {obterRotuloVersao(result.version, versionsForSelect)}
                        </p>
                        <p className="text-sm">{result.snippet}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavegarParaReferencia(result.reference, result.version)}
                        >
                          Abrir
                        </Button>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Busca */}
        <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar livro..."
            className="pl-10"
              value={buscaLivro}
              onChange={(e) => setBuscaLivro(e.target.value)}
          />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="old" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="old" className="gap-2">
              <BookMarked className="h-4 w-4" />
              Antigo ({filteredOldTestament.length})
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Novo ({filteredNewTestament.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="old" className="mt-4">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2 pr-4">
                {filteredOldTestament.map((book) => (
                  <CartaoLivro
                    key={book.id}
                    book={book}
                    onClick={() => handleBookSelect(book)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2 pr-4">
                {filteredNewTestament.map((book) => (
                  <CartaoLivro
                    key={book.id}
                    book={book}
                    onClick={() => handleBookSelect(book)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

      </div>
    </LayoutApp>
  );
}
