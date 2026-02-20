import { API_ATIVA, requisicaoApi } from "@/modules/api/client";
import { type Role } from "@/auth/permissions";

export type EnderecoPayload = {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

export type SexoCadastro = "MASCULINO" | "FEMININO" | "OUTRO" | "NAO_INFORMADO";

export type StatusCadastro = "PRIMEIROACESSO" | "PENDENTE" | "APROVADO" | "REJEITADO";

export type PreCadastroPayload = {
  nomeCompleto: string;
  email: string;
  telefone: string;
  telefoneSecundario: string;
  telefoneEmergencia: string;
  nomeContatoEmergencia: string;
  cpf: string;
  sexo: SexoCadastro;
  dataNascimento: string;
  senha: string;
  perfilSolicitado: Role;
  observacoes?: string;
  endereco: EnderecoPayload;
};

const CHAVE_STORAGE = "semear.preCadastro";

type PreCadastroLocal = PreCadastroPayload & {
  id: string;
  login: string;
  status: StatusCadastro;
  perfilAprovado?: Role;
  criadoEm: string;
  atualizadoEm?: string;
};

const normalizarCpf = (value: string) => value.replace(/\D/g, "");

const normalizarEmail = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace("@semeare.com", "@semear.com")
    .replace("@semear.com.br", "@semear.com");

const mapearPerfilParaApi = (perfil: Role) => {
  const mapa: Record<Role, string> = {
    admin: "ADMIN",
    pastor: "PASTOR",
    secretaria: "SECRETARIA",
    tesouraria: "TESOURARIA",
    lider: "LIDER",
    membro: "MEMBRO",
    visitante: "VISITANTE",
  };
  return mapa[perfil] ?? "MEMBRO";
};

const lerLocal = (): PreCadastroLocal[] => {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(CHAVE_STORAGE);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as PreCadastroLocal[];
  } catch {
    return [];
  }
};

const salvarLocal = (items: PreCadastroLocal[]) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(items));
};

const criarConsultaStatus = (campo: "cpf" | "email", valor: string) => {
  const params = new URLSearchParams();
  params.set(`${campo}.equals`, valor);
  return params.toString();
};

type PreCadastroApi = {
  id?: string | number;
  status?: StatusCadastro;
};

export const obterStatusCadastroPorIdentificador = async (
  identificador: string,
): Promise<StatusCadastro | null> => {
  const valor = identificador.trim();
  if (!valor) {
    return null;
  }
  const isEmail = valor.includes("@");
  const campo = isEmail ? "email" : "cpf";
  const normalizado = isEmail ? normalizarEmail(valor) : normalizarCpf(valor);

  if (API_ATIVA) {
    try {
      const query = criarConsultaStatus(campo, normalizado);
      const response = await requisicaoApi<PreCadastroApi[]>(
        `/api/pre-cadastros?${query}`,
      );
      const match = response?.[0];
      return match?.status ?? null;
    } catch {
      return null;
    }
  }

  const locais = lerLocal();
  const match = locais.find((item) =>
    campo === "email"
      ? normalizarEmail(item.email) === normalizado
      : normalizarCpf(item.cpf) === normalizado,
  );
  return match?.status ?? null;
};

export const listarPreCadastrosPorStatus = async (status: StatusCadastro) => {
  if (API_ATIVA) {
    const params = new URLSearchParams();
    params.set("status.equals", status);
    return requisicaoApi<PreCadastroApi[]>(`/api/pre-cadastros?${params.toString()}`, {
      auth: true,
    });
  }
  return lerLocal().filter((item) => item.status === status);
};

export type PreCadastroCompleto = PreCadastroApi & {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  telefoneSecundario?: string;
  telefoneEmergencia?: string;
  nomeContatoEmergencia?: string;
  cpf?: string;
  sexo?: string;
  dataNascimento?: string;
  perfilSolicitado?: string;
  perfilAprovado?: string;
  observacoes?: string;
  criadoEm?: string;
  endereco?: EnderecoPayload & { id?: number };
};

