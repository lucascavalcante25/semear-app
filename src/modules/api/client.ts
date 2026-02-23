const urlBaseBruta = import.meta.env.VITE_API_URL as string | undefined;

function normalizarUrlBaseApi(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.replace(/\/$/, "");

  // Quando o app é acessado via IP na rede (ex.: celular), "localhost" aponta pro dispositivo,
  // não para a máquina do backend. Então, se a base estiver em localhost/127.0.0.1, trocamos
  // pelo hostname atual do navegador.
  if (typeof window !== "undefined") {
    try {
      const url = new URL(trimmed);
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        url.hostname = window.location.hostname;
        return url.toString().replace(/\/$/, "");
      }
    } catch {
      // ignore
    }
  }

  return trimmed;
}

export const URL_BASE_API = normalizarUrlBaseApi(urlBaseBruta);
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

  if (options.body instanceof FormData) {
    headers.delete("Content-Type");
  } else {
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
      const errorBody = (await response.json()) as {
        message?: string;
        title?: string;
        detail?: string;
        fieldErrors?: Array<{ field: string; message: string }>;
      };
      const fieldErrs = errorBody?.fieldErrors;
      if (Array.isArray(fieldErrs) && fieldErrs.length > 0) {
        message = fieldErrs.map((e) => `${e.field}: ${e.message}`).join("; ");
      } else if (typeof errorBody?.title === "string" && errorBody.title.trim()) {
        message = errorBody.title;
      } else if (typeof errorBody?.message === "string") {
        message = errorBody.message;
        if (message.startsWith("error.")) {
          if (typeof errorBody?.detail === "string" && errorBody.detail.trim()) {
            message = errorBody.detail;
          } else {
            const msgMap: Record<string, string> = {
              "error.userexists": "Você já possui acesso. Faça login.",
              "error.alreadyexists": "Já existe uma solicitação em análise para estes dados.",
              "error.alreadyapproved": "Solicitação já aprovada. Faça login.",
            };
            message = msgMap[message] ?? message;
          }
        }
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
