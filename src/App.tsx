import { Notificador } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorAutenticacao } from "@/contexts/AuthContext";
import { RequerAutenticacao } from "@/components/auth/RequireAuth";
import { ProvedorTema } from "@/contexts/ThemeContext";

// Pages
import Inicio from "./pages/Index";
import Biblia from "./pages/Bible";
import Membros from "./pages/Members";
import Louvores from "./pages/Praise";
import Financeiro from "./pages/Financial";
import Visitantes from "./pages/Visitors";
import Avisos from "./pages/Announcements";
import Devocionais from "./pages/Devotionals";
import Mais from "./pages/More";
import Configuracoes from "./pages/Settings";
import Entrar from "./pages/Login";
import PreCadastro from "./pages/PreCadastro";
import AprovarPreCadastros from "./pages/AprovarPreCadastros";
import AcessoNegado from "./pages/AccessDenied";
import NaoEncontrado from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProvedorTema>
      <TooltipProvider>
        <Notificador />
        <Sonner />
        <ProvedorAutenticacao>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Entrar />} />
              <Route path="/pre-cadastro" element={<PreCadastro />} />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
          </BrowserRouter>
        </ProvedorAutenticacao>
      </TooltipProvider>
    </ProvedorTema>
  </QueryClientProvider>
);

export default App;
