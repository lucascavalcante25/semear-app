import { BellRing, Settings2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { usePushLembretePendente } from "@/hooks/use-push-lembrete-pendente";
import { canAccess } from "@/auth/permissions";
import { usarAutenticacao } from "@/contexts/AuthContext";

/** Lembrete discreto no sininho — só aparece quando push ainda não foi ativado neste dispositivo. */
export function LembretePushSininho() {
  const { user } = usarAutenticacao();
  const navigate = useNavigate();
  const { carregando, mostrarLembrete, bloqueado } = usePushLembretePendente();

  if (carregando || (!mostrarLembrete && !bloqueado)) {
    return null;
  }

  const rotaConfig = canAccess(user, "/configuracoes") ? "/configuracoes" : "/mais";

  if (bloqueado) {
    return (
      <>
        <DropdownMenuItem
          className="flex flex-col items-start gap-1 cursor-default opacity-80"
          disabled
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <BellRing className="h-4 w-4 text-amber-600" />
            Notificações bloqueadas
          </span>
          <span className="text-xs text-muted-foreground">
            Permita notificações nas configurações do navegador.
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </>
    );
  }

  return (
    <>
      <DropdownMenuItem
        className="flex flex-col items-start gap-1 cursor-pointer bg-olive-light/30 focus:bg-olive-light/40"
        onClick={() => navigate(rotaConfig)}
      >
        <span className="text-sm font-medium flex items-center gap-2">
          <BellRing className="h-4 w-4 text-olive-dark" />
          Ativar lembretes no celular
        </span>
        <span className="text-xs text-muted-foreground">
          Versículo do dia, eventos e escalas — configure em{" "}
          <Settings2 className="inline h-3 w-3" /> Configurações
        </span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
    </>
  );
}
