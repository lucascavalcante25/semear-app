import { requisicaoApi } from "@/modules/api/client";

export type DashboardResumoDTO = {
  totalMembros: number;
  totalVisitantes: number;
  visitantesMes: number;
  pedidosOracaoAbertos: number;
  preCadastrosPendentes: number;
  saldoMes?: number | null;
  aniversariantesHoje: number;
  avisosAtivos: number;
  documentosVencendo: number;
  aniversariantes?: Array<{ id: number; nome: string }>;
};

export const obterResumoDashboard = () =>
  requisicaoApi<DashboardResumoDTO>("/api/dashboard/resumo", { auth: true });
