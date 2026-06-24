import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { canAccess, canWrite, podeAcessarSuporte, usuarioEhSuperAdmin } from "@/auth/permissions";
import { PixOfertaBloco } from "@/components/pix/PixOferta";
import { BadgeNotificacaoMenu } from "@/components/layout/BadgeNotificacaoMenu";
import { gruposMenuNavegacao } from "@/components/layout/menu-navegacao";

export function BarraLateral() {
  const location = useLocation();
  const { user } = usarAutenticacao();
  const { notificacoes, pedidosOracaoPendentes } = usarNotificacoes();
  const badgeSuporte = notificacoes.filter((n) => n.tipo === "SUPORTE").length;

  const filtrarItem = (item: (typeof gruposMenuNavegacao)[0]["items"][0]) => {
    if (item.suporteOnly) return podeAcessarSuporte(user);
    if (item.avisosWrite) return canWrite(user, "/avisos");
    return canAccess(user, item.path);
  };

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-30 w-64 overflow-y-auto border-r border-border bg-sidebar md:top-16">
      <div className="flex h-full flex-col py-4">
        <div className="flex-1 space-y-6 px-3">
          {gruposMenuNavegacao.map((grupo) => {
            const itens = grupo.items.filter(filtrarItem);
            if (itens.length === 0) return null;

            return (
              <div key={grupo.label}>
                <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {grupo.label}
                </h4>
                <ul className="space-y-1">
                  {itens.map((item) => {
                    const isActive =
                      location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                    const Icon = item.icon;
                    const badge =
                      item.path === "/suporte"
                        ? badgeSuporte
                        : item.path === "/oracao"
                          ? pedidosOracaoPendentes
                          : 0;

                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

        <div className="mt-4 space-y-3 border-t border-sidebar-border px-4 py-4">
          <PixOfertaBloco compact />
          <div className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2">
            <Heart className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Plantando sementes</span>
              <span className="text-[10px] text-muted-foreground">Colhendo frutos</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
