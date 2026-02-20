import { requisicaoApi } from "@/modules/api/client";

export type VisitanteDTO = {
  id?: number;
  nome: string;
  telefone?: string | null;
  dataVisita: string; // yyyy-mm-dd
  comoConheceu?: string | null;
  observacoes?: string | null;
  criadoEm?: string;
  criadoPor?: string | null;
  atualizadoEm?: string | null;
  atualizadoPor?: string | null;
};

export type VisitanteApp = {
  id: string;
  name: string;
  phone?: string;
  visitDate: Date;
  howHeard?: string;
  notes?: string;
  createdAt: Date;
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

export const mapearVisitante = (dto: VisitanteDTO): VisitanteApp => ({
  id: String(dto.id ?? dto.nome),
  name: dto.nome,
  phone: dto.telefone ?? undefined,
  visitDate: toDateLocal(dto.dataVisita),
  howHeard: dto.comoConheceu ?? undefined,
  notes: dto.observacoes ?? undefined,
  createdAt: dto.criadoEm ? new Date(dto.criadoEm) : new Date(),
});

export const listarVisitantes = async (): Promise<VisitanteApp[]> => {
  const params = new URLSearchParams();
  params.set("page", "0");
  params.set("size", "500");
  params.set("sort", "dataVisita,desc");
  const lista = await requisicaoApi<VisitanteDTO[]>(`/api/visitantes?${params.toString()}`, { auth: true });
  return (lista ?? []).map(mapearVisitante);
};

export type CriarVisitantePayload = {
  nome: string;
  dataVisita?: string; // yyyy-mm-dd
  comoConheceu?: string;
  observacoes?: string;
};

export const criarVisitante = async (payload: CriarVisitantePayload): Promise<VisitanteApp> => {
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  const body: Partial<VisitanteDTO> = {
    nome: payload.nome.trim(),
    dataVisita: payload.dataVisita || `${yyyy}-${mm}-${dd}`,
    comoConheceu: payload.comoConheceu?.trim() || undefined,
    observacoes: payload.observacoes?.trim() || undefined,
  };
  const created = await requisicaoApi<VisitanteDTO>("/api/visitantes", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearVisitante(created);
};

export type AtualizarVisitantePayload = VisitanteDTO;

export const atualizarVisitante = async (payload: AtualizarVisitantePayload): Promise<VisitanteApp> => {
  if (!payload.id) {
    throw new Error("ID do visitante é obrigatório.");
  }
  const updated = await requisicaoApi<VisitanteDTO>(`/api/visitantes/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    auth: true,
  });
  return mapearVisitante(updated);
};

export const excluirVisitante = async (id: number): Promise<void> => {
  await requisicaoApi(`/api/visitantes/${id}`, { method: "DELETE", auth: true });
};

