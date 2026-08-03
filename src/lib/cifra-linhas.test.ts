import { describe, expect, it } from "vitest";
import {
  ehLinhaDeAcordes,
  estimarColunasMonospace,
  quebrarCifraParaLargura,
  quebrarParAcordeLetra,
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
});
