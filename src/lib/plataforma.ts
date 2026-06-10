/**
 * Marcas do ecossistema (não confundir com igrejas clientes).
 *
 * - PRODUTO: app que cada igreja usa (membros, avisos, bíblia, etc.)
 * - PLATAFORMA: painel SaaS do dono (super-admin)
 * - Igreja cliente: nome vem do tenant (ex.: Presbiteriana Renovada, Semear, etc.)
 */
export const PRODUTO = {
  /** Nome comercial do app para igrejas — aparece na aba do navegador e materiais de venda. */
  nome: "WillIgreja",
  slogan: "Gestão e comunhão para sua igreja",
  logoUrl: "/logo-willsas.svg",
} as const;

/** Painel SaaS (SUPER_ADMIN) — WillSas / WillTech. */
export const PLATAFORMA = {
  nome: "WillSas",
  slogan: "Gestão inteligente para igrejas",
  empresa: "WillTech Solutions Dev",
  logoUrl: "/logo-willsas.svg",
} as const;

/** Título da aba: igreja logada + produto, ou só o produto. */
export function tituloDocumento(opcoes?: { igreja?: string; area?: "plataforma" | "produto" }) {
  if (opcoes?.area === "plataforma") {
    return PLATAFORMA.nome;
  }
  const base = PRODUTO.nome;
  const igreja = opcoes?.igreja?.trim();
  if (igreja && igreja !== "Sua igreja") {
    return `${igreja} · ${base}`;
  }
  return base;
}

/** Textos da Central de Suporte (atendimento pela empresa desenvolvedora, não pela igreja). */
export const TEXTO_SUPORTE = {
  subtituloCentral: `Envie dúvidas, sugestões ou relate problemas à equipe ${PLATAFORMA.empresa}.`,
  cardAjuda: `Abra uma solicitação de suporte para a equipe ${PLATAFORMA.empresa}.`,
  sucessoEnvio: `Solicitação enviada com sucesso! A equipe ${PLATAFORMA.empresa} analisará e responderá em breve.`,
  remetenteMensagem: PLATAFORMA.empresa,
} as const;

export const CHAVE_TEMA_PLATAFORMA = "willsas.tema";
