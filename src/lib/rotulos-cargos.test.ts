import { describe, expect, it } from "vitest";
import { obterRotulosCargos } from "@/lib/rotulos-cargos";
import type { IgrejaCargo } from "@/modules/cargos/api";

const cargosMock: IgrejaCargo[] = [
  { id: 1, codigo: "ADMIN_IGREJA", nome: "Administrador da Igreja", modulos: [] },
  { id: 2, codigo: "LIDER", nome: "Líder de ministério", modulos: [] },
  { id: 3, codigo: "SECRETARIA", nome: "Secretaria", modulos: [] },
];

describe("obterRotulosCargos", () => {
  it("retorna todos os cargos quando o membro tem mais de um", () => {
    const rotulos = obterRotulosCargos(
      { cargoIds: [1, 2], authorities: ["ROLE_ADMIN_IGREJA", "ROLE_LIDER"], role: "admin" },
      cargosMock,
    );
    expect(rotulos).toEqual(["Administrador da Igreja", "Líder de ministério"]);
  });

  it("usa authorities como fallback sem lista de cargos", () => {
    const rotulos = obterRotulosCargos(
      { authorities: ["ROLE_ADMIN_IGREJA", "ROLE_LIDER"], role: "admin" },
      [],
    );
    expect(rotulos).toContain("Administrador da Igreja");
    expect(rotulos).toContain("Líder de ministério");
  });
});
