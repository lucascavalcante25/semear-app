/** Extrai o ID de vídeo de URLs comuns do YouTube. */
export function extrairIdYoutube(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const raw = url.trim();

  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host.endsWith("youtube.com") || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const partes = u.pathname.split("/").filter(Boolean);
      const embedIdx = partes.findIndex((p) => p === "embed" || p === "shorts" || p === "live" || p === "v");
      if (embedIdx >= 0 && partes[embedIdx + 1] && /^[\w-]{11}$/.test(partes[embedIdx + 1])) {
        return partes[embedIdx + 1];
      }
    }
  } catch {
    // fallback regex abaixo
  }

  const m =
    raw.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/) ??
    raw.match(/[?&]v=([\w-]{11})/);
  return m?.[1] ?? null;
}

export function urlEmbedYoutube(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
