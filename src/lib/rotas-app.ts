const ROTAS_PUBLICAS = [
  "/landing",
  "/precos",
  "/login",
  "/esqueci-senha",
  "/pre-cadastro",
  "/solicitar-acesso",
];

export function isRotaPublica(pathname: string): boolean {
  const base = pathname.split("?")[0];
  return ROTAS_PUBLICAS.some((r) => base === r || base.startsWith(`${r}/`));
}

export function isRotaSuperAdmin(pathname: string): boolean {
  return pathname.startsWith("/super-admin");
}

export function isRotaIgreja(pathname: string): boolean {
  return !isRotaPublica(pathname) && !isRotaSuperAdmin(pathname);
}
