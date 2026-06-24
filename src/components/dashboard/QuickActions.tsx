import { Link } from "react-router-dom";
import {
  BookOpen,
  BookMarked,
  Music,
  Users,
  UserPlus,
  Megaphone,
  Wallet,
  LifeBuoy,
  Heart,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, podeAcessarSuporte } from "@/auth/permissions";

type VarianteCor = "primary" | "secondary";

const VARIANTE_CLASSES: Record<VarianteCor, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

const acoes: Array<{
  icon: React.ElementType;
  label: string;
  path: string;
  variante: VarianteCor;
  suporteOnly?: boolean;
}> = [
  { icon: BookOpen, label: "Bíblia", path: "/biblia", variante: "primary" },
  { icon: BookMarked, label: "Devocionais", path: "/devocionais", variante: "secondary" },
  { icon: Music, label: "Louvores", path: "/louvores", variante: "primary" },
  { icon: Users, label: "Membros", path: "/membros", variante: "secondary" },
  { icon: UserPlus, label: "Visitantes", path: "/visitantes", variante: "primary" },
  { icon: Megaphone, label: "Avisos", path: "/avisos", variante: "secondary" },
  { icon: Heart, label: "Oração", path: "/oracao", variante: "primary" },
  { icon: Calendar, label: "Eventos", path: "/eventos", variante: "secondary" },
  { icon: Wallet, label: "Financeiro", path: "/financeiro", variante: "secondary" },
  { icon: LifeBuoy, label: "Suporte", path: "/suporte", variante: "secondary", suporteOnly: true },
];

export function AcoesRapidas() {
  const { user } = usarAutenticacao();
  const acoesVisiveis = acoes.filter((acao) => {
    if (acao.suporteOnly) return podeAcessarSuporte(user);
    return canAccess(user, acao.path);
  });

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 min-w-0">
      {acoesVisiveis.map((acao) => {
        const Icon = acao.icon;
        return (
          <Link
            key={acao.path}
            to={acao.path}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 shadow-sm",
                "group-hover:scale-105 group-active:scale-95",
                VARIANTE_CLASSES[acao.variante],
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
              {acao.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
