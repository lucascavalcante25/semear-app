const urlBaseBruta = import.meta.env.VITE_API_URL as string | undefined;

export const URL_BASE_API = urlBaseBruta?.replace(/\/$/, "");
export const API_ATIVA = Boolean(URL_BASE_API);

const CHAVE_TOKEN = "semear.token";

export const obterToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(CHAVE_TOKEN);
};

export const salvarToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CHAVE_TOKEN, token);
};

export const limparToken = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CHAVE_TOKEN);
};

type OpcoesApi = RequestInit & { auth?: boolean };

export const requisicaoApi = async <T>(path: string, options: OpcoesApi = {}): Promise<T> => {
  if (!URL_BASE_API) {
    throw new Error("API nao configurada.");
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = obterToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${URL_BASE_API}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Falha na requisicao.";
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === "string") {
        message = errorBody.message;
      }
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};
