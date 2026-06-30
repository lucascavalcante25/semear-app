/**
 * Sistema de permissões baseado em módulo + nível de acesso (READ / WRITE).
 *
 * REGRA CRÍTICA: Usuários já cadastrados em produção mantêm suas permissões.
 * - Se user.permissions existe e tem itens → usar (novo formato)
 * - Se user.modules existe e tem itens → tratar como WRITE (legado)
 * - Senão → aplicar permissões padrão do role
 */

export type AccessLevel = "READ" | "WRITE";

export type Role =
  | "super_admin"
  | "admin"
  | "admin_igreja"
  | "pastor"
  | "copastor"
  | "secretaria"
  | "tesouraria"
  | "lider"
  | "membro"
  | "visitante";

export const MODULES = [
  "dashboard",
  "biblia",
  "devocionais",
  "louvores",
  "membros",
  "visitantes",
  "comunicados",
  "financeiro",
  "oracao",
  "departamentos",
  "escalas",
  "eventos",
  "aprovar-pre-cadastros",
  "configuracoes",
] as const;

export type ModuleKey = (typeof MODULES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Dono da Plataforma",
  admin: "Administração",
  admin_igreja: "Administrador da Igreja",
  pastor: "Pastor",
  copastor: "Co-pastor",
  secretaria: "Secretaria",
  tesouraria: "Tesouraria",
  lider: "Líder de ministério",
  membro: "Membro",
  visitante: "Visitante",
};

export const PUBLIC_ROUTES = [
  "/login",
  "/pre-cadastro",
  "/landing",
  "/precos",
  "/solicitar-acesso",
  "/esqueci-senha",
];

/** Rotas autenticadas sem módulo específico (acesso liberado a qualquer usuário logado da igreja) */
const AUTHENTICATED_OPEN_ROUTES = ["/sobre", "/mais", "/acesso-negado"];

export const ROUTE_TO_MODULE: Record<string, ModuleKey> = {
  "/": "dashboard",
  "/biblia": "biblia",
  "/devocionais": "devocionais",
  "/louvores": "louvores",
  "/membros": "membros",
  "/visitantes": "visitantes",
  "/aniversariantes": "membros",
  "/comunicados": "comunicados",
  "/avisos": "comunicados",
  "/financeiro": "financeiro",
  "/aprovar-pre-cadastros": "aprovar-pre-cadastros",
  "/configuracoes": "configuracoes",
  "/configuracoes-igreja": "configuracoes",
  "/oracao": "oracao",
  "/informativos": "comunicados",
  "/notificacoes": "dashboard",
  "/departamentos": "departamentos",
  "/escalas": "escalas",
  "/eventos": "eventos",
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  biblia: "Bíblia",
  devocionais: "Devocionais",
  louvores: "Louvores",
  membros: "Membros",
  visitantes: "Visitantes",
  comunicados: "Comunicados",
  financeiro: "Financeiro",
  "aprovar-pre-cadastros": "Aprovar pré-cadastros",
  configuracoes: "Configurações",
  oracao: "Oração",
  departamentos: "Departamentos",
  escalas: "Escalas",
  eventos: "Eventos",
};

/** Perfis com WRITE em todos os módulos da igreja */
const ROLES_FULL_ACCESS: Role[] = ["admin", "admin_igreja", "pastor", "copastor"];

const writeAll = (mods: ModuleKey[]): ModulePermission[] =>
  mods.map((module) => ({ module, access: "WRITE" as AccessLevel }));

const readAll = (mods: ModuleKey[]): ModulePermission[] =>
  mods.map((module) => ({ module, access: "READ" as AccessLevel }));

const mergePerms = (...groups: ModulePermission[][]): ModulePermission[] => {
  const map = new Map<ModuleKey, AccessLevel>();
  for (const group of groups) {
    for (const p of group) {
      const atual = map.get(p.module);
      if (!atual || (atual === "READ" && p.access === "WRITE")) {
        map.set(p.module, p.access);
      }
    }
  }
  return Array.from(map.entries()).map(([module, access]) => ({ module, access }));
};

