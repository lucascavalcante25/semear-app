import { requisicaoApi } from "@/modules/api/client";

export type PublicoEvento = "INTERNO" | "PUBLICO";

export type EventoInscricaoDTO = {
  id?: number;
  eventoId?: number;
  userId?: number;
  userNome?: string;
  confirmado?: boolean;
  criadoEm?: string;
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
  inscricoes?: EventoInscricaoDTO[];
  inscrito?: boolean;
  totalInscritos?: number;
  criadoEm?: string;
};

export const LABEL_PUBLICO_EVENTO: Record<PublicoEvento, string> = {
  INTERNO: "Interno (igreja)",
  PUBLICO: "Público",
};

const paramsListagem = () => {
  const p = new URLSearchParams();
  p.set("page", "0");
  p.set("size", "500");
  p.set("sort", "dataInicio,desc");
  return p.toString();
};

const dataParaInstant = (data?: string | null): string | undefined => {
  if (!data) return undefined;
  if (data.includes("T")) return data;
  return `${data}T12:00:00.000Z`;
};

const prepararPayload = (body: EventoDTO): EventoDTO => ({
  ...body,
  dataInicio: dataParaInstant(body.dataInicio),
  dataFim: dataParaInstant(body.dataFim),
});

export const enriquecerEvento = (evento: EventoDTO, userId?: number): EventoDTO => {
  const inscricoes = evento.inscricoes ?? [];
  return {
    ...evento,
    totalInscritos: inscricoes.length,
    inscrito: userId != null ? inscricoes.some((i) => i.userId === userId) : false,
  };
};

export const listarEventos = async (userId?: number) => {
  const lista = await requisicaoApi<EventoDTO[]>(`/api/eventos?${paramsListagem()}`, { auth: true });
  return (lista ?? []).map((e) => enriquecerEvento(e, userId));
};

export const obterEvento = async (id: number, userId?: number) => {
  const evento = await requisicaoApi<EventoDTO>(`/api/eventos/${id}`, { auth: true });
  return enriquecerEvento(evento, userId);
};

export const criarEvento = (body: EventoDTO) =>
  requisicaoApi<EventoDTO>("/api/eventos", {
    method: "POST",
    auth: true,
    body: JSON.stringify(prepararPayload(body)),
  });

export const atualizarEvento = (id: number, body: EventoDTO) =>
  requisicaoApi<EventoDTO>(`/api/eventos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(prepararPayload(body)),
  });

export const excluirEvento = (id: number) =>
  requisicaoApi<void>(`/api/eventos/${id}`, { method: "DELETE", auth: true });

export const inscreverEvento = (id: number) =>
  requisicaoApi<EventoInscricaoDTO>(`/api/eventos/${id}/inscrever`, { method: "POST", auth: true });

export const cancelarInscricaoEvento = (id: number) =>
  requisicaoApi<void>(`/api/eventos/${id}/inscrever`, { method: "DELETE", auth: true });

export const confirmarCheckInInscricao = (eventoId: number, inscricaoId: number) =>
  requisicaoApi<EventoInscricaoDTO>(
    `/api/eventos/${eventoId}/inscricoes/${inscricaoId}/check-in`,
    { method: "PATCH", auth: true },
  );
