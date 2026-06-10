import type { Plano } from "@/modules/admin/api";

/** Valores do plano único de lançamento (fallback se API indisponível). */
export const PLANO_LANCAMENTO_PADRAO: Plano = {
  id: 1,
  nome: "Plano Completo",
  descricao:
    "Plano único de lançamento do WillIgreja com todos os recursos. Ideal para igrejas que querem organizar membros, comunicação e gestão em um só lugar — no computador ou no celular.",
  valorMensal: 139.9,
  valorAnual: 1510.92,
  valorImplantacao: 700,
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
  "PIX e ofertas configuráveis",
  "Identidade visual da igreja (cores e tema)",
  "App web responsivo — use no celular",
  "Central de suporte da plataforma",
] as const;

export function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parcela(valor: number, vezes: number) {
  return valor / vezes;
}

/** 12 × mensal (cartão) vs anual PIX com 10% off. */
export function economiaAnualPix(valorMensal: number, valorAnualPix: number) {
  return valorMensal * 12 - valorAnualPix;
}

export function normalizarPlano(planos: Plano[]): Plano {
  if (planos.length > 0) {
    return planos.find((p) => p.destaque) ?? planos[0];
  }
  return PLANO_LANCAMENTO_PADRAO;
}
