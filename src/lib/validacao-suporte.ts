import { validarEmail } from "@/lib/mascara-telefone";
import { MAX_ANEXOS_SUPORTE, type TipoSolicitacaoSuporte } from "@/modules/suporte/api";

export type FormNovaSolicitacao = {
  tipo: TipoSolicitacaoSuporte | "";
  titulo: string;
  descricao: string;
  emailSolicitante: string;
  telefoneSolicitante: string;
};

export type ErrosNovaSolicitacao = Partial<Record<keyof FormNovaSolicitacao | "anexo", string>>;

export function validarNovaSolicitacao(form: FormNovaSolicitacao, anexos?: File[]): ErrosNovaSolicitacao {
  const erros: ErrosNovaSolicitacao = {};

  if (!form.tipo) {
    erros.tipo = "Selecione o tipo da solicitação.";
  }
  const titulo = form.titulo.trim();
  if (!titulo) {
    erros.titulo = "Informe o título.";
  } else if (titulo.length < 5) {
    erros.titulo = "Título deve ter ao menos 5 caracteres.";
  } else if (titulo.length > 120) {
    erros.titulo = "Título deve ter no máximo 120 caracteres.";
  }

  const descricao = form.descricao.trim();
  if (!descricao) {
    erros.descricao = "Informe a descrição.";
  } else if (descricao.length < 10) {
    erros.descricao = "Descrição deve ter ao menos 10 caracteres.";
  } else if (descricao.length > 2000) {
    erros.descricao = "Descrição deve ter no máximo 2000 caracteres.";
  }

  if (form.emailSolicitante.trim() && !validarEmail(form.emailSolicitante.trim())) {
    erros.emailSolicitante = "E-mail inválido.";
  }

  const tel = form.telefoneSolicitante.replace(/\D/g, "");
  if (tel && (tel.length < 10 || tel.length > 11)) {
    erros.telefoneSolicitante = "Telefone deve ter 10 ou 11 dígitos.";
  }

  if (anexos && anexos.length > 0) {
    if (anexos.length > MAX_ANEXOS_SUPORTE) {
      erros.anexo = `Máximo de ${MAX_ANEXOS_SUPORTE} anexos por solicitação.`;
    }
    const tipos = ["image/png", "image/jpeg", "application/pdf"];
    for (const anexo of anexos) {
      if (!tipos.includes(anexo.type)) {
        erros.anexo = "Use PNG, JPG ou PDF.";
        break;
      }
      if (anexo.size > 5 * 1024 * 1024) {
        erros.anexo = "Cada arquivo deve ter no máximo 5 MB.";
        break;
      }
    }
  }

  return erros;
}

export function telefoneParaApi(valor: string): string | undefined {
  const digits = valor.replace(/\D/g, "");
  return digits || undefined;
}
