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
  "avisos",
  "financeiro",
  "oracao",
  "aprovar-pre-cadastros",
  "configuracoes",
] as const;

export type ModuleKey = (typeof MODULES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Dono da Plataforma",
  admin: "Administração",
  admin_igreja: "Administração da Igreja",
  pastor: "Pastor",
  copastor: "Co-pastor",
  secretaria: "Secretaria",
  tesouraria: "Tesouraria",
  lider: "Liderança",
  membro: "Membro",
  visitante: "Visitante",
};

export const PUBLIC_ROUTES = ["/login", "/pre-cadastro"];

export const ROUTE_TO_MODULE: Record<string, ModuleKey> = {
  "/": "dashboard",
  "/biblia": "biblia",
  "/devocionais": "devocionais",
  "/louvores": "louvores",
  "/membros": "membros",
  "/visitantes": "visitantes",
  "/avisos": "avisos",
  "/financeiro": "financeiro",
  "/aprovar-pre-cadastros": "aprovar-pre-cadastros",
  "/configuracoes": "configuracoes",
  "/configuracoes-igreja": "configuracoes",
  "/oracao": "oracao",
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  biblia: "Bíblia",
  devocionais: "Devocionais",
  louvores: "Louvores",
  membros: "Membros",
  visitantes: "Visitantes",
  avisos: "Avisos",
  financeiro: "Financeiro",
  "aprovar-pre-cadastros": "Aprovar pré-cadastros",
  configuracoes: "Configurações",
  oracao: "Oração",
};

/** Perfis com acesso total (READ + WRITE em todos módulos) */
const ROLES_FULL_ACCESS: Role[] = [
  "admin",
  "admin_igreja",
  "pastor",
  "copastor",
  "secretaria",
  "tesouraria",
  "lider",
];

/** Módulos que MEMBRO pode acessar (READ only). Configurações limitado ao próprio perfil. */
const MEMBRO_READ_MODULES_FINAL: ModuleKey[] = [
  "dashboard",
  "biblia",
  "devocionais",
  "visitantes",
  "avisos",
  "financeiro",
  "oracao",
  "configuracoes",
];

export type ModulePermission = {
  module: ModuleKey;
  access: AccessLevel;
};

export type UserAccess = {
  role: Role;
  /** Indica acesso ao painel da plataforma (pode coexistir com role de igreja). */
  isSuperAdmin?: boolean;
  authorities?: string[];
  modules?: (string | string[])[];
  permissions?: ModulePermission[];
};

/** Central de Suporte — disponível para qualquer usuário autenticado da igreja */
export const podeAcessarSuporte = (user: UserAccess | null | undefined): boolean => {
  return user != null;
};

/** Documentos da Igreja — apenas ADMIN_IGREJA e admin da plataforma */
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

/**
 * Converte módulos legados (string[] ou "module:ACCESS") para ModulePermission[].
 * Formato legado: "dashboard" = WRITE. Formato novo: "dashboard:READ" ou "dashboard:WRITE".
 */
const parsePermissoes = (user: UserAccess | null | undefined): ModulePermission[] => {
  if (!user) return [];

  // Se tem permissions explícitas (novo formato), usar
  if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.filter(
      (p): p is ModulePermission =>
        p && typeof p.module === "string" && (p.access === "READ" || p.access === "WRITE"),
    );
  }

  // Se tem modules (legado), converter: "module" sem colon = WRITE
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
      }
    } else {
      // Legado: sem colon = WRITE
      const module = item as ModuleKey;
      if (MODULES.includes(module)) {
        result.push({ module, access: "WRITE" });
      }
    }
  }

  return result;
};

/**
 * Retorna permissões padrão do role (para usuários sem permissions/modules salvos).
 */
const getDefaultPermissionsForRole = (role: Role): ModulePermission[] => {
  if (ROLES_FULL_ACCESS.includes(role)) {
    return MODULES.map((m) => ({ module: m, access: "WRITE" as AccessLevel }));
  }
  if (role === "membro") {
    return MEMBRO_READ_MODULES_FINAL.map((m) => ({ module: m, access: "READ" as AccessLevel }));
  }
  if (role === "visitante") {
    return [
      { module: "biblia", access: "READ" },
      { module: "oracao", access: "READ" },
      { module: "configuracoes", access: "READ" },
    ];
  }
  return [];
};

/**
 * Obtém as permissões efetivas do usuário.
 * Prioridade: permissions salvas > modules legado > padrão do role.
 */
export const getEffectivePermissions = (user: UserAccess | null | undefined): ModulePermission[] => {
  if (!user) return [];

  const parsed = parsePermissoes(user);
  if (parsed.length > 0) { return parsed; }

  return getDefaultPermissionsForRole(user.role);
};

/**
 * Verifica se o usuário tem acesso ao módulo com o nível especificado.
 * READ permite visualizar. WRITE permite CRUD.
 *
 * @param user - Usuário logado
 * @param module - Módulo
 * @param action - READ ou WRITE
 */
