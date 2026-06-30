import { requisicaoApi } from "@/modules/api/client";

export type NivelAcessoModulo = "READ" | "WRITE";

export type ModuloPermissao = {
  modulo: string;
  nivel: NivelAcessoModulo;
};

export type IgrejaCargo = {
  id?: number;
  codigo?: string;
  nome: string;
  descricao?: string;
  sistema?: boolean;
  ordem?: number;
  modulos: ModuloPermissao[];
};

export const listarCargos = async (): Promise<IgrejaCargo[]> =>
  requisicaoApi<IgrejaCargo[]>("/api/igreja/cargos", { auth: true });

export const criarCargo = async (cargo: IgrejaCargo): Promise<IgrejaCargo> =>
  requisicaoApi<IgrejaCargo>("/api/igreja/cargos", {
    method: "POST",
    body: JSON.stringify(cargo),
    auth: true,
  });

export const atualizarCargo = async (id: number, cargo: IgrejaCargo): Promise<IgrejaCargo> =>
  requisicaoApi<IgrejaCargo>(`/api/igreja/cargos/${id}`, {
    method: "PUT",
    body: JSON.stringify(cargo),
    auth: true,
  });

export const excluirCargo = async (id: number): Promise<void> =>
  requisicaoApi(`/api/igreja/cargos/${id}`, { method: "DELETE", auth: true });
