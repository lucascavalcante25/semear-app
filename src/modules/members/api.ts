import { requisicaoApi } from "@/modules/api/client";
import type { Role } from "@/auth/permissions";
import type { ModuleKey } from "@/auth/permissions";

/** DTO retornado pela API /api/admin/users */
export type AdminUserDTO = {
  id?: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  activated?: boolean;
  langKey?: string;
  createdBy?: string;
  createdDate?: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  authorities?: string[] | Array<{ name: string }>;
  modules?: string[] | string;
  birthDate?: string;
  sexo?: "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO";
  isDependente?: boolean;
  paiId?: number;
  maeId?: number;
  paiNome?: string;
  maeNome?: string;
};

/** Payload para criar dependente (criança/jovem sem login) */
export type DependenteCreatePayload = {
  nome: string;
  birthDate: string; // yyyy-mm-dd
  paiId?: number;
  maeId?: number;
};

const extrairAuthorities = (raw: AdminUserDTO["authorities"]): string[] => {
  if (!raw) return [];
  return raw.map((a) => (typeof a === "string" ? a : (a as { name: string }).name));
};

const extrairModules = (raw: AdminUserDTO["modules"]): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return (raw as string).split(",").map((s) => s.trim()).filter(Boolean);
};

const authorityParaRole = (auth: string): Role => {
  const nome = auth.replace(/^ROLE_/, "").toLowerCase();
  const roles: Role[] = ["admin", "pastor", "copastor", "secretaria", "tesouraria", "lider", "membro", "visitante"];
  return roles.includes(nome as Role) ? (nome as Role) : "membro";
};

const roleParaAuthority = (role: Role): string =>
  `ROLE_${role.toUpperCase()}`;

/** Converte AdminUserDTO para formato usado no frontend */
export const mapearParaMembro = (dto: AdminUserDTO) => {
  const name = [dto.firstName, dto.lastName].filter(Boolean).join(" ") || dto.login;
  const authorities = extrairAuthorities(dto.authorities);
  const modules = extrairModules(dto.modules);
  const role = authorities.length > 0 ? authorityParaRole(authorities[0]) : "membro";
  return {
    id: String(dto.id ?? dto.login),
    idNum: dto.id,
    login: dto.login,
    name,
    firstName: dto.firstName ?? "",
    lastName: dto.lastName ?? "",
    email: dto.email ?? "",
    imageUrl: dto.imageUrl,
    activated: dto.activated ?? true,
    role,
    authorities,
    modules: modules as ModuleKey[],
    isDependente: dto.isDependente ?? false,
    birthDate: dto.birthDate,
    sexo: dto.sexo,
    paiId: dto.paiId,
    maeId: dto.maeId,
    paiNome: dto.paiNome,
    maeNome: dto.maeNome,
  };
};

export type MembroApi = ReturnType<typeof mapearParaMembro>;

export type AtualizarMembroPayload = {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string | null;
  sexo?: "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO" | null;
  activated?: boolean;
  authorities: string[];
  modules: string[];
  paiId?: number | null;
  maeId?: number | null;
};

export const listarMembros = async (): Promise<MembroApi[]> => {
  const params = new URLSearchParams();
  params.set("page", "0");
  params.set("size", "500");
  params.set("sort", "lastName,asc");
  const lista = await requisicaoApi<AdminUserDTO[]>(
    `/api/membros?${params.toString()}`,
    { auth: true }
  );
  return (lista ?? []).map(mapearParaMembro);
};

export const obterMembroPorLogin = async (login: string): Promise<MembroApi | null> => {
  const dto = await requisicaoApi<AdminUserDTO>(
    `/api/admin/users/${encodeURIComponent(login)}`,
    { auth: true }
  );
  return dto ? mapearParaMembro(dto) : null;
};

export const atualizarMembro = async (
  payload: AtualizarMembroPayload
): Promise<MembroApi> => {
  const body: AdminUserDTO = {
    id: payload.id,
    login: payload.login.trim().toLowerCase(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email?.trim() || undefined,
    birthDate: payload.birthDate || undefined,
    sexo: payload.sexo || undefined,
    activated: payload.activated ?? true,
    authorities: payload.authorities,
    modules: payload.modules,
    paiId: payload.paiId ?? undefined,
    maeId: payload.maeId ?? undefined,
  };
  const updated = await requisicaoApi<AdminUserDTO>("/api/admin/users", {
    method: "PUT",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearParaMembro(updated);
};

export const excluirMembro = async (login: string): Promise<void> => {
  await requisicaoApi(
    `/api/admin/users/${encodeURIComponent(login)}`,
    { method: "DELETE", auth: true }
  );
};

export const cadastrarDependente = async (
  payload: DependenteCreatePayload
): Promise<AdminUserDTO> => {
  return requisicaoApi<AdminUserDTO>("/api/membros/dependentes", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
};

export { roleParaAuthority };
