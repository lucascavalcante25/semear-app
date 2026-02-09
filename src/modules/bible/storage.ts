const PREFIXO_STORAGE = "semear.biblia";

const isNavegador = () => typeof window !== "undefined";

export const obterChaveUsuario = (userId: string, suffix: string) =>
  `${PREFIXO_STORAGE}.${userId}.${suffix}`;

export const lerArmazenamento = <T>(key: string, fallback: T): T => {
  if (!isNavegador()) {
    return fallback;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const salvarArmazenamento = <T>(key: string, value: T) => {
  if (!isNavegador()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const removerArmazenamento = (key: string) => {
  if (!isNavegador()) {
    return;
  }
  window.localStorage.removeItem(key);
};

export const criarId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
};
