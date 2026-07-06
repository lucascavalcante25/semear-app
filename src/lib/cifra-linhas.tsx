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

/** Junta linhas para exibição em bloco `<pre>` preservando espaços e alinhamento. */
export function textoCifraParaExibicao(linhas: string[]): string {
  return filtrarTablaturas(linhas)
    .map((linha) => linha.replace(/\t/g, "    "))
    .join("\n");
}
