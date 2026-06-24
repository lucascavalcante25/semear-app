import { requisicaoApi } from "@/modules/api/client";

export type DepartamentoMembroDTO = {
  id?: number;
  departamentoId?: number;
  userId: number;
  userNome?: string;
  funcao?: string | null;
};

export type DepartamentoDTO = {
  id?: number;
  nome: string;
  descricao?: string | null;
  codigo?: "PORTARIA" | "RECEPCAO" | "LIMPEZA" | "OUTRO" | null;
  orientacoesServico?: string | null;
  liderId?: number | null;
  liderNome?: string | null;
  membros?: DepartamentoMembroDTO[];
  ativo?: boolean;
  criadoEm?: string;
};

const paramsListagem = () => {
  const p = new URLSearchParams();
  p.set("page", "0");
  p.set("size", "500");
  p.set("sort", "nome,asc");
  return p.toString();
};

export const listarDepartamentos = () =>
  requisicaoApi<DepartamentoDTO[]>(`/api/departamentos?${paramsListagem()}`, { auth: true });

export const obterDepartamento = (id: number) =>
  requisicaoApi<DepartamentoDTO>(`/api/departamentos/${id}`, { auth: true });

export const criarDepartamento = (body: DepartamentoDTO) =>
  requisicaoApi<DepartamentoDTO>("/api/departamentos", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });

export const atualizarDepartamento = (id: number, body: DepartamentoDTO) =>
  requisicaoApi<DepartamentoDTO>(`/api/departamentos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  });

export const excluirDepartamento = (id: number) =>
  requisicaoApi<void>(`/api/departamentos/${id}`, { method: "DELETE", auth: true });

export const adicionarMembroDepartamento = (departamentoId: number, userId: number, funcao?: string) =>
  requisicaoApi<DepartamentoMembroDTO>(`/api/departamentos/${departamentoId}/membros`, {
    method: "POST",
    auth: true,
    body: JSON.stringify({ userId, funcao }),
  });

export const removerMembroDepartamento = (departamentoId: number, userId: number) =>
  requisicaoApi<void>(`/api/departamentos/${departamentoId}/membros/${userId}`, {
    method: "DELETE",
    auth: true,
  });
