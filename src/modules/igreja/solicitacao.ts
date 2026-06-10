import { ErroRequisicaoApi, requisicaoApi } from "@/modules/api/client";
import type { PayloadSolicitacaoAcesso } from "@/lib/validacao-solicitacao";

export type SolicitacaoAcesso = {
  id?: number;
  nomeSolicitante: string;
  cpf?: string;
  email: string;
  telefone?: string;
  telefoneSecundario?: string;
  telefoneEmergencia?: string;
  nomeContatoEmergencia?: string;
  dataNascimento?: string;
  sexo?: string;
  cepPessoal?: string;
  enderecoPessoal?: string;
  numeroPessoal?: string;
  complementoPessoal?: string;
  bairroPessoal?: string;
  cidadePessoal?: string;
  estadoPessoal?: string;
  nomeIgreja: string;
  cnpjIgreja?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  quantidadeMembros?: number;
  mensagem?: string;
  status?: "PENDENTE" | "APROVADA" | "REJEITADA";
  dataSolicitacao?: string;
  dataAnalise?: string;
  observacaoAdmin?: string;
  igrejaCriadaId?: number;
};

function mensagemErroSolicitacao(erro: unknown): string {
  if (erro instanceof ErroRequisicaoApi) {
    if (erro.status === 400) {
      return "Não foi possível enviar a solicitação. Verifique os campos preenchidos.";
    }
    if (erro.status === 409) {
      return "Já existe uma solicitação para este e-mail ou CNPJ.";
    }
    if (erro.status >= 500) {
      return "Erro interno ao enviar solicitação. Tente novamente em alguns minutos.";
    }
    return erro.message;
  }
  if (erro instanceof TypeError) {
    return "Não foi possível conectar ao servidor.";
  }
  if (erro instanceof Error) return erro.message;
  return "Erro ao enviar solicitação.";
}

export async function enviarSolicitacaoAcesso(dados: PayloadSolicitacaoAcesso): Promise<SolicitacaoAcesso> {
  try {
    if (import.meta.env.DEV) {
      console.debug("[solicitacao] POST /api/solicitacoes-acesso", dados);
    }
    return await requisicaoApi<SolicitacaoAcesso>("/api/solicitacoes-acesso", {
      method: "POST",
      body: dados,
    });
  } catch (erro) {
    if (import.meta.env.DEV) console.error("[solicitacao] erro ao enviar", erro);
    throw new Error(mensagemErroSolicitacao(erro));
  }
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
  suporteAbertas?: number;
  suporteEmAnalise?: number;
  suporteEmAberto?: number;
  receitaMensalPrevista: number;
  receitaAnualPrevista?: number;
  testesVencendoEm3Dias?: number;
  testesVencidos?: number;
  pagamentosPendentes?: number;
  pagamentosAtrasados?: number;
  implantacoesPendentes?: number;
};

export async function obterDashboardAdmin() {
  return requisicaoApi<AdminDashboard>("/api/admin/dashboard", { auth: true });
}
