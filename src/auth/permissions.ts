export type Role =
  | "admin"
  | "pastor"
  | "secretaria"
  | "tesouraria"
  | "lider"
  | "membro"
  | "visitante";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administração",
  pastor: "Pastor",
  secretaria: "Secretaria",
  tesouraria: "Tesouraria",
  lider: "Liderança",
  membro: "Membro",
  visitante: "Visitante",
};

export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/": ["admin", "pastor", "secretaria", "tesouraria", "lider", "membro"],
  "/biblia": ["admin", "pastor", "secretaria", "tesouraria", "lider", "membro", "visitante"],
  "/devocionais": ["admin", "pastor", "lider", "membro"],
  "/louvores": ["admin", "pastor", "lider", "membro"],
  "/membros": ["admin", "pastor", "secretaria", "lider"],
  "/visitantes": ["admin", "pastor", "secretaria", "lider"],
  "/avisos": ["admin", "pastor", "secretaria"],
  "/financeiro": ["admin", "tesouraria"],
  "/mais": ["admin", "pastor", "secretaria", "tesouraria", "lider", "membro", "visitante"],
  "/configuracoes": ["admin"],
  "/acesso-negado": ["admin", "pastor", "secretaria", "tesouraria", "lider", "membro", "visitante"],
};

export const PUBLIC_ROUTES = ["/login"];

export const canAccessRoute = (role: Role | null | undefined, path: string) => {
  if (!role) {
    return false;
  }

  const allowed = ROUTE_PERMISSIONS[path];
  if (!allowed) {
    return true;
  }

  return allowed.includes(role);
};

export const getDefaultRouteForRole = (role: Role) => {
  const entries = Object.entries(ROUTE_PERMISSIONS);
  const match = entries.find(([, roles]) => roles.includes(role));
  return match?.[0] ?? "/";
};
