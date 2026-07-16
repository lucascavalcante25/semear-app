import { jsPDF } from "jspdf";
import type { EventoInscricaoDTO } from "@/modules/eventos/api";
import { formatarDataHoraEvento } from "@/modules/eventos/api";

export type DadosRelatorioInscritos = {
  tituloEvento: string;
  dataEvento?: string | null;
  local?: string | null;
  nomeIgreja?: string;
};

const esc = (valor: string) =>
  valor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rotuloStatus = (inscricao: EventoInscricaoDTO) => {
  if (inscricao.status === "CANCELADA") return "Cancelada";
  return "Ativa";
};

export const ordenarInscritosRelatorio = (inscritos: EventoInscricaoDTO[]) =>
  [...inscritos].sort((a, b) => {
    const aCancelada = a.status === "CANCELADA" ? 1 : 0;
    const bCancelada = b.status === "CANCELADA" ? 1 : 0;
    if (aCancelada !== bCancelada) return aCancelada - bCancelada;
    const aCriado = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
    const bCriado = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
    return bCriado - aCriado;
  });

const nomeArquivo = (titulo?: string) =>
  `inscritos-${titulo?.replace(/\s+/g, "-").toLowerCase() ?? "evento"}.pdf`;

export function montarHtmlRelatorioInscritos(
  dados: DadosRelatorioInscritos,
  inscritos: EventoInscricaoDTO[],
): string {
  const lista = ordenarInscritosRelatorio(inscritos);
  const linhas = lista
    .map(
      (inscricao, indice) => `
        <tr>
          <td class="num">${indice + 1}</td>
          <td>${esc(inscricao.userNome ?? "Participante")}</td>
          <td>${esc(inscricao.userEmail ?? "—")}</td>
          <td>${esc(inscricao.userTelefone ?? "—")}</td>
          <td>${inscricao.criadoEm ? esc(new Date(inscricao.criadoEm).toLocaleString("pt-BR")) : "—"}</td>
          <td>${esc(rotuloStatus(inscricao))}</td>
        </tr>`,
    )
    .join("");

  const dataEvento = dados.dataEvento ? esc(formatarDataHoraEvento(dados.dataEvento)) : "";
  const local = dados.local ? esc(dados.local) : "";
  const igreja = dados.nomeIgreja ? esc(dados.nomeIgreja) : "Igreja";

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Inscritos — ${esc(dados.tituloEvento)}</title>
    <style>
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #1f2937; margin: 0; padding: 20px; }
      h1 { font-size: 18px; margin: 0 0 4px; color: #1e3a1a; }
      .meta { color: #6b7280; font-size: 11px; margin-bottom: 16px; }
      .resumo { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
      th { background: #e8f0e8; color: #1e3a1a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
      td.num { width: 36px; text-align: center; color: #6b7280; }
      .rodape { margin-top: 16px; font-size: 10px; color: #9ca3af; text-align: right; }
    </style>
  </head>
  <body>
    <h1>Inscritos — ${esc(dados.tituloEvento)}</h1>
    <p class="meta">${igreja} · Gerado em ${esc(new Date().toLocaleString("pt-BR"))}</p>
    <div class="resumo">
      ${dataEvento ? `<div><strong>Data do evento:</strong> ${dataEvento}</div>` : ""}
      ${local ? `<div><strong>Local:</strong> ${local}</div>` : ""}
      <div><strong>Total de inscrições:</strong> ${lista.length}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th>Inscrição</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${
          lista.length > 0
            ? linhas
            : `<tr><td colspan="6" style="text-align:center;color:#6b7280;">Nenhuma inscrição</td></tr>`
        }
      </tbody>
    </table>
    <p class="rodape">Semear — relatório de inscritos do evento</p>
  </body>
</html>`;
}

export function gerarPdfInscritosEvento(
  dados: DadosRelatorioInscritos,
  inscritos: EventoInscricaoDTO[],
): jsPDF {
  const lista = ordenarInscritosRelatorio(inscritos);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();
  const margem = 14;
  let y = 18;

  doc.setFontSize(14);
  doc.text(`Inscritos — ${dados.tituloEvento}`, largura / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(10);
  if (dados.nomeIgreja) {
    doc.text(dados.nomeIgreja, largura / 2, y, { align: "center" });
    y += 5;
  }
  if (dados.dataEvento) {
    doc.text(`Evento: ${formatarDataHoraEvento(dados.dataEvento)}`, margem, y);
    y += 5;
  }
  if (dados.local) {
    doc.text(`Local: ${dados.local}`, margem, y);
    y += 5;
  }
  doc.text(`Total: ${lista.length} inscrição(ões)`, margem, y);
  y += 8;

  doc.setFontSize(9);
  lista.forEach((inscricao, indice) => {
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
    const nome = inscricao.userNome ?? "Participante";
    doc.setFont("helvetica", "bold");
    doc.text(`${indice + 1}. ${nome}`, margem, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    if (inscricao.userEmail) {
      doc.text(`E-mail: ${inscricao.userEmail}`, margem + 2, y);
      y += 4;
    }
    if (inscricao.userTelefone) {
      doc.text(`Telefone: ${inscricao.userTelefone}`, margem + 2, y);
      y += 4;
    }
    if (inscricao.criadoEm) {
      doc.text(`Inscrito em: ${new Date(inscricao.criadoEm).toLocaleString("pt-BR")}`, margem + 2, y);
      y += 4;
    }
    doc.text(`Status: ${rotuloStatus(inscricao)}`, margem + 2, y);
    y += 7;
  });

  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, largura - margem, doc.internal.pageSize.getHeight() - 8, {
    align: "right",
  });

  return doc;
}

export async function salvarOuCompartilharPdfInscritos(
  dados: DadosRelatorioInscritos,
  inscritos: EventoInscricaoDTO[],
): Promise<"compartilhado" | "salvo"> {
  const doc = gerarPdfInscritosEvento(dados, inscritos);
  const arquivo = nomeArquivo(dados.tituloEvento);
  const blob = doc.output("blob");
  const arquivoPdf = new File([blob], arquivo, { type: "application/pdf" });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [arquivoPdf] })) {
    await navigator.share({
      title: `Inscritos — ${dados.tituloEvento}`,
      text: `Lista de inscritos do evento ${dados.tituloEvento}`,
      files: [arquivoPdf],
    });
    return "compartilhado";
  }

  doc.save(arquivo);
  return "salvo";
}

export function imprimirRelatorioInscritos(dados: DadosRelatorioInscritos, inscritos: EventoInscricaoDTO[]) {
  const html = montarHtmlRelatorioInscritos(dados, inscritos);
  const janela = window.open("", "_blank");
  if (!janela) {
    throw new Error("Permita pop-ups para imprimir o relatório.");
  }
  janela.document.write(html);
  janela.document.close();
  janela.focus();
  window.setTimeout(() => {
    janela.print();
    janela.close();
  }, 250);
}