export const hasModuleAccess = (
  user: UserAccess | null | undefined,
  module: ModuleKey,
  action: AccessLevel,
): boolean => {
  if (!user) return false;

  if (ROLES_FULL_ACCESS.includes(user.role)) return true;

  const perms = getEffectivePermissions(user);
  const perm = perms.find((p) => p.module === module);
  if (!perm) return false;

  if (action === "READ") return perm.access === "READ" || perm.access === "WRITE";
  if (action === "WRITE") return perm.access === "WRITE";

  return false;
};

/**
 * Verifica se o usuário pode ver (READ) a rota.
 * Usado para menu lateral e navegação.
 */
export const canAccess = (user: UserAccess | null | undefined, path: string): boolean => {
  if (!user) return false;
  if (PUBLIC_ROUTES.includes(path)) return true;
  if (path === "/acesso-negado") return true;

  if (ROLES_FULL_ACCESS.includes(user.role)) return true;

  const moduleKey = getModuleForRoute(path);
  if (!moduleKey) return true;

  return hasModuleAccess(user, moduleKey, "READ");
};

/**
 * Verifica se o usuário pode executar ações (criar, editar, excluir) no módulo.
 */
export const canWrite = (user: UserAccess | null | undefined, path: string): boolean => {
  if (!user) return false;
  if (PUBLIC_ROUTES.includes(path)) return false;

  if (ROLES_FULL_ACCESS.includes(user.role)) return true;

  const moduleKey = getModuleForRoute(path);
  if (!moduleKey) return false;

  return hasModuleAccess(user, moduleKey, "WRITE");
};

export const getModuleForRoute = (path: string): ModuleKey | null => {
  const base = path.split("?")[0].split("#")[0];
  return ROUTE_TO_MODULE[base] ?? null;
};

export const getDefaultRouteForRole = (role: Role) => {
  if (role === "super_admin") return "/super-admin/dashboard";
  const perms = getDefaultPermissionsForRole(role);
  const first = perms[0];
  const moduleToRoute: Partial<Record<ModuleKey, string>> = Object.fromEntries(
    Object.entries(ROUTE_TO_MODULE).map(([route, mod]) => [mod, route]),
  );
  return (first ? moduleToRoute[first.module] : undefined) ?? "/";
};

/** Rota inicial após login — super admin vai direto ao Painel da Plataforma. */
export const getDefaultRouteForUser = (user: UserAccess | null | undefined): string => {
  if (!user) return "/login";
  if (usuarioEhSuperAdmin(user)) return "/super-admin/dashboard";
  return getDefaultRouteForRole(user.role);
};

// --- Compatibilidade com aprovação ---

/** Módulos padrão por role (para UI de edição de membros e aprovação) */
export const ROLE_DEFAULT_MODULES: Record<Role, ModuleKey[]> = {
  super_admin: [],
  admin: [...MODULES],
  admin_igreja: [...MODULES],
  pastor: [...MODULES],
  copastor: [...MODULES],
  secretaria: [...MODULES],
  tesouraria: ["dashboard", "biblia", "devocionais", "louvores", "avisos", "financeiro", "oracao", "configuracoes"],
  lider: [...MODULES],
  membro: MEMBRO_READ_MODULES_FINAL,
  visitante: ["biblia", "oracao", "configuracoes"],
};

/** Módulos permitidos por role (para UI de aprovação - limite superior) */
export const ROLE_ALLOWED_MODULES: Record<Role, ModuleKey[]> = {
  super_admin: [],
  admin: [...MODULES],
  admin_igreja: [...MODULES],
  pastor: [...MODULES],
  copastor: [...MODULES],
  secretaria: [...MODULES],
  tesouraria: ["dashboard", "biblia", "devocionais", "louvores", "avisos", "financeiro", "oracao", "configuracoes"],
  lider: [...MODULES],
  membro: MEMBRO_READ_MODULES_FINAL,
  visitante: ["biblia", "oracao", "configuracoes"],
};

/** Permissões padrão para MEMBRO (READ) - usado na aprovação */
export const MEMBRO_DEFAULT_PERMISSIONS: ModulePermission[] = MEMBRO_READ_MODULES_FINAL.map((m) => ({
  module: m,
  access: "READ" as AccessLevel,
}));

/** Permissões padrão para perfis com acesso total (WRITE) - usado na aprovação */
export const FULL_ACCESS_PERMISSIONS: ModulePermission[] = MODULES.map((m) => ({
  module: m,
  access: "WRITE" as AccessLevel,
}));

/** Converte ModulePermission[] para formato de modules (string[]) para API */
export const permissionsToModules = (perms: ModulePermission[]): string[] =>
  perms.map((p) => `${p.module}:${p.access}`);

/** Extrai apenas os nomes dos módulos de uma lista (suporta "module" ou "module:ACCESS") */
export const modulesToKeys = (raw: string[]): ModuleKey[] =>
  raw
    .map((s) => {
      const idx = s.indexOf(":");
      const key = idx >= 0 ? s.slice(0, idx).trim() : s.trim();
      return MODULES.includes(key as ModuleKey) ? (key as ModuleKey) : null;
    })
    .filter((k): k is ModuleKey => k != null);
