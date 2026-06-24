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
import { listarLiderancaOracao } from "@/modules/oracao/api";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { ehLiderancaOracao } from "@/auth/permissions";

const INTERVALO_POLLING_MS = 15_000;

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

    if (ehLiderancaOracao(user)) {
      try {
        const pendentes = await listarLiderancaOracao({
          status: "AGUARDANDO_APROVACAO",
          size: 200,
        });
        setPedidosOracaoPendentes(pendentes.length);
      } catch {
        setPedidosOracaoPendentes(0);
      }
    } else {
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

  // Polling e atualização ao retornar à aba
  useEffect(() => {
    if (!user) return;

    const atualizar = () => void carregar();
    intervalRef.current = setInterval(atualizar, INTERVALO_POLLING_MS);
    window.addEventListener("focus", atualizar);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      window.removeEventListener("focus", atualizar);
    };
  }, [user, carregar]);

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
