import { describe, expect, it } from "vitest";
import {
  agruparEstrofes,
  colorirAcordesNaLinha,
  ehLinhaDeAcordes,
  ehTokenAcorde,
  estimarColunasMonospace,
  quebrarCifraParaLargura,
  quebrarParAcordeLetra,
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
