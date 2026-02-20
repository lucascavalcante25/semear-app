import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  BookMarked,
  Music,
  Users,
  UserPlus,
  Megaphone,
  Wallet,
  Settings,
  Heart,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess } from "@/auth/permissions";
import { PixOfertaBloco } from "@/components/pix/PixOferta";

interface MenuMobileProps {
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Bíblia", path: "/biblia" },
  { icon: BookMarked, label: "Devocionais", path: "/devocionais" },
  { icon: Music, label: "Louvores", path: "/louvores" },
  { icon: Users, label: "Membros", path: "/membros" },
  { icon: UserPlus, label: "Visitantes", path: "/visitantes" },
  { icon: Megaphone, label: "Avisos", path: "/avisos" },
  { icon: UserCheck, label: "Aprovar pré-cadastros", path: "/aprovar-pre-cadastros" },
  { icon: Wallet, label: "Financeiro", path: "/financeiro" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function MenuMobile({ onClose }: MenuMobileProps) {
  const location = useLocation();
  const { user } = usarAutenticacao();
  const filteredItems = menuItems.filter((item) => canAccess(user, item.path));

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <SheetHeader className="p-4 border-b border-sidebar-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-olive-light/60 ring-1 ring-olive/20">
            <img
              src="/logo-semear.png"
              alt="Semear"
              className="h-7 w-7 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <SheetTitle className="text-left text-lg font-bold">Semear</SheetTitle>
            <span className="text-xs text-muted-foreground">
              Comunidade evangelica Semear
            </span>
          </div>
        </Link>
      </SheetHeader>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-olive text-olive-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        <PixOfertaBloco />
        <div className="flex items-center gap-3 rounded-lg bg-olive-light/50 px-3 py-3">
          <Heart className="h-5 w-5 text-olive" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              Plantando sementes
            </span>
            <span className="text-xs text-muted-foreground">
              Colhendo frutos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
