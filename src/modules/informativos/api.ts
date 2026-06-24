import { requisicaoApi } from "@/modules/api/client";

export type TipoInformativoApi = "INFORMATIVO" | "URGENTE" | "CAMPANHA" | "SISTEMA";
export type PublicoAlvoInformativoApi = "TODOS" | "MEMBROS" | "LIDERANCA" | "NOVOS_USUARIOS";
export type PrioridadeInformativoApi = "BAIXA" | "NORMAL" | "ALTA";

export type InformativoDTO = {
  id?: number;
  igrejaId?: number;
  titulo: string;
  conteudo: string;
  tipo?: TipoInformativoApi;
  publicoAlvo?: PublicoAlvoInformativoApi;
  prioridade?: PrioridadeInformativoApi;
  exibirNoLogin?: boolean;
  obrigatorio?: boolean;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string | null;
  criadoPorNome?: string;
  criadoEm?: string;
  lido?: boolean;
  ctaRotulo?: string | null;
  ctaRota?: string | null;
  imagemUrl?: string | null;
  totalLeituras?: number;
};

export type InformativoLeituraDTO = {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  lidoEm: string;
  confirmadoEm?: string;
};

export const LABEL_PUBLICO: Record<PublicoAlvoInformativoApi, string> = {
  TODOS: "Todos os usuários",
  MEMBROS: "Membros",
  LIDERANCA: "Liderança",
  NOVOS_USUARIOS: "Novos usuários",
};

export const LABEL_TIPO: Record<TipoInformativoApi, string> = {
  INFORMATIVO: "Informativo",
  URGENTE: "Urgente",
  CAMPANHA: "Campanha",
  SISTEMA: "Sistema",
};

export const listarInformativosAdmin = () =>
  requisicaoApi<InformativoDTO[]>("/api/informativos", { auth: true });

export const listarInformativosPendentesLogin = () =>
  requisicaoApi<InformativoDTO[]>("/api/informativos/pendentes-login", { auth: true });

export const criarInformativo = (body: InformativoDTO) =>
  requisicaoApi<InformativoDTO>("/api/informativos", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });

export const atualizarInformativo = (id: number, body: InformativoDTO) =>
  requisicaoApi<InformativoDTO>(`/api/informativos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });

export const excluirInformativo = (id: number) =>
  requisicaoApi<void>(`/api/informativos/${id}`, { method: "DELETE", auth: true });

export const confirmarInformativo = (id: number) =>
  requisicaoApi<InformativoDTO>(`/api/informativos/${id}/confirmar`, {
    method: "POST",
    auth: true,
  });

export const listarLeiturasInformativo = (id: number) =>
  requisicaoApi<InformativoLeituraDTO[]>(`/api/informativos/${id}/leituras`, { auth: true });

export const listarInformativosBanner = () =>
  requisicaoApi<InformativoDTO[]>("/api/informativos/banner", { auth: true });
