import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { obterResumoNotificacoes } from "@/modules/notifications/resumo";
import { type NotificacaoItem } from "@/modules/notifications/api";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarPollingInteligente } from "@/hooks/use-polling-inteligente";

const INTERVALO_POLLING_VISIVEL_MS = 20_000;
const INTERVALO_POLLING_OCULTO_MS = 90_000;

type NotificationsContextValue = {
  pendentesCount: number;
  pedidosOracaoPendentes: number;
  notificacoes: NotificacaoItem[];
  refreshNotificacoes: () => Promise<void>;
  removerNotificacaoLocal: (tipo: string, referenciaId: number) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function ProvedorNotificacoes({ children }: { children: React.ReactNode }) {
  const { user } = usarAutenticacao();
  const [pendentesCount, setPendentesCount] = useState(0);
  const [pedidosOracaoPendentes, setPedidosOracaoPendentes] = useState(0);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);

  const carregar = useCallback(async () => {
    if (!user) return;

    try {
      const resumo = await obterResumoNotificacoes();
      setPendentesCount(resumo.preCadastrosPendentes);
      setNotificacoes(resumo.notificacoes ?? []);
      setPedidosOracaoPendentes(resumo.pedidosOracaoPendentes);
    } catch {
      setPendentesCount(0);
      setNotificacoes([]);
      setPedidosOracaoPendentes(0);
    }
  }, [user]);

  const refreshNotificacoes = useCallback(async () => {
    await carregar();
  }, [carregar]);

  const removerNotificacaoLocal = useCallback((tipo: string, referenciaId: number) => {
    setNotificacoes((prev) =>
      prev.filter((x) => !(x.tipo === tipo && x.referenciaId === referenciaId))
    );
  }, []);

  // Carrega ao montar e quando user muda
  useEffect(() => {
    void carregar();
  }, [carregar]);

  usarPollingInteligente({
    ativo: !!user,
    aoAtualizar: () => void carregar(),
    intervaloVisivelMs: INTERVALO_POLLING_VISIVEL_MS,
    intervaloOcultoMs: INTERVALO_POLLING_OCULTO_MS,
  });

  const value: NotificationsContextValue = {
    pendentesCount,
    pedidosOracaoPendentes,
    notificacoes,
    refreshNotificacoes,
    removerNotificacaoLocal,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function usarNotificacoes() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("usarNotificacoes deve ser usado dentro de ProvedorNotificacoes");
  }
  return ctx;
}
