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
import { rastrearCtaTesteGratis, rastrearFaq, rastrearTelefone, rastrearWhatsapp } from "@/lib/analytics";
import {
  DadosEstruturadosLanding,
  PreloadImagemLcp,
} from "@/components/landing/DadosEstruturadosLanding";
import {
  CalendarDays,
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Church,
  CreditCard,
  FileArchive,
  Headphones,
  Heart,
  Mail,
  ImageIcon,
  Instagram,
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
      "Membros, visitantes, cultos, escalas de portaria e limpeza, eventos com inscrições e divulgação no WhatsApp, informativos, oração, documentos, louvores, financeiro e PIX — no computador e no celular.",
    imagem: "/landing/dashboard.webp",
    imagemAlt: "Painel principal com visão geral da igreja",
  },
  {
    destaque: "Teste grátis, sem compromisso",
    titulo: "Foque no que realmente importa: vidas",
    subtitulo:
      "Gestão completa para sua igreja — membros, avisos, louvores, financeiro e PIX em um sistema simples.",
    imagem: "/landing/membros.webp",
    imagemAlt: "Cadastro e gestão de membros da igreja",
  },
  {
    destaque: "Organize sua igreja sem burocracia",
    titulo: "Secretaria, finanças e comunicação em um só lugar",
    subtitulo:
      "Chega de dados espalhados em planilhas, cadernos e grupos de WhatsApp. Tudo integrado e acessível no celular.",
    imagem: "/landing/financeiro.webp",
    imagemAlt: "Módulo financeiro da igreja",
  },
  {
    destaque: "Desenvolvido para a realidade da igreja",
    titulo: "Tecnologia a serviço do ministério",
    subtitulo:
      "Plataforma criada para pastores e líderes que querem menos papelada e mais tempo com as pessoas.",
    imagem: "/landing/pix.webp",
    imagemAlt: "Ofertas via PIX integradas ao sistema",
  },
  {
    destaque: "Escalas automatizadas",
    titulo: "Portaria, recepção e limpeza sorteadas por ciclo",
    subtitulo:
      "Cadastre os cultos, gere o sorteio em rascunho, publique para a igreja e acompanhe tudo em um calendário claro — com limpeza mensal, semanal ou por culto.",
    imagem: "/landing/dashboard.webp",
    imagemAlt: "Escalas de portaria, recepção e limpeza organizadas por ciclo",
  },
  {
    destaque: "Eventos com inscrições e divulgação",
    titulo: "Divulgue eventos no WhatsApp e Instagram em um toque",
    subtitulo:
      "Crie o evento com banner, abra inscrições com controle de vagas e compartilhe o convite pronto — com prévia da imagem no WhatsApp e arte vertical para Stories.",
    imagem: "/landing/dashboard.webp",
    imagemAlt: "Evento com inscrições e botões de compartilhamento",
  },
  {
    destaque: "Suporte dentro do próprio sistema",
    titulo: "Dúvidas, erros e sugestões com quem entende sua igreja",
    subtitulo:
      "Abra chamados direto no sistema para tirar dúvidas, reportar problemas e enviar ideias de melhoria. A equipe acompanha cada solicitação da sua igreja.",
    imagem: "/landing/suporte.webp",
    imagemAlt: "Central de suporte integrada",
  },
] as const;

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
  { valor: "18", label: "módulos integrados" },
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
    titulo: "Departamentos",
    descricao: "Portaria, recepção, limpeza e outros — com membros, líderes e orientações de serviço.",
    icon: Users,
  },
  {
    titulo: "Escalas",
    descricao:
      "Sorteio automático de portaria e recepção por culto, limpeza mensal/semanal/por culto, publicação em rascunho e histórico com exclusão por lote.",
    icon: CalendarDays,
  },
  {
    titulo: "Eventos",
    descricao:
      "Banner, inscrições com controle de vagas, lista de inscritos com relatório em PDF, lembretes automáticos e compartilhamento direto no WhatsApp e Instagram.",
    icon: Sparkles,
  },
  {
    titulo: "Cultos",
    descricao:
      "Agenda de cultos recorrentes e extraordinários com pregador, mensagem, versículo, louvores do repertório e responsáveis de portaria, recepção e limpeza.",
    icon: Church,
  },
  {
    titulo: "Pedidos de Oração",
    descricao:
      "Compartilhe pedidos de oração com a igreja, interceda pelos irmãos e acompanhe respostas de forma organizada.",
    icon: Heart,
  },
  {
    titulo: "Informativos",
    descricao:
      "Comunicados ao entrar no sistema, campanhas e avisos com confirmação de leitura e botões de ação.",
    icon: Megaphone,
  },
  {
    titulo: "Avisos",
    descricao: "Comunique a igreja com avisos fixos, urgentes e notificações.",
    icon: Megaphone,
  },
  {
    titulo: "Louvores",
    descricao:
      "Repertório com letra e cifra, grupos de louvor e músicas escolhidas culto a culto sem alterar o grupo original.",
    icon: Music,
  },
  {
    titulo: "Notificações",
    descricao:
      "Push no celular e central de avisos: lembretes de eventos com contagem regressiva, escalas publicadas, leitura bíblica do dia e versículo diário.",
    icon: Bell,
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
  {
    titulo: "Site público",
    descricao:
      "Página da igreja com cultos, eventos públicos, avisos e pedido de oração — compartilhável por link.",
    icon: Church,
  },
];

