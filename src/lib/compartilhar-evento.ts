import { resolverUrlApi } from "@/modules/api/client";
import {
  formatarDataHoraEvento,
  type EventoDTO,
} from "@/modules/eventos/api";

const truncar = (texto: string, max: number) => {
  const t = texto.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
};

export function linkEventoNoApp(eventoId: number): string {
  const origem = typeof window !== "undefined" ? window.location.origin : "";
  return `${origem}/eventos?eventoId=${eventoId}`;
}

/** Texto limpo para WhatsApp / compartilhamento nativo. */
export function montarTextoCompartilhamentoEvento(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): string {
  if (!evento.id) return "";

  const linhas: string[] = [];
  linhas.push(`📅 *${evento.titulo.trim()}*`);

  const igreja = opcoes?.nomeIgreja?.trim();
  if (igreja) linhas.push(igreja);

  linhas.push("");

  if (evento.dataInicio) {
    linhas.push(`🗓️ ${formatarDataHoraEvento(evento.dataInicio)}`);
  }
  if (evento.local?.trim()) {
    linhas.push(`📍 ${evento.local.trim()}`);
  }

  if (evento.descricao?.trim()) {
    linhas.push("");
    linhas.push(truncar(evento.descricao, 280));
  }

  linhas.push("");
  linhas.push("*Como participar*");

  if (evento.status === "CANCELADO") {
    linhas.push("⚠️ Este evento foi cancelado.");
  } else if (evento.status === "ENCERRADO") {
    linhas.push("Evento encerrado.");
  } else if (evento.inscricoesAbertas && !evento.inscricoesEncerradas && !evento.lotado) {
    linhas.push("Inscrições pelo app (botão Inscrever-se na tela do evento).");
    if (evento.capacidade != null) {
      const vagas =
        evento.vagasDisponiveis != null
          ? `${evento.vagasDisponiveis} vaga(s) disponível(is)`
          : `${evento.capacidade} vagas`;
      linhas.push(`👥 ${vagas}`);
    }
  } else if (evento.lotado) {
    linhas.push("Evento lotado no momento.");
  } else if (evento.inscricoesEncerradas || evento.inscricoesAbertas === false) {
    linhas.push("Inscrições encerradas ou indisponíveis pelo app.");
  } else {
    linhas.push("Detalhes e participação pelo app.");
  }

  if (evento.linkExterno?.trim()) {
    linhas.push(`🔗 Mais informações: ${evento.linkExterno.trim()}`);
  }

  linhas.push("");
  linhas.push("👉 Abrir no app:");
  linhas.push(linkEventoNoApp(evento.id));

  const imagem = resolverUrlApi(evento.imagemUrl);
  if (imagem) {
    linhas.push("");
    linhas.push("🖼 Banner:");
    linhas.push(imagem);
  }

  return linhas.join("\n");
}

export function abrirWhatsAppComTexto(texto: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function compartilharEvento(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"whatsapp"> {
  const texto = montarTextoCompartilhamentoEvento(evento, opcoes);
  if (!texto) {
    throw new Error("Evento sem dados para compartilhar");
  }
  abrirWhatsAppComTexto(texto);
  return "whatsapp";
}
