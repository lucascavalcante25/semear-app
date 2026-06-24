import { Link, useLocation } from "react-router-dom";
import { Heart, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, canWrite, podeAcessarSuporte, usuarioEhSuperAdmin } from "@/auth/permissions";
import { PixOfertaBloco } from "@/components/pix/PixOferta";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { BadgeNotificacaoMenu } from "@/components/layout/BadgeNotificacaoMenu";
import { gruposMenuNavegacao } from "@/components/layout/menu-navegacao";

interface MenuMobileProps {
  onClose: () => void;
}

export function MenuMobile({ onClose }: MenuMobileProps) {
  const location = useLocation();
  const { user } = usarAutenticacao();
  const { notificacoes, pedidosOracaoPendentes } = usarNotificacoes();
  const badgeSuporte = notificacoes.filter((n) => n.tipo === "SUPORTE").length;
  const { nomeExibicao, subtituloExibicao, logoUrl } = useIgrejaConfiguracao();

  const filtrarItem = (item: (typeof gruposMenuNavegacao)[0]["items"][0]) => {
    if (item.suporteOnly) return podeAcessarSuporte(user);
    if (item.avisosWrite) return canWrite(user, "/avisos");
    return canAccess(user, item.path);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <SheetHeader className="border-b border-sidebar-border p-4">
        <Link to="/" onClick={onClose} className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-primary/25">
            <img key={logoUrl} src={logoUrl} alt={nomeExibicao} className="h-full w-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-col">
            <SheetTitle className="truncate text-left text-lg font-bold">{nomeExibicao}</SheetTitle>
            {subtituloExibicao && (
              <span className="truncate text-xs text-muted-foreground">{subtituloExibicao}</span>
            )}
          </div>
        </Link>
      </SheetHeader>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-5">
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
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "bg-olive text-olive-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent",
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
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
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      location.pathname.startsWith("/super-admin")
                        ? "bg-olive text-olive-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                    <span className="flex-1">Painel SaaS</span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-4">
        <PixOfertaBloco />
        <div className="flex items-center gap-3 rounded-lg bg-olive-light/50 px-3 py-3">
          <Heart className="h-5 w-5 text-olive" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Plantando sementes</span>
            <span className="text-xs text-muted-foreground">Colhendo frutos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
