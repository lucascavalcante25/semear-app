import { Link } from "react-router-dom";
import {
  BookOpen,
  BookMarked,
  Music,
  Users,
  UserPlus,
  Megaphone,
  Wallet,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const acoes = [
  {
    icon: BookOpen,
    label: "Bíblia",
    path: "/biblia",
    color: "bg-olive text-olive-foreground",
    bgLight: "bg-olive-light",
  },
  {
    icon: BookMarked,
    label: "Devocionais",
    path: "/devocionais",
    color: "bg-deep-blue text-deep-blue-foreground",
    bgLight: "bg-deep-blue-light",
  },
  {
    icon: Music,
    label: "Louvores",
    path: "/louvores",
    color: "bg-gold text-gold-foreground",
    bgLight: "bg-gold-light",
  },
  {
    icon: Users,
    label: "Membros",
    path: "/membros",
    color: "bg-olive text-olive-foreground",
    bgLight: "bg-olive-light",
  },
  {
    icon: UserPlus,
    label: "Visitantes",
    path: "/visitantes",
    color: "bg-deep-blue text-deep-blue-foreground",
    bgLight: "bg-deep-blue-light",
  },
  {
    icon: Megaphone,
    label: "Avisos",
    path: "/avisos",
    color: "bg-gold text-gold-foreground",
    bgLight: "bg-gold-light",
  },
  {
    icon: Wallet,
    label: "Financeiro",
    path: "/financeiro",
    color: "bg-olive text-olive-foreground",
    bgLight: "bg-olive-light",
  },
  {
    icon: Heart,
    label: "Oração",
    path: "/oracao",
    color: "bg-deep-blue text-deep-blue-foreground",
    bgLight: "bg-deep-blue-light",
  },
];

export function AcoesRapidas() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {acoes.map((acao) => {
        const Icon = acao.icon;
        return (
          <Link
            key={acao.path}
            to={acao.path}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200",
                "group-hover:scale-105 group-active:scale-95",
                acao.color
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
