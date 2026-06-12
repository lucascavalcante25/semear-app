import {
  EXTENSOES_PERMITIDAS,
  MAX_TAMANHO_ARQUIVO_BYTES,
  TIPOS_ARQUIVO_PERMITIDOS,
  type CategoriaDocumentoIgreja,
} from "./types";

export type FormDocumento = {
  nome: string;
  categoria: CategoriaDocumentoIgreja | "";
  dataDocumento: string;
  descricao: string;
  arquivo: File | null;
};

export type ErrosFormDocumento = Partial<Record<keyof FormDocumento | "geral", string>>;

export function validarFormDocumento(form: FormDocumento, editando = false): ErrosFormDocumento {
  const erros: ErrosFormDocumento = {};
  const nome = form.nome.trim();

  if (nome.length < 3) {
    erros.nome = "Informe um nome com pelo menos 3 caracteres.";
  } else if (nome.length > 120) {
    erros.nome = "O nome pode ter no máximo 120 caracteres.";
  }

  if (!form.categoria) {
    erros.categoria = "Selecione uma categoria.";
  }

  if (form.descricao.trim().length > 500) {
    erros.descricao = "A descrição pode ter no máximo 500 caracteres.";
  }

  if (!editando) {
    if (!form.arquivo) {
      erros.arquivo = "Selecione um arquivo para enviar.";
    } else {
      const erroArquivo = validarArquivo(form.arquivo);
      if (erroArquivo) {
        erros.arquivo = erroArquivo;
      }
    }
  }

  return erros;
}

export function validarArquivo(arquivo: File): string | null {
  if (arquivo.size > MAX_TAMANHO_ARQUIVO_BYTES) {
    return "O arquivo não pode passar de 10 MB.";
  }

  const nome = arquivo.name.toLowerCase();
  const ext = nome.includes(".") ? nome.slice(nome.lastIndexOf(".")) : "";
  const extensoesBloqueadas = [".exe", ".bat", ".cmd", ".sh", ".js", ".jar", ".php", ".html"];
  if (extensoesBloqueadas.includes(ext)) {
    return "Este tipo de arquivo não é permitido por segurança.";
  }
  if (!EXTENSOES_PERMITIDAS.includes(ext)) {
    return "Use PDF, imagens (PNG/JPG) ou documentos de escritório (DOC, DOCX, XLS, XLSX).";
  }
  if (arquivo.type && !TIPOS_ARQUIVO_PERMITIDOS.includes(arquivo.type)) {
    return "Tipo de arquivo não permitido.";
  }
  return null;
}

export function formatarTamanhoArquivo(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function labelTipoArquivo(mime?: string): string {
  if (!mime) return "Arquivo";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("png")) return "PNG";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "JPG";
  if (mime.includes("word")) return "Word";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "Excel";
  return "Arquivo";
}

export function podeVisualizarInline(mime?: string): boolean {
  return Boolean(mime && (mime.includes("pdf") || mime.startsWith("image/")));
}
