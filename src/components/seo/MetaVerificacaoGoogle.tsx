import { useEffect } from "react";

const CODIGO = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined;

/** Meta tag de verificação do Google Search Console (quando VITE_GOOGLE_SITE_VERIFICATION estiver definida). */
export function MetaVerificacaoGoogle() {
  useEffect(() => {
    if (!CODIGO?.trim()) return;
    const nome = "google-site-verification";
    if (document.querySelector(`meta[name="${nome}"]`)) return;
    const meta = document.createElement("meta");
    meta.name = nome;
    meta.content = CODIGO.trim();
    document.head.appendChild(meta);
  }, []);
  return null;
}
