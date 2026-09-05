import { describe, expect, it } from "vitest";
import {
  agruparEstrofes,
  colorirAcordesNaLinha,
  ehLinhaDeAcordes,
  ehTokenAcorde,
  estimarColunasMonospace,
  quebrarCifraParaLargura,
  quebrarParAcordeLetra,
  sanitizarTextoCifraColado,
  segmentarLinhaCifra,
} from "@/lib/cifra-linhas";

describe("cifra-linhas — quebra inteligente", () => {
  it("detecta linha de acordes", () => {
    expect(ehLinhaDeAcordes("Am7             Em7         Dm7")).toBe(true);
    expect(ehLinhaDeAcordes("C  G  Am  F")).toBe(true);
    expect(ehLinhaDeAcordes("Purifica o meu coração para entrar em Tua presença")).toBe(false);
    expect(ehLinhaDeAcordes("[Intro]")).toBe(false);
  });

  it("quebra par acorde+letra no mesmo ponto sem perder o final", () => {
    const acordes = "Am7             Em7         Dm7";
    const letra = "Purifica o meu coração para entrar em Tua presença";
    const partes = quebrarParAcordeLetra(acordes, letra, 28);

    expect(partes.length).toBeGreaterThanOrEqual(4);
    expect(partes.join("\n")).toContain("presença");
    expect(partes.join("\n")).toContain("Am7");
    expect(partes.join("\n")).toContain("Dm7");
    // Nenhuma linha ultrapassa o limite (com pequena folga por trim).
    for (const linha of partes) {
      expect(linha.length).toBeLessThanOrEqual(28);
    }
  });

  it("quebra estrofe completa preservando marcadores", () => {
    const linhas = [
      "[Verso]",
      "Am7             Em7         Dm7",
      "Purifica o meu coração para entrar em Tua presença",
      "",
      "C               G",
      "Eu quero subir",
    ];
    const resultado = quebrarCifraParaLargura(linhas, 30);
    expect(resultado[0]).toBe("[Verso]");
    expect(resultado.join("\n")).toContain("presença");
    expect(resultado.join("\n")).toContain("Eu quero subir");
  });

  it("estima colunas a partir da largura", () => {
    expect(estimarColunasMonospace(320, 16)).toBeGreaterThan(20);
    expect(estimarColunasMonospace(0, 16)).toBe(40);
  });

  it("reconhece B4 e Em7M como acorde", () => {
    expect(ehTokenAcorde("B4")).toBe(true);
    expect(ehTokenAcorde("Em7M")).toBe(true);
  });

  it("não trata palavra 'em' da letra como acorde", () => {
    expect(ehTokenAcorde("em")).toBe(false);
    expect(ehTokenAcorde("Em")).toBe(true);
    expect(colorirAcordesNaLinha("Há um bálsamo em Gileade")).toBe(false);
    expect(colorirAcordesNaLinha("D               Bm")).toBe(true);
    expect(colorirAcordesNaLinha("[Intro] F# G#m E F#")).toBe(true);
  });

  it("segmenta acordes preservando espaços", () => {
    const segs = segmentarLinhaCifra("D               Bm");
    expect(segs.some((s) => s.acorde && s.texto === "D")).toBe(true);
    expect(segs.some((s) => s.acorde && s.texto === "Bm")).toBe(true);
  });

  it("agrupa estrofes por linha em branco", () => {
    const grupos = agruparEstrofes(["A", "letra", "", "B", "outra"]);
    expect(grupos).toHaveLength(2);
    expect(grupos[0]).toEqual(["A", "letra"]);
  });
});

