import { describe, expect, it } from "vitest";
import type { CultoAgendaItemDTO } from "@/modules/cultos/api";
import { montarMensagemCultoWhatsApp, ordenarLouvoresCulto } from "@/lib/compartilhar-culto";

const culto: CultoAgendaItemDTO = {
  cultoRegistroId: 1,
  nome: "Culto de domingo",
  tipo: "RECORRENTE",
  data: "2026-08-30",
  horario: "09:00:00",
  pregador: "Pastor João",
  louvores: [
    { louvorId: 3, titulo: "Rio de Deus", artista: "Sara nossa terra", ordem: 3 },
    { louvorId: 1, titulo: "Leão de Judá Prevaleceu", artista: "Koinonya", ordem: 0 },
    { louvorId: 2, titulo: "Ao Único", ordem: 1 },
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

  it("inclui só título e artista dos louvores na ordem do culto", () => {
    const texto = montarMensagemCultoWhatsApp(
      culto,
      {
        pregador: true,
        louvores: true,
        portaria: false,
        recepcao: false,
        limpeza: false,
      },
      "https://minha-igreja-digital-app.vercel.app",
    );
    expect(texto).toContain("Pastor João");
    const idxLeao = texto.indexOf("1. Leão de Judá");
    const idxUnico = texto.indexOf("2. Ao Único");
    const idxRio = texto.indexOf("3. Rio de Deus");
    expect(idxLeao).toBeGreaterThan(-1);
    expect(idxUnico).toBeGreaterThan(idxLeao);
    expect(idxRio).toBeGreaterThan(idxUnico);
    expect(texto).not.toContain("Portaria");
    expect(texto).toContain("Compartilhado pelo app Semear");
    expect(texto).toContain("https://minha-igreja-digital-app.vercel.app");
  });

  it("ordena louvores pelo campo ordem e pela posição na lista", () => {
    const desordenados = [
      { louvorId: 10, titulo: "C", ordem: 2 },
      { louvorId: 11, titulo: "A", ordem: 0 },
      { louvorId: 12, titulo: "B", ordem: 1 },
    ];
    expect(ordenarLouvoresCulto(desordenados).map((l) => l.titulo)).toEqual(["A", "B", "C"]);
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
