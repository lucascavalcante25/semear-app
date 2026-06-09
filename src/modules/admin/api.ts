import { requisicaoApi } from "@/modules/api/client";

export type AdminUsuario = {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated?: boolean;
  igrejaId?: number;
  igrejaNome?: string;
  authorities?: string[];
};

export type Plano = {
  id: number;
  nome: string;
  descricao?: string;
  valorMensal: number;
  ativo?: boolean;
};

export type AssinaturaIgreja = {
  id: number;
  igrejaId?: number;
  igrejaNome?: string;
  planoId?: number;
  planoNome?: string;
  valorMensal: number;
  dataVencimento?: string;
  statusPagamento: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
  dataPagamento?: string;
  observacao?: string;
};

export type FinanceiroResumo = {
  totalAssinaturas: number;
  assinaturasPagas: number;
  assinaturasPendentes: number;
  assinaturasAtrasadas: number;
  receitaMensalPrevista: number;
  receitaMensalRecebida: number;
};

export type PlataformaConfig = {
  nomePlataforma: string;
  versao?: string;
  emailSuporte?: string;
  urlBase?: string;
};

export async function listarUsuariosAdmin(): Promise<AdminUsuario[]> {
  return requisicaoApi<AdminUsuario[]>("/api/admin/usuarios", { auth: true });
}

export async function listarPlanosAdmin(): Promise<Plano[]> {
  return requisicaoApi<Plano[]>("/api/admin/planos", { auth: true });
}

export async function listarAssinaturasAdmin(): Promise<AssinaturaIgreja[]> {
  return requisicaoApi<AssinaturaIgreja[]>("/api/admin/assinaturas", { auth: true });
}

export async function obterResumoFinanceiroAdmin(): Promise<FinanceiroResumo> {
  return requisicaoApi<FinanceiroResumo>("/api/admin/financeiro/resumo", { auth: true });
}

export async function obterConfigPlataformaAdmin(): Promise<PlataformaConfig> {
  return requisicaoApi<PlataformaConfig>("/api/admin/configuracao-plataforma", { auth: true });
}
