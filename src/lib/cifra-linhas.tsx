const PADRAO_CORDA_TAB = /^[EBGDA]\|/i;
const PADRAO_PARTE_TAB = /^parte\s+\d+\s+de\s+\d+$/i;

/** Token típico de acorde (C, Am7, F#m, Bb/D, Gsus4, E9, N.C.). Nota em maiúscula para não colorir "em"/"a". */
const TOKEN_ACORDE =
  /^(N\.?C\.?|%|[A-G](?:#|b)?(?:m|M|maj|min|dim|aug|sus|add|°|º)?[0-9]*(?:\([^)]+\))?(?:\+|M)?(?:\/[A-G](?:#|b)?)?)$/;

export function ehTokenAcorde(token: string): boolean {
  const t = token.trim();
  if (!t) return false;
  return TOKEN_ACORDE.test(t) || t === "|" || t === "-" || t === "/";
}

export type SegmentoCifra = { texto: string; acorde: boolean };

/** Separa a linha em espaços e tokens, marcando acordes (preserva alinhamento). */
export function segmentarLinhaCifra(linha: string): SegmentoCifra[] {
  if (!linha) return [{ texto: "", acorde: false }];
  return linha.split(/(\s+)/).map((parte) => ({
    texto: parte,
    acorde: !/^\s*$/.test(parte) && TOKEN_ACORDE.test(parte),
  }));
}

export function colorirAcordesNaLinha(linha: string): boolean {
  if (!linha.trim() || ehMarcadorSecao(linha)) return false;
  if (ehLinhaDeAcordes(linha)) return true;
  const t = linha.trim();
  if (t.startsWith("[") && t.includes("]")) {
    const depois = t.slice(t.indexOf("]") + 1).trim();
    return depois.split(/\s+/).some((tok) => TOKEN_ACORDE.test(tok));
  }
  return false;
}

export function agruparEstrofes(linhas: string[]): string[][] {
  const estrofes: string[][] = [];
  let atual: string[] = [];
  for (const linha of linhas) {
    if (linha.trim() === "") {
      if (atual.length > 0) {
        estrofes.push(atual);
        atual = [];
      }
      continue;
    }
    atual.push(linha);
  }
  if (atual.length > 0) estrofes.push(atual);
  return estrofes;
}

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

export function ehMarcadorSecao(linha: string): boolean {
  const t = linha.trim();
  return /^\[[^\]]+\]$/.test(t) || /^\([^)]+\)$/.test(t);
}

/** Heurística: linha composta majoritariamente por acordes espaçados. */
export function ehLinhaDeAcordes(linha: string): boolean {
  const texto = linha.replace(/\t/g, "    ");
  const trimmed = texto.trim();
  if (!trimmed || ehMarcadorSecao(trimmed)) return false;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let acordes = 0;
  for (const token of tokens) {
    if (TOKEN_ACORDE.test(token) || token === "|" || token === "-" || token === "/") {
      acordes += 1;
    }
  }
  return acordes / tokens.length >= 0.6;
}

function pontoQuebra(texto: string, maxCols: number): number {
  if (texto.length <= maxCols) return texto.length;
  const janela = texto.slice(0, maxCols + 1);
  const espaco = janela.lastIndexOf(" ");
  // Evita quebrar muito cedo (só no início da linha).
  if (espaco >= Math.floor(maxCols * 0.35)) return espaco;
  return maxCols;
}

function removerEspacosComunsNoInicio(a: string, b: string): [string, string] {
  let i = 0;
  const limite = Math.min(a.length, b.length);
  while (i < limite && a[i] === " " && b[i] === " ") i += 1;
  // Se só um lado tem espaços à esquerda, remove o excesso do lado com espaços
  // para a continuação não ficar "empurrada" sem necessidade — mas só o comum
  // preserva o alinhamento acorde↔sílaba.
  return [a.slice(i), b.slice(i)];
}

/** Quebra um par acorde+letra no mesmo índice de coluna (mantém alinhamento). */
export function quebrarParAcordeLetra(acordes: string, letra: string, maxCols: number): string[] {
  const out: string[] = [];
  let a = acordes.replace(/\t/g, "    ");
  let l = letra.replace(/\t/g, "    ");
  const limite = Math.max(12, maxCols);

  while (a.length > limite || l.length > limite) {
    const antes = a.length + l.length;
    const alvo = limite;
    // Prefere fronteira de palavra da letra; se letra curta, usa a dos acordes.
    let col = l.length > limite ? pontoQuebra(l, alvo) : pontoQuebra(a, alvo);
    if (col <= 0) col = alvo;

    out.push(a.slice(0, col).replace(/\s+$/, ""));
    out.push(l.slice(0, col).replace(/\s+$/, ""));
    [a, l] = removerEspacosComunsNoInicio(a.slice(col), l.slice(col));

    // Linha sem espaços (ou quebra inválida): força avanço para não travar.
    if (a.length + l.length >= antes) {
      out.push(a.slice(0, limite));
      out.push(l.slice(0, limite));
      a = a.slice(limite);
      l = l.slice(limite);
    }
  }

  if (a.length > 0 || l.length > 0) {
    out.push(a.replace(/\s+$/, ""));
    out.push(l.replace(/\s+$/, ""));
  }
  return out;
}

function quebrarLinhaSimples(linha: string, maxCols: number): string[] {
  const texto = linha.replace(/\t/g, "    ");
  if (texto.length <= maxCols) return [texto];
  const out: string[] = [];
  let rest = texto;
  while (rest.length > maxCols) {
    const col = pontoQuebra(rest, maxCols);
    out.push(rest.slice(0, col).replace(/\s+$/, ""));
    rest = rest.slice(col).replace(/^\s+/, "");
    if (!rest) break;
  }
  if (rest) out.push(rest);
  return out;
}

/**
 * Requebra a cifra para caber em `maxCols` colunas monoespaçadas,
 * mantendo acordes alinhados com a letra nas estrofes.
 */
export function quebrarCifraParaLargura(linhas: string[], maxCols: number): string[] {
  const fonte = filtrarTablaturas(linhas).map((l) => l.replace(/\t/g, "    "));
  const limite = Math.max(12, Math.floor(maxCols));
  const out: string[] = [];

  for (let i = 0; i < fonte.length; i += 1) {
    const atual = fonte[i];
    const proxima = fonte[i + 1];

    if (
      ehLinhaDeAcordes(atual) &&
      proxima != null &&
      !ehLinhaDeAcordes(proxima) &&
      !ehMarcadorSecao(proxima) &&
      proxima.trim() !== ""
    ) {
      out.push(...quebrarParAcordeLetra(atual, proxima, limite));
      i += 1;
      continue;
    }

    if (atual.trim() === "" || ehMarcadorSecao(atual)) {
      out.push(atual);
      continue;
    }

    out.push(...quebrarLinhaSimples(atual, limite));
  }

  return out;
}

export function textoCifraQuebradaParaExibicao(linhas: string[], maxCols: number): string {
  return quebrarCifraParaLargura(linhas, maxCols).join("\n");
}

/** Estima colunas monoespaçadas que cabem na largura útil. */
export function estimarColunasMonospace(larguraPx: number, tamanhoFontePx: number): number {
  if (larguraPx <= 0 || tamanhoFontePx <= 0) return 40;
  // Fator típico de monospace (~0.6em); margem de segurança para padding.
  const larguraChar = tamanhoFontePx * 0.62;
  return Math.max(16, Math.floor((larguraPx - 4) / larguraChar));
}
