import { describe, it, expect } from "vitest";
import {
  canAccess,
  canWrite,
  hasModuleAccess,
  usuarioEhSuperAdmin,
  getDefaultPermissionsForRole,
  type UserAccess,
} from "@/auth/permissions";

const user = (role: UserAccess["role"], extra?: Partial<UserAccess>): UserAccess => ({
  role,
  ...extra,
});

describe("permissions — matriz por perfil", () => {
  it("membro: espiritual + oração (write) + eventos, sem visitantes nem financeiro", () => {
    const membro = user("membro");
    expect(hasModuleAccess(membro, "biblia", "READ")).toBe(true);
    expect(hasModuleAccess(membro, "oracao", "WRITE")).toBe(true);
    expect(hasModuleAccess(membro, "eventos", "READ")).toBe(true);
    expect(hasModuleAccess(membro, "visitantes", "READ")).toBe(false);
    expect(hasModuleAccess(membro, "financeiro", "READ")).toBe(false);
    expect(canAccess(membro, "/oracao")).toBe(true);
    expect(canAccess(membro, "/visitantes")).toBe(false);
    expect(canAccess(membro, "/aniversariantes")).toBe(false);
  });

  it("tesouraria: financeiro sim, membros não", () => {
    const tes = user("tesouraria");
    expect(hasModuleAccess(tes, "financeiro", "WRITE")).toBe(true);
    expect(hasModuleAccess(tes, "membros", "READ")).toBe(false);
    expect(canAccess(tes, "/financeiro")).toBe(true);
    expect(canAccess(tes, "/membros")).toBe(false);
    expect(canAccess(tes, "/departamentos")).toBe(false);
  });

  it("secretaria: operação sim, financeiro não", () => {
    const sec = user("secretaria");
    expect(hasModuleAccess(sec, "membros", "WRITE")).toBe(true);
    expect(hasModuleAccess(sec, "visitantes", "WRITE")).toBe(true);
    expect(hasModuleAccess(sec, "financeiro", "WRITE")).toBe(false);
    expect(canAccess(sec, "/informativos")).toBe(true);
    expect(canWrite(sec, "/informativos")).toBe(true);
    expect(canAccess(sec, "/financeiro")).toBe(false);
  });

  it("lider: ministério write, membros/visitantes só leitura", () => {
    const lid = user("lider");
    expect(hasModuleAccess(lid, "departamentos", "WRITE")).toBe(true);
    expect(hasModuleAccess(lid, "escalas", "WRITE")).toBe(true);
    expect(hasModuleAccess(lid, "membros", "READ")).toBe(true);
    expect(hasModuleAccess(lid, "membros", "WRITE")).toBe(false);
    expect(canAccess(lid, "/aniversariantes")).toBe(true);
    expect(canWrite(lid, "/membros")).toBe(false);
  });

  it("pastor: acesso total na igreja", () => {
    const pastor = user("pastor");
    expect(hasModuleAccess(pastor, "financeiro", "WRITE")).toBe(true);
    expect(hasModuleAccess(pastor, "escalas", "WRITE")).toBe(true);
    expect(canWrite(pastor, "/configuracoes-igreja")).toBe(true);
  });

  it("super admin ignora restrições", () => {
    const superAdmin = user("super_admin", { isSuperAdmin: true, authorities: ["ROLE_SUPER_ADMIN"] });
    expect(usuarioEhSuperAdmin(superAdmin)).toBe(true);
    expect(hasModuleAccess(superAdmin, "financeiro", "WRITE")).toBe(true);
  });

  it("rotas abertas e suporte para autenticados", () => {
    const membro = user("membro");
    expect(canAccess(membro, "/sobre")).toBe(true);
    expect(canAccess(membro, "/suporte")).toBe(true);
    expect(canAccess(membro, "/mais")).toBe(true);
  });

  it("defaults por role não incluem financeiro para secretaria", () => {
    const mods = getDefaultPermissionsForRole("secretaria").map((p) => p.module);
    expect(mods).toContain("membros");
    expect(mods).not.toContain("financeiro");
  });
});
