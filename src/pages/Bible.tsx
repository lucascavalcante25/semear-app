import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Search, 
  Star, 
  Share2, 
  ChevronRight,
  BookMarked
} from "lucide-react";
import { bibleBooks, oldTestamentBooks, newTestamentBooks, type BibleBook } from "@/data/bible-books";
import { cn } from "@/lib/utils";

const API_BASE_URL = "https://bible-api.com";
const DEFAULT_VERSION = "almeida";

const PREFERRED_VERSION_IDS = [
  "almeida",
  "kjv",
  "bbe",
  "web",
  "asv",
  "darby",
  "dra",
  "oeb-us",
  "oeb-cw",
  "webbe",
  "ylt",
];

const ENGLISH_BOOK_NAMES: Record<string, string> = {
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

type ChapterVerse = {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
};

type ChapterResponse = {
  reference: string;
  verses: ChapterVerse[];
  translation_id: string;
  translation_name: string;
};

type VersionInfo = {
  identifier: string;
  name: string;
  language: string;
  language_code: string;
};

type VersionResponse = {
  translations: VersionInfo[];
};

const FALLBACK_VERSIONS: VersionInfo[] = [
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

const getVersionLabel = (version: string, versions: VersionInfo[]) => {
  const match = versions.find((item) => item.identifier === version);
  return match?.name ?? version.toUpperCase();
};

const getBookNameForVersion = (book: BibleBook, version?: VersionInfo) => {
  if (!version || version.language_code === "por") {
    return book.name;
  }

  return ENGLISH_BOOK_NAMES[book.id] ?? book.name;
};

const toBibleApiQuery = (bookName: string, chapter: number) => {
  const rawQuery = `${bookName} ${chapter}`;
  return encodeURIComponent(rawQuery).replace(/%20/g, "+");
};

function BookCard({ book, onClick }: { book: BibleBook; onClick: () => void }) {
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

export default function Bible() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState(DEFAULT_VERSION);
  const [availableVersions, setAvailableVersions] = useState<VersionInfo[]>([]);
  const [chapterData, setChapterData] = useState<ChapterResponse | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadVersions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/data`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as versões.");
        }

        const data = (await response.json()) as VersionResponse;
        const translations = Array.isArray(data?.translations)
          ? data.translations
          : [];

        const preferredSet = new Set(PREFERRED_VERSION_IDS);
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
        const versionsToUse = sorted.length > 0 ? sorted : FALLBACK_VERSIONS;

        const referenceBook = bibleBooks[0];
        const referenceChapter = 1;
        const validated = await Promise.all(
          versionsToUse.map(async (version) => {
            const bookName = getBookNameForVersion(referenceBook, version);
            const query = toBibleApiQuery(bookName, referenceChapter);
            try {
              const validationResponse = await fetch(
                `${API_BASE_URL}/${query}?translation=${version.identifier}`,
                { signal: controller.signal },
              );
              if (!validationResponse.ok) {
                return null;
              }
              const validationData = (await validationResponse.json()) as ChapterResponse;
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
          (version): version is VersionInfo => Boolean(version),
        );
        const versionsFinal = workingVersions.length > 0 ? workingVersions : [FALLBACK_VERSIONS[0]];

        setAvailableVersions(versionsFinal);
        setSelectedVersion((previous) =>
          versionsFinal.some((version) => version.identifier === previous)
            ? previous
            : DEFAULT_VERSION,
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAvailableVersions([FALLBACK_VERSIONS[0]]);
          setSelectedVersion(DEFAULT_VERSION);
        }
      }
    };

    loadVersions();

    return () => controller.abort();
  }, []);

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
        const bookName = getBookNameForVersion(selectedBook, selectedVersionInfo);
        const query = toBibleApiQuery(bookName, selectedChapter);
        const response = await fetch(
          `${API_BASE_URL}/${query}?translation=${selectedVersion}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar este capítulo.");
        }

        const data = (await response.json()) as ChapterResponse;
        setChapterData(data);
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

  const versionsForSelect =
    availableVersions.length > 0 ? availableVersions : FALLBACK_VERSIONS;

  const filteredOldTestament = oldTestamentBooks.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNewTestament = newTestamentBooks.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSelect = (book: BibleBook) => {
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

  // Chapter selection view
  if (selectedBook && !selectedChapter) {
    return (
      <AppLayout>
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
                    {getVersionLabel(version.identifier, versionsForSelect)}
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
      </AppLayout>
    );
  }

  // Chapter reading view
  if (selectedBook && selectedChapter) {
    return (
      <AppLayout>
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
                  {getVersionLabel(selectedVersion, versionsForSelect)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Share2 className="h-4 w-4" />
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
                    {getVersionLabel(version.identifier, versionsForSelect)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-6">
              {isLoadingChapter ? (
                <p className="text-sm text-muted-foreground">Carregando capítulo...</p>
              ) : chapterError ? (
                <p className="text-sm text-destructive">{chapterError}</p>
              ) : (
                <div className="space-y-4 text-base leading-relaxed">
                  {chapterData?.verses.map((verse, index) => (
                    <p
                      key={verse.verse}
                      className={cn(index === 0 && "verse-highlight")}
                    >
                      <sup className="text-xs text-olive font-bold mr-1">
                        {verse.verse}
                      </sup>
                      {verse.text}
                    </p>
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
      </AppLayout>
    );
  }

  // Book list view
  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-olive-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Bíblia Sagrada</h1>
            <p className="text-sm text-muted-foreground">
              {getVersionLabel(selectedVersion, versionsForSelect)}
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
                  {getVersionLabel(version.identifier, versionsForSelect)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar livro..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                  <BookCard
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
                  <BookCard
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
    </AppLayout>
  );
}
