import { ErroRequisicaoApi, requisicaoApi, URL_BASE_API, obterToken } from "@/modules/api/client";
import type {
  FiltrosSolicitacao,
  PrioridadeSolicitacaoSuporte,
  SolicitacaoSuporte,
  StatusSolicitacaoSuporte,
  TipoSolicitacaoSuporte,
} from "@/modules/suporte/api";

export type FiltrosAdminSuporte = FiltrosSolicitacao & {
  igrejaId?: number;
  prioridade?: PrioridadeSolicitacaoSuporte;
};

export type SuporteResumo = {
  abertas: number;
  emAnalise: number;
  respondidas: number;
  resolvidas: number;
  finalizadas: number;
  canceladas: number;
  aguardandoRespostaSuporte?: number;
  ultimas: {
    id: number;
    igrejaNome?: string;
    tipo?: string;
    titulo?: string;
    status?: string;
    createdDate?: string;
  }[];
};

function montarQuery(filtros: FiltrosAdminSuporte): string {
  const params = new URLSearchParams();
  if (filtros.igrejaId) params.set("igrejaId", String(filtros.igrejaId));
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.prioridade) params.set("prioridade", filtros.prioridade);
  if (filtros.busca?.trim()) params.set("busca", filtros.busca.trim());
  const q = params.toString();
  return q ? `?${q}` : "";
}

export async function obterResumoSuporte() {
  return requisicaoApi<SuporteResumo>("/api/admin/suporte/resumo", { auth: true });
}

export async function listarSolicitacoesAdmin(filtros: FiltrosAdminSuporte = {}) {
  return requisicaoApi<SolicitacaoSuporte[]>(`/api/admin/suporte/solicitacoes${montarQuery(filtros)}`, { auth: true });
}

export async function obterSolicitacaoAdmin(id: number) {
  return requisicaoApi<SolicitacaoSuporte & { observacaoInternaAdmin?: string }>(
    `/api/admin/suporte/solicitacoes/${id}`,
    { auth: true },
  );
}

export async function atualizarStatusSolicitacao(
  id: number,
  body: {
    status?: StatusSolicitacaoSuporte;
    prioridade?: PrioridadeSolicitacaoSuporte;
    observacaoInternaAdmin?: string;
  },
) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/admin/suporte/solicitacoes/${id}/status`, {
    auth: true,
    method: "PATCH",
    body,
  });
}

export async function enviarMensagemSuporte(id: number, texto: string) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/admin/suporte/solicitacoes/${id}/mensagens`, {
    auth: true,
    method: "POST",
    body: { texto },
  });
}

export async function resolverSolicitacao(id: number, texto?: string) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/admin/suporte/solicitacoes/${id}/resolver`, {
    auth: true,
    method: "PATCH",
    body: texto ? { texto } : {},
  });
}

export async function finalizarSolicitacao(id: number, texto?: string) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/admin/suporte/solicitacoes/${id}/finalizar`, {
    auth: true,
    method: "PATCH",
    body: texto ? { texto } : {},
  });
}

export async function responderSolicitacao(
  id: number,
  body: {
    respostaAdmin: string;
    status?: StatusSolicitacaoSuporte;
    observacaoInternaAdmin?: string;
  },
) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/admin/suporte/solicitacoes/${id}/responder`, {
    auth: true,
    method: "POST",
    body,
  });
}

export function urlDownloadAnexoAdmin(solicitacaoId: number, anexoId: number): string {
  return `${URL_BASE_API}/api/admin/suporte/solicitacoes/${solicitacaoId}/anexos/${anexoId}`;
}

export async function baixarAnexoAdmin(solicitacaoId: number, anexoId: number): Promise<Blob> {
  const token = obterToken();
  const res = await fetch(urlDownloadAnexoAdmin(solicitacaoId, anexoId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new ErroRequisicaoApi("Não foi possível baixar o anexo.", res.status);
  }
  return res.blob();
}

export function urlDownloadAnexosZipAdmin(solicitacaoId: number): string {
  return `${URL_BASE_API}/api/admin/suporte/solicitacoes/${solicitacaoId}/anexos/zip`;
}

export async function baixarTodosAnexosAdmin(solicitacaoId: number): Promise<Blob> {
  const token = obterToken();
  const res = await fetch(urlDownloadAnexosZipAdmin(solicitacaoId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new ErroRequisicaoApi("Não foi possível baixar os anexos.", res.status);
  }
  return res.blob();
}
