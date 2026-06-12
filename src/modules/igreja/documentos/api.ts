import { ErroRequisicaoApi, obterToken, requisicaoApi, URL_BASE_API } from "@/modules/api/client";
import type { CategoriaDocumentoIgreja, DocumentoIgreja } from "./types";

export type FiltrosDocumentos = {
  nome?: string;
  categoria?: CategoriaDocumentoIgreja;
  tipoArquivo?: string;
  dataInicio?: string;
  dataFim?: string;
};

export type PayloadDocumento = {
  nome: string;
  categoria: CategoriaDocumentoIgreja;
  descricao?: string;
  dataDocumento?: string;
  arquivo: File;
};

export type PayloadAtualizarDocumento = {
  nome: string;
  categoria: CategoriaDocumentoIgreja;
  descricao?: string;
  dataDocumento?: string;
};

function montarQuery(filtros?: FiltrosDocumentos): string {
  if (!filtros) return "";
  const params = new URLSearchParams();
  if (filtros.nome) params.set("nome", filtros.nome);
  if (filtros.categoria) params.set("categoria", filtros.categoria);
  if (filtros.tipoArquivo) params.set("tipoArquivo", filtros.tipoArquivo);
  if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
  if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listarDocumentosIgreja(filtros?: FiltrosDocumentos): Promise<DocumentoIgreja[]> {
  return requisicaoApi<DocumentoIgreja[]>(`/api/igreja/documentos${montarQuery(filtros)}`, { auth: true });
}

export async function obterDocumentoIgreja(id: number): Promise<DocumentoIgreja> {
  return requisicaoApi<DocumentoIgreja>(`/api/igreja/documentos/${id}`, { auth: true });
}

export async function enviarDocumentoIgreja(dados: PayloadDocumento): Promise<DocumentoIgreja> {
  const form = new FormData();
  form.append("arquivo", dados.arquivo);
  form.append("nome", dados.nome);
  form.append("categoria", dados.categoria);
  if (dados.descricao) form.append("descricao", dados.descricao);
  if (dados.dataDocumento) form.append("dataDocumento", dados.dataDocumento);

  return requisicaoApi<DocumentoIgreja>("/api/igreja/documentos", {
    auth: true,
    method: "POST",
    body: form,
  });
}

export async function atualizarDocumentoIgreja(id: number, dados: PayloadAtualizarDocumento): Promise<DocumentoIgreja> {
  return requisicaoApi<DocumentoIgreja>(`/api/igreja/documentos/${id}`, {
    auth: true,
    method: "PUT",
    body: dados,
  });
}

export async function excluirDocumentoIgreja(id: number): Promise<void> {
  return requisicaoApi<void>(`/api/igreja/documentos/${id}`, {
    auth: true,
    method: "DELETE",
  });
}

export function urlDownloadDocumento(id: number, inline = false): string {
  const base = `${URL_BASE_API}/api/igreja/documentos/${id}/download`;
  return inline ? `${base}?inline=true` : base;
}

export async function baixarDocumentoIgreja(id: number, inline = false): Promise<Blob> {
  const token = obterToken();
  const res = await fetch(urlDownloadDocumento(id, inline), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new ErroRequisicaoApi("Não foi possível baixar o documento.", res.status);
  }
  return res.blob();
}
