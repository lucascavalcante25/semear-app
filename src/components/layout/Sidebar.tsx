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
  LayoutDashboard,
  Church,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { canAccess, podeAcessarSuporte, usuarioEhSuperAdmin } from "@/auth/permissions";
import { PixOfertaBloco } from "@/components/pix/PixOferta";
import { BadgeNotificacaoMenu } from "@/components/layout/BadgeNotificacaoMenu";

const menuGroups = [
  {
    label: "Principal",
    items: [
      { icon: Home, label: "Dashboard", path: "/" },
      { icon: BookOpen, label: "Bíblia", path: "/biblia" },
      { icon: BookMarked, label: "Devocionais", path: "/devocionais" },
    ],
  },
  {
    label: "Ministério",
    items: [
      { icon: Music, label: "Louvores", path: "/louvores" },
      { icon: Users, label: "Membros", path: "/membros" },
      { icon: UserPlus, label: "Visitantes", path: "/visitantes" },
      { icon: Megaphone, label: "Avisos", path: "/avisos" },
    ],
  },
  {
    label: "Administração",
    items: [
      { icon: UserCheck, label: "Aprovar pré-cadastros", path: "/aprovar-pre-cadastros" },
      { icon: Wallet, label: "Financeiro", path: "/financeiro" },
      { icon: Church, label: "Config. da Igreja", path: "/configuracoes-igreja" },
      { icon: LifeBuoy, label: "Suporte", path: "/suporte", suporteOnly: true },
      { icon: Settings, label: "Configurações", path: "/configuracoes" },
    ],
  },
];

export function BarraLateral() {
  const location = useLocation();
  const { user } = usarAutenticacao();
  const { notificacoes } = usarNotificacoes();
  const badgeSuporte = notificacoes.filter((n) => n.tipo === "SUPORTE").length;

  return (
    <aside className="fixed left-0 top-14 md:top-16 bottom-0 z-30 w-64 border-r border-border bg-sidebar overflow-y-auto">
      <div className="flex flex-col h-full py-4">
        {/* Menu Groups */}
        <div className="flex-1 space-y-6 px-3">
          {menuGroups.map((group) => {
            const items = group.items.filter((item) => {
              if ("suporteOnly" in item && item.suporteOnly) {
                return podeAcessarSuporte(user);
              }
              return canAccess(user, item.path);
            });
            if (items.length === 0) {
              return null;
            }

            return (
              <div key={group.label}>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h4>
              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive =
                    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                  const Icon = item.icon;
                  const badge = item.path === "/suporte" ? badgeSuporte : 0;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <BadgeNotificacaoMenu quantidade={badge} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}

          {usuarioEhSuperAdmin(user) && (
            <div>
              <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Plataforma
              </h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/super-admin/dashboard"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      location.pathname.startsWith("/super-admin")
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Painel SaaS
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-4 mt-4 space-y-3">
          <PixOfertaBloco compact />
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2">
            <Heart className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                Plantando sementes
              </span>
              <span className="text-[10px] text-muted-foreground">
                Colhendo frutos
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
