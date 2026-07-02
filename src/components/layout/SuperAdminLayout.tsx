import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Church,
  ClipboardList,
  Users,
  CreditCard,
  Wallet,
  Settings,
  LogOut,
  Menu,
  ArrowLeft,
  Moon,
  Sun,
  Headphones,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarTema } from "@/contexts/ThemeContext";
import { usarEhMobile } from "@/hooks/use-mobile";
import { MARCA, PLATAFORMA } from "@/lib/plataforma";
import { useTituloDocumento } from "@/hooks/use-titulo-documento";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { usarNotificacoesSuperAdmin } from "@/hooks/use-notificacoes-super-admin";
import { BadgeNotificacaoMenu } from "@/components/layout/BadgeNotificacaoMenu";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin/dashboard" },
  { icon: Church, label: "Igrejas", path: "/super-admin/igrejas" },
  { icon: ClipboardList, label: "Solicitações", path: "/super-admin/solicitacoes", badge: "solicitacoes" as const },
  { icon: Headphones, label: "Suporte dos Clientes", path: "/super-admin/suporte", badge: "suporte" as const },
  { icon: Users, label: "Usuários", path: "/super-admin/usuarios" },
  { icon: CreditCard, label: "Planos", path: "/super-admin/planos" },
  { icon: Wallet, label: "Meu Financeiro", path: "/super-admin/financeiro" },
  { icon: Activity, label: "Monitoramento", path: "/super-admin/monitoramento" },
  { icon: Settings, label: "Configurações", path: "/super-admin/configuracoes" },
];

function MenuLateral({
  onNavigate,
  badgeSolicitacoes,
  badgeSuporte,
}: {
  onNavigate?: () => void;
  badgeSolicitacoes: number;
  badgeSuporte: number;
}) {
  const location = useLocation();
  const { logout } = usarAutenticacao();
  const { theme, setTheme } = usarTema();
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <img src={PLATAFORMA.logoUrl} alt="" className="h-8 w-8 rounded-lg" aria-hidden />
          <div>
            <h1 className="text-base font-bold leading-tight">{MARCA.nome}</h1>
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{MARCA.painelPlataforma}</p>
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const ativo = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          const badge =
            item.badge === "solicitacoes"
              ? badgeSolicitacoes
              : item.badge === "suporte"
                ? badgeSuporte
                : 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                ativo
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <BadgeNotificacaoMenu quantidade={badge} />
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 space-y-1 border-t border-sidebar-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark", "platform")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Tema claro" : "Tema escuro"}
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link to="/" onClick={onNavigate}>
            <ArrowLeft className="h-4 w-4" />
            Voltar à área da igreja
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function LayoutSuperAdmin({ children }: { children: React.ReactNode }) {
  const isMobile = usarEhMobile();
  const [menuAberto, setMenuAberto] = useState(false);
  const { badgeSolicitacoes, badgeSuporte, temAlgumaNotificacao } = usarNotificacoesSuperAdmin();
  useTituloDocumento({ area: "plataforma" });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {!isMobile && (
          <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-hidden border-r border-border">
            <MenuLateral badgeSolicitacoes={badgeSolicitacoes} badgeSuporte={badgeSuporte} />
          </aside>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          {isMobile && (
            <header className="flex h-14 items-center gap-2 border-b px-3">
              <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Menu className="h-5 w-5" />
                    {temAlgumaNotificacao && (
                      <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex h-full w-72 flex-col p-0">
                  <MenuLateral
                    onNavigate={() => setMenuAberto(false)}
                    badgeSolicitacoes={badgeSolicitacoes}
                    badgeSuporte={badgeSuporte}
                  />
                </SheetContent>
              </Sheet>
              <span className="font-semibold">{PLATAFORMA.nome}</span>
            </header>
          )}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
