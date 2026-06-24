import { requisicaoApi } from "@/modules/api/client";

export type CategoriaPedidoOracaoApi =
  | "SAUDE"
  | "FAMILIA"
  | "TRABALHO"
  | "ESPIRITUAL"
  | "RELACIONAMENTO"
  | "GRATIDAO"
  | "OUTRO";

export type VisibilidadePedidoOracaoApi = "PRIVADA" | "PUBLICA";

export type StatusPedidoOracaoApi =
  | "AGUARDANDO_APROVACAO"
  | "ABERTO"
  | "EM_INTERCESSAO"
  | "RESPONDIDO"
  | "ENCERRADO"
  | "REJEITADO";

export type PedidoOracaoDTO = {
  id: number;
  igrejaId?: number;
  usuarioId?: number;
  usuarioNome?: string;
  titulo: string;
  descricao: string;
  categoria?: CategoriaPedidoOracaoApi;
  visibilidade: VisibilidadePedidoOracaoApi;
  status: StatusPedidoOracaoApi;
  anonimo?: boolean;
  requerAprovacao?: boolean;
  aprovado?: boolean;
  aprovadoPorNome?: string;
  aprovadoEm?: string;
  respostaTexto?: string;
  respondidoEm?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  totalIntercessoes?: number;
  oreiPorMim?: boolean;
};

export type PedidoOracaoCriarDTO = {
  titulo: string;
  descricao: string;
  categoria?: CategoriaPedidoOracaoApi;
  visibilidade: VisibilidadePedidoOracaoApi;
  anonimo?: boolean;
};

export const LABEL_CATEGORIA: Record<CategoriaPedidoOracaoApi, string> = {
  SAUDE: "Saúde",
  FAMILIA: "Família",
  TRABALHO: "Trabalho",
  ESPIRITUAL: "Espiritual",
  RELACIONAMENTO: "Relacionamento",
  GRATIDAO: "Gratidão",
  OUTRO: "Outro",
};

export const LABEL_STATUS: Record<StatusPedidoOracaoApi, string> = {
  AGUARDANDO_APROVACAO: "Aguardando aprovação",
  ABERTO: "Em oração",
  EM_INTERCESSAO: "Em intercessão",
  RESPONDIDO: "Respondido",
  ENCERRADO: "Encerrado",
  REJEITADO: "Rejeitado",
};

export const LABEL_VISIBILIDADE: Record<VisibilidadePedidoOracaoApi, string> = {
  PUBLICA: "Público para a igreja",
  PRIVADA: "Apenas liderança",
};

export type PedidosOracaoPaginados = {
  content: PedidoOracaoDTO[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};

export type FiltrosPedidoOracao = {
  categoria?: CategoriaPedidoOracaoApi;
  status?: StatusPedidoOracaoApi;
  page?: number;
  size?: number;
};

const montarQueryFiltros = (filtros?: FiltrosPedidoOracao) => {
  const p = new URLSearchParams();
  if (filtros?.categoria) p.set("categoria", filtros.categoria);
  if (filtros?.status) p.set("status", filtros.status);
  if (filtros?.page != null) p.set("page", String(filtros.page));
  if (filtros?.size != null) p.set("size", String(filtros.size));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
};

const normalizarLista = (
  resposta: PedidoOracaoDTO[] | PedidosOracaoPaginados,
): PedidoOracaoDTO[] => {
  if (Array.isArray(resposta)) return resposta;
  return resposta.content ?? [];
};

export const listarMuralOracao = async (filtros?: FiltrosPedidoOracao) => {
  const resposta = await requisicaoApi<PedidoOracaoDTO[] | PedidosOracaoPaginados>(
    `/api/pedidos-oracao${montarQueryFiltros(filtros)}`,
    { auth: true },
  );
  return normalizarLista(resposta ?? []);
};

export const listarMeusPedidosOracao = async (filtros?: FiltrosPedidoOracao) => {
  const resposta = await requisicaoApi<PedidoOracaoDTO[] | PedidosOracaoPaginados>(
    `/api/pedidos-oracao/meus${montarQueryFiltros(filtros)}`,
    { auth: true },
  );
  return normalizarLista(resposta ?? []);
};

export const listarLiderancaOracao = async (filtros?: FiltrosPedidoOracao) => {
  const resposta = await requisicaoApi<PedidoOracaoDTO[] | PedidosOracaoPaginados>(
    `/api/pedidos-oracao/lideranca${montarQueryFiltros(filtros)}`,
    { auth: true },
  );
  return normalizarLista(resposta ?? []);
};

export const criarPedidoOracao = (body: PedidoOracaoCriarDTO) =>
  requisicaoApi<PedidoOracaoDTO>("/api/pedidos-oracao", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });

export const aprovarPedidoOracao = (id: number) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/aprovar`, {
    method: "PATCH",
    auth: true,
  });

export const rejeitarPedidoOracao = (id: number) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/rejeitar`, {
    method: "PATCH",
    auth: true,
  });

export const responderPedidoOracao = (id: number, respostaTexto: string) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/responder`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ respostaTexto }),
  });

export const encerrarPedidoOracao = (id: number) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/encerrar`, {
    method: "PATCH",
    auth: true,
  });

export const excluirPedidoOracao = (id: number) =>
  requisicaoApi<void>(`/api/pedidos-oracao/${id}`, { method: "DELETE", auth: true });

export const registrarIntercessao = (id: number) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/orei`, {
    method: "POST",
    auth: true,
  });

export const removerIntercessao = (id: number) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/orei`, {
    method: "DELETE",
    auth: true,
  });

export const denunciarPedidoOracao = (id: number) =>
  requisicaoApi<PedidoOracaoDTO>(`/api/pedidos-oracao/${id}/denunciar`, {
    method: "POST",
    auth: true,
  });
