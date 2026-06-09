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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarEhMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/super-admin/dashboard" },
  { icon: Church, label: "Igrejas", path: "/super-admin/igrejas" },
  { icon: ClipboardList, label: "Solicitações", path: "/super-admin/solicitacoes" },
  { icon: Users, label: "Usuários", path: "/super-admin/usuarios" },
  { icon: CreditCard, label: "Planos", path: "/super-admin/planos" },
  { icon: Wallet, label: "Meu Financeiro", path: "/super-admin/financeiro" },
  { icon: Settings, label: "Configurações", path: "/super-admin/configuracoes" },
];

function MenuLateral({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { logout } = usarAutenticacao();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Plataforma</p>
        <h1 className="text-lg font-bold">Semear SaaS</h1>
        <p className="text-xs text-muted-foreground">Painel do dono</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const ativo = location.pathname === item.path;
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
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-sidebar-border p-3">
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link to="/" onClick={onNavigate}>
            <ArrowLeft className="h-4 w-4" />
            Voltar ao app da igreja
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {!isMobile && (
          <aside className="w-64 shrink-0 border-r border-border">
            <MenuLateral />
          </aside>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          {isMobile && (
            <header className="flex h-14 items-center gap-2 border-b px-3">
              <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <MenuLateral onNavigate={() => setMenuAberto(false)} />
                </SheetContent>
              </Sheet>
              <span className="font-semibold">Painel da Plataforma</span>
            </header>
          )}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
