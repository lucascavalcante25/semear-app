import { requisicaoApi } from "@/modules/api/client";

export type TipoAvisoApi = "NORMAL" | "URGENTE" | "FIXO";

export type AvisoDTO = {
  id?: number;
  titulo: string;
  conteudo: string;
  tipo: TipoAvisoApi;
  dataInicio: string; // yyyy-mm-dd
  dataFim?: string | null;
  ativo: boolean;
  criadoEm?: string;
  criadoPor?: string;
  atualizadoEm?: string | null;
  atualizadoPor?: string | null;
};

export type AvisoApp = {
  id: string;
  idNum?: number;
  title: string;
  content: string;
  type: "normal" | "urgent" | "fixed";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

const mapTipo = (tipo: TipoAvisoApi): AvisoApp["type"] => {
  if (tipo === "FIXO") return "fixed";
  if (tipo === "URGENTE") return "urgent";
  return "normal";
};

const mapTipoToApi = (tipo: AvisoApp["type"]): TipoAvisoApi => {
  if (tipo === "fixed") return "FIXO";
  if (tipo === "urgent") return "URGENTE";
  return "NORMAL";
};

export const mapearAviso = (dto: AvisoDTO): AvisoApp => ({
  id: String(dto.id ?? dto.titulo),
  idNum: dto.id,
  title: dto.titulo,
  content: dto.conteudo,
  type: mapTipo(dto.tipo),
  startDate: toDateLocal(dto.dataInicio),
  endDate: dto.dataFim ? toDateLocal(dto.dataFim) : undefined,
  isActive: dto.ativo,
  createdAt: dto.criadoEm ? new Date(dto.criadoEm) : new Date(),
  createdBy: dto.criadoPor ?? "Sistema",
});

export const listarAvisos = async (ativos = true, limit = 200): Promise<AvisoApp[]> => {
  const params = new URLSearchParams();
  params.set("page", "0");
  params.set("size", String(limit));
  params.set("sort", "dataInicio,desc");
  params.set("ativos", ativos ? "true" : "false");
  const lista = await requisicaoApi<AvisoDTO[]>(`/api/avisos?${params.toString()}`, { auth: true });
  return (lista ?? []).map(mapearAviso);
};

export const criarAviso = async (aviso: Omit<AvisoApp, "id" | "idNum" | "createdAt" | "createdBy">) => {
  const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10);
  const body: Partial<AvisoDTO> = {
    titulo: aviso.title.trim(),
    conteudo: aviso.content.trim(),
    tipo: mapTipoToApi(aviso.type),
    dataInicio: yyyyMmDd(aviso.startDate),
    dataFim: aviso.endDate ? yyyyMmDd(aviso.endDate) : null,
    ativo: aviso.isActive,
  };
  const created = await requisicaoApi<AvisoDTO>("/api/avisos", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearAviso(created);
};

export const atualizarAviso = async (dto: AvisoDTO) => {
  if (!dto.id) throw new Error("ID do aviso é obrigatório.");
  const updated = await requisicaoApi<AvisoDTO>(`/api/avisos/${dto.id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
    auth: true,
  });
  return mapearAviso(updated);
};

export const excluirAviso = async (id: number) => {
  await requisicaoApi(`/api/avisos/${id}`, { method: "DELETE", auth: true });
};

export const tipoUiParaApi = mapTipoToApi;