const SECRETARIA_DEFAULT_PERMISSIONS: ModulePermission[] = writeAll([
  "dashboard",
  "biblia",
  "devocionais",
  "louvores",
  "membros",
  "visitantes",
  "comunicados",
  "oracao",
  "departamentos",
  "escalas",
  "eventos",
  "aprovar-pre-cadastros",
  "configuracoes",
]);

const TESOURARIA_DEFAULT_PERMISSIONS: ModulePermission[] = writeAll([
  "dashboard",
  "biblia",
  "devocionais",
  "comunicados",
  "financeiro",
  "oracao",
  "configuracoes",
]);

const LIDER_DEFAULT_PERMISSIONS: ModulePermission[] = mergePerms(
  writeAll([
    "dashboard",
    "biblia",
    "devocionais",
    "louvores",
    "oracao",
    "departamentos",
    "escalas",
    "eventos",
    "configuracoes",
    "comunicados",
  ]),
  readAll(["membros", "visitantes", "comunicados"]),
);

const MEMBRO_DEFAULT_PERMISSIONS_INTERNAL: ModulePermission[] = mergePerms(
  readAll(["dashboard", "biblia", "devocionais", "comunicados", "eventos", "configuracoes"]),
  writeAll(["oracao"]),
);

const VISITANTE_DEFAULT_PERMISSIONS: ModulePermission[] = readAll(["biblia", "oracao", "configuracoes"]);

export type ModulePermission = {
  module: ModuleKey;
  access: AccessLevel;
};

export type UserAccess = {
  role: Role;
  isSuperAdmin?: boolean;
  authorities?: string[];
  modules?: (string | string[])[];
  permissions?: ModulePermission[];
  /** Permissões efetivas calculadas no servidor (cargos + override). Formato: `modulo:READ|WRITE` */
  permissoesEfetivas?: string[];
  cargoIds?: number[];
};

const parseStringsPermissao = (items: string[]): ModulePermission[] => {
  const result: ModulePermission[] = [];
  for (const item of items) {
    const colonIdx = item.indexOf(":");
    if (colonIdx >= 0) {
      const module = item.slice(0, colonIdx) as ModuleKey;
      const access = item.slice(colonIdx + 1).toUpperCase() as AccessLevel;
      if (MODULES.includes(module) && (access === "READ" || access === "WRITE")) {
        result.push({ module, access });
      } else if ((module === "avisos" || module === "informativos") && (access === "READ" || access === "WRITE")) {
        result.push({ module: "comunicados", access });
      }
    }
  }
  return result;
};

export const temPermissoesDinamicas = (user: UserAccess | null | undefined): boolean =>
  Boolean(user?.permissoesEfetivas && user.permissoesEfetivas.length > 0);

export const podeAcessarSuporte = (user: UserAccess | null | undefined): boolean => user != null;

export const podeAcessarRotaSuporte = (path: string): boolean =>
  path === "/suporte" || path.startsWith("/suporte/");

export const podeGerenciarDocumentosIgreja = (user: UserAccess | null | undefined): boolean => {
  if (!user) return false;
  if (user.authorities?.includes("ROLE_ADMIN_IGREJA")) return true;
  if (user.authorities?.includes("ROLE_ADMIN")) return true;
  return user.role === "admin" || user.role === "admin_igreja";
};

export const usuarioEhSuperAdmin = (user: UserAccess | null | undefined): boolean => {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  if (user.role === "super_admin") return true;
  return user.authorities?.includes("ROLE_SUPER_ADMIN") ?? false;
};

