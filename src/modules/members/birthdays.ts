import { requisicaoApi } from "@/modules/api/client";

export type AniversarianteApi = {
  id: number;
  name: string;
  birthDate: string; // yyyy-mm-dd (próximo aniversário)
  imageUrl?: string | null;
};

export type AniversarianteApp = {
  id: string;
  name: string;
  date: Date;
  photoUrl?: string;
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

export const listarAniversariantes = async (days = 7): Promise<AniversarianteApp[]> => {
  const params = new URLSearchParams();
  params.set("days", String(days));
  const lista = await requisicaoApi<AniversarianteApi[]>(`/api/membros/aniversariantes?${params.toString()}`, { auth: true });
  return (lista ?? []).map((a) => ({
    id: String(a.id),
    name: a.name,
    date: toDateLocal(a.birthDate),
    photoUrl: a.imageUrl ?? undefined,
  }));
};

