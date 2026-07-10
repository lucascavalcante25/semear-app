import { lazy, Suspense } from "react";
import { Notificador } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProvedorAutenticacao } from "@/contexts/AuthContext";
import { ProvedorNotificacoes } from "@/contexts/NotificationsContext";
import { RequerAutenticacao } from "@/components/auth/RequireAuth";
import { ProvedorTema } from "@/contexts/ThemeContext";
import { ProvedorIgreja } from "@/contexts/IgrejaContext";
import { SincronizarTema } from "@/components/theme/SincronizarTema";
import { SincronizarCoresIgreja } from "@/components/theme/SincronizarCoresIgreja";
import { SincronizarIgreja } from "@/components/theme/SincronizarIgreja";
import { LimparBloqueioNavegacao } from "@/components/navigation/LimparBloqueioNavegacao";
import { RequerSuperAdmin } from "@/components/auth/RequireSuperAdmin";
import { RastreadorAnalytics } from "@/components/analytics/RastreadorAnalytics";
import { MetaVerificacaoGoogle } from "@/components/seo/MetaVerificacaoGoogle";

const DashboardSuperAdmin = lazy(() => import("./pages/super-admin/Dashboard"));
const IgrejasSuperAdmin = lazy(() => import("./pages/super-admin/Igrejas"));
const SolicitacoesSuperAdmin = lazy(() => import("./pages/super-admin/Solicitacoes"));
const UsuariosSuperAdmin = lazy(() => import("./pages/super-admin/Usuarios"));
const PlanosSuperAdmin = lazy(() => import("./pages/super-admin/Planos"));
const FinanceiroSuperAdmin = lazy(() => import("./pages/super-admin/Financeiro"));
const ConfiguracoesSuperAdmin = lazy(() => import("./pages/super-admin/Configuracoes"));
const SuporteClientesSuperAdmin = lazy(() => import("./pages/super-admin/SuporteClientes"));
const MonitoramentoSuperAdmin = lazy(() => import("./pages/super-admin/Monitoramento"));
const Suporte = lazy(() => import("./pages/Suporte"));
const SolicitarAcesso = lazy(() => import("./pages/SolicitarAcesso"));
const Landing = lazy(() => import("./pages/Landing"));
const AssinaturaBloqueada = lazy(() => import("./pages/AssinaturaBloqueada"));
const ConfiguracoesIgreja = lazy(() => import("./pages/ConfiguracoesIgreja"));
const Inicio = lazy(() => import("./pages/Index"));
const Biblia = lazy(() => import("./pages/Bible"));
const Membros = lazy(() => import("./pages/Members"));
const AniversariantesPagina = lazy(() => import("./pages/Birthdays"));
const Louvores = lazy(() => import("./pages/Praise"));
const Financeiro = lazy(() => import("./pages/Financial"));
const Visitantes = lazy(() => import("./pages/Visitors"));
const Comunicados = lazy(() => import("./pages/Comunicados"));
const Devocionais = lazy(() => import("./pages/Devotionals"));
const Mais = lazy(() => import("./pages/More"));
const Configuracoes = lazy(() => import("./pages/Settings"));
const Entrar = lazy(() => import("./pages/Login"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const PreCadastro = lazy(() => import("./pages/PreCadastro"));
const AprovarPreCadastros = lazy(() => import("./pages/AprovarPreCadastros"));
const AcessoNegado = lazy(() => import("./pages/AccessDenied"));
const NaoEncontrado = lazy(() => import("./pages/NotFound"));
const PedidosOracao = lazy(() => import("./pages/PrayerRequests"));
const Sobre = lazy(() => import("./pages/About"));
const NotificacoesPagina = lazy(() => import("./pages/Notifications"));
const Departamentos = lazy(() => import("./pages/Departamentos"));
const Escalas = lazy(() => import("./pages/Escalas"));
const Cultos = lazy(() => import("./pages/Cultos"));
const Eventos = lazy(() => import("./pages/Eventos"));
const PublicIgreja = lazy(() => import("./pages/PublicIgreja"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function CarregandoPagina() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProvedorTema>
      <TooltipProvider>
        <Notificador />
        <Sonner />
        <ProvedorAutenticacao>
          <ProvedorIgreja>
          <ProvedorNotificacoes>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <RastreadorAnalytics />
            <MetaVerificacaoGoogle />
            <SincronizarTema />
            <SincronizarIgreja />
            <SincronizarCoresIgreja />
            <LimparBloqueioNavegacao />
            <Suspense fallback={<CarregandoPagina />}>
            <Routes>
              <Route path="/login" element={<Entrar />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/pre-cadastro" element={<PreCadastro />} />
              <Route path="/solicitar-acesso" element={<SolicitarAcesso />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/precos" element={<Landing />} />
              <Route path="/i/:slug" element={<PublicIgreja />} />
              <Route
                path="/assinatura-bloqueada"
                element={
                  <RequerAutenticacao>
                    <AssinaturaBloqueada />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/super-admin/dashboard"
                element={
                  <RequerSuperAdmin>
                    <DashboardSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/igrejas"
                element={
                  <RequerSuperAdmin>
                    <IgrejasSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/solicitacoes"
                element={
                  <RequerSuperAdmin>
                    <SolicitacoesSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/usuarios"
                element={
                  <RequerSuperAdmin>
                    <UsuariosSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/planos"
                element={
                  <RequerSuperAdmin>
                    <PlanosSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/financeiro"
                element={
                  <RequerSuperAdmin>
                    <FinanceiroSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/configuracoes"
                element={
                  <RequerSuperAdmin>
                    <ConfiguracoesSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/suporte"
                element={
                  <RequerSuperAdmin>
                    <SuporteClientesSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/super-admin/monitoramento"
                element={
                  <RequerSuperAdmin>
                    <MonitoramentoSuperAdmin />
                  </RequerSuperAdmin>
                }
              />
              <Route
                path="/configuracoes-igreja"
                element={
                  <RequerAutenticacao>
                    <ConfiguracoesIgreja />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/acesso-negado"
                element={
                  <RequerAutenticacao>
                    <AcessoNegado />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/"
                element={
                  <RequerAutenticacao>
                    <Inicio />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/biblia"
                element={
                  <RequerAutenticacao>
                    <Biblia />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/membros"
                element={
                  <RequerAutenticacao>
                    <Membros />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/aniversariantes"
                element={
                  <RequerAutenticacao>
                    <AniversariantesPagina />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/louvores"
                element={
                  <RequerAutenticacao>
                    <Louvores />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <RequerAutenticacao>
                    <Financeiro />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/visitantes"
                element={
                  <RequerAutenticacao>
                    <Visitantes />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/comunicados"
                element={
                  <RequerAutenticacao>
                    <Comunicados />
                  </RequerAutenticacao>
                }
              />
              <Route path="/avisos" element={<Navigate to="/comunicados" replace />} />
              <Route path="/informativos" element={<Navigate to="/comunicados" replace />} />
              <Route
                path="/devocionais"
                element={
                  <RequerAutenticacao>
                    <Devocionais />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/oracao"
                element={
                  <RequerAutenticacao>
                    <PedidosOracao />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/eventos"
                element={
                  <RequerAutenticacao>
                    <Eventos />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/escalas"
                element={
                  <RequerAutenticacao>
                    <Escalas />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/cultos"
                element={
                  <RequerAutenticacao>
                    <Cultos />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/departamentos"
                element={
                  <RequerAutenticacao>
                    <Departamentos />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/notificacoes"
                element={
                  <RequerAutenticacao>
                    <NotificacoesPagina />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/sobre"
                element={
                  <RequerAutenticacao>
                    <Sobre />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/mais"
                element={
                  <RequerAutenticacao>
                    <Mais />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <RequerAutenticacao>
                    <Configuracoes />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/aprovar-pre-cadastros"
                element={
                  <RequerAutenticacao>
                    <AprovarPreCadastros />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/suporte"
                element={
                  <RequerAutenticacao>
                    <Suporte />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/suporte/:id"
                element={
                  <RequerAutenticacao>
                    <Suporte />
                  </RequerAutenticacao>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
          </ProvedorNotificacoes>
          </ProvedorIgreja>
        </ProvedorAutenticacao>
      </TooltipProvider>
    </ProvedorTema>
  </QueryClientProvider>
);

export default App;
