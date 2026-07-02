import { Bell, Menu, LogOut, User, Moon, Sun } from "lucide-react";
import { PixOfertaCompacto } from "@/components/pix/PixOferta";
import { PainelSininhoNotificacoes } from "@/components/notificacoes/PainelSininhoNotificacoes";
import { usePushLembretePendente } from "@/hooks/use-push-lembrete-pendente";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuMobile } from "./MobileMenu";
import { usarEhMobile } from "@/hooks/use-mobile";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useAvatarUrlCurrentUser } from "@/hooks/use-avatar-url";
import { canAccess } from "@/auth/permissions";
import { BadgesCargos } from "@/components/membros/BadgesCargos";
import { useCargosIgreja } from "@/hooks/use-cargos-igreja";
import { obterRotulosCargos } from "@/lib/rotulos-cargos";
import { podeVerPreCadastrosPendentes } from "@/lib/pre-cadastro-permissoes";
import { Link, useNavigate } from "react-router-dom";
import { usarTema } from "@/contexts/ThemeContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";


export function Cabecalho() {
  const isMobile = usarEhMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pendentesCount, notificacoes } = usarNotificacoes();
  const { user, logout } = usarAutenticacao();
  const cargosIgreja = useCargosIgreja();
  const avatarUrl = useAvatarUrlCurrentUser();
  const rotulosCargosUsuario = user
    ? obterRotulosCargos(
        { cargoIds: user.cargoIds, authorities: user.authorities, role: user.role },
        cargosIgreja,
      )
    : [];

  const navigate = useNavigate();
  const { theme, toggleTheme } = usarTema();
  const { nomeExibicao, subtituloExibicao, logoUrl } = useIgrejaConfiguracao();
  const { mostrarLembrete: pushPendente } = usePushLembretePendente();
  const podeVerPreCadastros = podeVerPreCadastrosPendentes(user?.role);
  const totalBadgeNotificacoes =
    (podeVerPreCadastros ? pendentesCount : 0) + notificacoes.length;
  const userInitials = user?.name
    ?.split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass safe-top overflow-visible">
      <div className="flex h-14 md:h-16 items-center">
        {/* Marca (alinhada com a sidebar no desktop) */}
        <div className="flex items-center gap-2 px-3 md:px-4 h-full shrink-0 min-w-0 md:w-64 md:border-r md:border-border">
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <MenuMobile onClose={() => setIsMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          )}

          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-primary/25">
              <img
                key={logoUrl}
                src={logoUrl}
                alt={nomeExibicao}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold tracking-tight text-foreground truncate">
                {nomeExibicao}
              </span>
              {!isMobile && subtituloExibicao && (
                <span className="text-[10px] text-muted-foreground -mt-0.5 truncate">
                  {subtituloExibicao}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex h-14 md:h-16 items-center justify-end gap-2 sm:gap-3 pl-2 pr-3 md:px-4">
          <PixOfertaCompacto />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative mr-0.5 sm:mr-1">
                <Bell className="h-5 w-5" />
                {pushPendente && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-olive ring-2 ring-background" />
                )}
                {totalBadgeNotificacoes > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                    {totalBadgeNotificacoes}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <PainelSininhoNotificacoes />
          </DropdownMenu>          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative rounded-full data-[state=open]:ring-2 data-[state=open]:ring-olive/30 data-[state=open]:ring-offset-2 data-[state=open]:shadow-md"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarUrl ?? undefined} alt={user?.name} />
                  <AvatarFallback>{userInitials ?? <User className="h-5 w-5" />}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name ?? "Usuário"}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email ?? "Sem e-mail"}
                  </span>
                  {rotulosCargosUsuario.length > 0 ? (
                    <BadgesCargos
                      rotulos={rotulosCargosUsuario}
                      className="mt-1"
                      badgeClassName="text-[10px] font-normal"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">Sem função</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate(canAccess(user, "/configuracoes") ? "/configuracoes" : "/mais")
                }
              >
                Minha conta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Modo claro" : "Modo escuro"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
