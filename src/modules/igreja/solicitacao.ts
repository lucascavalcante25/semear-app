import { requisicaoApi } from "@/modules/api/client";

export type SolicitacaoAcesso = {
  id?: number;
  nomeSolicitante: string;
  email: string;
  telefone?: string;
  nomeIgreja: string;
  cnpjIgreja?: string;
  cidade?: string;
  estado?: string;
  mensagem?: string;
  status?: "PENDENTE" | "APROVADA" | "REJEITADA";
};

export async function enviarSolicitacaoAcesso(dados: SolicitacaoAcesso) {
  return requisicaoApi<SolicitacaoAcesso>("/api/solicitacoes-acesso", {
    method: "POST",
    body: dados,
  });
}

export async function listarSolicitacoes(status?: string) {
  const q = status ? `?status=${status}` : "";
  return requisicaoApi<SolicitacaoAcesso[]>(`/api/admin/solicitacoes${q}`, { auth: true });
}

export async function aprovarSolicitacao(id: number, observacaoAdmin?: string) {
  return requisicaoApi<SolicitacaoAcesso>(`/api/admin/solicitacoes/${id}/aprovar`, {
    auth: true,
    method: "POST",
    body: { observacaoAdmin },
  });
}

export async function rejeitarSolicitacao(id: number, observacaoAdmin?: string) {
  return requisicaoApi<SolicitacaoAcesso>(`/api/admin/solicitacoes/${id}/rejeitar`, {
    auth: true,
    method: "POST",
    body: { observacaoAdmin },
  });
}

export type AdminDashboard = {
  totalIgrejas: number;
  igrejasAtivas: number;
  igrejasEmTeste: number;
  igrejasInativas: number;
  totalUsuarios: number;
  solicitacoesPendentes: number;
  receitaMensalPrevista: number;
};

export async function obterDashboardAdmin() {
  return requisicaoApi<AdminDashboard>("/api/admin/dashboard", { auth: true });
}
