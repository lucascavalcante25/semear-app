import { requisicaoApi } from "@/modules/api/client";

export type IgrejaUsoMonitoramento = {
  igrejaId: number;
  nome: string;
  usuariosAtivos: number;
};

export type TabelaVolumeMonitoramento = {
  tabela: string;
  registrosEstimados: number;
};

export type ServicoStatusMonitoramento = {
  nome: string;
  status: string;
  detalhe: string;
};

export type AdminMonitoramento = {
  coletadoEm: string;
  uptimeSegundos: number;
  statusGeral: string;
  statusBanco: string;
  statusDisco: string;
  memoriaUsadaMb: number;
  memoriaMaxMb: number;
  memoriaPercentual: number;
  cpuPercentual: number;
  threadsAtivas: number;
  conexoesAtivas: number;
  conexoesIdle: number;
  conexoesMax: number;
  conexoesPendentes: number;
  requisicoesPorMinuto: number;
  latenciaMediaMs: number;
  totalRequisicoes: number;
  totalIgrejas: number;
  igrejasAtivas: number;
  totalUsuarios: number;
  usuariosAtivos: number;
  totalComunicados: number;
  totalEventos: number;
  dispositivosPushAtivos: number;
  notificacoesEnviadas24h: number;
  pushHabilitado: boolean;
  topIgrejasPorUsuarios: IgrejaUsoMonitoramento[];
  volumesTabela: TabelaVolumeMonitoramento[];
  alertas: string[];
  servicos: ServicoStatusMonitoramento[];
};

export type AdminMenuResumo = {
  solicitacoesPendentes: number;
  suporteAguardandoResposta: number;
};

export const obterMonitoramento = () =>
  requisicaoApi<AdminMonitoramento>("/api/admin/monitoramento", { auth: true });

export const obterMenuResumoAdmin = () =>
  requisicaoApi<AdminMenuResumo>("/api/admin/dashboard/menu-resumo", { auth: true });

export type MonitoramentoHistoricoPonto = {
  coletadoEm: string;
  statusGeral: string;
  statusBanco: string;
  memoriaPercentual: number;
  cpuPercentual: number;
  conexoesAtivas: number;
  conexoesMax: number;
  requisicoesPorMinuto: number;
  latenciaMediaMs: number;
  totalUsuarios: number;
  totalIgrejas: number;
};

export const obterHistoricoMonitoramento = (horas = 24) =>
  requisicaoApi<MonitoramentoHistoricoPonto[]>(
    `/api/admin/monitoramento/historico?horas=${horas}`,
    { auth: true },
  );
