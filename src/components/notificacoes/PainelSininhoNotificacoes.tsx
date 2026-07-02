import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LembretePushSininho } from "@/components/notificacoes/LembretePushSininho";
import { usarNotificacoes } from "@/contexts/NotificationsContext";
import { usarAutenticacao } from "@/contexts/AuthContext";
import type { NotificacaoItem } from "@/modules/notifications/api";
import {
  marcarNotificacaoComoLida,
  marcarTodasNotificacoesComoLidas,
  notificacaoIgnoraMarcarVista,
  rotaNotificacao,
  tratarCliqueNotificacao,
} from "@/lib/notificacao-acoes";
import { podeVerPreCadastrosPendentes } from "@/lib/pre-cadastro-permissoes";
import { cn } from "@/lib/utils";

type ItemNotificacaoProps = {
  notificacao: NotificacaoItem;
  marcando: boolean;
  onMarcarLida: (n: NotificacaoItem) => void;
  onAbrir: (n: NotificacaoItem) => void;
};

function ItemNotificacaoSininho({ notificacao, marcando, onMarcarLida, onAbrir }: ItemNotificacaoProps) {
  const podeMarcarLida = !notificacaoIgnoraMarcarVista(notificacao.tipo);

  return (
    <div
      className={cn(
        "flex items-start gap-1 rounded-sm px-2 py-2 hover:bg-accent focus-within:bg-accent",
        marcando && "opacity-60",
      )}
    >
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onAbrir(notificacao)}
        disabled={marcando}
      >
        <span className="text-sm font-medium leading-snug">{notificacao.titulo}</span>
        {notificacao.descricao && (
          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
            {notificacao.descricao}
          </span>
        )}
      </button>
      {podeMarcarLida && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          title="Marcar como lida"
          aria-label="Marcar como lida"
          disabled={marcando}
          onClick={(e) => {
            e.stopPropagation();
            onMarcarLida(notificacao);
          }}
        >
          {marcando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

export function PainelSininhoNotificacoes() {
  const navigate = useNavigate();
  const { user } = usarAutenticacao();
  const { pendentesCount, notificacoes, removerNotificacaoLocal } = usarNotificacoes();
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [marcandoChave, setMarcandoChave] = useState<string | null>(null);

  const chaveNotificacao = (n: NotificacaoItem) => `${n.tipo}-${n.referenciaId}`;
  const temNotificacoesMarcaveis = notificacoes.some((n) => !notificacaoIgnoraMarcarVista(n.tipo));

  const abrirNotificacao = async (n: NotificacaoItem) => {
    const chave = chaveNotificacao(n);
    setMarcandoChave(chave);
    try {
      await tratarCliqueNotificacao(n, removerNotificacaoLocal);
      navigate(rotaNotificacao(n.link));
    } catch {
      navigate(rotaNotificacao(n.link));
    } finally {
      setMarcandoChave(null);
    }
  };

  const marcarUmaComoLida = async (n: NotificacaoItem) => {
    const chave = chaveNotificacao(n);
    setMarcandoChave(chave);
    try {
      await marcarNotificacaoComoLida(n, removerNotificacaoLocal);
    } catch {
      /* mantém na lista se falhar */
    } finally {
      setMarcandoChave(null);
    }
  };

  const marcarTodasComoLidas = async () => {
    if (!temNotificacoesMarcaveis) return;
    setMarcandoTodas(true);
    try {
      await marcarTodasNotificacoesComoLidas(notificacoes, removerNotificacaoLocal);
    } catch {
      /* ignora — itens já removidos localmente permanecem fora */
    } finally {
      setMarcandoTodas(false);
    }
  };

  const semItens =
    (!podeVerPreCadastrosPendentes(user?.role) || pendentesCount === 0) && notificacoes.length === 0;

  return (
    <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto p-1">
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <DropdownMenuLabel className="p-0 text-sm font-semibold">Notificações</DropdownMenuLabel>
        {temNotificacoesMarcaveis && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-xs text-muted-foreground hover:text-foreground"
            disabled={marcandoTodas}
            onClick={() => void marcarTodasComoLidas()}
          >
            {marcandoTodas ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-1.5 h-3.5 w-3.5" />
            )}
            Marcar todas
          </Button>
        )}
      </div>
      <DropdownMenuSeparator />
      <LembretePushSininho />
      {podeVerPreCadastrosPendentes(user?.role) && pendentesCount > 0 && (
        <DropdownMenuItem
          className="flex flex-col items-start gap-1 cursor-pointer"
          onClick={() => navigate("/aprovar-pre-cadastros")}
        >
          <span className="text-sm font-medium">{pendentesCount} pré-cadastro(s) pendente(s)</span>
          <span className="text-xs text-muted-foreground">Clique para aprovar ou rejeitar</span>
        </DropdownMenuItem>
      )}
      {notificacoes.map((n) => (
        <ItemNotificacaoSininho
          key={chaveNotificacao(n)}
          notificacao={n}
          marcando={marcandoChave === chaveNotificacao(n) || marcandoTodas}
          onMarcarLida={(item) => void marcarUmaComoLida(item)}
          onAbrir={(item) => void abrirNotificacao(item)}
        />
      ))}
      {semItens && (
        <DropdownMenuItem className="text-sm text-muted-foreground" disabled>
          Sem notificações no momento
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate("/notificacoes")}>
        Ver central de notificações
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