const SCREENSHOTS = [
  { src: "/landing/dashboard.webp", alt: "Dashboard da igreja", legenda: "Dashboard" },
  { src: "/landing/membros.webp", alt: "Cadastro de membros", legenda: "Membros" },
  { src: "/landing/financeiro.webp", alt: "Financeiro da igreja", legenda: "Financeiro" },
  { src: "/landing/pix.webp", alt: "Ofertas via PIX", legenda: "PIX" },
  { src: "/landing/configuracoes.webp", alt: "Configurações", legenda: "Configurações" },
  { src: "/landing/suporte.webp", alt: "Central de suporte", legenda: "Suporte" },
];

const FAQ = [
  {
    pergunta: "Como funcionam as escalas de portaria e limpeza?",
    resposta:
      "Você cadastra os cultos, configura portaria/recepção e limpeza em abas separadas, gera o sorteio em rascunho e publica quando estiver satisfeito. A limpeza pode ser mensal, semanal ou por culto. Voluntários veem as escalas no calendário do ciclo, confirmam presença pelo sistema e recebem avisos no login e na central de notificações.",
  },
  {
    pergunta: "Como funcionam os eventos com inscrições?",
    resposta:
      "Você cria o evento com banner e define vagas e prazo. Os membros se inscrevem pelo app, a liderança acompanha a lista de inscritos e gera relatório em PDF. O sistema envia lembretes automáticos conforme o evento se aproxima, e o convite pode ser compartilhado direto no WhatsApp (com prévia da imagem) e no Instagram (arte pronta para Stories).",
  },
  {
    pergunta: "A igreja tem uma página pública na internet?",
    resposta:
      "Sim. Cada igreja pode ativar um site público com link próprio para divulgar cultos, eventos abertos ao público, avisos e receber pedidos de oração de visitantes.",
  },
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
      className="text-sm font-medium text-foreground/75 transition hover:text-foreground"
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
    const carregarPlano = () => {
      obterPlanoPublico()
        .then(setPlano)
        .catch(() => setPlano(null));
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(carregarPlano, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(carregarPlano, 2500);
    return () => window.clearTimeout(timer);
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
      <DadosEstruturadosLanding />
      <PreloadImagemLcp />
      {/* Header fixo ao rolar */}
      <header className="fixed inset-x-0 top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4">
          <Link to="/landing" className="flex min-w-0 items-center gap-2 font-semibold">
            <img
              src={MARCA.logoLogin}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-lg"
            />
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
              <Link
                to="/solicitar-acesso"
                title="Cadastro e teste grátis para administrador da igreja"
                onClick={() => rastrearCtaTesteGratis("header")}
              >
                <span className="sm:hidden">Teste grátis (admin)</span>
                <span className="hidden sm:inline">Admin da igreja — teste grátis</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
      {/* Hero slider */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/15 via-background to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-20 lg:py-24">
          <div
            className={cn(
              "grid items-center gap-10 transition-all duration-700 ease-in-out lg:grid-cols-2 lg:gap-12 xl:gap-16",
              fadeVisivel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            )}
          >
            <div className="order-2 space-y-6 text-center lg:order-1 lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                {slideAtivo === HERO_SLIDES.length - 1 ? (
                  <Headphones className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {slide.destaque}
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.25rem] xl:leading-[1.1]">
                {slide.titulo}
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg lg:max-w-xl">{slide.subtitulo}</p>
              <div className="flex flex-wrap justify-center gap-3 pt-1 lg:justify-start">
                <Button asChild size="lg" className="gap-2 px-8">
                  <Link
                    to="/solicitar-acesso"
                    onClick={() => rastrearCtaTesteGratis("hero")}
                  >
                    Testar grátis por {diasTrial} dias
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Entrar no sistema</Link>
                </Button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div
                  className="pointer-events-none absolute -right-4 -top-6 h-32 w-32 rounded-full bg-primary/20 blur-3xl sm:h-40 sm:w-40"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -bottom-6 -left-4 h-28 w-28 rounded-full bg-primary/10 blur-3xl sm:h-36 sm:w-36"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-background/90 p-2 shadow-2xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 border-b border-border/60 px-3 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/90" aria-hidden />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" aria-hidden />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" aria-hidden />
                    <span className="ml-2 truncate text-[0.65rem] text-muted-foreground sm:text-xs">
                      {MARCA.nome}
                    </span>
                  </div>
                  <img
                    key={slide.imagem}
                    src={slide.imagem}
                    alt={slide.imagemAlt}
                    width={960}
                    height={1062}
                    className="aspect-[4/3] w-full rounded-b-xl object-cover object-top"
                    loading={slideAtivo === 0 ? "eager" : "lazy"}
                    fetchPriority={slideAtivo === 0 ? "high" : "auto"}
                    decoding={slideAtivo === 0 ? "sync" : "async"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-1 lg:mt-10" role="tablist" aria-label="Slides do hero">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === slideAtivo}
                aria-label={`Slide ${i + 1} de ${HERO_SLIDES.length}`}
                onClick={() => mudarSlide(i)}
                className="flex h-11 w-11 items-center justify-center rounded-full"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-500 ease-in-out",
                    i === slideAtivo ? "h-2.5 w-8 bg-primary" : "h-2.5 w-2.5 bg-primary/40",
                  )}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-b bg-muted/20 py-12" aria-labelledby="pilares-titulo">
        <h2 id="pilares-titulo" className="sr-only">
          Por que escolher o {MARCA.nome}
        </h2>
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
            <Link to="/solicitar-acesso" onClick={() => rastrearCtaTesteGratis("narrativa")}>
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
      {/* Comunicação e oração */}
      <section className="scroll-mt-20 border-b bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Comunicação que aproxima a igreja</h2>
            <p className="mt-2 text-muted-foreground">
              Recursos pensados para fortalecer a comunhão e manter todos informados.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-background dark:from-rose-950/20">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle>Pedidos de Oração</CardTitle>
                <CardDescription>
                  Um espaço seguro para compartilhar necessidades, interceder uns pelos outros e registrar
                  respostas de oração — com moderação configurável pela liderança.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Pedidos públicos ou privados para a equipe pastoral</p>
                <p>• Intercessão com um toque — a igreja ora junto</p>
                <p>• Acesso rápido no celular, inclusive com botão flutuante</p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-6 w-6" />
                </div>
                <CardTitle>Informativos comerciais e institucionais</CardTitle>
                <CardDescription>
                  Campanhas, avisos urgentes e comunicados ao entrar no sistema — com confirmação de leitura,
                  banners no dashboard e botões de ação personalizados.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Modal ao login para comunicados importantes</p>
                <p>• Banners não obrigatórios no dashboard</p>
                <p>• CTA com link interno (eventos, inscrições, páginas)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Escalas */}
      <section className="scroll-mt-20 border-b py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Escalas sem planilha e sem grupo de WhatsApp</h2>
            <p className="mt-2 text-muted-foreground">
              Portaria, recepção e limpeza organizadas por ciclo — com sorteio, revisão e publicação para os voluntários.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-background dark:from-emerald-950/20">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <CardTitle>Portaria e recepção</CardTitle>
                <CardDescription>
                  Cadastre os cultos da igreja, defina regras por departamento e gere o próximo ciclo em rascunho antes
                  de publicar para toda a equipe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Sorteio automático respeitando gênero e regras de cada culto</p>
                <p>• Calendário do ciclo com destaque “Você” para quem foi escalado</p>
                <p>• Confirmação de presença pelo próprio voluntário</p>
                <p>• Histórico do ciclo com exclusão sem afetar a limpeza</p>
              </CardContent>
            </Card>
            <Card className="border-sky-200/60 bg-gradient-to-br from-sky-50/80 to-background dark:from-sky-950/20">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle>Limpeza flexível</CardTitle>
                <CardDescription>
                  Escolha a frequência que faz sentido para sua igreja: mensal, semanal ou em cada culto cadastrado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Três modos: mensal, semanal ou por culto</p>
                <p>• Dia da limpeza configurável nos modos mensal e semanal</p>
                <p>• Geração no ciclo vigente com histórico de lotes</p>
                <p>• Exclusão de lote de limpeza sem remover portaria e recepção</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
                  <Link to="/solicitar-acesso" onClick={() => rastrearCtaTesteGratis("precos")}>
                    Começar teste grátis
                  </Link>
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
          <Accordion
            type="single"
            collapsible
            className="w-full"
            onValueChange={(valor) => {
              if (!valor) return;
              const item = FAQ[Number(valor.replace("faq-", ""))];
              if (item) rastrearFaq(item.pergunta);
            }}
          >
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
            WhatsApp, telefone, e-mail ou Instagram.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  aria-label={`Ligar para ${MARCA.contato.telefoneExibicao}`}
                  onClick={() => rastrearTelefone("telefone_card")}
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
                  aria-label={`Conversar no WhatsApp: ${MARCA.contato.telefoneExibicao}`}
                  onClick={() => rastrearWhatsapp("whatsapp_card")}
                >
                  {MARCA.contato.telefoneExibicao}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">Toque para abrir a conversa</p>
              </CardContent>
            </Card>
            <Card className="text-left shadow-sm">
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
            <Card className="text-left shadow-sm">
              <CardHeader className="pb-2">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Instagram className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Instagram</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={MARCA.contato.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                  aria-label={`Abrir Instagram: @${MARCA.contato.instagramUsuario}`}
                >
                  @{MARCA.contato.instagramUsuario}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">Novidades da plataforma</p>
              </CardContent>
            </Card>
          </div>
          <Button asChild size="lg" className="mt-8 gap-2">
            <a
              href={MARCA.contato.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => rastrearWhatsapp("contato_botao")}
            >
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
              <Link to="/solicitar-acesso" onClick={() => rastrearCtaTesteGratis("rodape")}>
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

      </main>

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
            <a
              href={`tel:${MARCA.contato.telefoneE164}`}
              className="hover:text-foreground hover:underline"
              aria-label={`Telefone: ${MARCA.contato.telefoneExibicao}`}
            >
              {MARCA.contato.telefoneExibicao}
            </a>
            {" · "}
            <a href={`mailto:${MARCA.contato.email}`} className="hover:text-foreground hover:underline">
              {MARCA.contato.email}
            </a>
            {" · "}
            <a
              href={MARCA.contato.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline"
            >
              @{MARCA.contato.instagramUsuario}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
