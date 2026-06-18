import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { obterPlanoPublico, type PlanoPublico } from "@/modules/admin/api";
import {
  PLANO_LANCAMENTO_PADRAO,
  RECURSOS_PLANO_LANCAMENTO,
  TAXA_ADESAO_REFERENCIA,
  calcularValorAnualAvista,
  economiaAnualAvista,
  formatarMoeda,
  obterTaxaAdesao,
} from "@/lib/plano-comercial";
import { CreditoEmpresa } from "@/components/brand/CreditoEmpresa";
import { MARCA, PLATAFORMA, PRODUTO } from "@/lib/plataforma";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Church,
  CreditCard,
  FileArchive,
  Headphones,
  Heart,
  Mail,
  ImageIcon,
  MessageCircle,
  Phone,
  Megaphone,
  Music,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Zap,
  ZoomIn,
} from "lucide-react";

const HERO_SLIDES = [
  {
    destaque: "Minha Igreja Digital",
    titulo: "Sua igreja organizada em um só lugar",
    subtitulo:
      "Membros, visitantes, avisos, documentos, louvores, devocionais, financeiro e ofertas via PIX — no computador e no celular.",
  },
  {
    destaque: "Teste grátis, sem compromisso",
    titulo: "Foque no que realmente importa: vidas",
    subtitulo:
      "Gestão completa para sua igreja — membros, avisos, louvores, financeiro e PIX em um sistema simples.",
  },
  {
    destaque: "Organize sua igreja sem burocracia",
    titulo: "Secretaria, finanças e comunicação em um só lugar",
    subtitulo:
      "Chega de dados espalhados em planilhas, cadernos e grupos de WhatsApp. Tudo integrado e acessível no celular.",
  },
  {
    destaque: "Desenvolvido para a realidade da igreja",
    titulo: "Tecnologia a serviço do ministério",
    subtitulo:
      "Plataforma criada para pastores e líderes que querem menos papelada e mais tempo com as pessoas.",
  },
  {
    destaque: "Suporte dentro do próprio sistema",
    titulo: "Dúvidas, erros e sugestões com quem entende sua igreja",
    subtitulo:
      "Abra chamados direto no sistema para tirar dúvidas, reportar problemas e enviar ideias de melhoria. A equipe acompanha cada solicitação da sua igreja.",
  },
];

const PILARES = [
  {
    titulo: "Segurança",
    descricao: "Seus dados protegidos na nuvem, com acesso por perfil e login seguro.",
    icon: Shield,
  },
  {
    titulo: "Suporte",
    descricao: `Atendimento da equipe ${PLATAFORMA.empresa} que entende a rotina da igreja.`,
    icon: Headphones,
  },
  {
    titulo: "Simplicidade",
    descricao: "Interface clara e intuitiva — sua equipe aprende rápido, sem complicação.",
    icon: Zap,
  },
  {
    titulo: "Mobilidade",
    descricao: "Funciona no computador, tablet e celular. Sem instalar aplicativo.",
    icon: Smartphone,
  },
];

const DESTAQUES = [
  { valor: "7", label: "dias de teste grátis" },
  { valor: "12+", label: "módulos integrados" },
  { valor: "100%", label: "web — sem instalar app" },
  { valor: "Docs", label: "documentos da igreja" },
];