describe("cifra-linhas — sanitizar cola", () => {
  it("remove restos \"> do HTML e não duplica seção", () => {
    const bruto = `[Intro] G C9 Em7\n">D\nG C9 Em7\n">D\n[Primeira Parte]\n">D\n[Primeira Parte]`;
    const limpo = sanitizarTextoCifraColado(bruto);
    expect(limpo).not.toContain('">');
    expect(limpo.split("\n").filter((l) => l === "[Primeira Parte]")).toHaveLength(1);
    expect(limpo).toContain("D");
  });

  it("preserva acordes da cola do Cifra Club (Leão de Judá)", () => {
    const bruto = [
      "Tom: G",
      "[Intro] Em D C Am B4",
      "[Primeira Parte]",
      '">Em7',
      "[Primeira Parte]",
      "Em7",
      "Ouve-se o júbilo de todos os povos",
      "D",
      "Os reis se dobraram ao Senhor",
      "C Am7",
      "Ouve-se um brado de vitória",
      "B7",
      "O dia do Senhor chegou",
    ].join("\n");
    const limpo = sanitizarTextoCifraColado(bruto);
    expect(limpo).toContain("B4");
    expect(limpo.split("\n").filter((l) => l === "[Primeira Parte]")).toHaveLength(1);
    expect(limpo).toContain("Em7");
    expect(limpo).toContain("Am7");
    expect(limpo).toContain("B7");
    expect(limpo).toContain("Ouve-se o júbilo de todos os povos");
    expect(limpo).toContain("O dia do Senhor chegou");
  });

  it("extrai acordes de HTML do Cifra Club", () => {
    const html =
      "<pre>[Intro] <b>Em</b> <b>D</b> <b>C</b> <b>Am</b> <b>B4</b><br><b>Em7</b><br>Ouve-se o júbilo</pre>";
    const limpo = sanitizarTextoCifraColado(html);
    expect(limpo).toContain("B4");
    expect(limpo).toContain("Em7");
    expect(limpo).toContain("Ouve-se o júbilo");
  });

  it("remove duplicidade de frases da música", () => {
    const bruto = [
      "G                    C9",
      "Eu vejo a glória do Senhor hoje aqui",
      "G                    C9",
      "Eu vejo a glória do Senhor hoje aqui",
      "Em7                  D",
      "A sua mão, o seu poder sobre mim",
    ].join("\n");
    const limpo = sanitizarTextoCifraColado(bruto);
    expect(limpo.split("\n").filter((l) => l.includes("Eu vejo a glória"))).toHaveLength(1);
  });

  it("preserva cifra limpa colada normalmente", () => {
    const limpa = "[Intro] G  C9  Em7  D\n\nG                    C9\nEu vejo a glória";
    expect(sanitizarTextoCifraColado(limpa)).toBe(limpa);
  });

  it("corrige letra/acorde/mesma letra (cola Cifra Club — Fernandinho)", () => {
    const bruto = [
      "Tom: D",
      "Tom: D",
      "[Refrão]",
      "D",
      "[Refrão]",
      "Se não for pra te adorar",
      "D",
      "Se não for pra te adorar",
      "Para que nasci?",
      "G",
      "Para que nasci?",
      "Se não for pra Te servir",
      "Bm7",
      "Se não for pra Te servir",
      "Por que estou aqui?",
      "A2",
      "Por que estou aqui?",
    ].join("\n");
    const limpo = sanitizarTextoCifraColado(bruto);
    const linhas = limpo.split("\n");
    expect(linhas.filter((l) => l === "Tom: D")).toHaveLength(1);
    expect(linhas.filter((l) => l === "[Refrão]")).toHaveLength(1);
    expect(linhas.filter((l) => l === "Se não for pra te adorar")).toHaveLength(1);
    expect(linhas.filter((l) => l === "Para que nasci?")).toHaveLength(1);
    expect(linhas.filter((l) => l === "Se não for pra Te servir")).toHaveLength(1);
    expect(linhas.filter((l) => l === "Por que estou aqui?")).toHaveLength(1);
    // Ordem correta: acorde acima da letra
    expect(limpo).toContain("D\nSe não for pra te adorar");
    expect(limpo).toContain("G\nPara que nasci?");
    expect(limpo).toContain("Bm7\nSe não for pra Te servir");
    expect(limpo).toContain("A2\nPor que estou aqui?");
  });
});
