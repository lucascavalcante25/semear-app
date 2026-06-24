export type CategoriaDocumentoIgreja =
  | "ESTATUTO"
  | "ATA"
  | "CNPJ"
  | "CERTIDAO"
  | "CONTRATO"
  | "FINANCEIRO"
  | "MEMBRO"
  | "RECIBO"
  | "RELATORIO"
  | "AUTORIZACAO"
  | "OUTRO";

export const CATEGORIAS_DOCUMENTO: CategoriaDocumentoIgreja[] = [
  "ESTATUTO",
  "ATA",
  "CNPJ",
  "CERTIDAO",
  "CONTRATO",
  "FINANCEIRO",
  "MEMBRO",
  "RECIBO",
  "RELATORIO",
  "AUTORIZACAO",
  "OUTRO",
];

export const LABEL_CATEGORIA: Record<CategoriaDocumentoIgreja, string> = {
  ESTATUTO: "Estatuto",
  ATA: "Ata",
  CNPJ: "CNPJ",
  CERTIDAO: "Certidão",
  CONTRATO: "Contrato",
  FINANCEIRO: "Financeiro",
  MEMBRO: "Membro",
  RECIBO: "Recibo",
  RELATORIO: "Relatório",
  AUTORIZACAO: "Autorização",
  OUTRO: "Outro",
};

export type DocumentoIgreja = {
  id: number;
  igrejaId?: number;
  nome: string;
  descricao?: string;
  categoria: CategoriaDocumentoIgreja;
  nomeArquivoOriginal: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  urlDownload?: string;
  dataDocumento?: string;
  dataValidade?: string;
  dataUpload?: string;
  dataAtualizacao?: string;
  usuarioUploadId?: number;
  usuarioUploadNome?: string;
  ativo?: boolean;
};

export const TIPOS_ARQUIVO_PERMITIDOS = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const EXTENSOES_PERMITIDAS = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx", ".xls", ".xlsx"];

export const MAX_TAMANHO_ARQUIVO_BYTES = 10 * 1024 * 1024;
