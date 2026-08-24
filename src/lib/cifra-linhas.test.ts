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
  it("remove restos \">D do HTML do Cifra Club", () => {
    const bruto = `[Intro] G C9 Em7\n">D\nG C9 Em7\n">D\n[Primeira Parte]\n">D\n[Primeira Parte]`;
    const limpo = sanitizarTextoCifraColado(bruto);
    expect(limpo).not.toContain('">');
    expect(limpo.split("\n").filter((l) => l === "[Primeira Parte]")).toHaveLength(1);
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
});
