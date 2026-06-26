import { useEffect, useState } from "react";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { obterPreferenciasNotificacao } from "@/modules/notificacoes/api";
import { verificarSuportePush } from "@/modules/notificacoes/push";

export type StatusPushLembrete = {
  carregando: boolean;
  /** Push disponível neste dispositivo e ainda não ativado/registrado */
  mostrarLembrete: boolean;
  /** Permissão negada pelo navegador */
  bloqueado: boolean;
};

export function usePushLembretePendente(): StatusPushLembrete {
  const { user } = usarAutenticacao();
  const [status, setStatus] = useState<StatusPushLembrete>({
    carregando: true,
    mostrarLembrete: false,
    bloqueado: false,
  });

  useEffect(() => {
    if (!user) {
      setStatus({ carregando: false, mostrarLembrete: false, bloqueado: false });
      return;
    }

    let cancelado = false;
    const verificar = async () => {
      try {
        const suporte = await verificarSuportePush();
        if (!suporte) {
          if (!cancelado) {
            setStatus({ carregando: false, mostrarLembrete: false, bloqueado: false });
          }
          return;
        }
        const negado = typeof Notification !== "undefined" && Notification.permission === "denied";
        const prefs = await obterPreferenciasNotificacao();
        const ativo = Boolean(prefs.pushAtivo && prefs.dispositivoRegistrado);
        if (!cancelado) {
          setStatus({
            carregando: false,
            mostrarLembrete: !ativo && !negado,
            bloqueado: negado,
          });
        }
      } catch {
        if (!cancelado) {
          setStatus({ carregando: false, mostrarLembrete: false, bloqueado: false });
        }
      }
    };

    void verificar();
    return () => {
      cancelado = true;
    };
  }, [user]);

  return status;
}
