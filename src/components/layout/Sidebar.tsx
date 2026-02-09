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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/auth/permissions";

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
      { icon: Wallet, label: "Financeiro", path: "/financeiro" },
      { icon: Settings, label: "Configurações", path: "/configuracoes" },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;

  return (
    <aside className="fixed left-0 top-14 md:top-16 bottom-0 w-64 border-r border-border bg-sidebar overflow-y-auto">
      <div className="flex flex-col h-full py-4">
        {/* Menu Groups */}
        <div className="flex-1 space-y-6 px-3">
          {menuGroups.map((group) => {
            const items = group.items.filter((item) =>
              canAccessRoute(role, item.path),
            );
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
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-olive text-olive-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-4 mt-4">
          <div className="flex items-center gap-3 rounded-lg bg-olive-light/50 px-3 py-2">
            <Heart className="h-4 w-4 text-olive" />
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
