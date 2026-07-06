import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TEXTO_SUPORTE } from "@/lib/plataforma";
import { usarPollingInteligente } from "@/hooks/use-polling-inteligente";
import type { SolicitacaoSuporte, SolicitacaoSuporteMensagem, StatusSolicitacaoSuporte } from "@/modules/suporte/api";

const INTERVALO_POLLING_VISIVEL_MS = 20_000;
const INTERVALO_POLLING_OCULTO_MS = 60_000;

function formatarData(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

function extrairMensagens(solicitacao: SolicitacaoSuporte): SolicitacaoSuporteMensagem[] {
  if (solicitacao.mensagens && solicitacao.mensagens.length > 0) {
    return solicitacao.mensagens;
  }
  return [
    {
      id: 0,
      tipo: "MENSAGEM_CLIENTE",
      texto: solicitacao.descricao,
      dataEnvio: solicitacao.createdDate,
      usuarioNome: solicitacao.nomeSolicitante,
    },
  ];
}

function assinaturaMensagens(mensagens: SolicitacaoSuporteMensagem[]): string {
  return mensagens.map((m) => `${m.id}:${m.dataEnvio}`).join("|");
}

type Props = {
  solicitacao: SolicitacaoSuporte;
  visao: "cliente" | "suporte";
  podeEnviar: boolean;
  placeholder?: string;
  onEnviar: (texto: string) => Promise<SolicitacaoSuporte>;
  buscarAtualizacao?: () => Promise<SolicitacaoSuporte>;
  onSincronizar?: (s: SolicitacaoSuporte) => void;
  onAtualizacaoRemota?: () => void;
};

export function ConversaSuporte({
  solicitacao,
  visao,
  podeEnviar,
  placeholder,
  onEnviar,
  buscarAtualizacao,
  onSincronizar,
  onAtualizacaoRemota,
}: Props) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagens, setMensagens] = useState(() => extrairMensagens(solicitacao));
  const [status, setStatus] = useState<StatusSolicitacaoSuporte>(solicitacao.status);

  const scrollRef = useRef<HTMLDivElement>(null);
  const deveRolarRef = useRef(true);
  const assinaturaRef = useRef(assinaturaMensagens(mensagens));
  const statusRef = useRef(status);
  const sincronizarRef = useRef<(() => Promise<void>) | null>(null);

  statusRef.current = status;

  useEffect(() => {
    const novas = extrairMensagens(solicitacao);
    const novaAssinatura = assinaturaMensagens(novas);
    if (novaAssinatura !== assinaturaRef.current) {
      assinaturaRef.current = novaAssinatura;
      setMensagens(novas);
    }
    if (solicitacao.status !== statusRef.current) {
      setStatus(solicitacao.status);
    }
  }, [solicitacao]);

  const rolarParaFim = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanciaFim = el.scrollHeight - el.scrollTop - el.clientHeight;
    deveRolarRef.current = distanciaFim < 80;
  };

  useEffect(() => {
    if (deveRolarRef.current) {
      rolarParaFim();
    }
  }, [mensagens, rolarParaFim]);

  useEffect(() => {
    if (!buscarAtualizacao) return;

    let cancelado = false;

    const sincronizar = async () => {
      try {
        const s = await buscarAtualizacao();
        if (cancelado) return;

        const novas = extrairMensagens(s);
        const novaAssinatura = assinaturaMensagens(novas);
        const mensagensMudaram = novaAssinatura !== assinaturaRef.current;
        const statusMudou = s.status !== statusRef.current;

        if (mensagensMudaram) {
          assinaturaRef.current = novaAssinatura;
          setMensagens(novas);
          if (visao === "cliente" && novas.some((m) => m.tipo === "MENSAGEM_SUPORTE")) {
            onAtualizacaoRemota?.();
          }
        }
        if (statusMudou) {
          setStatus(s.status);
        }
        if (mensagensMudaram || statusMudou) {
          onSincronizar?.(s);
        }
      } catch {
        /* silencioso */
      }
    };

    sincronizarRef.current = () => sincronizar();

    return () => {
      cancelado = true;
      sincronizarRef.current = null;
    };
  }, [buscarAtualizacao, onSincronizar, onAtualizacaoRemota, visao]);

  usarPollingInteligente({
    ativo: !!buscarAtualizacao,
    aoAtualizar: () => void sincronizarRef.current?.(),
    intervaloVisivelMs: INTERVALO_POLLING_VISIVEL_MS,
    intervaloOcultoMs: INTERVALO_POLLING_OCULTO_MS,
  });

  const enviar = async () => {
    const t = texto.trim();
    if (t.length < 2) return;
    setEnviando(true);
    try {
      const atualizado = await onEnviar(t);
      const novas = extrairMensagens(atualizado);
      assinaturaRef.current = assinaturaMensagens(novas);
      setMensagens(novas);
      setStatus(atualizado.status);
      setTexto("");
      deveRolarRef.current = true;
      onSincronizar?.(atualizado);
    } finally {
      setEnviando(false);
    }
  };

  const podeEnviarEfetivo =
    podeEnviar &&
    (visao === "cliente" ? podeClienteEnviarMensagem(status) : podeSuporteEnviarMensagem(status));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Conversa</p>
        <span className="text-xs text-muted-foreground">
          {mensagens.length} mensagem{mensagens.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-[12rem] max-h-[min(28rem,55vh)] space-y-3 overflow-y-auto rounded-xl border bg-muted/20 p-4"
      >
        {mensagens.map((m) => {
          const isSuporte = m.tipo === "MENSAGEM_SUPORTE";
          const isSistema = m.tipo === "SISTEMA";
          const alinhamento =
            visao === "cliente"
              ? isSuporte || isSistema
                ? "items-start"
                : "items-end"
              : isSuporte
                ? "items-end"
                : "items-start";

          return (
            <div key={`${m.id}-${m.dataEnvio}`} className={cn("flex flex-col", alinhamento)}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  isSistema && "bg-background text-muted-foreground italic border",
                  !isSistema && isSuporte && "bg-primary text-primary-foreground",
                  !isSistema && !isSuporte && "bg-background border",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.texto}</p>
              </div>
              <p className="mt-1 px-1 text-[11px] text-muted-foreground">
                {visao === "cliente" && isSuporte
                  ? `${TEXTO_SUPORTE.remetenteMensagem} · `
                  : m.usuarioNome
                    ? `${m.usuarioNome} · `
                    : ""}
                {formatarData(m.dataEnvio)}
              </p>
            </div>
          );
        })}
      </div>

      {podeEnviarEfetivo && (
        <div className="space-y-3 rounded-xl border bg-muted/10 p-4">
          <Textarea
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={placeholder ?? "Escreva sua mensagem..."}
            maxLength={2000}
            className="resize-none bg-background"
          />
          <div className="flex justify-end">
            <Button className="gap-2" onClick={() => void enviar()} disabled={enviando || texto.trim().length < 2}>
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function podeClienteEnviarMensagem(status: string) {
  return status !== "FINALIZADA" && status !== "CANCELADA";
}

export function podeClienteCancelar(status: string) {
  return status === "ABERTA" || status === "EM_ANALISE";
}

export function podeSuporteFinalizar(status: string) {
  return status === "RESOLVIDA";
}

export function podeSuporteEnviarMensagem(status: string) {
  return status !== "FINALIZADA" && status !== "CANCELADA";
}
