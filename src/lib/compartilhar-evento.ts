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

/** Link curto e limpo (sem ?v= técnico). A prévia do WhatsApp usa as meta tags da página. */
export function linkCompartilharEvento(eventoId: number): string {
  if (typeof window !== "undefined" && import.meta.env.PROD) {
    return `${window.location.origin}/e/${eventoId}`;
  }
  const api = URL_BASE_API?.replace(/\/$/, "") ?? "";
  return `${api}/api/public/eventos/${eventoId}/compartilhar`;
}

/**
 * Convite WhatsApp.
 * Obs.: o WhatsApp não permite mascarar URL com texto clicável ("Ir para o App").
 * Por isso usamos um rótulo claro + link curto, e deixamos a prévia OG mostrar a imagem.
 */
export function montarTextoCompartilhamentoEvento(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): string {
  if (!evento.id) return "";

  const linhas: string[] = [];
  linhas.push(`*${evento.titulo.trim()}*`);

  const meta: string[] = [];
  const igreja = opcoes?.nomeIgreja?.trim();
  if (igreja) meta.push(igreja);
  if (evento.dataInicio) meta.push(formatarDataHoraEvento(evento.dataInicio));
  if (evento.local?.trim()) meta.push(evento.local.trim());
  if (meta.length) {
    linhas.push(meta.join(" · "));
  }

  linhas.push("");

  if (evento.status === "CANCELADO") {
    linhas.push("Este evento foi cancelado.");
  } else if (evento.status === "ENCERRADO") {
    linhas.push("Evento encerrado.");
  } else if (evento.inscricoesAbertas && !evento.inscricoesEncerradas && !evento.lotado) {
    linhas.push("Inscrições abertas pelo app.");
  } else if (evento.lotado) {
    linhas.push("Evento lotado no momento.");
  }

  linhas.push("");
  linhas.push("👉 Ir para o app");
  linhas.push(linkCompartilharEvento(evento.id));

  return linhas.join("\n");
}

/** Legenda Instagram (sem markdown). */
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
    linhas.push(truncar(evento.descricao, 160));
  }

  if (evento.inscricoesAbertas && !evento.inscricoesEncerradas && !evento.lotado) {
    linhas.push("");
    linhas.push("Inscrições pelo app");
  }

  linhas.push("");
  linhas.push("Ir para o app:");
  linhas.push(linkCompartilharEvento(evento.id));

  return linhas.join("\n");
}

export function abrirWhatsAppComTexto(texto: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

async function obterArquivoBanner(evento: EventoDTO): Promise<File | null> {
  const imagemAbsoluta = resolverUrlApi(evento.imagemUrl?.split("?")[0]);
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

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
}

function wrapTexto(
  ctx: CanvasRenderingContext2D,
  texto: string,
  maxWidth: number,
  maxLinhas: number,
): string[] {
  const palavras = texto.trim().split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of palavras) {
    const teste = atual ? `${atual} ${palavra}` : palavra;
    if (ctx.measureText(teste).width <= maxWidth) {
      atual = teste;
    } else {
      if (atual) linhas.push(atual);
      atual = palavra;
      if (linhas.length >= maxLinhas) break;
    }
  }
  if (atual && linhas.length < maxLinhas) linhas.push(atual);
  if (linhas.length === maxLinhas && palavras.join(" ").length > linhas.join(" ").length) {
    const ultima = linhas[maxLinhas - 1];
    linhas[maxLinhas - 1] = `${ultima.replace(/\s+\S*$/, "").trimEnd()}…`;
  }
  return linhas;
}

/**
 * Arte vertical 9:16 para Stories/Reels: banner horizontal inteiro (letterbox),
 * sem o crop agressivo que o Instagram aplica no banner cru.
 */
