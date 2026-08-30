import type { CultoAgendaItemDTO, CultoLouvorItemDTO, PapelCultoResponsavel } from "@/modules/cultos/api";

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export type OpcoesCompartilharCulto = {
  pregador: boolean;
  louvores: boolean;
  portaria: boolean;
  recepcao: boolean;
  limpeza: boolean;
};

export function formatarDataCultoWhatsApp(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const data = new Date(y, m - 1, d);
  const diaSemana = DIAS_SEMANA[data.getDay()] ?? "";
  const dataFmt = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  return diaSemana ? `${diaSemana}, ${dataFmt}` : dataFmt;
}

export function formatarHorarioCulto(horario: string): string {
  const t = horario.trim();
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function nomeResponsavel(item: CultoAgendaItemDTO, papel: PapelCultoResponsavel): string | null {
  const nome = item.responsaveis?.find((r) => r.papel === papel)?.nome?.trim();
  return nome || null;
}

function linhaLouvor(l: CultoLouvorItemDTO): string {
  const titulo = l.titulo?.trim() || "Louvor";
  const artista = l.artista?.trim();
  return artista ? `• ${titulo} — ${artista}` : `• ${titulo}`;
}

export function montarMensagemCultoWhatsApp(
  item: CultoAgendaItemDTO,
  opcoes: OpcoesCompartilharCulto,
): string {
  const linhas: string[] = [];
  linhas.push(`🙏 *${item.nome.trim() || "Culto"}*`);
  linhas.push("");
  linhas.push(`📅 *Quando:* ${formatarDataCultoWhatsApp(item.data)} às ${formatarHorarioCulto(item.horario)}`);

  if (opcoes.pregador && item.pregador?.trim()) {
    linhas.push(`🎤 *Pregador:* ${item.pregador.trim()}`);
  }

  if (opcoes.louvores && (item.louvores?.length ?? 0) > 0) {
    const ordenados = [...item.louvores].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    linhas.push("");
    linhas.push("🎵 *Louvores:*");
    for (const l of ordenados) {
      linhas.push(linhaLouvor(l));
    }
  }

  const portaria = opcoes.portaria ? nomeResponsavel(item, "PORTARIA") : null;
  const recepcao = opcoes.recepcao ? nomeResponsavel(item, "RECEPCAO") : null;
  const limpeza = opcoes.limpeza ? nomeResponsavel(item, "LIMPEZA") : null;
  if (portaria || recepcao || limpeza) {
    linhas.push("");
    linhas.push("👥 *Equipe:*");
    if (portaria) linhas.push(`🚪 Portaria: ${portaria}`);
    if (recepcao) linhas.push(`🤝 Recepção: ${recepcao}`);
    if (limpeza) linhas.push(`🧹 Limpeza da semana: ${limpeza}`);
  }

  linhas.push("");
  linhas.push("Você é bem-vindo(a)! ✨");
  return linhas.join("\n");
}

export async function enviarMensagemWhatsApp(texto: string, titulo: string): Promise<"compartilhado" | "whatsapp" | "copiado"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title: titulo, text: texto });
    return "compartilhado";
  }
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  const janela = window.open(url, "_blank", "noopener,noreferrer");
  if (janela) return "whatsapp";
  await navigator.clipboard.writeText(texto);
  return "copiado";
}
