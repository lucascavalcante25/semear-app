import type { Role } from "@/auth/permissions";

const PERFIS_APROVACAO_PRE_CADASTRO: Role[] = ["admin", "pastor", "copastor", "secretaria"];

export const podeVerPreCadastrosPendentes = (role?: Role | string | null): boolean =>
  Boolean(role && PERFIS_APROVACAO_PRE_CADASTRO.includes(role as Role));
