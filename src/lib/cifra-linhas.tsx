import type { ReactNode } from "react";

const PADRAO_CORDA_TAB = /^[EBGDA]\|/i;
const PADRAO_PARTE_TAB = /^parte\s+\d+\s+de\s+\d+$/i;

/** Linhas típicas de tablatura (E|, B|, etc.) ou marcadores "Parte N de M". */
export function ehLinhaTablatura(linha: string): boolean {
  const texto = linha.trim();
  if (!texto) return false;
  if (PADRAO_CORDA_TAB.test(texto)) return true;
  if (PADRAO_PARTE_TAB.test(texto)) return true;
  if (/^[A-G]\|[-\d\s|]+$/i.test(texto)) return true;
  return false;
}

export function filtrarTablaturas(linhas: string[]): string[] {
  return linhas.filter((linha) => !ehLinhaTablatura(linha));
}

/** Destaca acordes comuns no texto (ex.: [Intro], Am, G/B). */
export function destacarAcordesNaLinha(linha: string): ReactNode[] {
  const partes = linha.split(/(\[[^\]]+\]|\b[A-G][#b]?(?:\/[A-G][#b]?)?(?:m|maj|min|sus|add|dim|aug)?[0-9]*(?:\/[A-G][#b]?)?\b)/g);
  return partes.map((parte, i) => {
    if (/^\[.+\]$/.test(parte) || /^[A-G][#b]?/.test(parte.trim())) {
      return (
        <span key={i} className="font-bold text-amber-600 dark:text-amber-400">
          {parte}
        </span>
      );
    }
    return parte;
  });
}
