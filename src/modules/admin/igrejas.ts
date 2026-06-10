import { requisicaoApi } from "@/modules/api/client";
import type { IgrejaConfiguracao, StatusIgreja } from "@/modules/igreja/api";

export type FiltrosIgrejas = {
  nome?: string;
  cnpj?: string;
  cidade?: string;
  status?: StatusIgreja;
};

export async function listarIgrejasAdmin(filtros: FiltrosIgrejas = {}): Promise<IgrejaConfiguracao[]> {
  const params = new URLSearchParams();
  if (filtros.nome?.trim()) params.set("nome", filtros.nome.trim());
  if (filtros.cnpj?.trim()) params.set("cnpj", filtros.cnpj.trim());
  if (filtros.cidade?.trim()) params.set("cidade", filtros.cidade.trim());
  if (filtros.status) params.set("status", filtros.status);
  const q = params.toString();
  return requisicaoApi<IgrejaConfiguracao[]>(`/api/admin/igrejas${q ? `?${q}` : ""}`, { auth: true });
}

export async function ativarIgreja(id: number): Promise<IgrejaConfiguracao> {
  return requisicaoApi<IgrejaConfiguracao>(`/api/admin/igrejas/${id}/ativar`, { method: "PATCH", auth: true });
}

export async function inativarIgreja(id: number): Promise<IgrejaConfiguracao> {
  return requisicaoApi<IgrejaConfiguracao>(`/api/admin/igrejas/${id}/inativar`, { method: "PATCH", auth: true });
}

export async function colocarIgrejaEmTeste(id: number): Promise<IgrejaConfiguracao> {
  return requisicaoApi<IgrejaConfiguracao>(`/api/admin/igrejas/${id}/teste`, { method: "PATCH", auth: true });
}
