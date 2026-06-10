import { ErroRequisicaoApi, requisicaoApi, URL_BASE_API, obterToken } from "@/modules/api/client";

export type TipoSolicitacaoSuporte =
  | "DUVIDA"
  | "SUGESTAO"
  | "RECLAMACAO"
  | "MELHORIA"
  | "ERRO"
  | "OUTRO";

export type StatusSolicitacaoSuporte =
  | "ABERTA"
  | "EM_ANALISE"
  | "RESPONDIDA"
  | "RESOLVIDA"
  | "FINALIZADA"
  | "CANCELADA";

export type PrioridadeSolicitacaoSuporte = "BAIXA" | "MEDIA" | "ALTA" | "URGENTE";

export type SolicitacaoSuporteAnexo = {
  id: number;
  nomeArquivo: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  dataUpload?: string;
};

export type SolicitacaoSuporteHistorico = {
  id: number;
  acao: "CRIADA" | "STATUS_ALTERADO" | "RESPONDIDA" | "ANEXO_ADICIONADO";
  statusAnterior?: StatusSolicitacaoSuporte;
  statusNovo?: StatusSolicitacaoSuporte;
  mensagem?: string;
  dataAcao?: string;
  usuarioNome?: string;
  visivelParaCliente?: boolean;
};

export type TipoMensagemSuporte = "MENSAGEM_CLIENTE" | "MENSAGEM_SUPORTE" | "SISTEMA";

export type SolicitacaoSuporteMensagem = {
  id: number;
  tipo: TipoMensagemSuporte;
  texto: string;
  dataEnvio?: string;
  usuarioNome?: string;
  usuarioId?: number;
};

export type SolicitacaoSuporte = {
  id: number;
  igrejaId?: number;
  igrejaNome?: string;
  nomeSolicitante: string;
  emailSolicitante: string;
  telefoneSolicitante?: string;
  tipo: TipoSolicitacaoSuporte;
  prioridade: PrioridadeSolicitacaoSuporte;
  titulo: string;
  descricao: string;
  status: StatusSolicitacaoSuporte;
  respostaAdmin?: string;
  respondidoPorNome?: string;
  dataResposta?: string;
  dataFinalizacao?: string;
  createdDate?: string;
  temAnexo?: boolean;
  quantidadeAnexos?: number;
  anexos?: SolicitacaoSuporteAnexo[];
  historico?: SolicitacaoSuporteHistorico[];
  mensagens?: SolicitacaoSuporteMensagem[];
  lidaPeloSuporte?: boolean;
};

export type CriarSolicitacaoPayload = {
  tipo: TipoSolicitacaoSuporte;
  titulo: string;
  descricao: string;
  emailSolicitante?: string;
  telefoneSolicitante?: string;
};

export type FiltrosSolicitacao = {
  status?: StatusSolicitacaoSuporte;
  tipo?: TipoSolicitacaoSuporte;
  busca?: string;
  dataInicio?: string;
  dataFim?: string;
};

function montarQuery(filtros: FiltrosSolicitacao): string {
  const params = new URLSearchParams();
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.tipo) params.set("tipo", filtros.tipo);
  if (filtros.busca?.trim()) params.set("busca", filtros.busca.trim());
  if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
  if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export async function listarMinhasSolicitacoes(filtros: FiltrosSolicitacao = {}) {
  return requisicaoApi<SolicitacaoSuporte[]>(`/api/suporte/solicitacoes${montarQuery(filtros)}`, { auth: true });
}

export async function obterMinhaSolicitacao(id: number) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/suporte/solicitacoes/${id}`, { auth: true });
}

export async function criarSolicitacao(dados: CriarSolicitacaoPayload) {
  return requisicaoApi<SolicitacaoSuporte>("/api/suporte/solicitacoes", {
    auth: true,
    method: "POST",
    body: dados,
  });
}

export const MAX_ANEXOS_SUPORTE = 5;

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function criarSolicitacaoComAnexo(dados: CriarSolicitacaoPayload, anexos?: File[]) {
  const form = new FormData();
  form.append("solicitacao", new Blob([JSON.stringify(dados)], { type: "application/json" }));
  (anexos ?? []).forEach((arquivo) => form.append("anexos", arquivo));
  return requisicaoApi<SolicitacaoSuporte>("/api/suporte/solicitacoes/com-anexo", {
    auth: true,
    method: "POST",
    body: form,
  });
}

export async function enviarMensagemCliente(id: number, texto: string) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/suporte/solicitacoes/${id}/mensagens`, {
    auth: true,
    method: "POST",
    body: { texto },
  });
}

export async function cancelarSolicitacao(id: number, motivo?: string) {
  return requisicaoApi<SolicitacaoSuporte>(`/api/suporte/solicitacoes/${id}/cancelar`, {
    auth: true,
    method: "PATCH",
    body: motivo ? { texto: motivo } : {},
  });
}

export async function marcarSolicitacaoLida(id: number) {
  return requisicaoApi<void>(`/api/suporte/solicitacoes/${id}/marcar-lida`, {
    auth: true,
    method: "PATCH",
  });
}

export function urlDownloadAnexo(solicitacaoId: number, anexoId: number): string {
  return `${URL_BASE_API}/api/suporte/solicitacoes/${solicitacaoId}/anexos/${anexoId}`;
}

export async function baixarAnexo(solicitacaoId: number, anexoId: number): Promise<Blob> {
  const token = obterToken();
  const res = await fetch(urlDownloadAnexo(solicitacaoId, anexoId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new ErroRequisicaoApi("Não foi possível baixar o anexo.", res.status);
  }
  return res.blob();
}

export function urlDownloadAnexosZip(solicitacaoId: number): string {
  return `${URL_BASE_API}/api/suporte/solicitacoes/${solicitacaoId}/anexos/zip`;
}

export async function baixarTodosAnexos(solicitacaoId: number): Promise<Blob> {
  const token = obterToken();
  const res = await fetch(urlDownloadAnexosZip(solicitacaoId), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new ErroRequisicaoApi("Não foi possível baixar os anexos.", res.status);
  }
  return res.blob();
}

export const LABEL_TIPO: Record<TipoSolicitacaoSuporte, string> = {
  DUVIDA: "Dúvida",
  SUGESTAO: "Sugestão",
  RECLAMACAO: "Reclamação",
  MELHORIA: "Melhoria",
  ERRO: "Erro",
  OUTRO: "Outro",
};

export const LABEL_STATUS: Record<StatusSolicitacaoSuporte, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em análise",
  RESPONDIDA: "Respondida",
  RESOLVIDA: "Resolvida",
  FINALIZADA: "Finalizada",
  CANCELADA: "Cancelada",
};
