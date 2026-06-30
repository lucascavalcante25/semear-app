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
  valorAnual?: number;
  valorImplantacao?: number;
  diasTrial?: number;
  limiteMembros?: number | null;
  destaque?: boolean;
  textoBotao?: string;
  ordemExibicao?: number;
  ativo?: boolean;
  dataCadastro?: string;
  dataAtualizacao?: string;
  promocaoImplantacaoAnual?: number;
  descontoAnualPercentual?: number;
};

export type StatusAssinatura =
  | "EM_TESTE"
  | "ATIVA"
  | "PENDENTE_PAGAMENTO"
  | "ATRASADA"
  | "SUSPENSA"
  | "CANCELADA";

export type FormaPagamento = "PIX" | "CARTAO_LINK" | "BOLETO" | "DINHEIRO" | "OUTRO";

export type AssinaturaIgreja = {
  id: number;
  igrejaId?: number;
  igrejaNome?: string;
  planoId?: number;
  planoNome?: string;
  valorMensal: number;
  dataVencimento?: string;
  statusPagamento: "PENDENTE" | "PAGO" | "ATRASADO" | "ISENTO" | "CANCELADO";
  dataPagamento?: string;
  observacao?: string;
  statusAssinatura?: StatusAssinatura;
  dataInicioTeste?: string;
  dataFimTeste?: string;
  dataAtivacao?: string;
  valorImplantacaoContratado?: number;
  valorMensalContratado?: number;
  valorAnualContratado?: number;
  statusImplantacao?: AssinaturaIgreja["statusPagamento"];
  statusMensalidade?: AssinaturaIgreja["statusPagamento"];
  formaPagamento?: FormaPagamento;
  proximoVencimento?: string;
  responsavelNome?: string;
  diasRestantesTeste?: number;
  acessoPermitido?: boolean;
};

export type AssinaturaAcesso = {
  igrejaId?: number;
  statusAssinatura?: StatusAssinatura;
  diasRestantesTeste?: number;
  dataFimTeste?: string;
  acessoPermitido: boolean;
  mensagem?: string;
};

export type MensagensComerciais = {
  mensagemAbordagem?: string;
  mensagemPreco?: string;
  mensagemDemo?: string;
  mensagemFimTeste?: string;
  whatsappContato?: string;
  emailContato?: string;
};

export type PlanoPublico = {
  nome: string;
  descricao?: string;
  valorMensal: number;
  valorAnual?: number;
  valorImplantacao?: number;
  promocaoImplantacaoAnual?: number;
  diasTrial?: number;
  descontoAnualPercentual?: number;
  textoBotao?: string;
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

export async function obterAssinaturaAcesso(): Promise<AssinaturaAcesso> {
  return requisicaoApi<AssinaturaAcesso>("/api/account/assinatura-acesso", { auth: true });
}

export async function ativarAssinaturaAdmin(id: number): Promise<AssinaturaIgreja> {
  return requisicaoApi<AssinaturaIgreja>(`/api/admin/assinaturas/${id}/ativar`, { method: "PATCH", auth: true });
}

export async function prorrogarTesteAdmin(id: number, dias = 7): Promise<AssinaturaIgreja> {
  return requisicaoApi<AssinaturaIgreja>(`/api/admin/assinaturas/${id}/prorrogar-teste`, {
    method: "PATCH",
    auth: true,
    body: { dias },
  });
}

export async function suspenderAssinaturaAdmin(id: number, motivo?: string): Promise<AssinaturaIgreja> {
  return requisicaoApi<AssinaturaIgreja>(`/api/admin/assinaturas/${id}/suspender`, {
    method: "PATCH",
    auth: true,
    body: { motivo },
  });
}

export async function marcarImplantacaoPagaAdmin(id: number, forma: FormaPagamento = "PIX"): Promise<AssinaturaIgreja> {
  return requisicaoApi<AssinaturaIgreja>(`/api/admin/assinaturas/${id}/registrar-pagamento-implantacao`, {
    method: "PATCH",
    auth: true,
    body: { formaPagamento: forma },
  });
}

export async function marcarMensalidadePagaAdmin(id: number, forma: FormaPagamento = "PIX"): Promise<AssinaturaIgreja> {
  return requisicaoApi<AssinaturaIgreja>(`/api/admin/assinaturas/${id}/registrar-pagamento-mensal`, {
    method: "PATCH",
    auth: true,
    body: { formaPagamento: forma },
  });
}

export async function registrarPagamentoAnualAdmin(id: number, forma: FormaPagamento = "PIX"): Promise<AssinaturaIgreja> {
  return requisicaoApi<AssinaturaIgreja>(`/api/admin/assinaturas/${id}/registrar-pagamento-anual`, {
    method: "PATCH",
    auth: true,
    body: { formaPagamento: forma },
  });
}

export async function obterMensagensComerciaisAdmin(): Promise<MensagensComerciais> {
  return requisicaoApi<MensagensComerciais>("/api/admin/planos/mensagens-comerciais", { auth: true });
}

export async function salvarMensagensComerciaisAdmin(dados: MensagensComerciais): Promise<MensagensComerciais> {
  return requisicaoApi<MensagensComerciais>("/api/admin/planos/mensagens-comerciais", {
    method: "PUT",
    auth: true,
    body: dados,
  });
}

export async function obterPlanoPublico(): Promise<PlanoPublico> {
  const CACHE_KEY = "semear:plano-publico";
  const CACHE_TTL_MS = 60 * 60 * 1000;

  try {
    const bruto = sessionStorage.getItem(CACHE_KEY);
    if (bruto) {
      const { data, ts } = JSON.parse(bruto) as { data: PlanoPublico; ts: number };
      if (Date.now() - ts < CACHE_TTL_MS) return data;
    }
  } catch {
    /* cache inválido — ignora */
  }

  const data = await requisicaoApi<PlanoPublico>("/api/public/plano-lancamento");
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    /* quota excedida — ignora */
  }
  return data;
}
