import { useState, useEffect, useCallback, useMemo } from "react";
import { MARCA } from "@/lib/plataforma";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Loader2,
  Trash2,
  Printer,
  Download,
  ChevronDown,
  ChevronRight,
  Search,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { canWrite } from "@/auth/permissions";
import { usarEhMobile } from "@/hooks/use-mobile";
import { apiParaMascaraData, dataMascaraParaApi } from "@/lib/mascara-telefone";
import { DatePicker } from "@/components/ui/date-picker";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LabelList } from "recharts";
import {
  listarLancamentos,
  criarLancamento,
  atualizarLancamento,
  excluirLancamento,
  exportarLancamentosCsv,
  type LancamentoApp,
} from "@/modules/financeiro/api";
import { formatarMoeda, valorMoedaParaNumero } from "@/lib/masks";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function dataHojeFormatada(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function dataParaFormulario(data: Date): string {
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  const yyyy = data.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function valorParaFormulario(valor: number): string {
  return formatarMoeda(String(Math.round(valor * 100)));
}

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "hsl(var(--chart-1))",
  },
  saidas: {
    label: "Saídas",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const categoryLabels: Record<string, string> = {
  tithe: "Dízimo",
  offering: "Oferta",
  donation: "Doação",
  special: "Especial",
  utilities: "Contas",
  maintenance: "Manutenção",
  supplies: "Materiais",
  salaries: "Salários",
  events: "Eventos",
  missions: "Missões",
  other: "Outros",
};

const CATEGORIAS_RECEITA = [
  { value: "tithe", label: "Dízimo" },
  { value: "offering", label: "Oferta" },
  { value: "donation", label: "Doação" },
  { value: "special", label: "Especial" },
  { value: "other", label: "Outros" },
];

const CATEGORIAS_DESPESA = [
  { value: "utilities", label: "Contas" },
  { value: "maintenance", label: "Manutenção" },
  { value: "supplies", label: "Materiais" },
  { value: "salaries", label: "Salários" },
  { value: "events", label: "Eventos" },
  { value: "missions", label: "Missões" },
  { value: "other", label: "Outros" },
];

const METODOS_PAGAMENTO = [
  { value: "cash", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "card", label: "Cartão" },
  { value: "transfer", label: "Transferência" },
];

const MESES_COMPLETOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type DadosIgrejaRelatorio = {
  nome: string;
  cnpj: string;
  endereco: string;
  logoUrl: string;
};

function agregarPorMes(lancamentos: LancamentoApp[], ano: number) {
  const porMes: Record<number, { entradas: number; saidas: number }> = {};
  for (let m = 1; m <= 12; m++) {
    porMes[m] = { entradas: 0, saidas: 0 };
  }
  for (const l of lancamentos) {
    const d = l.date;
    if (d.getFullYear() !== ano) continue;
    const m = d.getMonth() + 1;
    if (l.type === "income") {
      porMes[m].entradas += l.amount;
    } else {
      porMes[m].saidas += l.amount;
    }
  }
  let saldoAcumulado = 0;
  return MESES.map((nome, i) => {
    const entradas = porMes[i + 1].entradas;
    const saidas = porMes[i + 1].saidas;
    const saldoMes = entradas - saidas;
    saldoAcumulado += saldoMes;
    return {
      month: nome,
      monthIndex: i + 1,
      entradas,
      saidas,
      saldoMes,
      saldoAcumulado,
    };
  });
}

function filtrarLancamentosPorMes(
  lancamentos: LancamentoApp[],
  mes: number,
  ano: number
): LancamentoApp[] {
  return lancamentos
    .filter((l) => l.date.getMonth() + 1 === mes && l.date.getFullYear() === ano)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

type FiltroTipoLancamento = "all" | "income" | "expense";

type GrupoMesLancamentos = {
  chave: string;
  mes: number;
  ano: number;
  label: string;
  lancamentos: LancamentoApp[];
  entradas: number;
  saidas: number;
  saldo: number;
  count: number;
};

function chaveMesAno(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  return `${data.getFullYear()}-${mes}`;
}

function agruparLancamentosPorMes(
  lancamentos: LancamentoApp[],
  filtroTipo: FiltroTipoLancamento,
  anoFiltro: number | "todos",
  busca: string,
): GrupoMesLancamentos[] {
  let lista = [...lancamentos];

  if (filtroTipo !== "all") {
    lista = lista.filter((l) => l.type === filtroTipo);
  }
  if (anoFiltro !== "todos") {
    lista = lista.filter((l) => l.date.getFullYear() === anoFiltro);
  }
  const termo = busca.trim().toLowerCase();
  if (termo) {
    lista = lista.filter(
      (l) =>
        l.description.toLowerCase().includes(termo) ||
        (categoryLabels[l.category] || l.category).toLowerCase().includes(termo),
    );
  }

  const mapa = new Map<string, LancamentoApp[]>();
  for (const l of lista) {
    const chave = chaveMesAno(l.date);
    const grupo = mapa.get(chave) ?? [];
    grupo.push(l);
    mapa.set(chave, grupo);
  }

  return Array.from(mapa.entries())
    .map(([chave, items]) => {
      const [anoStr, mesStr] = chave.split("-");
      const ano = Number(anoStr);
      const mes = Number(mesStr);
      const ordenados = items.sort((a, b) => b.date.getTime() - a.date.getTime());
      const entradas = ordenados
        .filter((l) => l.type === "income")
        .reduce((acc, l) => acc + l.amount, 0);
      const saidas = ordenados
        .filter((l) => l.type === "expense")
        .reduce((acc, l) => acc + l.amount, 0);
      return {
        chave,
        mes,
        ano,
        label: `${MESES_COMPLETOS[mes - 1]} ${ano}`,
        lancamentos: ordenados,
        entradas,
        saidas,
        saldo: entradas - saidas,
        count: ordenados.length,
      };
    })
    .sort((a, b) => b.chave.localeCompare(a.chave));
}

function anosComLancamentos(lancamentos: LancamentoApp[]): number[] {
  const anos = new Set(lancamentos.map((l) => l.date.getFullYear()));
  const atual = new Date().getFullYear();
  anos.add(atual);
  return Array.from(anos).sort((a, b) => b - a);
}

function ehMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

interface ModalRelatorioMensalProps {
  mes: number;
  ano: number;
  lancamentos: LancamentoApp[];
  saldoTotal: number;
  aberto: boolean;
  onFechar: () => void;
  dadosIgreja: DadosIgrejaRelatorio;
}

function ModalRelatorioMensal({
  mes,
  ano,
  lancamentos,
  saldoTotal,
  aberto,
  onFechar,
  dadosIgreja,
}: ModalRelatorioMensalProps) {
  const lancamentosMes = filtrarLancamentosPorMes(lancamentos, mes, ano);
  const entradas = lancamentosMes.filter((l) => l.type === "income");
  const saidas = lancamentosMes.filter((l) => l.type === "expense");
  const totalEntradas = entradas.reduce((acc, l) => acc + l.amount, 0);
  const totalSaidas = saidas.reduce((acc, l) => acc + l.amount, 0);
  const saldo = totalEntradas - totalSaidas;
  const nomeMes = MESES_COMPLETOS[mes - 1];

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const handleImprimir = async () => {
    const linhasEntradas =
      entradas.length === 0
        ? "<tr><td colspan='4' class='p-2 text-gray-500'>Nenhuma entrada</td></tr>"
        : entradas
            .map(
              (l) =>
                `<tr class="border-t border-gray-200"><td class="p-2">${l.date.toLocaleDateString("pt-BR")}</td><td class="p-2">${esc(l.description)}</td><td class="p-2">${esc(categoryLabels[l.category] || l.category)}</td><td class="p-2 text-right text-green-700 font-medium">R$ ${l.amount.toLocaleString("pt-BR")}</td></tr>`
            )
            .join("");
    const linhasSaidas =
      saidas.length === 0
        ? "<tr><td colspan='4' class='p-2 text-gray-500'>Nenhuma despesa</td></tr>"
        : saidas
            .map(
              (l) =>
                `<tr class="border-t border-gray-200"><td class="p-2">${l.date.toLocaleDateString("pt-BR")}</td><td class="p-2">${esc(l.description)}</td><td class="p-2">${esc(categoryLabels[l.category] || l.category)}</td><td class="p-2 text-right text-red-700 font-medium">R$ ${l.amount.toLocaleString("pt-BR")}</td></tr>`
            )
            .join("");

    const htmlConteudo = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - ${nomeMes}/${ano}</title>
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 16px; color: #333; }
            .logo-print { max-height: 56px; }
            .secao-titulo { background: #2d5a27; color: white; padding: 8px 12px; font-weight: 600; }
            .saldo-box { background: #e8f0e8; border: 1px solid #2d5a27; padding: 10px 14px; margin: 8px 0; }
            .saldo-total-box { background: #1e3a1a; color: white; padding: 12px 16px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            .text-right { text-align: right; }
            .text-green { color: #166534; }
            .text-red { color: #b91c1c; }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #2d5a27;">
            <img src="${window.location.origin}${dadosIgreja.logoUrl}" alt="Logo" class="logo-print" style="margin-bottom: 8px;" />
            <h1 style="font-size: 18px; margin: 4px 0;">${dadosIgreja.nome}</h1>
            <p style="font-size: 11px; color: #666;">CNPJ: ${dadosIgreja.cnpj} · ${dadosIgreja.endereco}</p>
          </div>
          <h2 style="text-align: center; font-size: 16px; margin-bottom: 12px;">Relatório Financeiro - ${nomeMes}/${ano}</h2>
          <div class="secao-titulo">Entradas (Ofertas)</div>
          <table>
            <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th class="text-right">Valor</th></tr></thead>
            <tbody>${linhasEntradas}</tbody>
            <tfoot style="background: #dcfce7;"><tr><td colspan="3" style="font-weight: 600;">Total de entradas</td><td class="text-right text-green" style="font-weight: 600;">R$ ${totalEntradas.toLocaleString("pt-BR")}</td></tr></tfoot>
          </table>
          <div class="secao-titulo">Despesas</div>
          <table>
            <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th class="text-right">Valor</th></tr></thead>
            <tbody>${linhasSaidas}</tbody>
            <tfoot style="background: #fee2e2;"><tr><td colspan="3" style="font-weight: 600;">Total de despesas</td><td class="text-right text-red" style="font-weight: 600;">R$ ${totalSaidas.toLocaleString("pt-BR")}</td></tr></tfoot>
          </table>
          <div class="saldo-box">
            <strong>Saldo do mês (em caixa):</strong> R$ ${saldo.toLocaleString("pt-BR")} ${saldo >= 0 ? "(positivo)" : "(negativo)"}
          </div>
          <div class="saldo-total-box" style="display: flex; justify-content: space-between; align-items: center;">
            <span>SALDO TOTAL EM CAIXA</span>
            <span>R$ ${saldoTotal.toLocaleString("pt-BR")}</span>
          </div>
          <p style="text-align: right; font-size: 11px; color: #666; margin-top: 12px;">${dadosIgreja.endereco} - ${ano}</p>
        </body>
      </html>
    `;

    if (ehMobile()) {
      try {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 15;

        doc.setFontSize(14);
        doc.text(dadosIgreja.nome, pageWidth / 2, y, { align: "center" });
        y += 8;
        doc.setFontSize(10);
        doc.text(`CNPJ: ${dadosIgreja.cnpj}`, pageWidth / 2, y, { align: "center" });
        y += 6;
        doc.text(`Relatório - ${nomeMes}/${ano}`, pageWidth / 2, y, { align: "center" });
        y += 12;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Entradas", 14, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        entradas.forEach((l) => {
          doc.text(`${l.date.toLocaleDateString("pt-BR")} - ${l.description} - R$ ${l.amount.toLocaleString("pt-BR")}`, 14, y);
          y += 5;
        });
        doc.setFont("helvetica", "bold");
        doc.text(`Total entradas: R$ ${totalEntradas.toLocaleString("pt-BR")}`, 14, y);
        y += 10;

        doc.setFont("helvetica", "bold");
        doc.text("Despesas", 14, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        saidas.forEach((l) => {
          doc.text(`${l.date.toLocaleDateString("pt-BR")} - ${l.description} - R$ ${l.amount.toLocaleString("pt-BR")}`, 14, y);
          y += 5;
        });
        doc.setFont("helvetica", "bold");
        doc.text(`Total despesas: R$ ${totalSaidas.toLocaleString("pt-BR")}`, 14, y);
        y += 12;

        doc.setFillColor(232, 240, 232);
        doc.rect(14, y, pageWidth - 28, 12, "F");
        doc.setFont("helvetica", "bold");
        doc.text(`Saldo do mês: R$ ${saldo.toLocaleString("pt-BR")} ${saldo >= 0 ? "(positivo)" : "(negativo)"}`, 18, y + 8);
        y += 18;

        doc.setFillColor(30, 58, 26);
        doc.rect(14, y, pageWidth - 28, 14, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text("SALDO TOTAL EM CAIXA", 18, y + 8);
        doc.text(`R$ ${saldoTotal.toLocaleString("pt-BR")}`, pageWidth - 18, y + 8, { align: "right" });
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(9);
        doc.text(`${dadosIgreja.endereco} - ${ano}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });

        doc.save(`relatorio-${nomeMes.toLowerCase()}-${ano}.pdf`);
        toast.success("Relatório baixado com sucesso.");
      } catch (e) {
        toast.error("Erro ao gerar PDF. Tente novamente.");
      }
      return;
    }

    const janela = window.open("", "_blank");
    if (!janela) {
      toast.error("Permita pop-ups para imprimir o relatório.");
      return;
    }
    janela.document.write(htmlConteudo);
    janela.document.close();
    janela.focus();
    setTimeout(() => {
      janela.print();
      janela.close();
    }, 250);
  };

  if (!aberto) return null;

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Relatório - {nomeMes} {ano}</DialogTitle>
          <DialogDescription>
            Detalhamento de entradas e despesas do mês
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div>
            <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Entradas ({entradas.length})
            </h3>
            {entradas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhuma entrada neste mês.</p>
            ) : (
              <div className="space-y-2">
                {entradas.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div>
                      <p className="font-medium text-sm">{l.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.date.toLocaleDateString("pt-BR")} · {categoryLabels[l.category] || l.category}
                      </p>
                    </div>
                    <p className="font-semibold text-primary">+ R$ {l.amount.toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-semibold mt-2 text-primary">Total: R$ {totalEntradas.toLocaleString("pt-BR")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Despesas ({saidas.length})
            </h3>
            {saidas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhuma despesa neste mês.</p>
            ) : (
              <div className="space-y-2">
                {saidas.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div>
                      <p className="font-medium text-sm">{l.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.date.toLocaleDateString("pt-BR")} · {categoryLabels[l.category] || l.category}
                      </p>
                    </div>
                    <p className="font-semibold text-destructive">- R$ {l.amount.toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-semibold mt-2 text-destructive">Total: R$ {totalSaidas.toLocaleString("pt-BR")}</p>
          </div>
          <div className="space-y-2">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Saldo do mês (em caixa)</span>
                <span className={cn("font-bold text-lg", saldo >= 0 ? "text-foreground" : "text-destructive")}>
                  R$ {saldo.toLocaleString("pt-BR")} {saldo >= 0 ? "(positivo)" : "(negativo)"}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Saldo total em caixa</span>
                <span className={cn("font-bold text-lg", saldoTotal >= 0 ? "text-foreground" : "text-destructive")}>
                  R$ {saldoTotal.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onFechar}>Fechar</Button>
          <Button className="gap-2" onClick={handleImprimir}>
            <Printer className="h-4 w-4" />
            Imprimir relatório
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const METODO_LABELS: Record<string, string> = {
  cash: "Dinheiro",
  pix: "PIX",
  card: "Cartão",
  transfer: "Transferência",
};

interface ModalDetalheLancamentoProps {
  lancamento: LancamentoApp | null;
  aberto: boolean;
  onFechar: () => void;
  onEditar?: (lancamento: LancamentoApp) => void;
  onExcluir?: (id: number) => void;
  podeEditar?: boolean;
  podeExcluir?: boolean;
}

function ModalDetalheLancamento({
  lancamento,
  aberto,
  onFechar,
  onEditar,
  onExcluir,
  podeEditar,
  podeExcluir,
}: ModalDetalheLancamentoProps) {
  if (!lancamento || !aberto) return null;
  const isIncome = lancamento.type === "income";
  const idNum = lancamento.idNum ?? Number(lancamento.id);

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                isIncome ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}
            >
              {isIncome ? (
                <ArrowUpCircle className="h-5 w-5" />
              ) : (
                <ArrowDownCircle className="h-5 w-5" />
              )}
            </div>
            {isIncome ? "Entrada" : "Despesa"}
          </DialogTitle>
          <DialogDescription>
            Detalhes do lançamento cadastrado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-muted-foreground text-xs">Descrição</Label>
            <p className="font-medium">{lancamento.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Data</Label>
              <p className="font-medium">{lancamento.date.toLocaleDateString("pt-BR")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Categoria</Label>
              <p className="font-medium">{categoryLabels[lancamento.category] || lancamento.category}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Valor</Label>
            <p
              className={cn(
                "font-bold text-xl",
                isIncome ? "text-primary" : "text-destructive"
              )}
            >
              {isIncome ? "+" : "-"} R$ {lancamento.amount.toLocaleString("pt-BR")}
            </p>
          </div>
          {lancamento.paymentMethod && (
            <div>
              <Label className="text-muted-foreground text-xs">Método de pagamento</Label>
              <p className="font-medium">{METODO_LABELS[lancamento.paymentMethod] || lancamento.paymentMethod}</p>
            </div>
          )}
          {lancamento.notes && (
            <div>
              <Label className="text-muted-foreground text-xs">Observações</Label>
              <p className="font-medium text-sm">{lancamento.notes}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Cadastrado por {lancamento.createdBy} em {lancamento.createdAt.toLocaleDateString("pt-BR")} às{" "}
            {lancamento.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {podeEditar && onEditar && (
              <Button
                variant="outline"
                onClick={() => {
                  onEditar(lancamento);
                  onFechar();
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {podeExcluir && onExcluir && idNum && (
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (confirm("Excluir este lançamento?")) {
                    onExcluir(idNum);
                    onFechar();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onFechar}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LinhaLancamentoProps {
  lancamento: LancamentoApp;
  onClick?: () => void;
  onEditar?: (lancamento: LancamentoApp) => void;
  onExcluir?: (id: number) => void;
  podeEditar?: boolean;
  podeExcluir?: boolean;
}

function LinhaLancamento({
  lancamento,
  onClick,
  onEditar,
  onExcluir,
  podeEditar,
  podeExcluir,
}: LinhaLancamentoProps) {
  const isIncome = lancamento.type === "income";
  const idNum = lancamento.idNum ?? Number(lancamento.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 border-b border-border/40 last:border-0 hover:bg-muted/40 transition-colors min-w-0 cursor-pointer text-sm"
    >
      <span className="text-[11px] sm:text-xs text-muted-foreground w-11 sm:w-14 shrink-0 tabular-nums">
        {lancamento.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
      </span>
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md shrink-0",
          isIncome ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
        )}
      >
        {isIncome ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate leading-tight">{lancamento.description}</p>
        <p className="text-[10px] text-muted-foreground truncate sm:hidden">
          {categoryLabels[lancamento.category] || lancamento.category}
        </p>
      </div>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 hidden sm:inline-flex shrink-0 font-normal">
        {categoryLabels[lancamento.category] || lancamento.category}
      </Badge>
      <p
        className={cn(
          "font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 tabular-nums",
          isIncome ? "text-primary" : "text-destructive",
        )}
      >
        {isIncome ? "+" : "-"} R$ {lancamento.amount.toLocaleString("pt-BR")}
      </p>
      <div className="flex items-center shrink-0">
        {podeEditar && onEditar && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onEditar(lancamento);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {podeExcluir && onExcluir && idNum ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Excluir este lançamento?")) onExcluir(idNum);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

interface ListaLancamentosAgrupadosProps {
  grupos: GrupoMesLancamentos[];
  mesesAbertos: Set<string>;
  onToggleMes: (chave: string) => void;
  onExpandirTodos: () => void;
  onRecolherTodos: () => void;
  onClickLancamento: (l: LancamentoApp) => void;
  onEditar?: (l: LancamentoApp) => void;
  onExcluir?: (id: number) => void;
  podeEditar?: boolean;
  podeExcluir?: boolean;
}

function ListaLancamentosAgrupados({
  grupos,
  mesesAbertos,
  onToggleMes,
  onExpandirTodos,
  onRecolherTodos,
  onClickLancamento,
  onEditar,
  onExcluir,
  podeEditar,
  podeExcluir,
}: ListaLancamentosAgrupadosProps) {
  if (grupos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nenhum lançamento encontrado com os filtros atuais.
      </p>
    );
  }

  const totalLancamentos = grupos.reduce((acc, g) => acc + g.count, 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground px-1">
        <span>
          {totalLancamentos} lançamento{totalLancamentos !== 1 ? "s" : ""} em {grupos.length} mês
          {grupos.length !== 1 ? "es" : ""}
        </span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onExpandirTodos}>
            Expandir todos
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onRecolherTodos}>
            Recolher
          </Button>
        </div>
      </div>

      {grupos.map((grupo) => {
        const aberto = mesesAbertos.has(grupo.chave);
        return (
          <div key={grupo.chave} className="rounded-lg border border-border overflow-hidden bg-card">
            <button
              type="button"
              onClick={() => onToggleMes(grupo.chave)}
              className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                {aberto ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="font-semibold text-sm">{grupo.label}</span>
                <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                  {grupo.count} lanç.
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs pl-6 sm:pl-0">
                {grupo.entradas > 0 && (
                  <span className="text-primary font-medium tabular-nums">
                    + R$ {grupo.entradas.toLocaleString("pt-BR")}
                  </span>
                )}
                {grupo.saidas > 0 && (
                  <span className="text-destructive font-medium tabular-nums">
                    - R$ {grupo.saidas.toLocaleString("pt-BR")}
                  </span>
                )}
                <span
                  className={cn(
                    "font-semibold tabular-nums text-foreground",
                    grupo.saldo < 0 && "text-destructive",
                  )}
                >
                  Saldo: {grupo.saldo >= 0 ? "+" : "-"} R${" "}
                  {Math.abs(grupo.saldo).toLocaleString("pt-BR")}
                </span>
              </div>
            </button>
            {aberto && (
              <div className="border-t border-border/60 bg-muted/10">
                {grupo.lancamentos.map((lancamento) => (
                  <LinhaLancamento
                    key={lancamento.id}
                    lancamento={lancamento}
                    onClick={() => onClickLancamento(lancamento)}
                    onEditar={onEditar}
                    onExcluir={onExcluir}
                    podeEditar={podeEditar}
                    podeExcluir={podeExcluir}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Financeiro() {
  const { user } = usarAutenticacao();
  const { configuracao, logoUrl } = useIgrejaConfiguracao();
  const dadosIgrejaRelatorio: DadosIgrejaRelatorio = {
    nome: configuracao?.nome || "Igreja",
    cnpj: configuracao?.cnpj || "",
    endereco: [configuracao?.cidade, configuracao?.estado].filter(Boolean).join(" - ") || "",
    logoUrl: logoUrl || MARCA.logoIcon,
  };
  const podeEscreverFinanceiro = canWrite(user, "/financeiro");
  const isMobile = usarEhMobile();
  const [lancamentos, setLancamentos] = useState<LancamentoApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [lancamentoEditando, setLancamentoEditando] = useState<LancamentoApp | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState<"income" | "expense">("income");
  const [formData, setFormData] = useState({
    data: dataHojeFormatada(),
    valor: "",
    categoria: "",
    descricao: "",
    metodoPagamento: "",
    centroCusto: "",
  });
  const [exportandoCsv, setExportandoCsv] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [lancamentoDetalhe, setLancamentoDetalhe] = useState<LancamentoApp | null>(null);
  const [abaTipo, setAbaTipo] = useState<FiltroTipoLancamento>("all");
  const [anoFiltro, setAnoFiltro] = useState<number | "todos">(new Date().getFullYear());
  const [busca, setBusca] = useState("");
  const [mesesAbertos, setMesesAbertos] = useState<Set<string>>(() => {
    const hoje = new Date();
    return new Set([chaveMesAno(hoje)]);
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await listarLancamentos();
      setLancamentos(lista);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar lançamentos.");
      setLancamentos([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalReceitas = lancamentos
    .filter((e) => e.type === "income")
    .reduce((acc, e) => acc + e.amount, 0);

  const totalDespesas = lancamentos
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => acc + e.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  const anoAtual = new Date().getFullYear();
  const anoGrafico = anoFiltro === "todos" ? anoAtual : anoFiltro;
  const chartData = agregarPorMes(lancamentos, anoGrafico);
  const anosDisponiveis = useMemo(() => anosComLancamentos(lancamentos), [lancamentos]);

  const gruposFiltrados = useMemo(
    () => agruparLancamentosPorMes(lancamentos, abaTipo, anoFiltro, busca),
    [lancamentos, abaTipo, anoFiltro, busca],
  );

  const toggleMes = (chave: string) => {
    setMesesAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(chave)) next.delete(chave);
      else next.add(chave);
      return next;
    });
  };

  const expandirTodosMeses = () => {
    setMesesAbertos(new Set(gruposFiltrados.map((g) => g.chave)));
  };

  const recolherTodosMeses = () => setMesesAbertos(new Set());

  const handleSalvar = async () => {
    const valorNum = valorMoedaParaNumero(formData.valor);
    if (valorNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (!formData.categoria?.trim()) {
      toast.error("Selecione uma categoria.");
      return;
    }
    if (!formData.descricao?.trim()) {
      toast.error("Informe a descrição.");
      return;
    }

    setSalvando(true);
    try {
      const dataApi = dataMascaraParaApi(formData.data);
      if (!dataApi) {
        toast.error("Informe uma data válida (dd/mm/aaaa).");
        setSalvando(false);
        return;
      }
      const payload = {
        type: tipoLancamento,
        category: formData.categoria,
        description: formData.descricao.trim(),
        amount: valorNum,
        date: new Date(`${dataApi}T00:00:00`),
        paymentMethod: formData.metodoPagamento
          ? (formData.metodoPagamento as "cash" | "pix" | "card" | "transfer")
          : undefined,
        centroCusto: formData.centroCusto.trim() || undefined,
      };

      if (lancamentoEditando) {
        await atualizarLancamento({ ...lancamentoEditando, ...payload });
        toast.success("Lançamento atualizado.");
      } else {
        await criarLancamento(payload);
        toast.success("Lançamento registrado.");
      }

      setDialogAberto(false);
      setLancamentoEditando(null);
      resetForm();
      carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await excluirLancamento(id);
      toast.success("Lançamento excluído.");
      carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir.");
    }
  };

  const resetForm = () => {
    setTipoLancamento("income");
    setFormData({
      data: dataHojeFormatada(),
      valor: "",
      categoria: "",
      descricao: "",
      metodoPagamento: "",
      centroCusto: "",
    });
  };

  const handleExportarCsv = async () => {
    setExportandoCsv(true);
    try {
      const blob = await exportarLancamentosCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lancamentos-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exportado.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao exportar CSV.");
    } finally {
      setExportandoCsv(false);
    }
  };

  const abrirFormularioNovo = () => {
    setLancamentoEditando(null);
    resetForm();
    setDialogAberto(true);
  };

  const abrirFormularioEdicao = (lancamento: LancamentoApp) => {
    setLancamentoEditando(lancamento);
    setTipoLancamento(lancamento.type);
    setFormData({
      data: dataParaFormulario(lancamento.date),
      valor: valorParaFormulario(lancamento.amount),
      categoria: lancamento.category,
      descricao: lancamento.description,
      metodoPagamento: lancamento.paymentMethod ?? "",
      centroCusto: lancamento.centroCusto ?? "",
    });
    setLancamentoDetalhe(null);
    setDialogAberto(true);
  };

  return (
    <LayoutApp>
      <div className="space-y-3 sm:space-y-4 animate-fade-in pb-4">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Financeiro</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Gestão de entradas e saídas
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={exportandoCsv}
              onClick={() => void handleExportarCsv()}
            >
              {exportandoCsv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              CSV
            </Button>
            <Button
              className="gap-1.5 sm:gap-2 shrink-0"
              disabled={!podeEscreverFinanceiro}
              onClick={abrirFormularioNovo}
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
          </div>

          <Dialog
            open={dialogAberto}
            onOpenChange={(open) => {
              setDialogAberto(open);
              if (!open) {
                setLancamentoEditando(null);
                resetForm();
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {lancamentoEditando ? "Editar Lançamento" : "Novo Lançamento"}
                </DialogTitle>
                <DialogDescription>
                  {lancamentoEditando
                    ? "Corrija os dados do lançamento e salve as alterações."
                    : "Registre uma nova entrada ou saída."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tipoLancamento === "income" ? "default" : "outline"}
                    className={cn(
                      "gap-2",
                      tipoLancamento === "income" && "bg-primary hover:bg-primary/90"
                    )}
                    onClick={() => setTipoLancamento("income")}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Entrada
                  </Button>
                  <Button
                    variant={tipoLancamento === "expense" ? "default" : "outline"}
                    className={cn(
                      "gap-2",
                      tipoLancamento === "expense" && "bg-destructive hover:bg-destructive/90"
                    )}
                    onClick={() => setTipoLancamento("expense")}
                  >
                    <TrendingDown className="h-4 w-4" />
                    Saída
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="text"
                      inputMode="numeric"
                      className="pl-10"
                      placeholder="0,00"
                      value={formData.valor}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          valor: formatarMoeda(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v) =>
                      setFormData((f) => ({ ...f, categoria: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoLancamento === "income"
                        ? CATEGORIAS_RECEITA.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))
                        : CATEGORIAS_DESPESA.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o lançamento..."
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, descricao: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centroCusto">Centro de custo</Label>
                  <Input
                    id="centroCusto"
                    placeholder="Ex.: Louvor, Infantil, Missões..."
                    value={formData.centroCusto}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, centroCusto: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <DatePicker
                      id="date"
                      value={dataMascaraParaApi(formData.data) || undefined}
                      onChange={(v) =>
                        setFormData((f) => ({
                          ...f,
                          data: v ? apiParaMascaraData(v) : "",
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment">Pagamento</Label>
                    <Select
                      value={formData.metodoPagamento}
                      onValueChange={(v) =>
                        setFormData((f) => ({ ...f, metodoPagamento: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Método" />
                      </SelectTrigger>
                      <SelectContent>
                        {METODOS_PAGAMENTO.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDialogAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvar} disabled={salvando}>
                    {salvando ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {lancamentoEditando ? "Salvar alterações" : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Entradas</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-primary truncate" title={`R$ ${totalReceitas.toLocaleString("pt-BR")}`}>
                    R$ {totalReceitas.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-xs text-muted-foreground">Saídas</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-destructive truncate" title={`R$ ${totalDespesas.toLocaleString("pt-BR")}`}>
                    R$ {totalDespesas.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border",
                  saldo >= 0
                    ? "bg-muted/40 border-border"
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet
                      className={cn(
                        "h-4 w-4",
                        saldo >= 0 ? "text-foreground" : "text-destructive"
                      )}
                    />
                    <span className="text-xs text-muted-foreground">Saldo</span>
                  </div>
                  <p
                    className={cn(
                      "text-base sm:text-lg font-bold truncate",
                      saldo >= 0 ? "text-foreground" : "text-destructive"
                    )}
                    title={`R$ ${saldo.toLocaleString("pt-BR")}`}
                  >
                    R$ {saldo.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border shadow-spiritual">
              <CardHeader className="pb-2 bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-base text-foreground">
                  Movimentação Mensal {anoGrafico}
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto -mx-1 px-1">
                <div className={cn("min-w-0", isMobile && "min-w-[320px]")}>
                  <ChartContainer config={chartConfig} className={cn("w-full [&_.recharts-rectangle]:cursor-pointer", isMobile ? "h-[200px]" : "h-[220px]")}>
                    <BarChart data={chartData} margin={isMobile ? { top: 8, right: 8, left: 8, bottom: 4 } : undefined}>
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        interval={0}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`}
                            labelFormatter={(_, payload) => {
                              const d = payload?.[0]?.payload;
                              if (!d) return "";
                              const saldoMes = d.saldoMes ?? 0;
                              const saldoAcum = d.saldoAcumulado ?? 0;
                              const sMes = saldoMes >= 0 ? `+R$ ${saldoMes.toLocaleString("pt-BR")}` : `-R$ ${Math.abs(saldoMes).toLocaleString("pt-BR")}`;
                              return `${d.month} · Saldo mês: ${sMes} ${saldoMes >= 0 ? "(positivo)" : "(negativo)"} · Em caixa: R$ ${saldoAcum.toLocaleString("pt-BR")}`;
                            }}
                          />
                        }
                      />
                      <Bar
                        dataKey="entradas"
                        fill="var(--color-entradas)"
                        radius={4}
                        onClick={(_, index) => index !== undefined && setMesSelecionado(index + 1)}
                      >
                        {!isMobile && (
                          <LabelList
                            dataKey="saldoAcumulado"
                            position="bottom"
                            formatter={(v: number) => {
                              const n = Number(v);
                              if (Number.isNaN(n)) return "";
                              return `R$ ${n.toLocaleString("pt-BR")}`;
                            }}
                            style={{ fontSize: 10 }}
                          />
                        )}
                      </Bar>
                      <Bar
                        dataKey="saidas"
                        fill="var(--color-saidas)"
                        radius={4}
                        onClick={(_, index) => index !== undefined && setMesSelecionado(index + 1)}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {isMobile ? "Toque em um mês para ver o detalhamento" : "Clique em um mês para ver o detalhamento"}
                </p>
              </CardContent>
            </Card>

            {mesSelecionado && (
              <ModalRelatorioMensal
                mes={mesSelecionado}
                ano={anoGrafico}
                lancamentos={lancamentos}
                saldoTotal={saldo}
                aberto={!!mesSelecionado}
                onFechar={() => setMesSelecionado(null)}
                dadosIgreja={dadosIgrejaRelatorio}
              />
            )}

            <ModalDetalheLancamento
              lancamento={lancamentoDetalhe}
              aberto={!!lancamentoDetalhe}
              onFechar={() => setLancamentoDetalhe(null)}
              onEditar={abrirFormularioEdicao}
              onExcluir={handleExcluir}
              podeEditar={podeEscreverFinanceiro}
              podeExcluir={podeEscreverFinanceiro}
            />

            <Card className="border-border shadow-spiritual">
              <CardHeader className="pb-3 space-y-3 bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-base text-foreground">Lançamentos</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por descrição ou categoria..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select
                    value={anoFiltro === "todos" ? "todos" : String(anoFiltro)}
                    onValueChange={(v) => {
                      const novoAno = v === "todos" ? "todos" : Number(v);
                      setAnoFiltro(novoAno);
                      if (novoAno !== "todos") {
                        const hoje = new Date();
                        const chave =
                          hoje.getFullYear() === novoAno
                            ? chaveMesAno(hoje)
                            : `${novoAno}-12`;
                        setMesesAbertos(new Set([chave]));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os anos</SelectItem>
                      {anosDisponiveis.map((ano) => (
                        <SelectItem key={ano} value={String(ano)}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs
                  value={abaTipo}
                  onValueChange={(v) => setAbaTipo(v as FiltroTipoLancamento)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="income">Entradas</TabsTrigger>
                    <TabsTrigger value="expense">Saídas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    {lancamentos.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        Nenhum lançamento registrado. Clique em Novo para adicionar.
                      </p>
                    ) : (
                      <ListaLancamentosAgrupados
                        grupos={gruposFiltrados}
                        mesesAbertos={mesesAbertos}
                        onToggleMes={toggleMes}
                        onExpandirTodos={expandirTodosMeses}
                        onRecolherTodos={recolherTodosMeses}
                        onClickLancamento={setLancamentoDetalhe}
                        onEditar={abrirFormularioEdicao}
                        onExcluir={handleExcluir}
                        podeEditar={podeEscreverFinanceiro}
                        podeExcluir={podeEscreverFinanceiro}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="income" className="mt-4">
                    <ListaLancamentosAgrupados
                      grupos={gruposFiltrados}
                      mesesAbertos={mesesAbertos}
                      onToggleMes={toggleMes}
                      onExpandirTodos={expandirTodosMeses}
                      onRecolherTodos={recolherTodosMeses}
                      onClickLancamento={setLancamentoDetalhe}
                      onEditar={abrirFormularioEdicao}
                      onExcluir={handleExcluir}
                      podeEditar={podeEscreverFinanceiro}
                      podeExcluir={podeEscreverFinanceiro}
                    />
                  </TabsContent>

                  <TabsContent value="expense" className="mt-4">
                    <ListaLancamentosAgrupados
                      grupos={gruposFiltrados}
                      mesesAbertos={mesesAbertos}
                      onToggleMes={toggleMes}
                      onExpandirTodos={expandirTodosMeses}
                      onRecolherTodos={recolherTodosMeses}
                      onClickLancamento={setLancamentoDetalhe}
                      onEditar={abrirFormularioEdicao}
                      onExcluir={handleExcluir}
                      podeEditar={podeEscreverFinanceiro}
                      podeExcluir={podeEscreverFinanceiro}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutApp>
  );
}
