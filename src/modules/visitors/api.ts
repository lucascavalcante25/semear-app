import { requisicaoApi } from "@/modules/api/client";

export type FormaChegadaVisitante = "SOZINHO" | "COM_ALGUEM" | "CONVIDADO";

export type VisitanteDTO = {
  id?: number;
  nome: string;
  telefone?: string | null;
  dataVisita: string; // yyyy-mm-dd
  comoConheceu?: string | null;
  observacoes?: string | null;
  formaChegada?: FormaChegadaVisitante | null;
  acompanhanteNome?: string | null;
  igrejaOrigem?: string | null;
  convidadoPor?: string | null;
  criadoEm?: string;
  criadoPor?: string | null;
  atualizadoEm?: string | null;
  atualizadoPor?: string | null;
};

export type VisitanteApp = {
  id: string;
  name: string;
  phone?: string;
  visitDate: Date;
  howHeard?: string;
  notes?: string;
  arrivalType?: FormaChegadaVisitante;
  companionName?: string;
  churchOrigin?: string;
  invitedBy?: string;
  createdAt: Date;
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

export const mapearVisitante = (dto: VisitanteDTO): VisitanteApp => ({
  id: String(dto.id ?? dto.nome),
  name: dto.nome,
  phone: dto.telefone ?? undefined,
  visitDate: toDateLocal(dto.dataVisita),
  howHeard: dto.comoConheceu ?? undefined,
  notes: dto.observacoes ?? undefined,
  arrivalType: dto.formaChegada ?? undefined,
  companionName: dto.acompanhanteNome ?? undefined,
  churchOrigin: dto.igrejaOrigem ?? undefined,
  invitedBy: dto.convidadoPor ?? undefined,
  createdAt: dto.criadoEm ? new Date(dto.criadoEm) : new Date(),
});

/** Texto amigável sobre como o visitante chegou (dashboard e listagem). */
export function textoFormaChegada(visitante: VisitanteApp): string | undefined {
  if (!visitante.arrivalType) return undefined;

  if (visitante.arrivalType === "SOZINHO") {
    return "Veio sozinho(a)";
  }
  if (visitante.arrivalType === "COM_ALGUEM") {
    return visitante.companionName
      ? `Veio com ${visitante.companionName}`
      : "Veio acompanhado(a)";
  }
  if (visitante.arrivalType === "CONVIDADO") {
    const partes = ["De outra igreja"];
    if (visitante.churchOrigin) {
      partes.push(`(${visitante.churchOrigin})`);
    }
    if (visitante.invitedBy) {
      partes.push(`— convidado(a) por ${visitante.invitedBy}`);
    }
    return partes.join(" ");
  }
  return undefined;
}

export const listarVisitantes = async (): Promise<VisitanteApp[]> => {
  const params = new URLSearchParams();
  params.set("page", "0");
  params.set("size", "500");
  params.set("sort", "dataVisita,desc");
  const lista = await requisicaoApi<VisitanteDTO[]>(`/api/visitantes?${params.toString()}`, { auth: true });
  return (lista ?? []).map(mapearVisitante);
};

/** Retorna visitantes cuja data da visita é hoje */
export const listarVisitantesDoDia = async (): Promise<VisitanteApp[]> => {
  const todos = await listarVisitantes();
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = hoje.getMonth();
  const dd = hoje.getDate();
  return todos.filter((v) => {
    const d = v.visitDate;
    return d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd;
  });
};

export type CriarVisitantePayload = {
  nome: string;
  dataVisita?: string; // yyyy-mm-dd
  comoConheceu?: string;
  observacoes?: string;
  formaChegada?: FormaChegadaVisitante;
  acompanhanteNome?: string;
  igrejaOrigem?: string;
  convidadoPor?: string;
};

const montarCamposChegada = (payload: {
  formaChegada?: FormaChegadaVisitante;
  acompanhanteNome?: string;
  igrejaOrigem?: string;
  convidadoPor?: string;
}): Pick<VisitanteDTO, "formaChegada" | "acompanhanteNome" | "igrejaOrigem" | "convidadoPor"> => {
  if (!payload.formaChegada) {
    return {
      formaChegada: null,
      acompanhanteNome: null,
      igrejaOrigem: null,
      convidadoPor: null,
    };
  }
  if (payload.formaChegada === "SOZINHO") {
    return {
      formaChegada: "SOZINHO",
      acompanhanteNome: null,
      igrejaOrigem: null,
      convidadoPor: null,
    };
  }
  if (payload.formaChegada === "COM_ALGUEM") {
    return {
      formaChegada: "COM_ALGUEM",
      acompanhanteNome: payload.acompanhanteNome?.trim() || null,
      igrejaOrigem: null,
      convidadoPor: null,
    };
  }
  return {
    formaChegada: "CONVIDADO",
    acompanhanteNome: null,
    igrejaOrigem: payload.igrejaOrigem?.trim() || null,
    convidadoPor: payload.convidadoPor?.trim() || null,
  };
};

export const criarVisitante = async (payload: CriarVisitantePayload): Promise<VisitanteApp> => {
  const hoje = new Date();
  const yyyy = hoje.getFullYear();
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  const dd = String(hoje.getDate()).padStart(2, "0");
  const body: Partial<VisitanteDTO> = {
    nome: payload.nome.trim(),
    dataVisita: payload.dataVisita || `${yyyy}-${mm}-${dd}`,
    comoConheceu: payload.comoConheceu?.trim() || undefined,
    observacoes: payload.observacoes?.trim() || undefined,
    ...montarCamposChegada(payload),
  };
  const created = await requisicaoApi<VisitanteDTO>("/api/visitantes", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearVisitante(created);
};

export type AtualizarVisitantePayload = VisitanteDTO;

export const atualizarVisitante = async (payload: AtualizarVisitantePayload): Promise<VisitanteApp> => {
  if (!payload.id) {
    throw new Error("ID do visitante é obrigatório.");
  }
  const updated = await requisicaoApi<VisitanteDTO>(`/api/visitantes/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    auth: true,
  });
  return mapearVisitante(updated);
};

export const excluirVisitante = async (id: number): Promise<void> => {
  await requisicaoApi(`/api/visitantes/${id}`, { method: "DELETE", auth: true });
};
