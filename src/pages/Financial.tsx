import { useState } from "react";
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
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import type { LancamentoFinanceiro } from "@/types";
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

// Lancamentos de exemplo
const lancamentosExemplo: LancamentoFinanceiro[] = [
  {
    id: "1",
    type: "income",
    category: "tithe",
    description: "Dízimos do culto de domingo",
    amount: 2500,
    date: new Date(),
    paymentMethod: "pix",
    createdAt: new Date(),
    createdBy: "Tesoureiro",
  },
  {
    id: "2",
    type: "income",
    category: "offering",
    description: "Ofertas do culto",
    amount: 850,
    date: new Date(),
    paymentMethod: "cash",
    createdAt: new Date(),
    createdBy: "Tesoureiro",
  },
  {
    id: "3",
    type: "expense",
    category: "utilities",
    description: "Conta de energia",
    amount: 450,
    date: new Date(),
    paymentMethod: "pix",
    createdAt: new Date(),
    createdBy: "Tesoureiro",
  },
];

const chartData = [
  { month: "Jan", entradas: 8500, saidas: 4200 },
  { month: "Fev", entradas: 7800, saidas: 3800 },
  { month: "Mar", entradas: 9200, saidas: 5100 },
  { month: "Abr", entradas: 8100, saidas: 4500 },
  { month: "Mai", entradas: 9800, saidas: 4800 },
  { month: "Jun", entradas: 8900, saidas: 4100 },
];

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

interface CartaoLancamentoProps {
  lancamento: LancamentoFinanceiro;
}

function CartaoLancamento({ lancamento }: CartaoLancamentoProps) {
  const isIncome = lancamento.type === "income";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        isIncome ? "bg-olive/10 text-olive" : "bg-destructive/10 text-destructive"
      )}>
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
      
      <p className={cn(
        "font-bold",
        isIncome ? "text-olive" : "text-destructive"
      )}>
        {isIncome ? "+" : "-"} R$ {lancamento.amount.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

export default function Financeiro() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [tipoLancamento, setTipoLancamento] = useState<"income" | "expense">("income");
  const [formData, setFormData] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const totalReceitas = lancamentosExemplo
    .filter((e) => e.type === "income")
    .reduce((acc, e) => acc + e.amount, 0);

  const totalDespesas = lancamentosExemplo
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => acc + e.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <LayoutApp>
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
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

          <Dialog open={dialogAberto} onOpenChange={(open) => { setDialogAberto(open); if (open) setFormData(new Date().toISOString().slice(0, 10)); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                {/* Type Selection */}
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
                    <Input id="amount" type="number" className="pl-10" placeholder="0,00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoLancamento === "income" ? (
                        <>
                          <SelectItem value="tithe">Dízimo</SelectItem>
                          <SelectItem value="offering">Oferta</SelectItem>
                          <SelectItem value="donation">Doação</SelectItem>
                          <SelectItem value="special">Especial</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="utilities">Contas</SelectItem>
                          <SelectItem value="maintenance">Manutenção</SelectItem>
                          <SelectItem value="supplies">Materiais</SelectItem>
                          <SelectItem value="salaries">Salários</SelectItem>
                          <SelectItem value="events">Eventos</SelectItem>
                          <SelectItem value="missions">Missões</SelectItem>
                          <SelectItem value="other">Outros</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea id="description" placeholder="Descreva o lançamento..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <DatePicker
                      id="date"
                      value={formData}
                      onChange={setFormData}
                      placeholder="Selecione a data"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment">Pagamento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="card">Cartão</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setDialogAberto(false)}>
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
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

          <Card className={cn(
            "border",
            saldo >= 0 ? "bg-deep-blue/5 border-deep-blue/20" : "bg-destructive/5 border-destructive/20"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className={cn("h-4 w-4", saldo >= 0 ? "text-deep-blue" : "text-destructive")} />
                <span className="text-xs text-muted-foreground">Saldo</span>
              </div>
              <p className={cn("text-lg font-bold", saldo >= 0 ? "text-deep-blue" : "text-destructive")}>
                R$ {saldo.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Movimentação Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="entradas" fill="var(--color-entradas)" radius={4} />
                <Bar dataKey="saidas" fill="var(--color-saidas)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="income">Entradas</TabsTrigger>
            <TabsTrigger value="expense">Saídas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {lancamentosExemplo.map((entry) => (
              <CartaoLancamento key={entry.id} lancamento={entry} />
            ))}
          </TabsContent>

          <TabsContent value="income" className="mt-4 space-y-2">
            {lancamentosExemplo
              .filter((e) => e.type === "income")
              .map((entry) => (
                <CartaoLancamento key={entry.id} lancamento={entry} />
              ))}
          </TabsContent>

          <TabsContent value="expense" className="mt-4 space-y-2">
            {lancamentosExemplo
              .filter((e) => e.type === "expense")
              .map((entry) => (
                <CartaoLancamento key={entry.id} lancamento={entry} />
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </LayoutApp>
  );
}
