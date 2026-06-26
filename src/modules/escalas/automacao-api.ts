import { requisicaoApi } from "@/modules/api/client";
import type { EscalaDTO } from "@/modules/escalas/api";

export type DiaSemanaCulto =
  | "DOMINGO"
  | "SEGUNDA"
  | "TERCA"
  | "QUARTA"
  | "QUINTA"
  | "SEXTA"
  | "SABADO";

export type RegraGeneroEscala = "MASCULINO" | "FEMININO" | "QUALQUER";

export type CodigoDepartamento = "PORTARIA" | "RECEPCAO" | "LIMPEZA" | "OUTRO";

export const LABEL_DIA_SEMANA: Record<DiaSemanaCulto, string> = {
  DOMINGO: "Domingo",
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
};

export const LABEL_REGRA_GENERO: Record<RegraGeneroEscala, string> = {
  MASCULINO: "Homens",
  FEMININO: "Mulheres",
  QUALQUER: "Qualquer",
};

export type CultoEscalaRegraDTO = {
  id?: number;
  departamentoId?: number;
  departamentoNome?: string;
  regraGenero?: RegraGeneroEscala;
  ativo?: boolean;
};

export type CultoRegistroDTO = {
  id?: number;
  nome: string;
  diaSemana: DiaSemanaCulto;
  horario: string;
  ativo?: boolean;
  regras?: CultoEscalaRegraDTO[];
};

export type EscalaConfigAutomaticaDTO = {
  id?: number;
  mesesCiclo?: number;
  diasAntecedencia?: number;
  ativo?: boolean;
  podeGerarProximoCiclo?: boolean;
  proximaDataGeracao?: string;
  motivoBloqueioGeracao?: string;
  gerarPortaria?: boolean;
  gerarRecepcao?: boolean;
  gerarLimpeza?: boolean;
  agruparPortariaRecepcao?: boolean;
  limpezaMensal?: boolean;
  modoLimpeza?: ModoLimpezaEscala;
  diaSemanaLimpeza?: DiaSemanaCulto;
};

export type ModoLimpezaEscala = "MENSAL" | "SEMANAL" | "POR_CULTO";

export const LABEL_MODO_LIMPEZA: Record<ModoLimpezaEscala, string> = {
  MENSAL: "Mensal",
  SEMANAL: "Semanal",
  POR_CULTO: "Por culto",
};

export type EscopoGeracaoEscala = "PORTARIA_RECEPCAO" | "LIMPEZA";

export type GerarCicloEscalasDTO = {
  escopo?: EscopoGeracaoEscala;
  substituirLimpezaExistente?: boolean;
};

export type EscalaGeracaoDTO = {
  id?: number;
  dataInicio?: string;
  dataFim?: string;
  status?: "RASCUNHO" | "PUBLICADA";
  origem?: "MANUAL" | "AGENDADO";
  criadoEm?: string;
  publicadoEm?: string;
  totalEscalas?: number;
};

export type EscalaAlertaSecretariaDTO = {
  tipo: string;
  titulo: string;
  mensagem: string;
  geracaoId?: number;
  diasRestantes?: number;
};

export type EscalaLoginAvisoDTO = {
  escalaItemId: number;
  escalaId?: number;
  tituloEscala?: string;
  departamentoNome?: string;
  funcao?: string;
  dataEvento?: string;
  cultoNome?: string;
  orientacoesServico?: string;
};

export const obterConfigAutomacao = () =>
  requisicaoApi<EscalaConfigAutomaticaDTO>("/api/escalas/automacao/config", { auth: true });

export const salvarConfigAutomacao = (body: EscalaConfigAutomaticaDTO) =>
  requisicaoApi<EscalaConfigAutomaticaDTO>("/api/escalas/automacao/config", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });

export const listarCultosRegistro = () =>
  requisicaoApi<CultoRegistroDTO[]>("/api/escalas/automacao/cultos", { auth: true });

export const salvarCultosRegistro = (cultos: CultoRegistroDTO[]) =>
  requisicaoApi<CultoRegistroDTO[]>("/api/escalas/automacao/cultos", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(cultos),
  });

export const listarGeracoesEscalas = () =>
  requisicaoApi<EscalaGeracaoDTO[]>("/api/escalas/automacao/geracoes", { auth: true });

export const listarEscalasDaGeracao = (geracaoId: number) =>
  requisicaoApi<EscalaDTO[]>(`/api/escalas/automacao/geracoes/${geracaoId}/escalas`, { auth: true });

export const gerarProximoCicloEscalas = (body?: GerarCicloEscalasDTO) =>
  requisicaoApi<EscalaGeracaoDTO>("/api/escalas/automacao/geracoes/gerar", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body ?? {}),
  });

export const publicarGeracaoEscalas = (id: number) =>
  requisicaoApi<EscalaGeracaoDTO>(`/api/escalas/automacao/geracoes/${id}/publicar`, {
    method: "POST",
    auth: true,
  });

export const descartarGeracaoEscalas = (id: number) =>
  requisicaoApi<void>(`/api/escalas/automacao/geracoes/${id}`, {
    method: "DELETE",
    auth: true,
  });

export const excluirEscalasPortariaRecepcao = (id: number) =>
  requisicaoApi<void>(`/api/escalas/automacao/geracoes/${id}/portaria-recepcao`, {
    method: "DELETE",
    auth: true,
  });

export type EscalaLimpezaLoteDTO = {
  chave: string;
  geracaoId?: number;
  criadoEm?: string;
  modo?: ModoLimpezaEscala | string;
  totalEscalas?: number;
  cicloPeriodo?: string;
  status?: "RASCUNHO" | "PUBLICADA";
};

export const listarLotesLimpeza = () =>
  requisicaoApi<EscalaLimpezaLoteDTO[]>("/api/escalas/automacao/limpeza/lotes", { auth: true });

export const listarEscalasDoLoteLimpeza = (chave: string) =>
  requisicaoApi<EscalaDTO[]>(
    `/api/escalas/automacao/limpeza/lotes/${encodeURIComponent(chave)}/escalas`,
    { auth: true },
  );

export const publicarLoteLimpeza = (chave: string) =>
  requisicaoApi<EscalaLimpezaLoteDTO>(
    `/api/escalas/automacao/limpeza/lotes/${encodeURIComponent(chave)}/publicar`,
    { method: "POST", auth: true },
  );

export const excluirLoteLimpeza = (chave: string) =>
  requisicaoApi<void>(`/api/escalas/automacao/limpeza/lotes/${encodeURIComponent(chave)}`, {
    method: "DELETE",
    auth: true,
  });

export const alertasSecretariaEscalas = () =>
  requisicaoApi<EscalaAlertaSecretariaDTO[]>("/api/escalas/automacao/alertas-secretaria", {
    auth: true,
  });

export const avisosLoginEscalas = () =>
  requisicaoApi<EscalaLoginAvisoDTO[]>("/api/escalas/automacao/avisos-login", { auth: true });

export const marcarAvisoLoginEscalaVisto = (escalaItemId: number) =>
  requisicaoApi<void>(`/api/escalas/automacao/avisos-login/${escalaItemId}/visto`, {
    method: "POST",
    auth: true,
  });
