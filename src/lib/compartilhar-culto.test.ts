import { describe, expect, it } from "vitest";
import type { CultoAgendaItemDTO } from "@/modules/cultos/api";
import { montarMensagemCultoWhatsApp } from "@/lib/compartilhar-culto";

const culto: CultoAgendaItemDTO = {
  cultoRegistroId: 1,
  nome: "Culto de domingo",
  tipo: "RECORRENTE",
  data: "2026-08-30",
  horario: "09:00:00",
  pregador: "Pastor João",
  louvores: [
    { louvorId: 1, titulo: "Leão de Judá Prevaleceu", artista: "Koinonya", ordem: 1 },
    { louvorId: 2, titulo: "Ao Único", ordem: 2 },
  ],
  responsaveis: [
    { papel: "PORTARIA", userId: 1, nome: "Maria", origemManual: false },
    { papel: "RECEPCAO", userId: 2, nome: "José", origemManual: false },
    { papel: "LIMPEZA", userId: 3, nome: "Ana", origemManual: false },
  ],
  temOverrideResponsaveis: false,
  temEscalaGerada: true,
};

describe("montarMensagemCultoWhatsApp", () => {
  it("sempre inclui data e hora", () => {
    const texto = montarMensagemCultoWhatsApp(culto, {
      pregador: false,
      louvores: false,
      portaria: false,
      recepcao: false,
      limpeza: false,
    });
    expect(texto).toContain("Culto de domingo");
    expect(texto).toContain("Domingo, 30/08/2026");
    expect(texto).toContain("09:00");
    expect(texto).not.toContain("Pregador");
    expect(texto).not.toContain("Louvores");
  });

  it("inclui só título e artista dos louvores", () => {
    const texto = montarMensagemCultoWhatsApp(culto, {
      pregador: true,
      louvores: true,
      portaria: false,
      recepcao: false,
      limpeza: false,
    });
    expect(texto).toContain("Pastor João");
    expect(texto).toContain("Leão de Judá Prevaleceu — Koinonya");
    expect(texto).toContain("Ao Único");
    expect(texto).not.toContain("Portaria");
  });

  it("inclui equipe quando marcado", () => {
    const texto = montarMensagemCultoWhatsApp(culto, {
      pregador: false,
      louvores: false,
      portaria: true,
      recepcao: true,
      limpeza: true,
    });
    expect(texto).toContain("Portaria: Maria");
    expect(texto).toContain("Recepção: José");
    expect(texto).toContain("Limpeza da semana: Ana");
  });
});
