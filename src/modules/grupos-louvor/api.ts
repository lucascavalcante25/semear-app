import { requisicaoApi } from "@/modules/api/client";

export type GrupoLouvorDTO = {
  id?: number;
  nome: string;
  ordem: number;
  louvorIds: number[];
};

export type GrupoLouvorApp = {
  id: string;
  idNum: number;
  name: string;
  ordem: number;
  louvorIds: string[];
};

const mapearGrupo = (dto: GrupoLouvorDTO): GrupoLouvorApp => ({
  id: String(dto.id ?? ""),
  idNum: dto.id ?? 0,
  name: dto.nome,
  ordem: dto.ordem ?? 0,
  louvorIds: (dto.louvorIds ?? []).map((id) => String(id)),
});

export const listarGrupos = async (): Promise<GrupoLouvorApp[]> => {
  const lista = await requisicaoApi<GrupoLouvorDTO[]>("/api/grupos-louvor", { auth: true });
  return (lista ?? []).map(mapearGrupo);
};

export const obterGrupo = async (id: number): Promise<GrupoLouvorApp> => {
  const dto = await requisicaoApi<GrupoLouvorDTO>(`/api/grupos-louvor/${id}`, { auth: true });
  return mapearGrupo(dto);
};

export const criarGrupo = async (nome: string): Promise<GrupoLouvorApp> => {
  const dto = await requisicaoApi<GrupoLouvorDTO>("/api/grupos-louvor", {
    method: "POST",
    body: JSON.stringify({ nome: nome.trim(), ordem: 0, louvorIds: [] }),
    auth: true,
  });
  return mapearGrupo(dto);
};

export const atualizarGrupo = async (id: number, nome: string): Promise<GrupoLouvorApp> => {
  const dto = await requisicaoApi<GrupoLouvorDTO>(`/api/grupos-louvor/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id, nome: nome.trim(), ordem: 0, louvorIds: [] }),
    auth: true,
  });
  return mapearGrupo(dto);
};

export const excluirGrupo = async (id: number): Promise<void> => {
  await requisicaoApi(`/api/grupos-louvor/${id}`, { method: "DELETE", auth: true });
};

export const adicionarLouvorAoGrupo = async (
  grupoId: number,
  louvorId: number
): Promise<GrupoLouvorApp> => {
  const dto = await requisicaoApi<GrupoLouvorDTO>(
    `/api/grupos-louvor/${grupoId}/louvores/${louvorId}`,
    { method: "POST", auth: true }
  );
  return mapearGrupo(dto);
};

export const removerLouvorDoGrupo = async (
  grupoId: number,
  louvorId: number
): Promise<GrupoLouvorApp | null> => {
  const dto = await requisicaoApi<GrupoLouvorDTO | undefined>(
    `/api/grupos-louvor/${grupoId}/louvores/${louvorId}`,
    { method: "DELETE", auth: true }
  );
  return dto ? mapearGrupo(dto) : null;
};

export const reordenarLouvoresNoGrupo = async (
  grupoId: number,
  louvorIdsInOrder: number[]
): Promise<GrupoLouvorApp> => {
  const dto = await requisicaoApi<GrupoLouvorDTO>(
    `/api/grupos-louvor/${grupoId}/ordem`,
    {
      method: "PUT",
      body: JSON.stringify(louvorIdsInOrder),
      auth: true,
    }
  );
  return mapearGrupo(dto);
};
