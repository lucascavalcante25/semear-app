import { requisicaoApi } from "@/modules/api/client";
import type { ConfigNotificacao } from "@/modules/notificacoes/config-types";

export type PublicoEvento = "INTERNO" | "PUBLICO";

export type CategoriaEvento =
  | "CULTO"
  | "EBD"
  | "JOVENS"
  | "CASAIS"
  | "MULHERES"
  | "HOMENS"
  | "LOUVOR"
  | "TREINAMENTO"
  | "OUTRO";

export type StatusEvento = "RASCUNHO" | "PUBLICADO" | "CANCELADO" | "ENCERRADO";

export type StatusInscricaoEvento = "ATIVA" | "CANCELADA";

export type EventoInscricaoDTO = {
  id?: number;
  eventoId?: number;
  userId?: number;
  userNome?: string;
  userEmail?: string;
  userTelefone?: string;
  confirmado?: boolean;
  status?: StatusInscricaoEvento;
  criadoEm?: string;
  canceladoEm?: string;
};

export type EventoDTO = {
  id?: number;
  titulo: string;
  descricao?: string | null;
  dataInicio?: string;
  dataFim?: string | null;
  local?: string | null;
  publico?: PublicoEvento;
  inscricoesAbertas?: boolean;
  capacidade?: number | null;
  categoria?: CategoriaEvento;
  status?: StatusEvento;
  imagemUrl?: string | null;
  linkExterno?: string | null;
  prazoCancelamentoInscricao?: string | null;
  inscricoes?: EventoInscricaoDTO[];
  inscrito?: boolean;
  situacaoInscricao?: string | null;
  lotado?: boolean;
  inscricoesEncerradas?: boolean;
  vagasDisponiveis?: number | null;
  totalInscritos?: number;
  criadoEm?: string;
  configNotificacao?: ConfigNotificacao;
};

export type EventoFiltro = {
  busca?: string;
  categoria?: CategoriaEvento | "";
  publico?: PublicoEvento | "";
  inscricoesAbertas?: boolean | "";
  status?: StatusEvento | "";
  periodo?: "PROXIMOS" | "PASSADOS" | "TODOS";
};

export const LABEL_PUBLICO_EVENTO: Record<PublicoEvento, string> = {
  INTERNO: "Interno (igreja)",
  PUBLICO: "Público",
};

export const LABEL_CATEGORIA_EVENTO: Record<CategoriaEvento, string> = {
  CULTO: "Culto",
  EBD: "EBD",
  JOVENS: "Jovens",
  CASAIS: "Casais",
  MULHERES: "Mulheres",
  HOMENS: "Homens",
  LOUVOR: "Louvor",
  TREINAMENTO: "Treinamento",
  OUTRO: "Outro",
};

export const LABEL_STATUS_EVENTO: Record<StatusEvento, string> = {
  RASCUNHO: "Rascunho",
  PUBLICADO: "Publicado",
  CANCELADO: "Cancelado",
  ENCERRADO: "Encerrado",
};

const montarQueryFiltro = (filtro?: EventoFiltro) => {
  const p = new URLSearchParams();
  if (filtro?.busca) p.set("busca", filtro.busca);
  if (filtro?.categoria) p.set("categoria", filtro.categoria);
  if (filtro?.publico) p.set("publico", filtro.publico);
  if (filtro?.inscricoesAbertas !== undefined && filtro.inscricoesAbertas !== "") {
    p.set("inscricoesAbertas", String(filtro.inscricoesAbertas));
  }
  if (filtro?.status) p.set("status", filtro.status);
  if (filtro?.periodo) p.set("periodo", filtro.periodo);
  return p.toString();
};

export const combinarDataHora = (data?: string, hora = "09:00") => {
  if (!data) return undefined;
  const [y, m, d] = data.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
};

export const extrairData = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

