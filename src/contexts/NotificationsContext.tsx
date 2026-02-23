import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { listarPreCadastrosParaAprovacao } from "@/modules/auth/preCadastro";
import {
  listarNotificacoesNaoVistas,
  marcarNotificacaoComoVista,
  type NotificacaoItem,
} from "@/modules/notifications/api";
import { usarAutenticacao } from "@/contexts/AuthContext";

const INTERVALO_POLLING_MS = 30_000; // 30 segundos para novas notificações de outros usuários

type NotificationsContextValue = {
  pendentesCount: number;
  notificacoes: NotificacaoItem[];
  refreshNotificacoes: () => Promise<void>;
  removerNotificacaoLocal: (tipo: string, referenciaId: number) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function ProvedorNotificacoes({ children }: { children: React.ReactNode }) {
  const { user } = usarAutenticacao();
  const [pendentesCount, setPendentesCount] = useState(0);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;

    try {
      if (user.role === "admin") {
        const lista = await listarPreCadastrosParaAprovacao();
        setPendentesCount(lista.length);
      } else {
        setPendentesCount(0);
      }
    } catch {
      setPendentesCount(0);
    }

    try {
      const lista = await listarNotificacoesNaoVistas();
      setNotificacoes(lista ?? []);
    } catch {
      setNotificacoes([]);
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

  // Polling para novas notificações (ex: aviso criado por outro usuário)
  useEffect(() => {
    if (!user) return;

    intervalRef.current = setInterval(() => {
      void carregar();
    }, INTERVALO_POLLING_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, carregar]);

  const value: NotificationsContextValue = {
    pendentesCount,
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
