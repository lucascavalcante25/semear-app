import { obterToken, URL_BASE_API } from "@/modules/api/client";
import type { NotificacaoItem } from "@/modules/notifications/api";

export type NotificacaoResumo = {
  notificacoes: NotificacaoItem[];
  preCadastrosPendentes: number;
  pedidosOracaoPendentes: number;
};

export type NotificacaoContagem = {
  totalNotificacoes: number;
  preCadastrosPendentes: number;
  pedidosOracaoPendentes: number;
  fingerprint: string;
};

type RespostaComEtag<T> = {
  status: 200 | 304;
  etag?: string;
  dados?: T;
};

async function requisicaoComEtag<T>(path: string, etag?: string): Promise<RespostaComEtag<T>> {
  if (!URL_BASE_API) {
    throw new Error("API não configurada.");
  }

  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  const token = obterToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (etag) {
    headers.set("If-None-Match", etag);
  }

  const response = await fetch(`${URL_BASE_API}${path}`, { headers });

  if (response.status === 304) {
    const novoEtag = response.headers.get("ETag")?.replace(/"/g, "") ?? etag;
    return { status: 304, etag: novoEtag };
  }

  if (!response.ok) {
    throw new Error("Falha ao carregar notificações.");
  }

  const novoEtag = response.headers.get("ETag")?.replace(/"/g, "");
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const dados = (await response.json()) as T;
    return { status: 200, etag: novoEtag, dados };
  }

  return { status: 200, etag: novoEtag };
}

export const obterContagemNotificacoes = async (
  etag?: string,
): Promise<RespostaComEtag<NotificacaoContagem>> => {
  return requisicaoComEtag<NotificacaoContagem>("/api/notificacoes/contagem", etag);
};

export const obterResumoNotificacoes = async (
  etag?: string,
): Promise<RespostaComEtag<NotificacaoResumo>> => {
  const resposta = await requisicaoComEtag<NotificacaoResumo>("/api/notificacoes/resumo", etag);
  if (resposta.status === 200 && resposta.dados) {
    resposta.dados = {
      notificacoes: resposta.dados.notificacoes ?? [],
      preCadastrosPendentes: resposta.dados.preCadastrosPendentes ?? 0,
      pedidosOracaoPendentes: resposta.dados.pedidosOracaoPendentes ?? 0,
    };
  }
  return resposta;
};
