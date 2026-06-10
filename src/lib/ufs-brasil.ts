export const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type UfBrasil = (typeof UFS_BRASIL)[number];

export function ufValida(uf: string): uf is UfBrasil {
  return UFS_BRASIL.includes(uf.toUpperCase() as UfBrasil);
}
