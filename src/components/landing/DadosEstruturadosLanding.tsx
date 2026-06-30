import { useEffect } from "react";
import { MARCA } from "@/lib/plataforma";
import { PLANO_LANCAMENTO_PADRAO } from "@/lib/plano-comercial";

const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ??
  "https://minha-igreja-digital-app.vercel.app";

/** JSON-LD para mecanismos de busca (SoftwareApplication + Organization). */
export function DadosEstruturadosLanding() {
  const dados = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: MARCA.empresa,
        url: SITE_URL,
        logo: `${SITE_URL}${MARCA.logoEmpresa}`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: MARCA.contato.telefoneE164,
          email: MARCA.contato.email,
          contactType: "customer service",
          availableLanguage: "Portuguese",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: MARCA.nome,
        description: MARCA.descricaoLonga,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: PLANO_LANCAMENTO_PADRAO.valorMensal,
          priceCurrency: "BRL",
          description: `Teste grátis por ${PLANO_LANCAMENTO_PADRAO.diasTrial} dias`,
        },
        provider: { "@id": `${SITE_URL}/#organization` },
        url: `${SITE_URL}/landing`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: MARCA.nome,
        url: SITE_URL,
        description: MARCA.slogan,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}

/** Preload da imagem LCP do hero (primeiro slide). */
export function PreloadImagemLcp() {
  useEffect(() => {
    const href = "/landing/dashboard.png";
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.fetchPriority = "high";
    document.head.appendChild(link);
  }, []);
  return null;
}
