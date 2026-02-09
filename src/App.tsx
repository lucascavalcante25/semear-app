import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ROUTE_PERMISSIONS } from "@/auth/permissions";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import Bible from "./pages/Bible";
import Members from "./pages/Members";
import Praise from "./pages/Praise";
import Financial from "./pages/Financial";
import Visitors from "./pages/Visitors";
import Announcements from "./pages/Announcements";
import Devotionals from "./pages/Devotionals";
import More from "./pages/More";
import Login from "./pages/Login";
import AccessDenied from "./pages/AccessDenied";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/acesso-negado"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/acesso-negado"]}>
                    <AccessDenied />
                  </RequireAuth>
                }
              />
              <Route
                path="/"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/"]}>
                    <Index />
                  </RequireAuth>
                }
              />
              <Route
                path="/biblia"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/biblia"]}>
                    <Bible />
                  </RequireAuth>
                }
              />
              <Route
                path="/membros"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/membros"]}>
                    <Members />
                  </RequireAuth>
                }
              />
              <Route
                path="/louvores"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/louvores"]}>
                    <Praise />
                  </RequireAuth>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/financeiro"]}>
                    <Financial />
                  </RequireAuth>
                }
              />
              <Route
                path="/visitantes"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/visitantes"]}>
                    <Visitors />
                  </RequireAuth>
                }
              />
              <Route
                path="/avisos"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/avisos"]}>
                    <Announcements />
                  </RequireAuth>
                }
              />
              <Route
                path="/devocionais"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/devocionais"]}>
                    <Devotionals />
                  </RequireAuth>
                }
              />
              <Route
                path="/mais"
                element={
                  <RequireAuth allowedRoles={ROUTE_PERMISSIONS["/mais"]}>
                    <More />
                  </RequireAuth>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
