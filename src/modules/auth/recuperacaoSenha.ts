import { requisicaoApi } from "@/modules/api/client";

export type CanalRecuperacao = "EMAIL" | "SMS";

export type RespostaRecuperacao = {
  mensagem: string;
  canal?: CanalRecuperacao;
  destinoMascarado?: string;
  codigoEnviado: boolean;
};

export async function iniciarRecuperacaoSenha(cpf: string): Promise<RespostaRecuperacao> {
  return requisicaoApi<RespostaRecuperacao>("/api/recuperacao-senha/iniciar", {
    method: "POST",
    body: { cpf },
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