const parsePermissoes = (user: UserAccess | null | undefined): ModulePermission[] => {
  if (!user) return [];

  if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.filter(
      (p): p is ModulePermission =>
        p && typeof p.module === "string" && (p.access === "READ" || p.access === "WRITE"),
    );
  }

  const raw = user.modules;
  if (!raw) return [];

  const items = Array.isArray(raw) ? raw : String(raw).split(",").map((s) => String(s).trim()).filter(Boolean);
  const result: ModulePermission[] = [];

  for (const item of items) {
    const colonIdx = item.indexOf(":");
    if (colonIdx >= 0) {
      const module = item.slice(0, colonIdx) as ModuleKey;
      const access = item.slice(colonIdx + 1).toUpperCase() as AccessLevel;
      if (MODULES.includes(module) && (access === "READ" || access === "WRITE")) {
        result.push({ module, access });
      } else if ((module === "avisos" || module === "informativos") && (access === "READ" || access === "WRITE")) {
        result.push({ module: "comunicados", access });
      }
    } else {
      const module = item as ModuleKey;
      if (MODULES.includes(module)) {
        result.push({ module, access: "WRITE" });
      }
    }
  }

  return result;
};

export const getDefaultPermissionsForRole = (role: Role): ModulePermission[] => {
  if (ROLES_FULL_ACCESS.includes(role)) {
    return MODULES.map((m) => ({ module: m, access: "WRITE" as AccessLevel }));
  }
  if (role === "secretaria") return SECRETARIA_DEFAULT_PERMISSIONS;
  if (role === "tesouraria") return TESOURARIA_DEFAULT_PERMISSIONS;
  if (role === "lider") return LIDER_DEFAULT_PERMISSIONS;
  if (role === "membro") return MEMBRO_DEFAULT_PERMISSIONS_INTERNAL;
  if (role === "visitante") return VISITANTE_DEFAULT_PERMISSIONS;
  return [];
};

export const getEffectivePermissions = (user: UserAccess | null | undefined): ModulePermission[] => {
  if (!user) return [];
  if (user.permissoesEfetivas && user.permissoesEfetivas.length > 0) {
    return parseStringsPermissao(user.permissoesEfetivas);
  }
  const parsed = parsePermissoes(user);
  if (parsed.length > 0) return parsed;
  return getDefaultPermissionsForRole(user.role);
};

export const hasModuleAccess = (
  user: UserAccess | null | undefined,
  module: ModuleKey,
  action: AccessLevel,
): boolean => {
  if (!user) return false;
  if (usuarioEhSuperAdmin(user)) return true;
  if (!temPermissoesDinamicas(user) && ROLES_FULL_ACCESS.includes(user.role)) return true;

  const perms = getEffectivePermissions(user);
  const perm = perms.find((p) => p.module === module);
  if (perm) {
    if (action === "READ") return perm.access === "READ" || perm.access === "WRITE";
    if (action === "WRITE") return perm.access === "WRITE";
  }

  return false;
};

export const canAccess = (user: UserAccess | null | undefined, path: string): boolean => {
  if (!user) return false;

  const base = path.split("?")[0].split("#")[0];
  if (PUBLIC_ROUTES.includes(base)) return true;
  if (AUTHENTICATED_OPEN_ROUTES.includes(base)) return true;
  if (podeAcessarRotaSuporte(base)) return podeAcessarSuporte(user);
  if (base.startsWith("/i/")) return true;

  if (usuarioEhSuperAdmin(user)) return true;
  if (!temPermissoesDinamicas(user) && ROLES_FULL_ACCESS.includes(user.role)) return true;

  const moduleKey = getModuleForRoute(base);
  if (!moduleKey) return false;

  return hasModuleAccess(user, moduleKey, "READ");
};

export const canWrite = (user: UserAccess | null | undefined, path: string): boolean => {
  if (!user) return false;

  const base = path.split("?")[0].split("#")[0];
  if (PUBLIC_ROUTES.includes(base)) return false;
  if (podeAcessarRotaSuporte(base)) return false;

  if (usuarioEhSuperAdmin(user)) return true;
  if (!temPermissoesDinamicas(user) && ROLES_FULL_ACCESS.includes(user.role)) return true;

  const moduleKey = getModuleForRoute(base);
  if (!moduleKey) return false;

  return hasModuleAccess(user, moduleKey, "WRITE");
};

export const getModuleForRoute = (path: string): ModuleKey | null => {
  const base = path.split("?")[0].split("#")[0];
  return ROUTE_TO_MODULE[base] ?? null;
};

