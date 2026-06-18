import type { Plano } from "@/modules/admin/api";

/** Meses pagos no plano anual à vista (2 meses grátis em relação a 12× mensal). */
export const MESES_PAGOS_ANUAL_AVISTA = 10;

/** Taxa única de adesão ao sistema (promoção de lançamento). */
export const TAXA_ADESAO_PROMOCIONAL = 200;

/** Referência para exibir desconto promocional (valor cheio antes da promo). */
export const TAXA_ADESAO_REFERENCIA = 700;

/** Valores do plano único de lançamento (fallback se API indisponível). */
export const PLANO_LANCAMENTO_PADRAO: Plano = {
  id: 1,
  nome: "Plano Completo",
  descricao:
    "Plano único de lançamento do Minha Igreja Digital com todos os recursos. Ideal para igrejas que querem organizar membros, comunicação e gestão em um só lugar — no computador ou no celular.",
  valorMensal: 57,
  valorAnual: 570,
  valorImplantacao: TAXA_ADESAO_PROMOCIONAL,
  diasTrial: 7,
  limiteMembros: null,
  destaque: true,
  textoBotao: "Começar teste de 7 dias",
  ordemExibicao: 1,
  ativo: true,
};

/** Texto exibido na contratação anual parcelada no cartão (12×). */
export const TEXTO_RENOVACAO_CARTAO_12X =
  "Ao concluir as 12 parcelas, o plano será renovado automaticamente para mais um ciclo de 12 meses. Antes da renovação, nossa equipe entrará em contato para confirmar se a igreja deseja permanecer no sistema e autorizar nova cobrança no cartão de crédito.";

export const RECURSOS_PLANO_LANCAMENTO = [
  "Membros ilimitados",
  "Visitantes e pré-cadastros",
  "Avisos e notificações",
  "Louvores e grupos de louvor",
  "Devocionais",
  "Bíblia com plano de leitura coletivo",
  "Financeiro da igreja",
  "Documentos da Igreja",
  "Arquivamento de atas, estatutos e contratos",
  "Organização segura de documentos administrativos",
  "Gestão e armazenamento de documentos da igreja",
  "PIX e ofertas configuráveis",
  "Logo da igreja no menu e cabeçalho",
  "Modo claro e escuro no perfil do usuário",
  "Funciona no computador e no celular",
  "Central de suporte do sistema",
] as const;

export function obterTaxaAdesao(valorImplantacao?: number | null) {
  if (valorImplantacao != null && valorImplantacao > 0) {
    return valorImplantacao;
  }
  return TAXA_ADESAO_PROMOCIONAL;
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parcela(valor: number, vezes: number) {
  return valor / vezes;
}

export function calcularValorAnualAvista(valorMensal: number) {
  return valorMensal * MESES_PAGOS_ANUAL_AVISTA;
}

/** Economia do anual à vista vs 12 parcelas mensais (2 meses grátis). */
export function economiaAnualAvista(valorMensal: number, valorAnualAvista: number) {
  return valorMensal * 12 - valorAnualAvista;
}

/** @deprecated Use economiaAnualAvista */
export function economiaAnualPix(valorMensal: number, valorAnualPix: number) {
  return economiaAnualAvista(valorMensal, valorAnualPix);
}

export function normalizarPlano(planos: Plano[]): Plano {
  if (planos.length > 0) {
    return planos.find((p) => p.destaque) ?? planos[0];
  }
  return PLANO_LANCAMENTO_PADRAO;
}
