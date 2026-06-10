import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { obterPlanoPublico, type PlanoPublico } from "@/modules/admin/api";
import { PLANO_LANCAMENTO_PADRAO, RECURSOS_PLANO_LANCAMENTO, formatarMoeda } from "@/lib/plano-comercial";
import { PLATAFORMA, PRODUTO } from "@/lib/plataforma";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import {
  ArrowRight,
  Church,
  CreditCard,
  ImageIcon,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

const BENEFICIOS = [
  { titulo: "Membros e visitantes organizados", icon: Users },
  { titulo: "Financeiro da igreja", icon: Wallet },
  { titulo: "Avisos e comunicação", icon: Church },
  { titulo: "Louvores e devocionais", icon: Sparkles },
  { titulo: "Ofertas via PIX", icon: CreditCard },
  { titulo: "Funciona no celular", icon: Smartphone },
  { titulo: "Identidade visual da igreja", icon: Church },
  { titulo: "Suporte direto pela plataforma", icon: Church },
];

const SCREENSHOTS = [
  { src: "/landing/dashboard.png", alt: "Dashboard da igreja", legenda: "Dashboard" },
  { src: "/landing/membros.png", alt: "Cadastro de membros", legenda: "Membros" },
  { src: "/landing/financeiro.png", alt: "Financeiro da igreja", legenda: "Financeiro" },
  { src: "/landing/pix.png", alt: "Ofertas via PIX", legenda: "PIX" },
  { src: "/landing/configuracoes.png", alt: "Configurações", legenda: "Configurações" },
  { src: "/landing/suporte.png", alt: "Central de suporte", legenda: "Suporte" },
];

const FAQ = [
  {
    pergunta: "Precisa instalar aplicativo?",
    resposta:
      "Não. A plataforma funciona pela web e é responsiva para celular, tablet e computador.",
  },
  {
    pergunta: "Como funciona o teste grátis?",
    resposta: "A igreja testa por 7 dias sem compromisso.",
  },
  {
    pergunta: "Como é feito o pagamento?",
    resposta: "No lançamento, o pagamento é feito por PIX ou link externo enviado pelo suporte.",
  },
  {
    pergunta: "Existe limite de membros?",
    resposta: "Neste lançamento, o plano único não possui limite de membros.",
  },
  {
    pergunta: "O que está incluso na implantação?",
    resposta: "Liberação da igreja, configuração inicial, orientação de uso e suporte inicial.",
  },
];

function PlaceholderImagem({ legenda }: { legenda: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 text-muted-foreground">
      <ImageIcon className="h-8 w-8 opacity-50" />
      <span className="text-sm font-medium">{legenda}</span>
      <span className="text-xs opacity-70">Substitua por screenshot em public/landing/</span>
    </div>
  );
}

function ScreenshotCard({ src, alt, legenda }: { src: string; alt: string; legenda: string }) {
  const [erro, setErro] = useState(false);
  if (erro) return <PlaceholderImagem legenda={legenda} />;
  return (
    <img
      src={src}
      alt={alt}
      className="aspect-video w-full rounded-xl border object-cover shadow-sm"
      onError={() => setErro(true)}
    />
  );
}

export default function Landing() {
  const [plano, setPlano] = useState<PlanoPublico | null>(null);
  useTituloDocumento({ area: "produto" });

  useEffect(() => {
    obterPlanoPublico()
      .then(setPlano)
      .catch(() => setPlano(null));
  }, []);

  const valorMensal = plano?.valorMensal ?? PLANO_LANCAMENTO_PADRAO.valorMensal;
  const valorAnual = plano?.valorAnual ?? PLANO_LANCAMENTO_PADRAO.valorAnual ?? 1510.92;
  const valorImplantacao = plano?.valorImplantacao ?? PLANO_LANCAMENTO_PADRAO.valorImplantacao ?? 700;
  const promocaoImplantacao = plano?.promocaoImplantacaoAnual ?? 500;
  const diasTrial = plano?.diasTrial ?? 7;
  const nomePlano = plano?.nome ?? PLANO_LANCAMENTO_PADRAO.nome;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <Church className="h-5 w-5 text-primary" />
            <span>{PRODUTO.nome}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Entrar no sistema</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/solicitar-acesso">Começar teste grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              {diasTrial} dias grátis para sua igreja testar
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Gestão completa para igrejas, simples e acessível
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl">
              Organize membros, visitantes, avisos, louvores, devocionais, financeiro e ofertas via PIX em uma
              plataforma web que funciona no computador e no celular.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/solicitar-acesso">
                  Testar grátis por {diasTrial} dias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Entrar no sistema</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold">Tudo que sua igreja precisa</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFICIOS.map(({ titulo, icon: Icon }) => (
            <Card key={titulo}>
              <CardHeader className="pb-2">
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <CardTitle className="text-base">{titulo}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-2xl font-bold">Veja o sistema por dentro</h2>
          <p className="mb-8 text-muted-foreground">Screenshots reais do painel da igreja.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCREENSHOTS.map((s) => (
              <div key={s.legenda} className="space-y-2">
                <ScreenshotCard src={s.src} alt={s.alt} legenda={s.legenda} />
                <p className="text-center text-sm font-medium text-muted-foreground">{s.legenda}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16" id="precos">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-bold">Plano {nomePlano}</h2>
            <p className="mt-2 text-muted-foreground">
              Um plano único com todos os recursos. Sem limite de membros no lançamento.
            </p>
            <ul className="mt-6 space-y-2">
              {RECURSOS_PLANO_LANCAMENTO.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-2 border-primary/30 shadow-lg">
            <CardHeader>
              <CardTitle>{nomePlano}</CardTitle>
              <CardDescription>Teste grátis por {diasTrial} dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{formatarMoeda(valorMensal)}<span className="text-base font-normal text-muted-foreground">/mês</span></p>
              </div>
              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                <p><strong>Implantação padrão:</strong> {formatarMoeda(valorImplantacao)}</p>
                <p><strong>Anual no PIX:</strong> {formatarMoeda(valorAnual)} (10% de desconto no plano)</p>
                <p className="text-green-700 dark:text-green-400">
                  <strong>Promoção no anual:</strong> pagamento anual no PIX com implantação por{" "}
                  {formatarMoeda(promocaoImplantacao)} (em vez de {formatarMoeda(valorImplantacao)})
                </p>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Opção 1 — Mensal:</strong> {formatarMoeda(valorImplantacao)} implantação +{" "}
                  {formatarMoeda(valorMensal)}/mês
                </p>
                <p>
                  <strong>Opção 2 — Anual PIX:</strong> {formatarMoeda(valorImplantacao)} implantação +{" "}
                  {formatarMoeda(valorAnual)}/ano no PIX
                </p>
                <p className="text-green-700 dark:text-green-400">
                  <strong>Opção 3 — Promoção no anual:</strong> pagamento anual no PIX com implantação de{" "}
                  {formatarMoeda(promocaoImplantacao)} + {formatarMoeda(valorAnual)}/ano
                </p>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/solicitar-acesso">Começar teste grátis</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-2xl font-bold">Como funciona</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              "Solicite o teste grátis",
              "Nós liberamos o acesso da sua igreja",
              "Você testa por 7 dias",
              "Se gostar, ativa sua assinatura",
              "Sua igreja continua usando a plataforma",
            ].map((passo, i) => (
              <li key={passo} className="rounded-xl border bg-background p-4">
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm font-medium">{passo}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Perguntas frequentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <Card key={item.pergunta}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.pergunta}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.resposta}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t bg-primary/5 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold">Quer organizar a gestão da sua igreja?</h2>
          <p className="mt-2 text-muted-foreground">Comece hoje com {diasTrial} dias grátis, sem compromisso.</p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/solicitar-acesso">Começar teste grátis</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {PLATAFORMA.nome} · {PLATAFORMA.empresa}
      </footer>
    </div>
  );
}
