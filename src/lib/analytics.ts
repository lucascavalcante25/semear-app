declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let inicializado = false;

/** Carrega gtag.js e configura GA4 (compatível com Google Tag Assistant). */
export function inicializarAnalytics(): void {
  if (typeof window === "undefined" || !GA_ID || inicializado) return;
  inicializado = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

/** Registra visualização de página (SPA). */
export function registrarPagina(caminho: string, titulo?: string): void {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: caminho,
    page_title: titulo ?? document.title,
  });
}

/** Evento de conversão — ex.: clique em "Teste grátis". */
export function registrarEvento(
  nome: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", nome, params);
}

/** Eventos padronizados para GA4 / Google Tag Assistant. */
export const EVENTOS_ANALYTICS = {
  CTA_TESTE_GRATIS: "cta_teste_gratis",
  CONTATO_WHATSAPP: "contato_whatsapp",
  CONTATO_TELEFONE: "contato_telefone",
  FAQ_ABERTO: "faq_aberto",
  SOLICITAR_ACESSO_ENVIADO: "generate_lead",
} as const;

/** Registra clique em CTA de teste grátis. */
export function rastrearCtaTesteGratis(local: string): void {
  registrarEvento(EVENTOS_ANALYTICS.CTA_TESTE_GRATIS, { local });
}

/** Registra clique em link de WhatsApp. */
export function rastrearWhatsapp(local: string): void {
  registrarEvento(EVENTOS_ANALYTICS.CONTATO_WHATSAPP, { local });
}

/** Registra clique em link de telefone. */
export function rastrearTelefone(local: string): void {
  registrarEvento(EVENTOS_ANALYTICS.CONTATO_TELEFONE, { local });
}
/** Registra abertura de pergunta no FAQ. */
export function rastrearFaq(pergunta: string): void {
  registrarEvento(EVENTOS_ANALYTICS.FAQ_ABERTO, { pergunta });
}

/** Registra envio bem-sucedido do formulário de solicitação de acesso. */
export function rastrearLeadEnviado(): void {
  registrarEvento(EVENTOS_ANALYTICS.SOLICITAR_ACESSO_ENVIADO, {
    form_name: "solicitar_acesso",
    currency: "BRL",
    value: 0,
  });
}

export function analyticsAtivo(): boolean {
  return Boolean(GA_ID);
}

