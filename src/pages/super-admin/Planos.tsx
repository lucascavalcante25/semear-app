import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  Loader2,
  Smartphone,
  Sparkles,
  Users,
  CalendarDays,
} from "lucide-react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listarPlanosAdmin, type Plano } from "@/modules/admin/api";
import { PLATAFORMA } from "@/lib/plataforma";
import {
  calcularValorAnualAvista,
  economiaAnualAvista,
  formatarMoeda,
  normalizarPlano,
  PLANO_LANCAMENTO_PADRAO,
  RECURSOS_PLANO_LANCAMENTO,
  TEXTO_RENOVACAO_CARTAO_12X,
} from "@/lib/plano-comercial";
import { cn } from "@/lib/utils";
import { SecaoMensagensComerciais } from "@/components/comercial/MensagensComerciais";

export default function PlanosSuperAdmin() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        setPlanos(await listarPlanosAdmin());
      } catch {
        setPlanos([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  const plano = useMemo(() => normalizarPlano(planos), [planos]);
  const usandoFallback = planos.length === 0 && !carregando;

  const valorMensal = plano.valorMensal ?? PLANO_LANCAMENTO_PADRAO.valorMensal;
  const valorAnualAvista =
    plano.valorAnual ?? PLANO_LANCAMENTO_PADRAO.valorAnual ?? calcularValorAnualAvista(valorMensal);
  const diasTrial = plano.diasTrial ?? PLANO_LANCAMENTO_PADRAO.diasTrial ?? 7;
  const economiaAnual = economiaAnualAvista(valorMensal, valorAnualAvista);

  return (
    <LayoutSuperAdmin>
      <div className="space-y-8 max-w-5xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
          <p className="text-muted-foreground max-w-2xl">
            Modelo comercial de lançamento da plataforma {PLATAFORMA.nome}. Um plano único com todos
            os recursos — use esta página como referência ao vender para igrejas.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Planos ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{carregando ? "—" : planos.filter((p) => p.ativo).length || 1}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teste grátis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{diasTrial} dias</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatarMoeda(valorMensal)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Anual à vista</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatarMoeda(valorAnualAvista)}
              </p>
            </CardContent>
          </Card>
        </div>

        {carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <Card
              className={cn(
                "overflow-hidden border-2 shadow-md",
                plano.destaque !== false ? "border-primary/40" : "border-border",
              )}
            >
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="gap-1 bg-primary hover:bg-primary">
                        <Sparkles className="h-3 w-3" />
                        Plano de lançamento
                      </Badge>
                      <Badge variant={plano.ativo !== false ? "outline" : "secondary"}>
                        {plano.ativo !== false ? "Ativo" : "Inativo"}
                      </Badge>
                      {usandoFallback && (
                        <Badge variant="secondary">Valores padrão (API vazia)</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                    <CardDescription className="text-base max-w-xl">
                      {plano.descricao ?? PLANO_LANCAMENTO_PADRAO.descricao}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>Membros ilimitados</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-8">
                <div className="rounded-xl border bg-muted/30 p-4 sm:p-5">
                  <p className="text-sm font-medium text-primary mb-1">
                    {diasTrial} dias grátis para testar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A igreja explora todos os recursos sem compromisso. Após o teste, escolhe plano mensal
                    ou anual. <strong>Sem taxa de implantação.</strong>
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      Plano mensal
                    </div>
                    <p className="text-2xl font-bold">{formatarMoeda(valorMensal)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Cobrança mensal recorrente. Valor de referência a partir de{" "}
                      {formatarMoeda(valorMensal)}/mês.
                    </p>
                  </div>

                  <div className="rounded-xl border p-4 space-y-2 ring-2 ring-primary/20">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Anual no cartão
                    </div>
                    <p className="text-2xl font-bold">12× {formatarMoeda(valorMensal)}</p>
                    <p className="text-xs text-muted-foreground">
                      Total: {formatarMoeda(valorMensal * 12)} em 12 parcelas — mesmo valor do mensal.
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed border-t pt-2 mt-2">
                      {TEXTO_RENOVACAO_CARTAO_12X}
                    </p>
                  </div>

                  <div className="rounded-xl border p-4 space-y-2 bg-green-50/50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Smartphone className="h-4 w-4 text-green-700 dark:text-green-400" />
                      Anual à vista (PIX)
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {formatarMoeda(valorAnualAvista)}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Equivalente a 10 meses — <strong>2 meses grátis</strong>
                      {economiaAnual > 0 && (
                        <>
                          {" "}
                          (economia de {formatarMoeda(economiaAnual)})
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-3">Tudo incluso neste plano</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {RECURSOS_PLANO_LANCAMENTO.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resumo comercial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2 border-b pb-2">
                    <span className="text-muted-foreground">Teste</span>
                    <span className="font-medium">{diasTrial} dias</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b pb-2">
                    <span className="text-muted-foreground">Mensal</span>
                    <span className="font-medium text-right">{formatarMoeda(valorMensal)}/mês</span>
                  </div>
                  <div className="flex justify-between gap-2 border-b pb-2">
                    <span className="text-muted-foreground">Anual cartão (12×)</span>
                    <span className="font-medium text-right">12× {formatarMoeda(valorMensal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pb-2 border-b">
                    {TEXTO_RENOVACAO_CARTAO_12X}
                  </p>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Anual PIX (2 meses grátis)</span>
                    <span className="font-medium text-right text-green-700 dark:text-green-400">
                      {formatarMoeda(valorAnualAvista)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">Sem taxa de implantação.</p>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="pt-5 text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong className="text-foreground">Para o time comercial:</strong> vincule este plano
                    ao aprovar uma solicitação de acesso ou ao cadastrar a igreja no painel.
                  </p>
                  <p>
                    Cobrança e status de pagamento são gerenciados em{" "}
                    <strong className="text-foreground">Meu Financeiro</strong>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opções comerciais</CardTitle>
            <CardDescription>Modelos de venda para apresentar às igrejas</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg border p-4 space-y-1">
              <p className="font-semibold">Opção 1 — Mensal</p>
              <p>{formatarMoeda(valorMensal)}/mês</p>
              <p className="text-xs text-muted-foreground pt-1">Sem taxa de implantação.</p>
            </div>
            <div className="rounded-lg border p-4 space-y-1 bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-800 dark:text-green-300">Opção 2 — Anual</p>
              <p>
                <strong>PIX à vista:</strong> {formatarMoeda(valorAnualAvista)}/ano (2 meses grátis)
              </p>
              <p>
                <strong>Cartão:</strong> 12× de {formatarMoeda(valorMensal)}
              </p>
            </div>
          </CardContent>
        </Card>

        <SecaoMensagensComerciais />
      </div>
    </LayoutSuperAdmin>
  );
}
