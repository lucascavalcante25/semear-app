import { requisicaoApi, URL_BASE_API } from "@/modules/api/client";

export type TipoLouvorApi = "JUBILO" | "ADORACAO" | "CEIA";

export type LouvorDTO = {
  id?: number;
  titulo: string;
  artista: string;
  tonalidade?: string | null;
  tempo?: string | null;
  tipo: TipoLouvorApi;
  youtubeUrl?: string | null;
  cifraUrl?: string | null;
  cifraConteudo?: string | null;
  cifraFileName?: string | null;
  cifraContentType?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LouvorApp = {
  id: string;
  idNum?: number;
  title: string;
  artist: string;
  key: string;
  tempo?: string;
  type: "jubilo" | "adoracao" | "ceia";
  youtubeUrl?: string;
  cifraFileName?: string;
  hasCifra: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

const mapTipo = (tipo: TipoLouvorApi): LouvorApp["type"] => {
  if (tipo === "JUBILO") return "jubilo";
  if (tipo === "ADORACAO") return "adoracao";
  return "ceia";
};

const mapTipoToApi = (tipo: LouvorApp["type"]): TipoLouvorApi => {
  if (tipo === "jubilo") return "JUBILO";
  if (tipo === "adoracao") return "ADORACAO";
  return "CEIA";
};

export const mapearLouvor = (dto: LouvorDTO): LouvorApp => ({
  id: String(dto.id ?? ""),
  idNum: dto.id,
  title: dto.titulo,
  artist: dto.artista,
  key: dto.tonalidade ?? "",
  tempo: dto.tempo ?? undefined,
  type: mapTipo(dto.tipo),
  youtubeUrl: dto.youtubeUrl ?? undefined,
  cifraFileName: dto.cifraFileName ?? undefined,
  hasCifra: Boolean(dto.cifraFileName),
  isActive: dto.ativo ?? true,
  notes: dto.observacoes ?? undefined,
  createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
  updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
});

export const listarLouvores = async (query?: string): Promise<LouvorApp[]> => {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  const lista = await requisicaoApi<LouvorDTO[]>(`/api/louvores${params}`, { auth: true });
  return (lista ?? []).map(mapearLouvor);
};

export const obterLouvor = async (id: number): Promise<LouvorApp> => {
  const dto = await requisicaoApi<LouvorDTO>(`/api/louvores/${id}`, { auth: true });
  return mapearLouvor(dto);
};

export const criarLouvor = async (
  louvor: Omit<LouvorApp, "id" | "idNum" | "hasCifra" | "createdAt" | "updatedAt">,
  cifraFile?: File | null
): Promise<LouvorApp> => {
  const body: Partial<LouvorDTO> = {
    titulo: louvor.title.trim(),
    artista: louvor.artist.trim(),
    tonalidade: louvor.key || null,
    tempo: louvor.tempo || null,
    tipo: mapTipoToApi(louvor.type),
    youtubeUrl: louvor.youtubeUrl?.trim() || null,
    observacoes: louvor.notes?.trim() || null,
    ativo: louvor.isActive ?? true,
  };

  if (cifraFile) {
    const form = new FormData();
    form.append("louvor", new Blob([JSON.stringify(body)], { type: "application/json" }));
    form.append("cifra", cifraFile);
    const created = await requisicaoApi<LouvorDTO>("/api/louvores/com-cifra", {
      method: "POST",
      body: form,
      auth: true,
    });
    return mapearLouvor(created);
  }

  const created = await requisicaoApi<LouvorDTO>("/api/louvores", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearLouvor(created);
};

export const atualizarLouvor = async (
  id: number,
  louvor: Omit<LouvorApp, "id" | "idNum" | "hasCifra" | "createdAt" | "updatedAt">
): Promise<LouvorApp> => {
  const body: LouvorDTO = {
    id,
    titulo: louvor.title.trim(),
    artista: louvor.artist.trim(),
    tonalidade: louvor.key || null,
    tempo: louvor.tempo || null,
    tipo: mapTipoToApi(louvor.type),
    youtubeUrl: louvor.youtubeUrl?.trim() || null,
    observacoes: louvor.notes?.trim() || null,
    ativo: louvor.isActive ?? true,
  };
  const updated = await requisicaoApi<LouvorDTO>(`/api/louvores/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearLouvor(updated);
};

export const atualizarCifraLouvor = async (id: number, cifraFile: File): Promise<LouvorApp> => {
  const form = new FormData();
  form.append("cifra", cifraFile);
  const updated = await requisicaoApi<LouvorDTO>(`/api/louvores/${id}/cifra`, {
    method: "PUT",
    body: form,
    auth: true,
  });
  return mapearLouvor(updated);
};

export const excluirLouvor = async (id: number) => {
  await requisicaoApi(`/api/louvores/${id}`, { method: "DELETE", auth: true });
};

/** URL para download/visualização da cifra (requer auth via header) */
export const urlCifraLouvor = (id: number): string => {
  if (!URL_BASE_API) return "#";
  const base = URL_BASE_API.replace(/\/$/, "");
  return `${base}/api/louvores/${id}/cifra`;
};

/** Abre a cifra em nova aba (usa fetch com auth para visualizar PDF/Word) */
export const abrirCifra = async (id: number) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("semear.token") : null;
  const url = urlCifraLouvor(id);
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Não foi possível carregar a cifra.");
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank", "noopener,noreferrer");
  URL.revokeObjectURL(blobUrl);
};

/** Baixa a cifra (usa fetch com auth) */
export const baixarCifra = async (id: number, filename = "cifra.pdf") => {
  const token = typeof window !== "undefined" ? localStorage.getItem("semear.token") : null;
  const url = urlCifraLouvor(id);
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Não foi possível baixar a cifra.");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

