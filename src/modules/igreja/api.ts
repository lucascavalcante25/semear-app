import { requisicaoApi, URL_BASE_API } from "@/modules/api/client";

export function resolverUrlLogo(logoUrl?: string): string {
  if (!logoUrl) return "/logo-semear.png";
  if (logoUrl.startsWith("/api/") && URL_BASE_API) {
    return `${URL_BASE_API}${logoUrl}`;
  }
  return logoUrl;
}

export type TipoChavePix = "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "CHAVE_ALEATORIA";
export type TemaPreferido = "SISTEMA" | "CLARO" | "ESCURO";
export type StatusIgreja = "ATIVA" | "INATIVA" | "EM_TESTE";

export type IgrejaConfiguracao = {
  id?: number;
  nome?: string;
  nomeFantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;
  nomePastorResponsavel?: string;
  cpfPastorResponsavel?: string;
  telefoneResponsavel?: string;
  emailResponsavel?: string;
  chavePix?: string;
  tipoChavePix?: TipoChavePix;
  nomeTitularPix?: string;
  bancoPix?: string;
  documentoTitularPix?: string;
  logoUrl?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  temaPreferido?: TemaPreferido;
  textoBoasVindas?: string;
  descricaoIgreja?: string;
  textoAgradecimentoOferta?: string;
  status?: StatusIgreja;
};

export type IgrejaPublica = Pick<
  IgrejaConfiguracao,
  | "id"
  | "nome"
  | "nomeFantasia"
  | "logoUrl"
  | "corPrimaria"
  | "corSecundaria"
  | "temaPreferido"
  | "textoBoasVindas"
  | "descricaoIgreja"
  | "cidade"
  | "estado"
>;

export type IgrejaPix = Pick<
  IgrejaConfiguracao,
  | "nome"
  | "nomeFantasia"
  | "cnpj"
  | "logoUrl"
  | "chavePix"
  | "tipoChavePix"
  | "nomeTitularPix"
  | "bancoPix"
  | "documentoTitularPix"
  | "textoAgradecimentoOferta"
  | "cidade"
>;

export async function obterConfiguracaoPublica(): Promise<IgrejaPublica | null> {
  try {
    return await requisicaoApi<IgrejaPublica>("/api/igreja-configuracao/publica");
  } catch {
    return null;
  }
}

export async function obterIgrejaAtual(): Promise<IgrejaConfiguracao | null> {
  try {
    return await requisicaoApi<IgrejaConfiguracao>("/api/igreja/atual", { auth: true });
  } catch {
    return null;
  }
}

export async function obterPixIgreja(): Promise<IgrejaPix | null> {
  try {
    return await requisicaoApi<IgrejaPix>("/api/igreja/pix", { auth: true });
  } catch {
    return null;
  }
}

export async function atualizarIgrejaAtual(dados: Partial<IgrejaConfiguracao>): Promise<IgrejaConfiguracao> {
  return requisicaoApi<IgrejaConfiguracao>("/api/igreja/atual", {
    auth: true,
    method: "PUT",
    body: dados,
  });
}

export async function atualizarPixIgreja(dados: Partial<IgrejaPix>): Promise<IgrejaPix> {
  return requisicaoApi<IgrejaPix>("/api/igreja/pix", {
    auth: true,
    method: "PUT",
    body: dados,
  });
}

export async function atualizarIdentidadeVisual(dados: Partial<IgrejaConfiguracao>): Promise<IgrejaConfiguracao> {
  return requisicaoApi<IgrejaConfiguracao>("/api/igreja/identidade-visual", {
    auth: true,
    method: "PUT",
    body: dados,
  });
}

export async function uploadLogoIgreja(arquivo: File): Promise<IgrejaConfiguracao> {
  const form = new FormData();
  form.append("file", arquivo);
  return requisicaoApi<IgrejaConfiguracao>("/api/igreja/logo", {
    auth: true,
    method: "POST",
    body: form,
  });
}
