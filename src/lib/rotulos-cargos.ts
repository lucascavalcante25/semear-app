import { ROLE_LABELS, type Role } from "@/auth/permissions";
import type { IgrejaCargo } from "@/modules/cargos/api";

const ORDEM_CODIGO_CARGO = [
  "ADMIN_IGREJA",
  "PASTOR",
  "COPASTOR",
  "SECRETARIA",
  "TESOURARIA",
  "LIDER",
  "MEMBRO",
  "VISITANTE",
] as const;

const AUTHORITY_PARA_ROLE: Record<string, Role> = {
  ROLE_ADMIN: "admin",
  ROLE_ADMIN_IGREJA: "admin_igreja",
  ROLE_PASTOR: "pastor",
  ROLE_COPASTOR: "copastor",
  ROLE_SECRETARIA: "secretaria",
  ROLE_TESOURARIA: "tesouraria",
  ROLE_LIDER: "lider",
  ROLE_MEMBRO: "membro",
  ROLE_VISITANTE: "visitante",
};

const PRIORIDADE_ROLES: Role[] = [
  "admin",
  "admin_igreja",
  "pastor",
  "copastor",
  "secretaria",
  "tesouraria",
  "lider",
  "membro",
  "visitante",
];

export type FonteRotulosCargos = {
  cargoIds?: number[];
  authorities?: string[];
  role?: Role;
};

function ordenarCargosPorIds(cargos: IgrejaCargo[], cargoIds: number[]): IgrejaCargo[] {
  return cargos
    .filter((c) => c.id != null && cargoIds.includes(c.id))
    .sort((a, b) => {
      const ia = ORDEM_CODIGO_CARGO.indexOf((a.codigo ?? "") as (typeof ORDEM_CODIGO_CARGO)[number]);
      const ib = ORDEM_CODIGO_CARGO.indexOf((b.codigo ?? "") as (typeof ORDEM_CODIGO_CARGO)[number]);
      const oa = ia >= 0 ? ia : 100 + (a.ordem ?? 0);
      const ob = ib >= 0 ? ib : 100 + (b.ordem ?? 0);
      return oa - ob || a.nome.localeCompare(b.nome, "pt-BR");
    });
}

function rotulosPorAuthorities(fonte: FonteRotulosCargos): string[] {
  const roles = new Set<Role>();
  for (const auth of fonte.authorities ?? []) {
    const role = AUTHORITY_PARA_ROLE[auth];
    if (role) roles.add(role);
  }
  if (roles.size === 0 && fonte.role) {
    roles.add(fonte.role);
  }

  const labels: string[] = [];
  const vistos = new Set<string>();
  for (const role of PRIORIDADE_ROLES) {
    if (!roles.has(role)) continue;
    const label = ROLE_LABELS[role];
    if (vistos.has(label)) continue;
    labels.push(label);
    vistos.add(label);
  }
  return labels;
}

/** Nomes dos cargos/permissões do membro (um ou mais). */
export function obterRotulosCargos(
  fonte: FonteRotulosCargos,
  cargosIgreja: IgrejaCargo[] = [],
): string[] {
  if (fonte.cargoIds?.length && cargosIgreja.length > 0) {
    const nomes = ordenarCargosPorIds(cargosIgreja, fonte.cargoIds)
      .map((c) => c.nome.trim())
      .filter(Boolean);
    if (nomes.length > 0) return nomes;
  }
  return rotulosPorAuthorities(fonte);
}

export function membroCombinaBuscaCargos(
  fonte: FonteRotulosCargos,
  cargosIgreja: IgrejaCargo[],
  busca: string,
): boolean {
  const termo = busca.trim().toLowerCase();
  if (!termo) return true;
  return obterRotulosCargos(fonte, cargosIgreja).some((label) => label.toLowerCase().includes(termo));
}