export const podeVerVisaoGerencial = (user: UserAccess | null | undefined): boolean => {
  if (!user) return false;
  if (usuarioEhSuperAdmin(user)) return true;
  const rolesGerenciais: Role[] = [
    "admin",
    "admin_igreja",
    "pastor",
    "copastor",
    "secretaria",
    "tesouraria",
    "lider",
  ];
  return rolesGerenciais.includes(user.role);
};

/** Liderança que modera pedidos de oração (badge no menu). */
export const ehLiderancaOracao = (user: UserAccess | null | undefined): boolean => {
  if (!user) return false;
  if (usuarioEhSuperAdmin(user)) return true;
  const roles: Role[] = ["admin", "admin_igreja", "pastor", "copastor", "secretaria", "lider"];
  return roles.includes(user.role);
};

export const getDefaultRouteForRole = (role: Role) => {
  if (role === "super_admin") return "/super-admin/dashboard";
  if (role === "membro" || role === "visitante") return "/biblia";
  const perms = getDefaultPermissionsForRole(role);
  const first = perms[0];
  // Primeira rota registrada por módulo (evita /notificacoes sobrescrever / no dashboard)
  const moduleToRoute: Partial<Record<ModuleKey, string>> = {};
  for (const [route, mod] of Object.entries(ROUTE_TO_MODULE)) {
    if (!moduleToRoute[mod]) {
      moduleToRoute[mod] = route;
    }
  }
  return (first ? moduleToRoute[first.module] : undefined) ?? "/";
};

export const getDefaultRouteForUser = (user: UserAccess | null | undefined): string => {
  if (!user) return "/login";
  if (usuarioEhSuperAdmin(user)) return "/super-admin/dashboard";
  return getDefaultRouteForRole(user.role);
};

const modulesFromPerms = (perms: ModulePermission[]): ModuleKey[] =>
  perms.map((p) => p.module);

export const ROLE_DEFAULT_MODULES: Record<Role, ModuleKey[]> = {
  super_admin: [],
  admin: [...MODULES],
  admin_igreja: [...MODULES],
  pastor: [...MODULES],
  copastor: [...MODULES],
  secretaria: modulesFromPerms(SECRETARIA_DEFAULT_PERMISSIONS),
  tesouraria: modulesFromPerms(TESOURARIA_DEFAULT_PERMISSIONS),
  lider: modulesFromPerms(LIDER_DEFAULT_PERMISSIONS),
  membro: modulesFromPerms(MEMBRO_DEFAULT_PERMISSIONS_INTERNAL),
  visitante: modulesFromPerms(VISITANTE_DEFAULT_PERMISSIONS),
};

export const ROLE_ALLOWED_MODULES: Record<Role, ModuleKey[]> = {
  super_admin: [],
  admin: [...MODULES],
  admin_igreja: [...MODULES],
  pastor: [...MODULES],
  copastor: [...MODULES],
  secretaria: modulesFromPerms(SECRETARIA_DEFAULT_PERMISSIONS),
  tesouraria: modulesFromPerms(TESOURARIA_DEFAULT_PERMISSIONS),
  lider: [...MODULES],
  membro: modulesFromPerms(MEMBRO_DEFAULT_PERMISSIONS_INTERNAL),
  visitante: modulesFromPerms(VISITANTE_DEFAULT_PERMISSIONS),
};

export const MEMBRO_DEFAULT_PERMISSIONS = MEMBRO_DEFAULT_PERMISSIONS_INTERNAL;

export const FULL_ACCESS_PERMISSIONS: ModulePermission[] = MODULES.map((m) => ({
  module: m,
  access: "WRITE" as AccessLevel,
}));

export const permissionsToModules = (perms: ModulePermission[]): string[] =>
  perms.map((p) => `${p.module}:${p.access}`);

export const modulesToKeys = (raw: string[]): ModuleKey[] =>
  raw
    .map((s) => {
      const idx = s.indexOf(":");
      const key = idx >= 0 ? s.slice(0, idx).trim() : s.trim();
      return MODULES.includes(key as ModuleKey) ? (key as ModuleKey) : null;
    })
    .filter((k): k is ModuleKey => k != null);