export async function gerarArteInstagramEvento(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<File | null> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#1a2e1c");
  grad.addColorStop(0.45, "#243828");
  grad.addColorStop(1, "#0f1a12");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const margem = 64;
  const bannerTopo = 220;
  const bannerAlturaMax = 520;
  const bannerLargura = W - margem * 2;

  const bannerArquivo = await obterArquivoBanner(evento);
  if (bannerArquivo) {
    const url = URL.createObjectURL(bannerArquivo);
    try {
      const img = await carregarImagem(url);
      const escala = Math.min(bannerLargura / img.width, bannerAlturaMax / img.height);
      const dw = Math.round(img.width * escala);
      const dh = Math.round(img.height * escala);
      const dx = Math.round((W - dw) / 2);
      const dy = bannerTopo + Math.round((bannerAlturaMax - dh) / 2);

      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, margem, bannerTopo, bannerLargura, bannerAlturaMax, 28);
      ctx.fill();

      ctx.save();
      roundRect(ctx, dx, dy, dw, dh, 20);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } catch {
      // segue sem banner
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  let y = bannerTopo + bannerAlturaMax + 72;
  ctx.fillStyle = "#F5F0E6";
  ctx.textAlign = "center";
  ctx.font = "700 64px Georgia, 'Times New Roman', serif";
  for (const linha of wrapTexto(ctx, evento.titulo.trim(), W - margem * 2, 3)) {
    ctx.fillText(linha, W / 2, y);
    y += 76;
  }

  y += 16;
  ctx.fillStyle = "#C4B89A";
  ctx.font = "500 36px system-ui, -apple-system, sans-serif";
  const igreja = opcoes?.nomeIgreja?.trim();
  if (igreja) {
    ctx.fillText(igreja, W / 2, y);
    y += 52;
  }
  if (evento.dataInicio) {
    ctx.fillText(formatarDataHoraEvento(evento.dataInicio), W / 2, y);
    y += 52;
  }
  if (evento.local?.trim()) {
    ctx.fillText(evento.local.trim(), W / 2, y);
    y += 52;
  }

  if (evento.inscricoesAbertas && !evento.inscricoesEncerradas && !evento.lotado) {
    y += 28;
    ctx.fillStyle = "#7BA56A";
    roundRect(ctx, W / 2 - 220, y - 44, 440, 72, 36);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 32px system-ui, -apple-system, sans-serif";
    ctx.fillText("Inscrições pelo app", W / 2, y);
  }

  ctx.fillStyle = "rgba(245,240,230,0.55)";
  ctx.font = "500 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("Semear · Minha Igreja Digital", W / 2, H - 80);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92),
  );
  if (!blob) return null;
  return new File([blob], `evento-${evento.id}-stories.jpg`, { type: "image/jpeg" });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
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

  // Preferência: só texto + prévia OG (mais limpo no WhatsApp).
  // Se o dispositivo permitir, ainda oferece imagem+texto via share sheet.
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
 * Instagram: uma ação só — abre o share sheet com arte vertical 9:16.
 * Stories / Feed / Mensagem ficam a cargo do Instagram.
 */
export async function compartilharEventoInstagram(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"compartilhado" | "baixado"> {
  const legenda = montarLegendaInstagram(evento, opcoes);
  const arte =
    (await gerarArteInstagramEvento(evento, opcoes)) ?? (await obterArquivoBanner(evento));

  if (
    arte &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [arte] })
  ) {
    try {
      await navigator.share({
        files: [arte],
        title: evento.titulo,
        text: legenda,
      });
      await copiarTexto(legenda);
      return "compartilhado";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
    }
  }

  if (arte) {
    baixarArquivo(arte);
  }
  await copiarTexto(legenda);
  return "baixado";
}

/** @deprecated use compartilharEventoInstagram */
export async function compartilharEventoInstagramStories(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"compartilhado" | "baixado"> {
  return compartilharEventoInstagram(evento, opcoes);
}

/** @deprecated use compartilharEventoInstagram */
export async function compartilharEventoInstagramFeed(
  evento: EventoDTO,
  opcoes?: { nomeIgreja?: string },
): Promise<"compartilhado" | "baixado"> {
  return compartilharEventoInstagram(evento, opcoes);
}
