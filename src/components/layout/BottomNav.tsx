import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  Music, 
  Users, 
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/auth/permissions";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: BookOpen, label: "Bíblia", path: "/biblia" },
  { icon: Music, label: "Louvor", path: "/louvores" },
  { icon: Users, label: "Membros", path: "/membros" },
  { icon: MoreHorizontal, label: "Mais", path: "/mais" },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role;
  const filteredItems = navItems.filter((item) => canAccessRoute(role, item.path));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom">
      <div className="flex items-center justify-around h-16">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px]",
                isActive
                  ? "text-olive"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200",
                  isActive && "bg-olive-light"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "scale-110"
                  )}
                />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
