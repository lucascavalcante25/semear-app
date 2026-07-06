import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  obterContagemNotificacoes,
  obterResumoNotificacoes,
} from "@/modules/notifications/resumo";
import { type NotificacaoItem } from "@/modules/notifications/api";
import {
  escutarNotificacoesDasAbas,
  publicarNotificacoesNasAbas,
  registrarListenerNotificacoes,
} from "@/modules/notifications/sync";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarPollingInteligente } from "@/hooks/use-polling-inteligente";
import { useLiderAbas } from "@/hooks/use-lider-abas";
import { iniciarListenerPushSeAtivo } from "@/modules/notificacoes/push";

const INTERVALO_POLLING_VISIVEL_MS = 45_000;
const INTERVALO_POLLING_OCULTO_MS = 120_000;
const INTERVALO_POLLING_PUSH_VISIVEL_MS = 90_000;
const INTERVALO_POLLING_PUSH_OCULTO_MS = 180_000;
const CHAVE_LIDER_ABAS = "semear.notificacoes";

type NotificationsContextValue = {
  pendentesCount: number;
  pedidosOracaoPendentes: number;
  notificacoes: NotificacaoItem[];
  refreshNotificacoes: () => Promise<void>;
  removerNotificacaoLocal: (tipo: string, referenciaId: number) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

function pushAtivoNoDispositivo(): boolean {
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

export function ProvedorNotificacoes({ children }: { children: React.ReactNode }) {
  const { user } = usarAutenticacao();
  const ehLider = useLiderAbas(CHAVE_LIDER_ABAS);
  const [pendentesCount, setPendentesCount] = useState(0);
  const [pedidosOracaoPendentes, setPedidosOracaoPendentes] = useState(0);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [pushAtivo, setPushAtivo] = useState(pushAtivoNoDispositivo);

  const fingerprintRef = useRef<string | undefined>(undefined);
  const carregandoRef = useRef(false);

  const aplicarResumo = useCallback(
    (resumo: {
      preCadastrosPendentes: number;
      pedidosOracaoPendentes: number;
      notificacoes: NotificacaoItem[];
    }, fingerprint?: string) => {
      setPendentesCount(resumo.preCadastrosPendentes);
      setPedidosOracaoPendentes(resumo.pedidosOracaoPendentes);
      setNotificacoes(resumo.notificacoes ?? []);
      if (fingerprint) {
        fingerprintRef.current = fingerprint;
      }
    },
    [],
  );

  const carregarCompleto = useCallback(async () => {
    if (!user || carregandoRef.current) return;

    carregandoRef.current = true;
    try {
      const resposta = await obterResumoNotificacoes(fingerprintRef.current);
      if (resposta.status === 304) {
        if (resposta.etag) {
          fingerprintRef.current = resposta.etag;
        }
        return;
      }
      if (resposta.dados) {
        aplicarResumo(resposta.dados, resposta.etag);
        publicarNotificacoesNasAbas({
          preCadastrosPendentes: resposta.dados.preCadastrosPendentes,
          pedidosOracaoPendentes: resposta.dados.pedidosOracaoPendentes,
          notificacoes: resposta.dados.notificacoes,
          fingerprint: resposta.etag ?? fingerprintRef.current ?? "",
        });
      }
    } catch {
      setPendentesCount(0);
      setNotificacoes([]);
      setPedidosOracaoPendentes(0);
      fingerprintRef.current = undefined;
    } finally {
      carregandoRef.current = false;
    }
  }, [user, aplicarResumo]);

  const verificarMudancas = useCallback(async () => {
    if (!user || !ehLider || carregandoRef.current) return;

    try {
      const contagem = await obterContagemNotificacoes(fingerprintRef.current);
      if (contagem.status === 304) {
        if (contagem.etag) {
          fingerprintRef.current = contagem.etag;
        }
        return;
      }

      const mudou =
        contagem.dados?.fingerprint &&
        contagem.dados.fingerprint !== fingerprintRef.current;

      if (mudou || !fingerprintRef.current) {
        await carregarCompleto();
      } else if (contagem.etag) {
        fingerprintRef.current = contagem.etag;
      }
    } catch {
      // silencioso no polling — refresh manual continua disponível
    }
  }, [user, ehLider, carregarCompleto]);

  const refreshNotificacoes = useCallback(async () => {
    fingerprintRef.current = undefined;
    await carregarCompleto();
  }, [carregarCompleto]);

  const removerNotificacaoLocal = useCallback((tipo: string, referenciaId: number) => {
    setNotificacoes((prev) =>
      prev.filter((x) => !(x.tipo === tipo && x.referenciaId === referenciaId)),
    );
    fingerprintRef.current = undefined;
  }, []);

  useEffect(() => {
    if (!user) {
      setPendentesCount(0);
      setNotificacoes([]);
      setPedidosOracaoPendentes(0);
      fingerprintRef.current = undefined;
      return;
    }
    fingerprintRef.current = undefined;
    void carregarCompleto();
  }, [user, carregarCompleto]);

  useEffect(() => {
    return escutarNotificacoesDasAbas((payload) => {
      if (payload.fingerprint === fingerprintRef.current) return;
      aplicarResumo(payload, payload.fingerprint);
    });
  }, [aplicarResumo]);

  useEffect(() => {
    return registrarListenerNotificacoes(() => {
      void refreshNotificacoes();
    });
  }, [refreshNotificacoes]);

  useEffect(() => {
    const atualizarPush = () => setPushAtivo(pushAtivoNoDispositivo());
    atualizarPush();
    window.addEventListener("focus", atualizarPush);
    document.addEventListener("visibilitychange", atualizarPush);
    return () => {
      window.removeEventListener("focus", atualizarPush);
      document.removeEventListener("visibilitychange", atualizarPush);
    };
  }, []);

  useEffect(() => {
    void iniciarListenerPushSeAtivo();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const aoMensagemSw = (event: MessageEvent) => {
      if (event.data?.type === "semear:notificacoes-atualizar") {
        void refreshNotificacoes();
      }
    };
    navigator.serviceWorker.addEventListener("message", aoMensagemSw);
    return () => navigator.serviceWorker.removeEventListener("message", aoMensagemSw);
  }, [refreshNotificacoes]);

  usarPollingInteligente({
    ativo: !!user && ehLider,
    aoAtualizar: () => void verificarMudancas(),
    intervaloVisivelMs: pushAtivo ? INTERVALO_POLLING_PUSH_VISIVEL_MS : INTERVALO_POLLING_VISIVEL_MS,
    intervaloOcultoMs: pushAtivo ? INTERVALO_POLLING_PUSH_OCULTO_MS : INTERVALO_POLLING_OCULTO_MS,
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
