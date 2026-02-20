import { Bell, Menu, LogOut, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuMobile } from "./MobileMenu";
import { usarEhMobile } from "@/hooks/use-mobile";
import { listarPreCadastrosParaAprovacao } from "@/modules/auth/preCadastro";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/auth/permissions";
import { Link, useNavigate } from "react-router-dom";
import { usarTema } from "@/contexts/ThemeContext";


export function Cabecalho() {
  const isMobile = usarEhMobile();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendentesCount, setPendentesCount] = useState(0);
  const { user, logout } = usarAutenticacao();

  useEffect(() => {
    if (user?.role !== "admin") return;
    const carregar = async () => {
      try {
        const lista = await listarPreCadastrosParaAprovacao();
        setPendentesCount(lista.length);
      } catch {
        setPendentesCount(0);
      }
    };
    void carregar();
  }, [user?.role, location.pathname]);
  const navigate = useNavigate();
  const { theme, toggleTheme } = usarTema();
  const userInitials = user?.name
    ?.split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 glass safe-top">
      <div className="flex h-14 md:h-16 items-center">
        {/* Marca (alinhada com a sidebar no desktop) */}
        <div className="flex items-center gap-2 px-4 h-full w-full md:w-64 md:border-r md:border-border bg-sidebar">
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive-light/60 ring-1 ring-olive/20">
              <img
                src="/logo-semear.png"
                alt="Semear"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-bold tracking-tight text-foreground truncate">
                Semear
              </span>
              {!isMobile && (
                <span className="text-[10px] text-muted-foreground -mt-1 truncate">
                  Comunidade evangelica Semear
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex-1">
          <div className="container flex h-14 md:h-16 items-center justify-end gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="h-5 w-5" />
                {user?.role === "admin" && pendentesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                    {pendentesCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === "admin" ? (
                <DropdownMenuItem
                  className="flex flex-col items-start gap-1 cursor-pointer"
                  onClick={() => navigate("/aprovar-pre-cadastros")}
                >
                  <span className="text-sm font-medium">
                    {pendentesCount > 0
                      ? `${pendentesCount} pré-cadastro(s) pendente(s)`
                      : "Aprovar pré-cadastros"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pendentesCount > 0
                      ? "Clique para aprovar ou rejeitar"
                      : "Ver solicitações pendentes"}
                  </span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  Sem notificações no momento
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{userInitials ?? <User className="h-4 w-4" />}</AvatarFallback>
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
                  <span className="text-xs text-muted-foreground">
                    {user?.role ? ROLE_LABELS[user.role] : "Sem função"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/mais")}>
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
