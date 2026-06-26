import type { LucideIcon } from "lucide-react";
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
  UserCheck,
  Church,
  LifeBuoy,
  Cake,
  Bell,
  Building2,
  CalendarDays,
  Calendar,
} from "lucide-react";

export type ItemMenuNavegacao = {
  icon: LucideIcon;
  label: string;
  path: string;
  suporteOnly?: boolean;
  avisosWrite?: boolean;
};

export type GrupoMenuNavegacao = {
  label: string;
  items: ItemMenuNavegacao[];
};

export const gruposMenuNavegacao: GrupoMenuNavegacao[] = [
  {
    label: "Principal",
    items: [
      { icon: Home, label: "Dashboard", path: "/" },
      { icon: BookOpen, label: "Bíblia", path: "/biblia" },
      { icon: BookMarked, label: "Devocionais", path: "/devocionais" },
      { icon: Heart, label: "Oração", path: "/oracao" },
    ],
  },
  {
    label: "Ministério",
    items: [
      { icon: Music, label: "Louvores", path: "/louvores" },
      { icon: Users, label: "Membros", path: "/membros" },
      { icon: UserPlus, label: "Visitantes", path: "/visitantes" },
      { icon: Megaphone, label: "Comunicados", path: "/comunicados" },
      { icon: Cake, label: "Aniversariantes", path: "/aniversariantes" },
      { icon: Building2, label: "Departamentos", path: "/departamentos" },
      { icon: CalendarDays, label: "Escalas", path: "/escalas" },
      { icon: Calendar, label: "Eventos", path: "/eventos" },
    ],
  },
  {
    label: "Administração",
    items: [
      { icon: UserCheck, label: "Aprovar pré-cadastros", path: "/aprovar-pre-cadastros" },
      { icon: Wallet, label: "Financeiro", path: "/financeiro" },
      { icon: Church, label: "Config. da Igreja", path: "/configuracoes-igreja" },
      { icon: LifeBuoy, label: "Suporte", path: "/suporte", suporteOnly: true },
      { icon: Settings, label: "Configurações", path: "/configuracoes" },
    ],
  },
];
