import { livrosBiblia } from "@/data/bible-books";

/**
 * Parseia referência bíblica (ex: "Hebreus 11:1", "1 Coríntios 13:4") para navegação.
 * Retorna { bookId, chapter, verse } ou null se não conseguir parsear.
 */
export function parsearReferenciaBiblica(ref: string): {
  bookId: string;
  chapter: number;
  verse: number;
} | null {
  const trimmed = ref.trim();
  if (!trimmed) return null;

  // Ordenar livros por nome mais longo primeiro (para "1 Coríntios" antes de "Coríntios")
  const livrosOrdenados = [...livrosBiblia].sort(
    (a, b) => b.name.length - a.name.length
  );

  for (const livro of livrosOrdenados) {
    const nomeNorm = livro.name.toLowerCase().replace(/\s+/g, " ");
    const refNorm = trimmed.toLowerCase();
    if (refNorm.startsWith(nomeNorm)) {
      const resto = trimmed.slice(livro.name.length).trim();
      const match = resto.match(/^(\d+):(\d+)/);
      if (match) {
        const chapter = parseInt(match[1], 10);
        const verse = parseInt(match[2], 10);
        if (chapter >= 1 && verse >= 1) {
          return { bookId: livro.id, chapter, verse };
        }
      }
    }
  }

  // Tentar por abreviação (Hb 11:1, 1Co 13:4)
  const matchAbbrev = trimmed.match(/^([1-3]?\s*[A-Za-zÀ-ÿ]+)\s+(\d+):(\d+)$/);
  if (matchAbbrev) {
    const abbrevPart = matchAbbrev[1].replace(/\s+/g, "").toLowerCase();
    const chapter = parseInt(matchAbbrev[2], 10);
    const verse = parseInt(matchAbbrev[3], 10);
    const livro = livrosBiblia.find(
      (b) =>
        b.abbrev.toLowerCase().replace(/\s/g, "") === abbrevPart ||
        b.id === abbrevPart
    );
    if (livro && chapter >= 1 && verse >= 1) {
      return { bookId: livro.id, chapter, verse };
    }
  }

  return null;
}

export function buildBibliaUrl(ref: string): string {
  const parsed = parsearReferenciaBiblica(ref);
  if (!parsed) return "/biblia";
  return `/biblia?bookId=${parsed.bookId}&chapter=${parsed.chapter}&verseStart=${parsed.verse}&verseEnd=${parsed.verse}`;
}
