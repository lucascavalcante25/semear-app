import { useState, useEffect, useCallback } from "react";
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
  DialogTrigger,
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
  Calendar,
  DollarSign,
  Loader2,
  Trash2,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canWrite } from "@/auth/permissions";
import { aplicarMascaraData, dataMascaraParaApi } from "@/lib/mascara-telefone";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  listarLancamentos,
  criarLancamento,
  excluirLancamento,
  type LancamentoApp,
} from "@/modules/financeiro/api";
import { formatarMoeda, valorMoedaParaNumero } from "@/lib/masks";
import { toast } from "sonner";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function dataHojeFormatada(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
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

const DADOS_IGREJA = {
  nome: "Comunidade Evangélica Semear",
  cnpj: "10.884.335/0001-73",
  endereco: "Eusébio - CE",
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
  return MESES.map((nome, i) => ({
    month: nome,
    monthIndex: i + 1,
    entradas: porMes[i + 1].entradas,
    saidas: porMes[i + 1].saidas,
  }));
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

interface ModalRelatorioMensalProps {
  mes: number;
  ano: number;
  lancamentos: LancamentoApp[];
  aberto: boolean;
  onFechar: () => void;
}

function ModalRelatorioMensal({
  mes,
  ano,
  lancamentos,
  aberto,
  onFechar,
}: ModalRelatorioMensalProps) {
  const lancamentosMes = filtrarLancamentosPorMes(lancamentos, mes, ano);
  const entradas = lancamentosMes.filter((l) => l.type === "income");
  const saidas = lancamentosMes.filter((l) => l.type === "expense");
  const totalEntradas = entradas.reduce((acc, l) => acc + l.amount, 0);
  const totalSaidas = saidas.reduce((acc, l) => acc + l.amount, 0);
  const saldo = totalEntradas - totalSaidas;
  const nomeMes = MESES_COMPLETOS[mes - 1];

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const handleImprimir = () => {
    const janela = window.open("", "_blank");
    if (!janela) {
      toast.error("Permita pop-ups para imprimir o relatório.");
      return;
    }
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
    janela.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório Financeiro - ${nomeMes}/${ano}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
          <style>
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            .logo-print { max-height: 72px; }
            .secao-titulo { background: #2d5a27; color: white; padding: 10px 14px; font-weight: 600; font-size: 0.95rem; }
            .saldo-final { background: #1e3a1a; color: white; padding: 14px 16px; font-weight: 700; font-size: 1rem; }
          </style>
        </head>
        <body class="p-6 text-gray-800 font-sans text-sm">
          <div class="max-w-2xl mx-auto">
            <div class="text-center mb-6 pb-4 border-b-2 border-green-800">
              <img src="${window.location.origin}/logo-semear.png" alt="Logo" class="logo-print mx-auto mb-3" />
              <h1 class="text-xl font-bold text-gray-900">${DADOS_IGREJA.nome}</h1>
              <p class="text-sm text-gray-600">CNPJ: ${DADOS_IGREJA.cnpj}</p>
              <p class="text-sm text-gray-600">${DADOS_IGREJA.endereco}</p>
            </div>
            <h2 class="text-lg font-semibold text-center mb-4 text-gray-800">Relatório Financeiro - ${nomeMes}/${ano}</h2>
            <div class="secao-titulo rounded-t-lg mt-4">Entradas (Ofertas)</div>
            <table class="w-full border border-gray-300">
              <thead class="bg-gray-100">
                <tr><th class="text-left p-2 font-semibold">Data</th><th class="text-left p-2 font-semibold">Descrição</th><th class="text-left p-2 font-semibold">Categoria</th><th class="text-right p-2 font-semibold">Valor</th></tr>
              </thead>
              <tbody>${linhasEntradas}</tbody>
              <tfoot class="bg-green-50 font-semibold"><tr><td colspan="3" class="p-2">Total de entradas</td><td class="p-2 text-right text-green-700">R$ ${totalEntradas.toLocaleString("pt-BR")}</td></tr></tfoot>
            </table>
            <div class="secao-titulo rounded-t-lg mt-4">Despesas</div>
            <table class="w-full border border-gray-300">
              <thead class="bg-gray-100">
                <tr><th class="text-left p-2 font-semibold">Data</th><th class="text-left p-2 font-semibold">Descrição</th><th class="text-left p-2 font-semibold">Categoria</th><th class="text-right p-2 font-semibold">Valor</th></tr>
              </thead>
              <tbody>${linhasSaidas}</tbody>
              <tfoot class="bg-red-50 font-semibold"><tr><td colspan="3" class="p-2">Total de despesas</td><td class="p-2 text-right text-red-700">R$ ${totalSaidas.toLocaleString("pt-BR")}</td></tr></tfoot>
            </table>
            <div class="saldo-final rounded-b-lg flex justify-between items-center">
              <span>SALDO FINAL EM CAIXA</span>
              <span>R$ ${saldo.toLocaleString("pt-BR")}</span>
            </div>
            <p class="text-right text-sm text-gray-500 mt-4">${DADOS_IGREJA.endereco} - ${ano}</p>
          </div>
        </body>
      </html>
    `);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Relatório - {nomeMes} {ano}</DialogTitle>
          <DialogDescription>
            Detalhamento de entradas e despesas do mês
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div>
            <h3 className="text-sm font-semibold text-olive mb-2 flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Entradas ({entradas.length})
            </h3>
            {entradas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Nenhuma entrada neste mês.</p>
            ) : (
              <div className="space-y-2">
                {entradas.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-olive/5 border border-olive/20">
                    <div>
                      <p className="font-medium text-sm">{l.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.date.toLocaleDateString("pt-BR")} · {categoryLabels[l.category] || l.category}
                      </p>
                    </div>
                    <p className="font-semibold text-olive">+ R$ {l.amount.toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm font-semibold mt-2 text-olive">Total: R$ {totalEntradas.toLocaleString("pt-BR")}</p>
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
          <div className="p-4 rounded-lg bg-deep-blue/10 border border-deep-blue/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Saldo do mês</span>
              <span className={cn("font-bold text-lg", saldo >= 0 ? "text-deep-blue" : "text-destructive")}>
                R$ {saldo.toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onFechar}>Fechar</Button>
          <Button className="gap-2 bg-olive hover:bg-olive-dark" onClick={handleImprimir}>
            <Printer className="h-4 w-4" />
            Imprimir relatório
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CartaoLancamentoProps {
  lancamento: LancamentoApp;
  onExcluir?: (id: number) => void;
  podeExcluir?: boolean;
}

function CartaoLancamento({ lancamento, onExcluir, podeExcluir }: CartaoLancamentoProps) {
  const isIncome = lancamento.type === "income";
  const idNum = lancamento.idNum ?? Number(lancamento.id);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
          isIncome ? "bg-olive/10 text-olive" : "bg-destructive/10 text-destructive"
        )}
      >
        {isIncome ? (
          <ArrowUpCircle className="h-5 w-5" />
        ) : (
          <ArrowDownCircle className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{lancamento.description}</p>
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[lancamento.category] || lancamento.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {lancamento.date.toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <p
          className={cn(
            "font-bold",
            isIncome ? "text-olive" : "text-destructive"
          )}
        >
          {isIncome ? "+" : "-"} R$ {lancamento.amount.toLocaleString("pt-BR")}
        </p>
        {podeExcluir && onExcluir && idNum && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onExcluir(idNum)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Financeiro() {
  const { user } = usarAutenticacao();
  const podeEscreverFinanceiro = canWrite(user, "/financeiro");
  const [lancamentos, setLancamentos] = useState<LancamentoApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState<"income" | "expense">("income");
  const [formData, setFormData] = useState({
    data: dataHojeFormatada(),
    valor: "",
    categoria: "",
    descricao: "",
    metodoPagamento: "",
  });
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);

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
  const chartData = agregarPorMes(lancamentos, anoAtual);

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
      await criarLancamento({
        type: tipoLancamento,
        category: formData.categoria,
        description: formData.descricao.trim(),
        amount: valorNum,
        date: new Date(`${dataApi}T00:00:00`),
        paymentMethod: formData.metodoPagamento
          ? (formData.metodoPagamento as "cash" | "pix" | "card" | "transfer")
          : undefined,
      });
      toast.success("Lançamento registrado.");
      setDialogAberto(false);
      setFormData({
        data: dataHojeFormatada(),
        valor: "",
        categoria: "",
        descricao: "",
        metodoPagamento: "",
      });
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
    setFormData({
      data: dataHojeFormatada(),
      valor: "",
      categoria: "",
      descricao: "",
      metodoPagamento: "",
    });
  };

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-olive-foreground">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Financeiro</h1>
              <p className="text-sm text-muted-foreground">
                Gestão de entradas e saídas
              </p>
            </div>
          </div>

          <Dialog
            open={dialogAberto}
            onOpenChange={(open) => {
              setDialogAberto(open);
              if (open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!podeEscreverFinanceiro}>
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Lançamento</DialogTitle>
                <DialogDescription>
                  Registre uma nova entrada ou saída.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={tipoLancamento === "income" ? "default" : "outline"}
                    className={cn(
                      "gap-2",
                      tipoLancamento === "income" && "bg-olive hover:bg-olive-dark"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      placeholder="dd/mm/aaaa"
                      value={formData.data}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          data: aplicarMascaraData(e.target.value),
                        }))
                      }
                      maxLength={10}
                      inputMode="numeric"
                      className="flex-1 min-w-[120px]"
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
                    Salvar
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
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-olive/5 border-olive/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-olive" />
                    <span className="text-xs text-muted-foreground">Entradas</span>
                  </div>
                  <p className="text-lg font-bold text-olive">
                    R$ {totalReceitas.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-xs text-muted-foreground">Saídas</span>
                  </div>
                  <p className="text-lg font-bold text-destructive">
                    R$ {totalDespesas.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "border",
                  saldo >= 0
                    ? "bg-deep-blue/5 border-deep-blue/20"
                    : "bg-destructive/5 border-destructive/20"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet
                      className={cn(
                        "h-4 w-4",
                        saldo >= 0 ? "text-deep-blue" : "text-destructive"
                      )}
                    />
                    <span className="text-xs text-muted-foreground">Saldo</span>
                  </div>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      saldo >= 0 ? "text-deep-blue" : "text-destructive"
                    )}
                  >
                    R$ {saldo.toLocaleString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Movimentação Mensal {anoAtual}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full [&_.recharts-rectangle]:cursor-pointer">
                  <BarChart data={chartData}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="entradas"
                      fill="var(--color-entradas)"
                      radius={4}
                      onClick={(_, index) => index !== undefined && setMesSelecionado(index + 1)}
                    />
                    <Bar
                      dataKey="saidas"
                      fill="var(--color-saidas)"
                      radius={4}
                      onClick={(_, index) => index !== undefined && setMesSelecionado(index + 1)}
                    />
                  </BarChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Clique em um mês para ver o detalhamento
                </p>
              </CardContent>
            </Card>

            {mesSelecionado && (
              <ModalRelatorioMensal
                mes={mesSelecionado}
                ano={anoAtual}
                lancamentos={lancamentos}
                aberto={!!mesSelecionado}
                onFechar={() => setMesSelecionado(null)}
              />
            )}

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="income">Entradas</TabsTrigger>
                <TabsTrigger value="expense">Saídas</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-2">
                {lancamentos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Nenhum lançamento registrado. Clique em Novo para adicionar.
                  </p>
                ) : (
                  lancamentos.map((entry) => (
                    <CartaoLancamento
                      key={entry.id}
                      lancamento={entry}
                      onExcluir={handleExcluir}
                      podeExcluir={podeEscreverFinanceiro}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="income" className="mt-4 space-y-2">
                {lancamentos
                  .filter((e) => e.type === "income")
                  .map((entry) => (
                    <CartaoLancamento
                      key={entry.id}
                      lancamento={entry}
                      onExcluir={handleExcluir}
                      podeExcluir={podeEscreverFinanceiro}
                    />
                  ))}
                {lancamentos.filter((e) => e.type === "income").length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Nenhuma entrada registrada.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="expense" className="mt-4 space-y-2">
                {lancamentos
                  .filter((e) => e.type === "expense")
                  .map((entry) => (
                    <CartaoLancamento
                      key={entry.id}
                      lancamento={entry}
                      onExcluir={handleExcluir}
                      podeExcluir={podeEscreverFinanceiro}
                    />
                  ))}
                {lancamentos.filter((e) => e.type === "expense").length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Nenhuma saída registrada.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </LayoutApp>
  );
}
