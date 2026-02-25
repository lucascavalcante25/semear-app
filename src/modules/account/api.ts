import { requisicaoApi, URL_BASE_API } from "@/modules/api/client";

export type ContaDTO = {
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  phoneSecondary?: string | null;
  phoneEmergency?: string | null;
  nomeContatoEmergencia?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  authorities?: string[];
  modules?: string[];
};

export const obterConta = async (): Promise<ContaDTO> => {
  return requisicaoApi<ContaDTO>("/api/account", { auth: true });
};

export const atualizarConta = async (dados: {
  firstName?: string;
  lastName?: string;
  email?: string;
  birthDate?: string | null;
  langKey?: string;
  imageUrl?: string | null;
  phone?: string | null;
  phoneSecondary?: string | null;
  phoneEmergency?: string | null;
  nomeContatoEmergencia?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}): Promise<void> => {
  await requisicaoApi("/api/account", {
    method: "POST",
    body: JSON.stringify(dados),
    auth: true,
  });
};

export const uploadAvatar = async (file: File): Promise<ContaDTO> => {
  const form = new FormData();
  form.append("file", file);
  const result = await requisicaoApi<ContaDTO>("/api/account/avatar", {
    method: "POST",
    body: form,
    auth: true,
  });
  return result;
};

export const urlAvatar = (): string => {
  if (!URL_BASE_API) return "";
  const base = URL_BASE_API.replace(/\/$/, "");
  return `${base}/api/account/avatar`;
};
