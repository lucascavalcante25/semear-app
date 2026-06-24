import { requisicaoApi } from "@/modules/api/client";

export type EscalaItemDTO = {
  id?: number;
  membroId?: number;
  membroNome?: string;
  userId?: number;
  userNome?: string;
  funcao?: string;
  confirmado?: boolean;
};

export type EscalaDTO = {
  id?: number;
  titulo: string;
  data?: string;
  dataEvento?: string;
  tipo?: string;
  departamentoId?: number | null;
  departamentoNome?: string | null;
  observacoes?: string | null;
  observacao?: string | null;
  status?: string;
  geracaoId?: number | null;
  itens?: EscalaItemDTO[];
  criadoEm?: string;
};

const paramsListagem = () => {
  const p = new URLSearchParams();
  p.set("page", "0");
  p.set("size", "500");
  p.set("sort", "dataEvento,desc");
  return p.toString();
};

const dataParaInstant = (data?: string | null): string | undefined => {
  if (!data) return undefined;
  if (data.includes("T")) return data;
  return `${data}T12:00:00.000Z`;
};

const instantParaData = (instant?: string | null): string | undefined => {
  if (!instant) return undefined;
  return instant.slice(0, 10);
};

const normalizarItem = (item: EscalaItemDTO): EscalaItemDTO => ({
  ...item,
  membroId: item.membroId ?? item.userId,
  membroNome: item.membroNome ?? item.userNome,
});

const normalizarEscala = (raw: EscalaDTO): EscalaDTO => ({
  ...raw,
  data: raw.data ?? instantParaData(raw.dataEvento),
  observacoes: raw.observacoes ?? raw.observacao ?? null,
  itens: (raw.itens ?? []).map(normalizarItem),
});

const prepararPayload = (body: EscalaDTO) => ({
  titulo: body.titulo,
  departamentoId: body.departamentoId,
  dataEvento: dataParaInstant(body.data),
  observacao: body.observacoes ?? body.observacao ?? null,
  itens: (body.itens ?? [])
    .filter((item) => item.userId != null || item.membroId != null)
    .map((item) => ({
      userId: item.userId ?? item.membroId,
      funcao: item.funcao,
      confirmado: item.confirmado,
    })),
});

export const listarEscalas = async () => {
  const lista = await requisicaoApi<EscalaDTO[]>(`/api/escalas?${paramsListagem()}`, { auth: true });
  return (lista ?? []).map(normalizarEscala);
};

export const criarEscala = async (body: EscalaDTO) => {
  const result = await requisicaoApi<EscalaDTO>("/api/escalas", {
    method: "POST",
    auth: true,
    body: JSON.stringify(prepararPayload(body)),
  });
  return normalizarEscala(result);
};

export const atualizarEscala = async (id: number, body: EscalaDTO) => {
  const result = await requisicaoApi<EscalaDTO>(`/api/escalas/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(prepararPayload(body)),
  });
  return normalizarEscala(result);
};

export const excluirEscala = (id: number) =>
  requisicaoApi<void>(`/api/escalas/${id}`, { method: "DELETE", auth: true });

export const confirmarItemEscala = (escalaId: number, itemId: number) =>
  requisicaoApi<EscalaItemDTO>(`/api/escalas/${escalaId}/itens/${itemId}/confirmar`, {
    method: "PATCH",
    auth: true,
  });
