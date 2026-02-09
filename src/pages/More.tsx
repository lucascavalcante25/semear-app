import { Link, useNavigate } from "react-router-dom";
import { LayoutApp } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookMarked,
  UserPlus,
  Megaphone,
  Wallet,
  Settings,
  Heart,
  Share2,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/auth/permissions";
import { usarTema } from "@/contexts/ThemeContext";

interface MenuItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  path?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  variant?: "default" | "destructive";
}

function MenuItem({ 
  icon: Icon, 
  label, 
  description, 
  path, 
  onClick, 
  rightElement,
  variant = "default" 
}: MenuItemProps) {
  const content = (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg transition-colors",
      "hover:bg-muted/50 active:bg-muted",
      variant === "destructive" && "text-destructive"
    )}>
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        variant === "destructive" 
          ? "bg-destructive/10 text-destructive" 
          : "bg-olive/10 text-olive"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {rightElement || <ChevronRight className="h-5 w-5 text-muted-foreground" />}
    </div>
  );

  if (path) {
    return <Link to={path}>{content}</Link>;
  }

  return (
    <button className="w-full text-left" onClick={onClick}>
      {content}
    </button>
  );
}

export default function Mais() {
  const { logout, user } = usarAutenticacao();
  const navigate = useNavigate();
  const { theme, toggleTheme } = usarTema();
  const isDarkMode = theme === "dark";

  const handleDarkModeToggle = () => {
    toggleTheme();
  };

  const role = user?.role;
  const canAccess = (path?: string) => {
    if (!path) {
      return true;
    }
    return canAccessRoute(role, path);
  };

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Mais opções</h1>
          <p className="text-sm text-muted-foreground">
            Configurações e recursos adicionais
          </p>
        </div>

        {/* Ministérios */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Ministérios
          </h2>
          <Card>
            <CardContent className="p-0">
              {canAccess("/devocionais") && (
                <MenuItem
                  icon={BookMarked}
                  label="Devocionais"
                  description="Reflexões diárias"
                  path="/devocionais"
                />
              )}
              {canAccess("/visitantes") && (
                <MenuItem
                  icon={UserPlus}
                  label="Visitantes"
                  description="Registrar novos visitantes"
                  path="/visitantes"
                />
              )}
              {canAccess("/avisos") && (
                <MenuItem
                  icon={Megaphone}
                  label="Avisos"
                  description="Comunicados da igreja"
                  path="/avisos"
                />
              )}
              {canAccess("/financeiro") && (
                <MenuItem
                  icon={Wallet}
                  label="Financeiro"
                  description="Entradas e saídas"
                  path="/financeiro"
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Configurações */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Configurações
          </h2>
          <Card>
            <CardContent className="p-0">
              <MenuItem
                icon={isDarkMode ? Moon : Sun}
                label="Modo escuro"
                description={isDarkMode ? "Ativado" : "Desativado"}
                onClick={handleDarkModeToggle}
                rightElement={
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleDarkModeToggle}
                  />
                }
              />
              {canAccess("/configuracoes") && (
                <MenuItem
                  icon={Settings}
                  label="Configurações"
                  description="Preferências do app"
                  path="/configuracoes"
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Sobre */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Sobre
          </h2>
          <Card>
            <CardContent className="p-0">
              <MenuItem
                icon={Heart}
                label="Pedidos de Oração"
                description="Compartilhe suas necessidades"
                path="/oracao"
              />
              <MenuItem
                icon={Share2}
                label="Compartilhar App"
                description="Convide seus amigos"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Comunidade evangelica Semear",
                      text: "Conheca o app da Comunidade evangelica Semear!",
                      url: window.location.origin,
                    });
                  }
                }}
              />
              <MenuItem
                icon={HelpCircle}
                label="Ajuda"
                description="Perguntas frequentes"
                path="/ajuda"
              />
              <MenuItem
                icon={Info}
                label="Sobre a Semear"
                description="Versão 1.0.0"
                path="/sobre"
              />
            </CardContent>
          </Card>
        </section>

        {/* Logout */}
        <Card>
          <CardContent className="p-0">
            <MenuItem
              icon={LogOut}
              label="Sair"
              variant="destructive"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            🌱 Semeando a palavra, formando discipulos e colhendo vidas.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Comunidade evangelica Semear © 2026
          </p>
        </div>
      </div>
    </LayoutApp>
  );
}
