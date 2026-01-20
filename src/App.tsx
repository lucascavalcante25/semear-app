import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/biblia" element={<Bible />} />
          <Route path="/membros" element={<Members />} />
          <Route path="/louvores" element={<Praise />} />
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/visitantes" element={<Visitors />} />
          <Route path="/avisos" element={<Announcements />} />
          <Route path="/devocionais" element={<Devotionals />} />
          <Route path="/mais" element={<More />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