const MODULOS = [
  {
    titulo: "Membros",
    descricao: "Cadastro completo, perfis, aniversariantes e aprovação de pré-cadastros.",
    icon: Users,
  },
  {
    titulo: "Visitantes",
    descricao: "Acompanhe visitantes e integre novos membros com fluxo organizado.",
    icon: Heart,
  },
  {
    titulo: "Avisos",
    descricao: "Comunique a igreja com avisos fixos, urgentes e notificações.",
    icon: Megaphone,
  },
  {
    titulo: "Louvores",
    descricao: "Organize repertório, grupos e escalas do ministério de louvor.",
    icon: Music,
  },
  {
    titulo: "Devocionais",
    descricao: "Publique devocionais e fortaleça a vida espiritual da congregação.",
    icon: Sparkles,
  },
  {
    titulo: "Bíblia",
    descricao: "Leitura bíblica e plano coletivo configurável pela igreja.",
    icon: BookOpen,
  },
  {
    titulo: "Financeiro",
    descricao: "Entradas, saídas, relatórios e visão clara das finanças.",
    icon: Wallet,
  },
  {
    titulo: "PIX e logo",
    descricao: "Chave PIX para ofertas e logo da sua igreja no sistema.",
    icon: CreditCard,
  },
  {
    titulo: "Documentos da Igreja",
    descricao:
      "Guarde atas, estatutos, contratos, certidões e outros documentos importantes da igreja em um só lugar.",
    icon: FileArchive,
  },
  {
    titulo: "Suporte",
    descricao: "Central de suporte integrada para dúvidas, erros e sugestões de melhoria.",
    icon: Headphones,
  },
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
      `Não. O ${PRODUTO.nome} funciona no navegador e é responsivo para celular, tablet e computador. Basta acessar pelo link que enviamos.`,
  },
  {
    pergunta: "Minha equipe não sabe mexer em computador. Vai conseguir?",
    resposta:
      "O sistema foi pensado para ser simples. Oferecemos orientação inicial e suporte pela plataforma para tirar dúvidas.",
  },
  {
    pergunta: "Como funciona o teste grátis?",
    resposta:
      "Sua igreja solicita o acesso, nós analisamos e liberamos 7 dias para testar todos os recursos, sem compromisso.",
  },
  {
    pergunta: "Como é feito o pagamento?",
    resposta:
      "Taxa única de adesão promocional de R$ 200,00 na ativação após o teste, mais assinatura mensal (R$ 57/mês) ou anual. No PIX à vista, o anual equivale a 10 meses (2 meses grátis). No cartão, o anual pode ser parcelado em 12× com o valor mensal.",
  },
  {
    pergunta: "Existe limite de membros?",
    resposta: "Neste lançamento, o plano único não possui limite de membros cadastrados.",
  },
  {
    pergunta: "Existe taxa de adesão?",
    resposta:
      "Sim. Na promoção de lançamento, a taxa única de adesão ao sistema é de R$ 200,00 (cobrada uma vez, na ativação após o teste grátis). Inclui orientação e configuração inicial. A mensalidade é cobrada à parte.",
  },
  {
    pergunta: "E se eu não gostar?",
    resposta:
      "Teste gratuitamente por 7 dias. Se não fizer sentido para sua igreja, basta não continuar — sem multa.",
  },
];

const PASSOS = [
  "Solicite o teste grátis",
  "Nós liberamos o acesso da sua igreja",
  "Você testa por 7 dias",
  "Se gostar, ativa sua assinatura",
  "Sua igreja continua usando a plataforma",
];

function PlaceholderImagem({ legenda }: { legenda: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/40 text-muted-foreground">
      <ImageIcon className="h-8 w-8 opacity-50" />
      <span className="text-sm font-medium">{legenda}</span>
    </div>
  );
}

