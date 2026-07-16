import { URL_BASE_API, resolverUrlApi } from "@/modules/api/client";
import {
  formatarDataHoraEvento,
  type EventoDTO,
} from "@/modules/eventos/api";

const truncar = (texto: string, max: number) => {
  const t = texto.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
};

/** Link amigável no app (Vercel faz proxy para a página OG do backend). */
export function linkCompartilharEvento(eventoId: number): string {
  if (typeof window !== "undefined" && import.meta.env.PROD) {
    return `${window.location.origin}/e/${eventoId}`;
  }
  const api = URL_BASE_API?.replace(/\/$/, "") ?? "";
  return `${api}/api/public/eventos/${eventoId}/compartilhar`;
}

/** Texto limpo: sem URLs de API/banner — só um link no final. */
export function montarTextoCompartilhamentoEvento(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): string {
  if (!evento.id) return "";

  const linhas: string[] = [];
  linhas.push(`*${evento.titulo.trim()}*`);

  const igreja = opcoes?.nomeIgreja?.trim();
  if (igreja) linhas.push(igreja);

  linhas.push("");

  if (evento.dataInicio) {
    linhas.push(formatarDataHoraEvento(evento.dataInicio));
  }
  if (evento.local?.trim()) {
    linhas.push(evento.local.trim());
  }

  if (evento.descricao?.trim()) {
    linhas.push("");
    linhas.push(truncar(evento.descricao, 280));
  }

  linhas.push("");

  if (evento.status === "CANCELADO") {
    linhas.push("Este evento foi cancelado.");
  } else if (evento.status === "ENCERRADO") {
    linhas.push("Evento encerrado.");
  } else if (evento.inscricoesAbertas && !evento.inscricoesEncerradas && !evento.lotado) {
    linhas.push("Inscrições abertas pelo app.");
    if (evento.capacidade != null) {
      const vagas =
        evento.vagasDisponiveis != null
          ? `${evento.vagasDisponiveis} vaga(s) disponível(is)`
          : `${evento.capacidade} vagas`;
      linhas.push(vagas);
    }
  } else if (evento.lotado) {
    linhas.push("Evento lotado no momento.");
  } else if (evento.inscricoesEncerradas || evento.inscricoesAbertas === false) {
    linhas.push("Inscrições indisponíveis no momento.");
  }

  if (evento.linkExterno?.trim()) {
    linhas.push("");
    linhas.push(`Mais informações: ${evento.linkExterno.trim()}`);
  }

  linhas.push("");
  linhas.push(linkCompartilharEvento(evento.id));

  return linhas.join("\n");
}

/** Legenda para Instagram (sem markdown do WhatsApp). */
export function montarLegendaInstagram(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): string {
  if (!evento.id) return "";

  const linhas: string[] = [];
  linhas.push(evento.titulo.trim());

  const igreja = opcoes?.nomeIgreja?.trim();
  if (igreja) linhas.push(igreja);

  if (evento.dataInicio) {
    linhas.push(formatarDataHoraEvento(evento.dataInicio));
  }
  if (evento.local?.trim()) {
    linhas.push(evento.local.trim());
  }

  if (evento.descricao?.trim()) {
    linhas.push("");
    linhas.push(truncar(evento.descricao, 200));
  }

  if (evento.inscricoesAbertas && !evento.inscricoesEncerradas && !evento.lotado) {
    linhas.push("");
    linhas.push("Inscrições pelo app 📲");
  }

  linhas.push("");
  linhas.push(linkCompartilharEvento(evento.id));

  return linhas.join("\n");
}

export function abrirWhatsAppComTexto(texto: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function obterArquivoBanner(evento: EventoDTO): Promise<File | null> {
  const imagemAbsoluta = resolverUrlApi(evento.imagemUrl);
  if (!imagemAbsoluta) return null;
  try {
    const res = await fetch(imagemAbsoluta);
    if (!res.ok) return null;
    const blob = await res.blob();
    const tipo = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
    const ext = tipo.includes("png") ? "png" : "jpg";
    return new File([blob], `evento-${evento.id}.${ext}`, { type: tipo });
  } catch {
    return null;
  }
}

function baixarArquivo(arquivo: File): void {
  const url = URL.createObjectURL(arquivo);
  const a = document.createElement("a");
  a.href = url;
  a.download = arquivo.name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

/**
 * WhatsApp: no celular tenta imagem + texto; senão abre o WhatsApp com o convite.
 */
export async function compartilharEventoWhatsApp(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"imagem" | "whatsapp"> {
  const texto = montarTextoCompartilhamentoEvento(evento, opcoes);
  if (!texto) throw new Error("Evento sem dados para compartilhar");

  const arquivo = await obterArquivoBanner(evento);
  if (
    arquivo &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [arquivo] })
  ) {
    try {
      await navigator.share({ files: [arquivo], title: evento.titulo, text: texto });
      return "imagem";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
    }
  }

  abrirWhatsAppComTexto(texto);
  return "whatsapp";
}

/** @deprecated use compartilharEventoWhatsApp */
export async function compartilharEvento(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"imagem" | "whatsapp"> {
  return compartilharEventoWhatsApp(evento, opcoes);
}

/**
 * Instagram Stories: compartilha a imagem (sheet nativo) ou baixa o banner + copia a legenda.
 * O Instagram não permite publicar Stories direto pelo navegador sem app oficial.
 */
export async function compartilharEventoInstagramStories(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"compartilhado" | "baixado"> {
  const legenda = montarLegendaInstagram(evento, opcoes);
  const arquivo = await obterArquivoBanner(evento);

  if (
    arquivo &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [arquivo] })
  ) {
    try {
      await navigator.share({
        files: [arquivo],
        title: evento.titulo,
        text: legenda,
      });
      await copiarTexto(legenda);
      return "compartilhado";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
    }
  }

  if (arquivo) {
    baixarArquivo(arquivo);
  }
  await copiarTexto(legenda);
  return "baixado";
}

/**
 * Instagram Feed: prepara imagem + legenda (clipboard) para colar na publicação da igreja.
 */
export async function compartilharEventoInstagramFeed(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"compartilhado" | "baixado"> {
  const legenda = montarLegendaInstagram(evento, opcoes);
  const arquivo = await obterArquivoBanner(evento);

  if (
    arquivo &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [arquivo] })
  ) {
    try {
      await navigator.share({
        files: [arquivo],
        title: evento.titulo,
        text: legenda,
      });
      await copiarTexto(legenda);
      return "compartilhado";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
    }
  }

  if (arquivo) {
    baixarArquivo(arquivo);
  }
  await copiarTexto(legenda);
  return "baixado";
}
