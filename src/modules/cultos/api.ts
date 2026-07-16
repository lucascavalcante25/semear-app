import { requisicaoApi } from "@/modules/api/client";
import type { CultoRegistroDTO, DiaSemanaCulto } from "@/modules/escalas/automacao-api";

export type TipoCulto = "RECORRENTE" | "EXTRAORDINARIO";
export type PapelCultoResponsavel = "PORTARIA" | "RECEPCAO" | "LIMPEZA";

export type CultoModeloDTO = CultoRegistroDTO & {
  tipo?: TipoCulto;
  dataEspecifica?: string | null;
};

export type CultoLouvorItemDTO = {
  louvorId: number;
  titulo: string;
  artista?: string;
  ordem: number;
  youtubeUrl?: string | null;
  tonalidade?: string | null;
  temLetraSalva?: boolean | null;
  temCifraApiSalva?: boolean | null;
};

export type CultoResponsavelDTO = {
  papel: PapelCultoResponsavel;
  userId: number;
  nome: string;
  origemManual: boolean;
};

export type CultoAgendaItemDTO = {
  ocorrenciaId?: number | null;
  cultoRegistroId: number;
  nome: string;
  tipo: TipoCulto;
  data: string;
  horario: string;
  pregador?: string | null;
  tituloMensagem?: string | null;
  versiculoCentral?: string | null;
  observacoes?: string | null;
  grupoLouvorOrigemId?: number | null;
  grupoLouvorOrigemNome?: string | null;
  louvores: CultoLouvorItemDTO[];
  responsaveis: CultoResponsavelDTO[];
  temOverrideResponsaveis: boolean;
  temEscalaGerada: boolean;
  cancelado?: boolean;
  motivoCancelamento?: string | null;
  canceladoEm?: string | null;
};

export type CultoAgendaListaDTO = {
  proximos: CultoAgendaItemDTO[];
  passados: CultoAgendaItemDTO[];
};

export type CultoOcorrenciaSalvarDTO = {
  cultoRegistroId: number;
  data: string;
  pregador?: string | null;
  tituloMensagem?: string | null;
  versiculoCentral?: string | null;
  observacoes?: string | null;
  grupoLouvorOrigemId?: number | null;
  louvorIds?: number[];
  responsaveisManuais?: { papel: PapelCultoResponsavel; userId: number }[];
};

export type CultoCancelarDTO = {
  cultoRegistroId: number;
  data: string;
  motivoCancelamento?: string;
};

export const listarModelosCulto = () =>
  requisicaoApi<CultoModeloDTO[]>("/api/cultos/modelos", { auth: true });

export const salvarModelosCulto = (cultos: CultoModeloDTO[]) =>
  requisicaoApi<CultoModeloDTO[]>("/api/cultos/modelos", {
    method: "PUT",
    body: JSON.stringify(cultos),
    auth: true,
  });

export const listarAgendaCultos = () =>
  requisicaoApi<CultoAgendaListaDTO>("/api/cultos/agenda", { auth: true });

export const obterDetalheCulto = (cultoRegistroId: number, data: string) =>
  requisicaoApi<CultoAgendaItemDTO>(
    `/api/cultos/agenda/detalhe?cultoRegistroId=${cultoRegistroId}&data=${encodeURIComponent(data)}`,
    { auth: true },
  );

export const salvarOcorrenciaCulto = (body: CultoOcorrenciaSalvarDTO) =>
  requisicaoApi<CultoAgendaItemDTO>("/api/cultos/agenda", {
    method: "PUT",
    body: JSON.stringify(body),
    auth: true,
  });

export const cancelarCulto = (body: CultoCancelarDTO) =>
  requisicaoApi<CultoAgendaItemDTO>("/api/cultos/agenda/cancelar", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });

export const reativarCulto = (body: Pick<CultoCancelarDTO, "cultoRegistroId" | "data">) =>
  requisicaoApi<CultoAgendaItemDTO>("/api/cultos/agenda/reativar", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });

export const previewGrupoLouvorCulto = (grupoId: number) =>
  requisicaoApi<CultoLouvorItemDTO[]>(`/api/cultos/grupos-louvor/${grupoId}/preview`, { auth: true });

export type { DiaSemanaCulto };
