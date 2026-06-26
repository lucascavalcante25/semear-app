import { requisicaoApi } from "@/modules/api/client";

export type TipoComunicadoApi =
  | "NORMAL"
  | "URGENTE"
  | "FIXO"
  | "CAMPANHA"
  | "BOAS_VINDAS"
  | "SISTEMA";

export type PublicoAlvoComunicadoApi = "TODOS" | "MEMBROS" | "LIDERANCA" | "NOVOS_USUARIOS";
export type PrioridadeComunicadoApi = "BAIXA" | "NORMAL" | "ALTA" | "URGENTE";

export type ComunicadoDTO = {
  id?: number;
  titulo: string;
  conteudo: string;
  tipo?: TipoComunicadoApi;
  publicoAlvo?: PublicoAlvoComunicadoApi;
  prioridade?: PrioridadeComunicadoApi;
  exibirNoLogin?: boolean;
  obrigatorio?: boolean;
  exibirNoSitePublico?: boolean;
  ativo?: boolean;
  dataInicio: string;
  dataFim?: string | null;
  ctaRotulo?: string | null;
  ctaRota?: string | null;
  imagemUrl?: string | null;
  criadoPor?: string;
  criadoEm?: string;
  atualizadoEm?: string | null;
  atualizadoPor?: string | null;
  lido?: boolean;
  totalLeituras?: number;
};

export type ComunicadoLeituraDTO = {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  confirmadoEm: string;
};

export type ComunicadoApp = {
  id: string;
  idNum?: number;
  title: string;
  content: string;
  type: "normal" | "urgent" | "fixed" | "campanha" | "boas_vindas" | "sistema";
  publicoAlvo: PublicoAlvoComunicadoApi;
  prioridade: PrioridadeComunicadoApi;
  exibirNoLogin: boolean;
  obrigatorio: boolean;
  exibirNoSitePublico: boolean;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  ctaRotulo?: string | null;
  ctaRota?: string | null;
};

export const LABEL_PUBLICO: Record<PublicoAlvoComunicadoApi, string> = {
  TODOS: "Todos os usuários",
  MEMBROS: "Membros",
  LIDERANCA: "Liderança",
  NOVOS_USUARIOS: "Novos usuários",
};

export const LABEL_TIPO: Record<TipoComunicadoApi, string> = {
  NORMAL: "Normal",
  URGENTE: "Urgente",
  FIXO: "Fixo",
  CAMPANHA: "Campanha",
  BOAS_VINDAS: "Boas-vindas",
  SISTEMA: "Sistema",
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

const mapTipo = (tipo: TipoComunicadoApi): ComunicadoApp["type"] => {
  if (tipo === "FIXO") return "fixed";
  if (tipo === "URGENTE") return "urgent";
  if (tipo === "CAMPANHA") return "campanha";
  if (tipo === "BOAS_VINDAS") return "boas_vindas";
  if (tipo === "SISTEMA") return "sistema";
  return "normal";
};

export const mapTipoToApi = (tipo: ComunicadoApp["type"]): TipoComunicadoApi => {
  if (tipo === "fixed") return "FIXO";
  if (tipo === "urgent") return "URGENTE";
  if (tipo === "campanha") return "CAMPANHA";
  if (tipo === "boas_vindas") return "BOAS_VINDAS";
  if (tipo === "sistema") return "SISTEMA";
  return "NORMAL";
};

export const mapearComunicado = (dto: ComunicadoDTO): ComunicadoApp => ({
  id: String(dto.id ?? dto.titulo),
  idNum: dto.id,
  title: dto.titulo,
  content: dto.conteudo,
  type: mapTipo(dto.tipo ?? "NORMAL"),
  publicoAlvo: dto.publicoAlvo ?? "TODOS",
  prioridade: dto.prioridade ?? "NORMAL",
  exibirNoLogin: dto.exibirNoLogin ?? false,
  obrigatorio: dto.obrigatorio ?? false,
  exibirNoSitePublico: dto.exibirNoSitePublico ?? true,
  startDate: toDateLocal(dto.dataInicio),
  endDate: dto.dataFim ? toDateLocal(dto.dataFim) : undefined,
  isActive: dto.ativo ?? true,
  createdAt: dto.criadoEm ? new Date(dto.criadoEm) : new Date(),
  createdBy: dto.criadoPor ?? "Sistema",
  ctaRotulo: dto.ctaRotulo,
  ctaRota: dto.ctaRota,
});

export const dtoFromApp = (
  item: Omit<ComunicadoApp, "id" | "idNum" | "createdAt" | "createdBy"> & { idNum?: number },
): ComunicadoDTO => {
  const yyyyMmDd = (d: Date) => d.toISOString().slice(0, 10);
  return {
    id: item.idNum,
    titulo: item.title.trim(),
    conteudo: item.content.trim(),
    tipo: mapTipoToApi(item.type),
    publicoAlvo: item.publicoAlvo,
    prioridade: item.prioridade,
    exibirNoLogin: item.exibirNoLogin,
    obrigatorio: item.obrigatorio,
    exibirNoSitePublico: item.exibirNoSitePublico,
    dataInicio: yyyyMmDd(item.startDate),
    dataFim: item.endDate ? yyyyMmDd(item.endDate) : null,
    ativo: item.isActive,
    ctaRotulo: item.ctaRotulo ?? null,
    ctaRota: item.ctaRota ?? null,
  };
};

export const listarComunicados = async (ativos = true, limit = 200): Promise<ComunicadoApp[]> => {
  const params = new URLSearchParams();
  params.set("page", "0");
  params.set("size", String(limit));
  params.set("sort", "dataInicio,desc");
  params.set("ativos", ativos ? "true" : "false");
  const lista = await requisicaoApi<ComunicadoDTO[]>(`/api/comunicados?${params.toString()}`, { auth: true });
  return (lista ?? []).map(mapearComunicado);
};

export const criarComunicado = async (body: ComunicadoDTO) => {
  const created = await requisicaoApi<ComunicadoDTO>("/api/comunicados", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearComunicado(created);
};

export const atualizarComunicado = async (dto: ComunicadoDTO) => {
  if (!dto.id) throw new Error("ID do comunicado é obrigatório.");
  const updated = await requisicaoApi<ComunicadoDTO>(`/api/comunicados/${dto.id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
    auth: true,
  });
  return mapearComunicado(updated);
};

export const excluirComunicado = async (id: number) => {
  await requisicaoApi(`/api/comunicados/${id}`, { method: "DELETE", auth: true });
};

export const listarComunicadosPendentesLogin = () =>
  requisicaoApi<ComunicadoDTO[]>("/api/comunicados/pendentes-login", { auth: true });

export const listarComunicadosBanner = () =>
  requisicaoApi<ComunicadoDTO[]>("/api/comunicados/banner", { auth: true });

export const confirmarComunicado = (id: number) =>
  requisicaoApi<ComunicadoDTO>(`/api/comunicados/${id}/confirmar`, {
    method: "POST",
    auth: true,
  });

export const listarLeiturasComunicado = (id: number) =>
  requisicaoApi<ComunicadoLeituraDTO[]>(`/api/comunicados/${id}/leituras`, { auth: true });
