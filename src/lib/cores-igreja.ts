type Hsl = { h: number; s: number; l: number };

function parseHex(hex?: string): string | null {
  if (!hex) return null;
  const limpo = hex.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(limpo) ? limpo : null;
}

/** Converte hex para componentes HSL (h: 0-360, s/l: 0-100). */
export function hexParaHsl(hex?: string): Hsl | null {
  const limpo = parseHex(hex);
  if (!limpo) return null;

  const r = parseInt(limpo.slice(0, 2), 16) / 255;
  const g = parseInt(limpo.slice(2, 4), 16) / 255;
  const b = parseInt(limpo.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslParaTokens({ h, s, l }: Hsl): string {
  return `${h} ${s}% ${l}%`;
}

function extrairHslDeTokens(tokens?: string | null): Hsl | null {
  if (!tokens) return null;
  const match = tokens.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) return null;
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

/** Luminância relativa (0–1) a partir de tokens HSL. */
function tokensParaLuminancia(tokens?: string | null): number {
  const hsl = extrairHslDeTokens(tokens);
  if (!hsl) return 0;

  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueParaRgb = (t: number) => {
    let tn = t;
    if (tn < 0) tn += 1;
    if (tn > 1) tn -= 1;
    if (tn < 1 / 6) return p + (q - p) * 6 * tn;
    if (tn < 1 / 2) return q;
    if (tn < 2 / 3) return p + (q - p) * (2 / 3 - tn) * 6;
    return p;
  };

  const r = hueParaRgb(h + 1 / 3);
  const g = hueParaRgb(h);
  const b = hueParaRgb(h - 1 / 3);

  const canal = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

const TOKENS_TEXTO_ESCURO = "220 25% 10%";
const TOKENS_TEXTO_CLARO = "0 0% 98%";

/** Texto legível sobre fundo colorido sólido: escuro em fundo claro, claro em fundo escuro. */
export function foregroundParaTokensFundo(tokensFundo?: string | null): string | null {
  if (!tokensFundo) return null;
  return tokensParaLuminancia(tokensFundo) > 0.42 ? TOKENS_TEXTO_ESCURO : TOKENS_TEXTO_CLARO;
}

/**
 * Converte cor hex (#RRGGBB) para o formato HSL usado pelas variáveis CSS do Tailwind.
 * Ex.: #5a7a3a → "80 35% 35%"
 */
export function hexParaTokensHsl(hex?: string): string | null {
  const hsl = hexParaHsl(hex);
  return hsl ? hslParaTokens(hsl) : null;
}

/** Luminância relativa WCAG (0–1) para decidir contraste de texto. */
export function hexParaLuminancia(hex?: string): number {
  const limpo = parseHex(hex);
  if (!limpo) return 0;

  const canal = (n: number) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  const r = canal(parseInt(limpo.slice(0, 2), 16));
  const g = canal(parseInt(limpo.slice(2, 4), 16));
  const b = canal(parseInt(limpo.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Cor de texto (#hex) com bom contraste sobre o fundo informado. */
export function corTextoSobreFundo(hexFundo?: string): string {
  return hexParaLuminancia(hexFundo) > 0.5 ? "#1a1f16" : "#f8f7f4";
}

/** Tokens HSL de texto sobre fundo colorido (para variáveis --*-foreground). */
export function hexParaTokensForeground(hex?: string): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  if (hsl.l > 52) {
    return hslParaTokens({ h: hsl.h, s: Math.min(hsl.s, 35), l: 16 });
  }
  return hslParaTokens({ h: hsl.h, s: Math.min(hsl.s, 30), l: 97 });
}

/** Variante clara da cor (fundos suaves, badges). */
export function hexParaTokensClaro(hex?: string): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  return hslParaTokens({
    h: hsl.h,
    s: Math.max(Math.min(hsl.s, 45), 18),
    l: Math.min(hsl.l + 48, 93),
  });
}

/** Variante escura da cor (textos de destaque em fundo claro). */
export function hexParaTokensEscuro(hex?: string): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  return hslParaTokens({
    h: hsl.h,
    s: Math.min(hsl.s + 8, 100),
    l: Math.max(hsl.l - 12, 20),
  });
}

export function ehModoEscuro(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/** Tom principal da marca — mais claro no escuro para contraste em fundos escuros. */
export function hexParaTokensPrimario(hex?: string, escuro = ehModoEscuro()): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  if (escuro) {
    return hslParaTokens({
      h: hsl.h,
      s: Math.min(hsl.s + 8, 80),
      l: Math.min(Math.max(hsl.l + 22, 50), 65),
    });
  }
  return hslParaTokens(hsl);
}

/** Tom secundário — levemente mais claro no escuro. */
export function hexParaTokensSecundario(hex?: string, escuro = ehModoEscuro()): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  if (escuro) {
    return hslParaTokens({
      h: hsl.h,
      s: Math.min(hsl.s + 5, 75),
      l: Math.min(Math.max(hsl.l + 15, 42), 58),
    });
  }
  return hslParaTokens(hsl);
}

/** Fundo suave / destaque leve (cards, badges, hovers). */
export function hexParaTokensSuperficie(hex?: string, escuro = ehModoEscuro()): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  if (escuro) {
    return hslParaTokens({
      h: hsl.h,
      s: Math.min(hsl.s, 35),
      l: Math.max(Math.min(hsl.l - 8, 22), 14),
    });
  }
  return hexParaTokensClaro(hex);
}

/** @deprecated Use foregroundParaTokensFundo com o token do fundo aplicado. */
export function hexParaTokensTextoSobre(hex?: string, escuro = ehModoEscuro()): string | null {
  const tom = hexParaTokensPrimario(hex, escuro);
  return foregroundParaTokensFundo(tom);
}

/** Terceiro tom da mesma família (sem mudar matiz — evita rosa/magenta fora da paleta). */
export function hexParaTokensTonal(hex?: string, escuro = ehModoEscuro()): string | null {
  const hsl = hexParaHsl(hex);
  if (!hsl) return null;
  if (escuro) {
    return hslParaTokens({
      h: hsl.h,
      s: Math.max(hsl.s - 8, 20),
      l: Math.min(Math.max(hsl.l + 6, 40), 55),
    });
  }
  return hslParaTokens({
    h: hsl.h,
    s: Math.max(hsl.s - 5, 25),
    l: Math.min(Math.max(hsl.l + 14, 38), 52),
  });
}

/** Aplica cores da igreja nas variáveis CSS, respeitando modo claro/escuro. */
export function aplicarCoresIgreja(corPrimaria?: string, corSecundaria?: string) {
  if (typeof document === "undefined") return;
  const escuro = ehModoEscuro();
  const root = document.documentElement;

  if (corPrimaria) {
    root.style.setProperty("--igreja-primary", corPrimaria);
    const primaria = hexParaTokensPrimario(corPrimaria, escuro);
    const primariaFg = foregroundParaTokensFundo(primaria);
    const primariaLight = hexParaTokensSuperficie(corPrimaria, escuro);
    const primariaDark = hexParaTokensEscuro(corPrimaria);

    if (primaria) {
      root.style.setProperty("--primary", primaria);
      root.style.setProperty("--olive", primaria);
      root.style.setProperty("--ring", primaria);
      root.style.setProperty("--sidebar-primary", primaria);
    }
    if (primariaFg) {
      root.style.setProperty("--primary-foreground", primariaFg);
      root.style.setProperty("--olive-foreground", primariaFg);
      root.style.setProperty("--sidebar-primary-foreground", primariaFg);
    }
    if (primariaLight) {
      root.style.setProperty("--olive-light", primariaLight);
      root.style.setProperty("--verse-highlight", primariaLight);
    }
    if (primariaDark) root.style.setProperty("--olive-dark", primariaDark);
  }

  if (corSecundaria) {
    root.style.setProperty("--igreja-secondary", corSecundaria);
    const secundaria = hexParaTokensSecundario(corSecundaria, escuro);
    const secundariaFg = foregroundParaTokensFundo(secundaria);
    const secundariaLight = hexParaTokensSuperficie(corSecundaria, escuro);
    const secundariaTonal = hexParaTokensTonal(corSecundaria, escuro);

    if (secundaria) {
      root.style.setProperty("--secondary", secundaria);
      root.style.setProperty("--deep-blue", secundaria);
      root.style.setProperty("--accent", secundaria);
      root.style.setProperty("--gold", secundaria);
    }
    if (secundariaFg) {
      root.style.setProperty("--secondary-foreground", secundariaFg);
      root.style.setProperty("--deep-blue-foreground", secundariaFg);
      root.style.setProperty("--accent-foreground", secundariaFg);
      root.style.setProperty("--gold-foreground", secundariaFg);
    }
    if (secundariaLight) {
      root.style.setProperty("--deep-blue-light", secundariaLight);
      root.style.setProperty("--gold-light", secundariaLight);
    }
    if (secundariaTonal) {
      root.style.setProperty("--gold-dark", secundariaTonal);
    }
  } else if (corPrimaria) {
    const tonal = hexParaTokensTonal(corPrimaria, escuro);
    const tonalFg = foregroundParaTokensFundo(tonal);
    const primariaLight = hexParaTokensSuperficie(corPrimaria, escuro);
    if (tonal) {
      root.style.setProperty("--accent", tonal);
      root.style.setProperty("--gold", tonal);
      root.style.setProperty("--secondary", tonal);
      root.style.setProperty("--deep-blue", tonal);
    }
    if (tonalFg) {
      root.style.setProperty("--accent-foreground", tonalFg);
      root.style.setProperty("--gold-foreground", tonalFg);
      root.style.setProperty("--secondary-foreground", tonalFg);
      root.style.setProperty("--deep-blue-foreground", tonalFg);
    }
    if (primariaLight) {
      root.style.setProperty("--deep-blue-light", primariaLight);
      root.style.setProperty("--gold-light", primariaLight);
    }
  }
}

/** Remove personalização visual da igreja (login / painel SaaS). */
export function limparCoresIgreja() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const props = [
    "--igreja-primary",
    "--igreja-secondary",
    "--primary",
    "--primary-foreground",
    "--olive",
    "--olive-foreground",
    "--olive-light",
    "--olive-dark",
    "--ring",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
    "--secondary",
    "--secondary-foreground",
    "--deep-blue",
    "--deep-blue-foreground",
    "--deep-blue-light",
    "--accent",
    "--accent-foreground",
    "--gold",
    "--gold-foreground",
    "--gold-light",
    "--verse-highlight",
  ];
  for (const prop of props) {
    root.style.removeProperty(prop);
  }
}