export const listarPreCadastrosParaAprovacao = async (): Promise<PreCadastroCompleto[]> => {
  const statusAprovacao: StatusCadastro[] = ["PRIMEIROACESSO", "PENDENTE"];
  const filtrarCpfValido = (items: PreCadastroCompleto[]) =>
    items.filter((item) => {
      const cpf = (item.cpf ?? "").replace(/\D/g, "");
      return cpf.length === 11;
    });
  if (API_ATIVA) {
    try {
      const pendentes = await requisicaoApi<PreCadastroCompleto[]>("/api/pre-cadastros/pendentes", {
        auth: true,
      });
      return filtrarCpfValido(Array.isArray(pendentes) ? pendentes : []);
    } catch {
      try {
        const todos = await requisicaoApi<PreCadastroCompleto[]>(
          "/api/pre-cadastros?page=0&size=100",
          { auth: true },
        );
        const lista = Array.isArray(todos) ? todos : [];
        return filtrarCpfValido(
          lista.filter((item) => statusAprovacao.includes((item.status ?? "") as StatusCadastro)),
        );
      } catch {
        return [];
      }
    }
  }
  return filtrarCpfValido(
    lerLocal().filter((item) => statusAprovacao.includes(item.status)) as PreCadastroCompleto[],
  );
};

export const obterPreCadastroPorId = async (id: string | number): Promise<PreCadastroCompleto | null> => {
  if (API_ATIVA) {
    try {
      return await requisicaoApi<PreCadastroCompleto>(`/api/pre-cadastros/${id}`, { auth: true });
    } catch {
      return null;
    }
  }
  const item = lerLocal().find((i) => String(i.id) === String(id));
  return item ? (item as PreCadastroCompleto) : null;
};

export const aprovarPreCadastro = async (
  id: string | number,
  perfilAprovado: Role,
  modules: string[] = [],
): Promise<void> => {
  const perfilApi = mapearPerfilParaApi(perfilAprovado);
  if (API_ATIVA) {
    await requisicaoApi(`/api/pre-cadastros/${id}/aprovar`, {
      method: "POST",
      body: JSON.stringify({ perfilAprovado: perfilApi, modules }),
      auth: true,
    });
    return;
  }
  const items = lerLocal();
  const idx = items.findIndex((i) => String(i.id) === String(id));
  if (idx >= 0) {
    items[idx] = {
      ...items[idx],
      status: "APROVADO",
      perfilAprovado,
    };
    salvarLocal(items);
  }
};

export const rejeitarPreCadastro = async (id: string | number): Promise<void> => {
  if (API_ATIVA) {
    await requisicaoApi(`/api/pre-cadastros/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        id: Number(id),
        status: "REJEITADO",
      }),
      auth: true,
    });
    return;
  }
  const items = lerLocal();
  const idx = items.findIndex((i) => String(i.id) === String(id));
  if (idx >= 0) {
    items[idx] = { ...items[idx], status: "REJEITADO" };
    salvarLocal(items);
  }
};

export const excluirPreCadastro = async (id: string | number): Promise<void> => {
  if (API_ATIVA) {
    await requisicaoApi(`/api/pre-cadastros/${id}`, {
      method: "DELETE",
      auth: true,
    });
    return;
  }
  const items = lerLocal().filter((i) => String(i.id) !== String(id));
  salvarLocal(items);
};

export const enviarPreCadastro = async (payload: PreCadastroPayload) => {
  const loginNormalizado = normalizarCpf(payload.cpf);

  if (API_ATIVA) {
    await requisicaoApi("/api/pre-cadastros", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        cpf: normalizarCpf(payload.cpf),
        email: normalizarEmail(payload.email),
        login: loginNormalizado, // login = CPF (somente digitos)
        perfilSolicitado: mapearPerfilParaApi(payload.perfilSolicitado),
        status: "PRIMEIROACESSO",
        telefoneSecundario: payload.telefoneSecundario,
        telefoneEmergencia: payload.telefoneEmergencia,
        nomeContatoEmergencia: payload.nomeContatoEmergencia,
      }),
    });
    return;
  }

  const next: PreCadastroLocal = {
    ...payload,
    cpf: normalizarCpf(payload.cpf),
    email: normalizarEmail(payload.email),
    login: loginNormalizado,
    id: `local_${Date.now()}`,
    status: "PRIMEIROACESSO",
    criadoEm: new Date().toISOString(),
  };
  const current = lerLocal();
  salvarLocal([next, ...current]);
};
