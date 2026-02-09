import { Notificador } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorAutenticacao } from "@/contexts/AuthContext";
import { RequerAutenticacao } from "@/components/auth/RequireAuth";
import { ROUTE_PERMISSIONS } from "@/auth/permissions";
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
import Entrar from "./pages/Login";
import PreCadastro from "./pages/PreCadastro";
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
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/acesso-negado"]}>
                    <AcessoNegado />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/"]}>
                    <Inicio />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/biblia"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/biblia"]}>
                    <Biblia />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/membros"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/membros"]}>
                    <Membros />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/louvores"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/louvores"]}>
                    <Louvores />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/financeiro"]}>
                    <Financeiro />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/visitantes"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/visitantes"]}>
                    <Visitantes />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/avisos"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/avisos"]}>
                    <Avisos />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/devocionais"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/devocionais"]}>
                    <Devocionais />
                  </RequerAutenticacao>
                }
              />
              <Route
                path="/mais"
                element={
                  <RequerAutenticacao allowedRoles={ROUTE_PERMISSIONS["/mais"]}>
                    <Mais />
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
