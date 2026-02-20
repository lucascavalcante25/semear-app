export type Role =
  | "admin"
  | "pastor"
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
  "aprovar-pre-cadastros",
  "configuracoes",
] as const;

export type ModuleKey = (typeof MODULES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administração",
  pastor: "Pastor",
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
};

/**
 * Módulos máximos permitidos por perfil (limite superior).
 * O usuário só acessa se o módulo estiver habilitado nele E permitido no papel.
 */
export const ROLE_ALLOWED_MODULES: Record<Role, ModuleKey[]> = {
  admin: [...MODULES],
  pastor: ["dashboard", "biblia", "devocionais", "louvores", "membros", "visitantes", "avisos", "configuracoes"],
  secretaria: [
    "dashboard",
    "biblia",
    "devocionais",
    "louvores",
    "membros",
    "visitantes",
    "avisos",
    "configuracoes",
  ],
  tesouraria: ["dashboard", "biblia", "devocionais", "louvores", "avisos", "financeiro", "configuracoes"],
  lider: ["dashboard", "biblia", "devocionais", "louvores", "membros", "visitantes", "configuracoes"],
  membro: ["dashboard", "biblia", "devocionais", "louvores", "configuracoes"],
  visitante: ["biblia", "configuracoes"],
};

/**
 * Módulos padrão sugeridos ao aprovar um usuário (pode ser ajustado no override do usuário).
 */
export const ROLE_DEFAULT_MODULES: Record<Role, ModuleKey[]> = {
  admin: [...MODULES],
  pastor: [...ROLE_ALLOWED_MODULES.pastor],
  secretaria: [...ROLE_ALLOWED_MODULES.secretaria],
  tesouraria: [...ROLE_ALLOWED_MODULES.tesouraria],
  lider: [...ROLE_ALLOWED_MODULES.lider],
  // Exemplo pedido: membro não tem louvores por padrão, mas pode ser habilitado no override.
  membro: ["dashboard", "biblia", "devocionais"],
  visitante: ["biblia"],
};

export type UserAccess = {
  role: Role;
  modules?: ModuleKey[];
};

const normalizarModules = (modules?: Array<string | null | undefined>): ModuleKey[] => {
  if (!modules) return [];
  const set = new Set<ModuleKey>();
  for (const raw of modules) {
    if (!raw) continue;
    const key = raw as ModuleKey;
    if ((MODULES as readonly string[]).includes(key)) {
      set.add(key);
    }
  }
  return Array.from(set);
};

export const getModuleForRoute = (path: string): ModuleKey | null => {
  const base = path.split("?")[0].split("#")[0];
  return ROUTE_TO_MODULE[base] ?? null;
};

export const canAccess = (user: UserAccess | null | undefined, path: string): boolean => {
  if (!user) return false;
  if (PUBLIC_ROUTES.includes(path)) return true;
  if (path === "/acesso-negado") return true;

  // Admin tem acesso total automático.
  if (user.role === "admin") return true;

  const moduleKey = getModuleForRoute(path);
  if (!moduleKey) {
    // Rotas desconhecidas: mantém comportamento atual (não quebrar rotas custom),
    // mas recomenda-se mapear explicitamente.
    return true;
  }

  const userModules = normalizarModules(user.modules);
  if (userModules.length > 0) {
    return userModules.includes(moduleKey);
  }

  const allowedByRole = ROLE_ALLOWED_MODULES[user.role] ?? [];
  return allowedByRole.includes(moduleKey);

};

export const getDefaultRouteForRole = (role: Role) => {
  const allowed = ROLE_ALLOWED_MODULES[role] ?? [];
  const moduleToRoute: Partial<Record<ModuleKey, string>> = Object.fromEntries(
    Object.entries(ROUTE_TO_MODULE).map(([route, mod]) => [mod, route]),
  );
  const first = allowed[0];
  return (first ? moduleToRoute[first] : undefined) ?? "/";
};
