import { requisicaoApi } from "@/modules/api/client";

export type TipoLouvorApi = "JUBILO" | "ADORACAO" | "CEIA";

export type LouvorDTO = {
  id?: number;
  titulo: string;
  artista: string;
  tonalidade?: string | null;
  tempo?: string | null;
  tipo: TipoLouvorApi;
  youtubeUrl?: string | null;
  observacoes?: string | null;
  ativo: boolean;
  temLetraSalva?: boolean | null;
  temCifraApiSalva?: boolean | null;
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
  temLetraSalva: boolean;
  temCifraApiSalva: boolean;
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
  temLetraSalva: Boolean(dto.temLetraSalva),
  temCifraApiSalva: Boolean(dto.temCifraApiSalva),
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

export const listarArtistasLouvor = async (query?: string): Promise<string[]> => {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  const lista = await requisicaoApi<string[]>(`/api/louvores/artistas${params}`, { auth: true });
  return lista ?? [];
};

export const obterLouvor = async (id: number): Promise<LouvorApp> => {
  const dto = await requisicaoApi<LouvorDTO>(`/api/louvores/${id}`, { auth: true });
  return mapearLouvor(dto);
};

export const criarLouvor = async (
  louvor: Omit<LouvorApp, "id" | "idNum" | "createdAt" | "updatedAt">
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

  const created = await requisicaoApi<LouvorDTO>("/api/louvores", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearLouvor(created);
};

export const atualizarLouvor = async (
  id: number,
  louvor: Omit<LouvorApp, "id" | "idNum" | "createdAt" | "updatedAt">
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

export const excluirLouvor = async (id: number) => {
  await requisicaoApi(`/api/louvores/${id}`, { method: "DELETE", auth: true });
};

export type LouvorLetraResposta = {
  texto?: string;
  fonte?: string;
  doCache: boolean;
  disponivel: boolean;
  mensagem?: string;
  cacheEm?: string;
};

export type LouvorCifraOnlineResposta = {
  linhas?: string[];
  url?: string;
  fonte?: string;
  doCache: boolean;
  disponivel: boolean;
  mensagem?: string;
  cacheEm?: string;
};

export const obterLetraLouvor = async (id: number): Promise<LouvorLetraResposta> => {
  return requisicaoApi<LouvorLetraResposta>(`/api/louvores/${id}/letra`, { auth: true });
};

export const obterCifraOnlineLouvor = async (id: number): Promise<LouvorCifraOnlineResposta> => {
  return requisicaoApi<LouvorCifraOnlineResposta>(`/api/louvores/${id}/cifra-online`, { auth: true });
};

export const salvarLetraManualLouvor = async (id: number, texto: string): Promise<LouvorLetraResposta> => {
  return requisicaoApi<LouvorLetraResposta>(`/api/louvores/${id}/letra`, {
    method: "PUT",
    body: JSON.stringify({ texto }),
    auth: true,
  });
};

export const salvarCifraManualLouvor = async (id: number, texto: string): Promise<LouvorCifraOnlineResposta> => {
  return requisicaoApi<LouvorCifraOnlineResposta>(`/api/louvores/${id}/cifra-online`, {
    method: "PUT",
    body: JSON.stringify({ texto }),
    auth: true,
  });
};

export const atualizarTomLouvor = async (id: number, tonalidade: string | null): Promise<LouvorApp> => {
  const updated = await requisicaoApi<LouvorDTO>(`/api/louvores/${id}/tonalidade`, {
    method: "PATCH",
    body: JSON.stringify({ tonalidade: tonalidade || null }),
    auth: true,
  });
  return mapearLouvor(updated);
};

