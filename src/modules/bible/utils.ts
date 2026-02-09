import type { IntervaloVersiculo, ReferenciaBiblia } from "./types";

export const normalizarIntervalo = (start: number, end: number): IntervaloVersiculo => {
  if (start <= end) {
    return { start, end };
  }
  return { start: end, end: start };
};

export const versiculoNoIntervalo = (verse: number, range: IntervaloVersiculo) =>
  verse >= range.start && verse <= range.end;

export const montarRotuloReferencia = (reference: ReferenciaBiblia) => {
  const { bookName, chapter, verseRange } = reference;
  const verseLabel =
    verseRange.start === verseRange.end
      ? verseRange.start
      : `${verseRange.start}-${verseRange.end}`;
  return `${bookName} ${chapter}:${verseLabel}`;
};

export const gerarTrecho = (text: string, term: string) => {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) {
    return text;
  }
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + term.length + 30);
  return `${start > 0 ? "..." : ""}${text.slice(start, end)}${end < text.length ? "..." : ""}`;
};
