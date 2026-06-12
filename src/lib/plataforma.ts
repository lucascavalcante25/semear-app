/**
 * Marcas do ecossistema (não confundir com igrejas clientes).
 *
 * - MARCA: identidade oficial da plataforma
 * - PRODUTO / PLATAFORMA: aliases para compatibilidade de imports
 * - Igreja cliente: nome vem do tenant (ex.: Comunidade Evangélica Semear)
 */

/** Incrementar ao trocar logo/favicon para forçar atualização no navegador. */
export const VERSAO_MARCA = "7";

export function assetMarca(caminho: string): string {
  return `${caminho}?v=${VERSAO_MARCA}`;
}

export const MARCA = {
  nome: "Minha Igreja Digital",
  slogan: "Sua igreja organizada em um só lugar",
  descricaoCurta:
    "Plataforma web para igrejas organizarem membros, visitantes, avisos, documentos da igreja, louvores, devocionais e financeiro, com acesso pelo computador e celular.",
  descricaoLonga:
    "Minha Igreja Digital é uma plataforma web criada para ajudar igrejas a organizar sua gestão em um só lugar. Com ela, é possível acompanhar membros, visitantes, avisos, documentos da igreja, louvores, devocionais, financeiro, pré-cadastros, ofertas via PIX e muito mais, de forma simples, moderna e acessível pelo computador ou celular.",
  empresa: "WillTech Solutions Dev",
  creditoRodape: "Desenvolvido por WillTech Solutions Dev",
  /** Ícone da plataforma (pacote favicon_io) */
  logoIcon: assetMarca("/brand/logo-icon.png"),
  logoIcon512: assetMarca("/brand/logo-icon-512.png"),
  faviconIco: assetMarca("/favicon.ico"),
  favicon16: assetMarca("/brand/favicon-16.png"),
  faviconPng: assetMarca("/brand/favicon-32.png"),
  appleTouchIcon: assetMarca("/brand/apple-touch-icon.png"),
  /** Logo completo da empresa desenvolvedora (WillTech Solutions Dev) */
  logoEmpresa: assetMarca("/brand/willtech-logo.png"),
  painelPlataforma: "Painel da Plataforma",
  painelIgreja: "Painel da Igreja",
  nomePlanoCompleto: "Minha Igreja Digital — Plano Completo",
  contato: {
    telefoneExibicao: "(85) 999584674",
    telefoneE164: "+5585999584674",
    email: "willtechsolutionsdev@gmail.com",
    whatsappUrl: "https://wa.me/5585999584674",
  },
} as const;

/** App que cada igreja usa (membros, avisos, bíblia, etc.) */
export const PRODUTO = {
  nome: MARCA.nome,
  slogan: MARCA.slogan,
  logoUrl: MARCA.logoIcon,
} as const;

/** Painel SUPER_ADMIN — mesma marca, contexto administrativo */
export const PLATAFORMA = {
  nome: MARCA.nome,
  slogan: MARCA.slogan,
  empresa: MARCA.empresa,
  creditoRodape: MARCA.creditoRodape,
  logoUrl: MARCA.logoIcon,
  painel: MARCA.painelPlataforma,
} as const;

/** Título da aba do navegador */
export function tituloDocumento(opcoes?: { igreja?: string; area?: "plataforma" | "produto" }) {
  const sufixo = " — Gestão para igrejas";
  if (opcoes?.area === "plataforma") {
    return `${MARCA.nome}${sufixo}`;
  }
  const base = `${MARCA.nome}${sufixo}`;
  const igreja = opcoes?.igreja?.trim();
  if (igreja && igreja !== "Sua igreja") {
    return `${igreja} · ${MARCA.nome}`;
  }
  return base;
}

/** Textos da Central de Suporte (atendimento pela empresa desenvolvedora, não pela igreja). */
export const TEXTO_SUPORTE = {
  subtituloCentral: `Envie dúvidas, sugestões ou relate problemas à equipe ${MARCA.empresa}.`,
  cardAjuda: `Abra uma solicitação de suporte para a equipe ${MARCA.empresa}.`,
  sucessoEnvio: `Solicitação enviada com sucesso! A equipe ${MARCA.empresa} analisará e responderá em breve.`,
  remetenteMensagem: MARCA.empresa,
} as const;

export const CHAVE_TEMA_PLATAFORMA = "willsas.tema";

/** Atualiza favicon da aba (arquivos de public/ e favicon_io). */
export function aplicarFaviconMarca() {
  if (typeof document === "undefined") return;

  const atualizar = (rel: string, href: string, type: string, sizes?: string) => {
    const seletor = `link[rel="${rel}"][data-marca="${href}"]`;
    let el = document.querySelector<HTMLLinkElement>(seletor);
    if (!el) {
      el = document.createElement("link");
      el.rel = rel;
      el.setAttribute("data-marca", href);
      document.head.appendChild(el);
    }
    el.href = href;
    el.type = type;
    if (sizes) el.sizes = sizes;
    else el.removeAttribute("sizes");
  };

  atualizar("icon", MARCA.faviconIco, "image/x-icon");
  atualizar("icon", MARCA.favicon16, "image/png", "16x16");
  atualizar("icon", MARCA.faviconPng, "image/png", "32x32");
  atualizar("apple-touch-icon", MARCA.appleTouchIcon, "image/png");

  let manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"][data-marca]');
  if (!manifest) {
    manifest = document.createElement("link");
    manifest.rel = "manifest";
    manifest.setAttribute("data-marca", "true");
    document.head.appendChild(manifest);
  }
  manifest.href = assetMarca("/brand/site.webmanifest");
}
