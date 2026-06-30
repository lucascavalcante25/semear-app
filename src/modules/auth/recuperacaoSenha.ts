import { requisicaoApi } from "@/modules/api/client";

export type CanalRecuperacao = "PUSH" | "SMS" | "EMAIL";

export type RespostaRecuperacao = {
  mensagem: string;
  canal?: CanalRecuperacao;
  destinoMascarado?: string;
  codigoEnviado: boolean;
};

export type OpcoesRecuperacao = {
  mensagem: string;
  podeRecuperar: boolean;
  pushDisponivel: boolean;
  dispositivosPushAtivos?: number;
  emailDisponivel: boolean;
  smsDisponivel: boolean;
  escolhaNecessaria: boolean;
  emailMascarado?: string;
  telefoneMascarado?: string;
};

export async function consultarOpcoesRecuperacao(cpf: string): Promise<OpcoesRecuperacao> {
  return requisicaoApi<OpcoesRecuperacao>("/api/recuperacao-senha/opcoes", {
    method: "POST",
    body: { cpf },
  });
}

export async function iniciarRecuperacaoSenha(
  cpf: string,
  canal?: CanalRecuperacao,
): Promise<RespostaRecuperacao> {
  return requisicaoApi<RespostaRecuperacao>("/api/recuperacao-senha/iniciar", {
    method: "POST",
    body: canal ? { cpf, canal } : { cpf },
  });
}

export async function validarCodigoRecuperacao(cpf: string, codigo: string): Promise<RespostaRecuperacao> {
  return requisicaoApi<RespostaRecuperacao>("/api/recuperacao-senha/validar", {
    method: "POST",
    body: { cpf, codigo },
  });
}

export async function concluirRecuperacaoSenha(
  cpf: string,
  codigo: string,
  novaSenha: string,
): Promise<RespostaRecuperacao> {
  return requisicaoApi<RespostaRecuperacao>("/api/recuperacao-senha/concluir", {
    method: "POST",
    body: { cpf, codigo, novaSenha },
  });
}