export const extrairHora = (iso?: string | null) => {
  if (!iso) return "09:00";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "09:00";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const prepararPayload = (body: EventoDTO & { horaInicio?: string; horaFim?: string }): EventoDTO => ({
  ...body,
  dataInicio: combinarDataHora(body.dataInicio, body.horaInicio ?? extrairHora(body.dataInicio)),
  dataFim: body.dataFim ? combinarDataHora(body.dataFim, body.horaFim ?? extrairHora(body.dataFim)) : null,
  prazoCancelamentoInscricao: body.prazoCancelamentoInscricao
    ? combinarDataHora(
        extrairData(body.prazoCancelamentoInscricao),
        extrairHora(body.prazoCancelamentoInscricao),
      )
    : null,
});

export const formatarDataEvento = (data?: string | null) => {
  if (!data) return "";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
};

export const formatarDataHoraEvento = (data?: string | null) => {
  if (!data) return "";
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const enriquecerEvento = (evento: EventoDTO, userId?: number): EventoDTO => {
  const inscricoes = (evento.inscricoes ?? []).filter((i) => i.status !== "CANCELADA");
  const inscritoAtivo = userId != null ? inscricoes.some((i) => i.userId === userId && i.status === "ATIVA") : false;
  return {
    ...evento,
    totalInscritos: evento.totalInscritos ?? inscricoes.filter((i) => i.status === "ATIVA").length,
    inscrito: evento.inscrito ?? inscritoAtivo,
  };
};

export const listarEventos = async (filtro?: EventoFiltro, userId?: number) => {
  const query = montarQueryFiltro(filtro);
  const lista = await requisicaoApi<EventoDTO[]>(`/api/eventos${query ? `?${query}` : ""}`, { auth: true });
  return (lista ?? []).map((e) => enriquecerEvento(e, userId));
};

export const listarEventosProximos = (userId?: number) =>
  requisicaoApi<EventoDTO[]>("/api/eventos/proximos", { auth: true }).then((lista) =>
    (lista ?? []).map((e) => enriquecerEvento(e, userId)),
  );

export const listarEventosPassados = (userId?: number) =>
  requisicaoApi<EventoDTO[]>("/api/eventos/passados", { auth: true }).then((lista) =>
    (lista ?? []).map((e) => enriquecerEvento(e, userId)),
  );

export const listarMinhasInscricoes = (userId?: number) =>
  requisicaoApi<EventoDTO[]>("/api/eventos/minhas-inscricoes", { auth: true }).then((lista) =>
    (lista ?? []).map((e) => enriquecerEvento(e, userId)),
  );

export const obterEvento = async (id: number, userId?: number) => {
  const evento = await requisicaoApi<EventoDTO>(`/api/eventos/${id}`, { auth: true });
  return enriquecerEvento(evento, userId);
};

export const listarInscritosEvento = (eventoId: number, filtro?: string, busca?: string) => {
  const p = new URLSearchParams();
  if (filtro) p.set("filtro", filtro);
  if (busca) p.set("busca", busca);
  const query = p.toString();
  return requisicaoApi<EventoInscricaoDTO[]>(
    `/api/eventos/${eventoId}/inscricoes${query ? `?${query}` : ""}`,
    { auth: true },
  );
};

export const criarEvento = (body: EventoDTO & { horaInicio?: string; horaFim?: string }) =>
  requisicaoApi<EventoDTO>("/api/eventos", {
    method: "POST",
    auth: true,
    body: JSON.stringify(prepararPayload(body)),
  });

export const atualizarEvento = (id: number, body: EventoDTO & { horaInicio?: string; horaFim?: string }) =>
  requisicaoApi<EventoDTO>(`/api/eventos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(prepararPayload(body)),
  });

export const excluirEvento = (id: number) =>
  requisicaoApi<void>(`/api/eventos/${id}`, { method: "DELETE", auth: true });

export async function uploadBannerEvento(eventoId: number, arquivo: File): Promise<EventoDTO> {
  const form = new FormData();
  form.append("file", arquivo);
  return requisicaoApi<EventoDTO>(`/api/eventos/${eventoId}/banner`, {
    method: "POST",
    auth: true,
    body: form,
  });
}

export const removerBannerEvento = (eventoId: number) =>
  requisicaoApi<EventoDTO>(`/api/eventos/${eventoId}/banner`, { method: "DELETE", auth: true });

export const inscreverEvento = (id: number) =>
  requisicaoApi<EventoInscricaoDTO>(`/api/eventos/${id}/inscrever`, { method: "POST", auth: true });

export const cancelarInscricaoEvento = (id: number) =>
  requisicaoApi<void>(`/api/eventos/${id}/inscrever`, { method: "DELETE", auth: true });

export const confirmarCheckInInscricao = (eventoId: number, inscricaoId: number) =>
  requisicaoApi<EventoInscricaoDTO>(`/api/eventos/${eventoId}/inscricoes/${inscricaoId}/check-in`, {
    method: "PATCH",
    auth: true,
  });

export const confirmarCheckInLote = (eventoId: number, ids: number[]) =>
  requisicaoApi<EventoInscricaoDTO[]>(`/api/eventos/${eventoId}/inscricoes/check-in-lote`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ ids }),
  });
