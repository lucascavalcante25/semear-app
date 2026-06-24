import { Notificador } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import DashboardSuperAdmin from "./pages/super-admin/Dashboard";
import IgrejasSuperAdmin from "./pages/super-admin/Igrejas";
import SolicitacoesSuperAdmin from "./pages/super-admin/Solicitacoes";
import UsuariosSuperAdmin from "./pages/super-admin/Usuarios";
import PlanosSuperAdmin from "./pages/super-admin/Planos";
import FinanceiroSuperAdmin from "./pages/super-admin/Financeiro";
import ConfiguracoesSuperAdmin from "./pages/super-admin/Configuracoes";
import SuporteClientesSuperAdmin from "./pages/super-admin/SuporteClientes";
import Suporte from "./pages/Suporte";
import SolicitarAcesso from "./pages/SolicitarAcesso";
import Landing from "./pages/Landing";
import AssinaturaBloqueada from "./pages/AssinaturaBloqueada";
import ConfiguracoesIgreja from "./pages/ConfiguracoesIgreja";

// Pages
import Inicio from "./pages/Index";
import Biblia from "./pages/Bible";
import Membros from "./pages/Members";
import AniversariantesPagina from "./pages/Birthdays";
import Louvores from "./pages/Praise";
import Financeiro from "./pages/Financial";
import Visitantes from "./pages/Visitors";
import Avisos from "./pages/Announcements";
import Devocionais from "./pages/Devotionals";
import Mais from "./pages/More";
import Configuracoes from "./pages/Settings";
import Entrar from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import PreCadastro from "./pages/PreCadastro";
import AprovarPreCadastros from "./pages/AprovarPreCadastros";
import AcessoNegado from "./pages/AccessDenied";
import NaoEncontrado from "./pages/NotFound";
import PedidosOracao from "./pages/PrayerRequests";
import Informativos from "./pages/Informativos";
import Sobre from "./pages/About";
import NotificacoesPagina from "./pages/Notifications";
import Departamentos from "./pages/Departamentos";
import Escalas from "./pages/Escalas";
import Eventos from "./pages/Eventos";
import PublicIgreja from "./pages/PublicIgreja";

const queryClient = new QueryClient();

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
            <SincronizarTema />
            <SincronizarIgreja />
            <SincronizarCoresIgreja />
            <LimparBloqueioNavegacao />
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
                path="/avisos"
                element={
                  <RequerAutenticacao>
                    <Avisos />
                  </RequerAutenticacao>
                }
              />
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
                path="/informativos"
                element={
                  <RequerAutenticacao>
                    <Informativos />
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
          </BrowserRouter>
          </ProvedorNotificacoes>
          </ProvedorIgreja>
        </ProvedorAutenticacao>
      </TooltipProvider>
    </ProvedorTema>
  </QueryClientProvider>
);

export default App;
