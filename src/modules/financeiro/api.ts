import { requisicaoApi } from "@/modules/api/client";

export type TipoLancamentoApi = "INCOME" | "EXPENSE";

export type LancamentoDTO = {
  id?: number;
  tipo: TipoLancamentoApi;
  categoria: string;
  descricao: string;
  valor: number;
  dataLancamento: string; // yyyy-mm-dd
  metodoPagamento?: string | null;
  referencia?: string | null;
  observacoes?: string | null;
  criadoEm?: string;
  criadoPor?: string;
  atualizadoEm?: string | null;
  atualizadoPor?: string | null;
};

export type LancamentoApp = {
  id: string;
  idNum?: number;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: Date;
  paymentMethod?: "cash" | "pix" | "card" | "transfer";
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

const mapTipo = (tipo: TipoLancamentoApi): LancamentoApp["type"] =>
  tipo === "INCOME" ? "income" : "expense";

const mapTipoToApi = (type: LancamentoApp["type"]): TipoLancamentoApi =>
  type === "income" ? "INCOME" : "EXPENSE";

const mapMetodo = (m?: string | null): LancamentoApp["paymentMethod"] | undefined => {
  if (!m) return undefined;
  const lower = m.toLowerCase();
  if (lower === "cash" || lower === "dinheiro") return "cash";
  if (lower === "pix") return "pix";
  if (lower === "card" || lower === "cartao") return "card";
  if (lower === "transfer" || lower === "transferencia") return "transfer";
  return undefined;
};

const mapMetodoToApi = (m?: LancamentoApp["paymentMethod"]): string | null => {
  if (!m) return null;
  return m;
};

export const mapearLancamento = (dto: LancamentoDTO): LancamentoApp => ({
  id: String(dto.id ?? ""),
  idNum: dto.id,
  type: mapTipo(dto.tipo),
  category: dto.categoria,
  description: dto.descricao,
  amount: Number(dto.valor),
  date: toDateLocal(dto.dataLancamento),
  paymentMethod: mapMetodo(dto.metodoPagamento),
  reference: dto.referencia ?? undefined,
  notes: dto.observacoes ?? undefined,
  createdAt: dto.criadoEm ? new Date(dto.criadoEm) : new Date(),
  createdBy: dto.criadoPor ?? "Sistema",
});

export const listarLancamentos = async (tipo?: "income" | "expense"): Promise<LancamentoApp[]> => {
  const params = new URLSearchParams();
  if (tipo) params.set("tipo", tipo === "income" ? "INCOME" : "EXPENSE");
  const url = params.toString() ? `/api/lancamentos?${params}` : "/api/lancamentos";
  const lista = await requisicaoApi<LancamentoDTO[]>(url, { auth: true });
  return (lista ?? []).map(mapearLancamento);
};

export const criarLancamento = async (
  lancamento: Omit<LancamentoApp, "id" | "idNum" | "createdAt" | "createdBy">
) => {
  const body: Partial<LancamentoDTO> = {
    tipo: mapTipoToApi(lancamento.type),
    categoria: lancamento.category,
    descricao: lancamento.description.trim(),
    valor: lancamento.amount,
    dataLancamento: lancamento.date.toISOString().slice(0, 10),
    metodoPagamento: mapMetodoToApi(lancamento.paymentMethod),
    referencia: lancamento.reference ?? null,
    observacoes: lancamento.notes ?? null,
  };
  const created = await requisicaoApi<LancamentoDTO>("/api/lancamentos", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearLancamento(created);
};

export const atualizarLancamento = async (lancamento: LancamentoApp) => {
  const id = lancamento.idNum ?? Number(lancamento.id);
  if (!id) throw new Error("ID do lançamento é obrigatório.");
  const body: LancamentoDTO = {
    id,
    tipo: mapTipoToApi(lancamento.type),
    categoria: lancamento.category,
    descricao: lancamento.description.trim(),
    valor: lancamento.amount,
    dataLancamento: lancamento.date.toISOString().slice(0, 10),
    metodoPagamento: mapMetodoToApi(lancamento.paymentMethod),
    referencia: lancamento.reference ?? null,
    observacoes: lancamento.notes ?? null,
  };
  const updated = await requisicaoApi<LancamentoDTO>(`/api/lancamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
    auth: true,
  });
  return mapearLancamento(updated);
};

export const excluirLancamento = async (id: number) => {
  await requisicaoApi(`/api/lancamentos/${id}`, { method: "DELETE", auth: true });
};