function ScreenshotCard({ src, alt, legenda }: { src: string; alt: string; legenda: string }) {
  const [erro, setErro] = useState(false);
  const [ampliado, setAmpliado] = useState(false);

  if (erro) return <PlaceholderImagem legenda={legenda} />;

  return (
    <>
      <button
        type="button"
        onClick={() => setAmpliado(true)}
        className="group relative w-full overflow-hidden rounded-xl border bg-background shadow-md transition hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Ampliar screenshot: ${legenda}`}
      >
        <img
          src={src}
          alt={alt}
          className="aspect-[4/3] w-full object-contain object-top"
          onError={() => setErro(true)}
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
          <span className="flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-medium opacity-0 shadow-sm transition group-hover:opacity-100">
            <ZoomIn className="h-3.5 w-3.5" />
            Clique para ampliar
          </span>
        </span>
      </button>

      <Dialog open={ampliado} onOpenChange={setAmpliado}>
        <DialogContent className="max-h-[95vh] w-[95vw] max-w-5xl overflow-auto p-3 sm:p-4">
          <DialogTitle className="mb-2 text-center text-base font-semibold">{legenda}</DialogTitle>
          <img src={src} alt={alt} className="mx-auto max-h-[80vh] w-full rounded-lg object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
}

function LinkNav({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
    >
      {children}
    </a>
  );
}

const DURACAO_FADE_MS = 500;
const INTERVALO_SLIDE_MS = 7500;

export default function Landing() {
  const [plano, setPlano] = useState<PlanoPublico | null>(null);
  const [slideAtivo, setSlideAtivo] = useState(0);
  const [fadeVisivel, setFadeVisivel] = useState(true);
  useTituloDocumento({ area: "produto" });

  useEffect(() => {
    obterPlanoPublico()
      .then(setPlano)
      .catch(() => setPlano(null));
  }, []);

  const mudarSlide = (proximo: number) => {
    if (proximo === slideAtivo) return;
    setFadeVisivel(false);
    window.setTimeout(() => {
      setSlideAtivo(proximo);
      setFadeVisivel(true);
    }, DURACAO_FADE_MS);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeVisivel(false);
      window.setTimeout(() => {
        setSlideAtivo((i) => (i + 1) % HERO_SLIDES.length);
        setFadeVisivel(true);
      }, DURACAO_FADE_MS);
    }, INTERVALO_SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  const valorMensal = plano?.valorMensal ?? PLANO_LANCAMENTO_PADRAO.valorMensal;
  const valorAnualAvista =
    plano?.valorAnual ?? PLANO_LANCAMENTO_PADRAO.valorAnual ?? calcularValorAnualAvista(valorMensal);
  const economiaAnual = economiaAnualAvista(valorMensal, valorAnualAvista);
  const diasTrial = plano?.diasTrial ?? 7;
  const nomePlano = plano?.nome ?? PLANO_LANCAMENTO_PADRAO.nome;
  const taxaAdesao = obterTaxaAdesao(plano?.valorImplantacao);
  const taxaAdesaoReferencia = TAXA_ADESAO_REFERENCIA;
  const slide = HERO_SLIDES[slideAtivo];

  return (
    <div className="min-h-screen bg-background pt-14 text-foreground">
      {/* Header fixo ao rolar */}
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4">
          <Link to="/landing" className="flex min-w-0 items-center gap-2 font-semibold">
            <img src={MARCA.logoIcon} alt="" className="h-8 w-8 shrink-0 rounded-lg" />
            <span className="truncate">{MARCA.nome}</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <LinkNav href="#modulos">Módulos</LinkNav>
            <LinkNav href="#sistema">Sistema</LinkNav>
            <LinkNav href="#precos">Planos</LinkNav>
            <LinkNav href="#faq">FAQ</LinkNav>
            <LinkNav href="#contato">Contato</LinkNav>
          </nav>
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="shrink-0 px-2.5 text-xs sm:px-3 sm:text-sm">
              <Link to="/solicitar-acesso" title="Cadastro e teste grátis para administrador da igreja">
                <span className="sm:hidden">Teste grátis (admin)</span>
                <span className="hidden sm:inline">Admin da igreja — teste grátis</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero slider */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/15 via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div
            className={cn(
              "mx-auto max-w-3xl space-y-6 text-center transition-all duration-700 ease-in-out",
              fadeVisivel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {slideAtivo === HERO_SLIDES.length - 1 ? (
                <Headphones className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {slide.destaque}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{slide.titulo}</h1>
            <p className="text-lg text-muted-foreground sm:text-xl">{slide.subtitulo}</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="gap-2 px-8">
                <Link to="/solicitar-acesso">
                  Testar grátis por {diasTrial} dias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Entrar no sistema</Link>
              </Button>
            </div>
            <div className="flex justify-center gap-2 pt-4">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => mudarSlide(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500 ease-in-out",
                    i === slideAtivo ? "w-8 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/50",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-b bg-muted/20 py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILARES.map(({ titulo, descricao, icon: Icon }) => (
            <div key={titulo} className="rounded-xl border bg-background p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{titulo}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Narrativa / dor */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Você foi chamado para pastorear, não para se perder na burocracia
          </h2>
          <p className="mt-6 text-left text-muted-foreground leading-relaxed sm:text-center sm:text-lg">
            Horas procurando dados de membros em cadernos e planilhas. Relatórios financeiros que demoram dias.
            Avisos que não chegam a todos. Enquanto isso, o que você ama fazer — pastorear, discipular, estar com as
            pessoas — fica em segundo plano.
          </p>
          <p className="mt-4 text-left font-medium text-foreground sm:text-center">
            O {PRODUTO.nome} reúne secretaria, comunicação e finanças em um só lugar. Simples, seguro e pensado para
            a rotina da sua igreja.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2">
            <Link to="/solicitar-acesso">
              Conhecer o {PRODUTO.nome}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Destaques numéricos */}
      <section className="border-y bg-primary py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTAQUES.map(({ valor, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-bold sm:text-5xl">{valor}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wide opacity-90">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos */}
      <section id="modulos" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Tudo que sua igreja precisa</h2>
            <p className="mt-2 text-muted-foreground">Módulos integrados em um só lugar.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULOS.map(({ titulo, descricao, icon: Icon }) => (
              <Card key={titulo} className="border shadow-sm transition hover:border-primary/30 hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{descricao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section id="sistema" className="scroll-mt-20 border-y bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Veja o sistema por dentro</h2>
            <p className="mt-2 text-muted-foreground">
              Screenshots reais do painel da igreja. Clique em qualquer imagem para ampliar.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SCREENSHOTS.map((s) => (
              <div key={s.legenda} className="space-y-2">
                <ScreenshotCard src={s.src} alt={s.alt} legenda={s.legenda} />
                <p className="text-center text-sm font-semibold">{s.legenda}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="precos" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Plano ideal para sua igreja crescer</h2>
            <p className="mt-2 text-muted-foreground">
              Um plano completo com todos os recursos. Sem limite de membros no lançamento.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-xl font-semibold">O que está incluso</h3>
              <ul className="space-y-2.5">
                {RECURSOS_PLANO_LANCAMENTO.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <Card className="relative border-2 border-primary shadow-xl lg:col-span-3">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                Recomendado
              </span>
              <CardHeader className="pt-8 text-center">
                <CardTitle className="text-2xl">{nomePlano}</CardTitle>
                <CardDescription>Teste grátis por {diasTrial} dias · sem cartão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Assinatura a partir de</p>
                  <p className="text-4xl font-bold">
                    {formatarMoeda(valorMensal)}
                    <span className="text-base font-normal text-muted-foreground">/mês</span>
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 text-center dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/20">
                  <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    Promoção de lançamento
                  </span>
                  <p className="mt-2 text-sm font-semibold text-foreground">Taxa de adesão ao sistema</p>
                  <p className="mt-1 flex flex-wrap items-baseline justify-center gap-2">
                    {taxaAdesaoReferencia > taxaAdesao && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatarMoeda(taxaAdesaoReferencia)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                      {formatarMoeda(taxaAdesao)}
                    </span>
                    <span className="text-xs text-muted-foreground">pagamento único</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Cobrada na ativação, após o teste grátis. Inclui configuração inicial e orientação.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border bg-muted/30 p-4 text-sm">
                    <p className="font-semibold">Plano mensal</p>
                    <p className="mt-1 text-lg font-bold">{formatarMoeda(valorMensal)}/mês</p>
                    <p className="mt-1 text-xs text-muted-foreground">Renovação mensal, sem fidelidade longa.</p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 text-sm dark:border-green-900 dark:bg-green-950/30">
                    <p className="font-semibold text-green-800 dark:text-green-300">Anual à vista (PIX)</p>
                    <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-400">
                      {formatarMoeda(valorAnualAvista)}/ano
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      10 meses pelo preço de 12 —{" "}
                      {economiaAnual > 0 && (
                        <strong className="text-green-700 dark:text-green-400">
                          economia de {formatarMoeda(economiaAnual)}
                        </strong>
                      )}
                    </p>
                  </div>
                </div>
                <p className="rounded-lg border bg-muted/20 px-3 py-2 text-center text-xs text-muted-foreground">
                  Anual no cartão: 12× de {formatarMoeda(valorMensal)} (mesmo valor do mensal). Adesão promocional:{" "}
                  <strong>{formatarMoeda(taxaAdesao)}</strong> (única vez).
                </p>
                <Button asChild className="w-full" size="lg">
                  <Link to="/solicitar-acesso">Começar teste grátis</Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Sem taxas escondidas. O que você vê é o que você paga.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="border-t bg-muted/20 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PASSOS.map((passo, i) => (
              <li
                key={passo}
                className="relative rounded-xl border bg-background p-5 shadow-sm"
              >
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm font-medium leading-snug">{passo}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={item.pergunta} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium">{item.pergunta}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.resposta}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="scroll-mt-20 border-t bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Fale conosco</h2>
          <p className="mt-3 text-muted-foreground">
            Tire dúvidas sobre o {MARCA.nome}, planos ou teste grátis. A equipe {MARCA.empresa} responde por
            WhatsApp, telefone ou e-mail.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Card className="text-left shadow-sm">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${MARCA.contato.telefoneE164}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {MARCA.contato.telefoneExibicao}
                </a>
              </CardContent>
            </Card>
            <Card className="text-left shadow-sm">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={MARCA.contato.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {MARCA.contato.telefoneExibicao}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">Toque para abrir a conversa</p>
              </CardContent>
            </Card>
            <Card className="text-left shadow-sm sm:col-span-1">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">E-mail</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${MARCA.contato.email}`}
                  className="break-all text-sm font-medium text-primary hover:underline"
                >
                  {MARCA.contato.email}
                </a>
              </CardContent>
            </Card>
          </div>
          <Button asChild size="lg" className="mt-8 gap-2">
            <a href={MARCA.contato.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Chamar no WhatsApp
            </a>
          </Button>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-primary to-primary/80 py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Church className="mx-auto mb-4 h-12 w-12 opacity-90" />
          <h2 className="text-2xl font-bold sm:text-3xl">Sua igreja merece estar organizada</h2>
          <p className="mt-3 text-lg opacity-90">
            Comece hoje com {diasTrial} dias grátis. Sem compromisso, sem cartão.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/solicitar-acesso">
                Teste grátis por {diasTrial} dias
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/login">Entrar no sistema</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{MARCA.nome}</p>
          <p className="mt-1">{MARCA.slogan}</p>
          <CreditoEmpresa className="mt-6" />
          <p className="mt-3 text-xs">
            <a href="#contato" className="hover:text-foreground hover:underline">
              Contato
            </a>
            {" · "}
            <a href={`tel:${MARCA.contato.telefoneE164}`} className="hover:text-foreground hover:underline">
              {MARCA.contato.telefoneExibicao}
            </a>
            {" · "}
            <a href={`mailto:${MARCA.contato.email}`} className="hover:text-foreground hover:underline">
              {MARCA.contato.email}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
