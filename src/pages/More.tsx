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
  Church,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, canWrite, podeAcessarSuporte, usuarioEhSuperAdmin } from "@/auth/permissions";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";

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
  const { nomeExibicao, configuracao, publica } = useIgrejaConfiguracao();
  const descricaoIgreja =
    configuracao?.descricaoIgreja?.trim() || publica.descricaoIgreja?.trim() || "";

  const canShow = (path?: string) => {
    if (!path) {
      return true;
    }
    return canAccess(user, path);
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
              {canShow("/devocionais") && (
                <MenuItem
                  icon={BookMarked}
                  label="Devocionais"
                  description="Reflexões diárias"
                  path="/devocionais"
                />
              )}
              {canShow("/visitantes") && (
                <MenuItem
                  icon={UserPlus}
                  label="Visitantes"
                  description="Registrar novos visitantes"
                  path="/visitantes"
                />
              )}
              {canShow("/avisos") && (
                <MenuItem
                  icon={Megaphone}
                  label="Avisos"
                  description="Comunicados da igreja"
                  path="/avisos"
                />
              )}
              {canShow("/financeiro") && (
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
              {canShow("/configuracoes") && (
                <MenuItem
                  icon={Settings}
                  label="Configurações"
                  description="Preferências do app"
                  path="/configuracoes"
                />
              )}
              {canWrite(user, "/configuracoes-igreja") && (
                <MenuItem
                  icon={Church}
                  label="Configurações da Igreja"
                  description="Dados, PIX e identidade visual"
                  path="/configuracoes-igreja"
                />
              )}
              {usuarioEhSuperAdmin(user) && (
                <MenuItem
                  icon={LayoutDashboard}
                  label="Painel da Plataforma"
                  description="Gerenciar igrejas e solicitações SaaS"
                  path="/super-admin/dashboard"
                />
              )}
            </CardContent>
          </Card>
        </section>

        {descricaoIgreja && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Nossa igreja
            </h2>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {descricaoIgreja}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

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
                      title: nomeExibicao,
                      text: `Conheça o app da ${configuracao?.nome || nomeExibicao}!`,
                      url: window.location.origin,
                    });
                  }
                }}
              />
              {podeAcessarSuporte(user) && (
                <MenuItem
                  icon={HelpCircle}
                  label="Central de Suporte"
                  description="Dúvidas e solicitações à plataforma"
                  path="/suporte"
                />
              )}
              <MenuItem
                icon={Info}
                label={`Sobre ${nomeExibicao}`}
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
            {configuracao?.nome || nomeExibicao} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </LayoutApp>
  );
}
