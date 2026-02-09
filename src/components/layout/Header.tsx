import { Book, Bell, Menu, LogOut, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "./MobileMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/auth/permissions";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Novo visitante registrado",
    description: "Confira o cadastro em Visitantes.",
  },
  {
    id: "2",
    title: "Aviso publicado",
    description: "Um novo aviso foi adicionado.",
  },
  {
    id: "3",
    title: "Contribuição registrada",
    description: "Atualização em Financeiro.",
  },
];

export function Header() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const userInitials = user?.name
    ?.split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 glass safe-top">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <MobileMenu onClose={() => setIsMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive text-olive-foreground">
              <Book className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">
                SEMEAR
              </span>
              {!isMobile && (
                <span className="text-[10px] text-muted-foreground -mt-1">
                  Comunidade Evangélica
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold text-[10px] font-bold text-gold-foreground flex items-center justify-center">
                  {NOTIFICATIONS.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NOTIFICATIONS.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1">
                  <span className="text-sm font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {notification.description}
                  </span>
                </DropdownMenuItem>
              ))}
              {NOTIFICATIONS.length === 0 && (
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
    </header>
  );
}
