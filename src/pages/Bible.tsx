import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const filteredOldTestament = oldTestamentBooks.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNewTestament = newTestamentBooks.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
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
                  Almeida Revista e Atualizada
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

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-base leading-relaxed">
                <p className="verse-highlight">
                  <sup className="text-xs text-olive font-bold mr-1">1</sup>
                  No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.
                </p>
                <p>
                  <sup className="text-xs text-olive font-bold mr-1">2</sup>
                  Ele estava no princípio com Deus.
                </p>
                <p>
                  <sup className="text-xs text-olive font-bold mr-1">3</sup>
                  Todas as coisas foram feitas por intermédio dele, e, sem ele, nada do que foi feito se fez.
                </p>
                <p className="text-center text-muted-foreground italic py-8">
                  📖 Conteúdo completo da Bíblia será carregado do banco de dados
                </p>
              </div>
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
              Almeida Revista e Atualizada
            </p>
          </div>
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
