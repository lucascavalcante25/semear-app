import { Badge } from "@/components/ui/badge";
import { LABEL_STATUS, type SolicitacaoSuporteHistorico } from "@/modules/suporte/api";

const LABEL_ACAO: Record<string, string> = {
  CRIADA: "Abertura",
  STATUS_ALTERADO: "Status",
  RESPONDIDA: "Resposta",
  ANEXO_ADICIONADO: "Anexo",
};

function formatarData(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

export function HistoricoSuporte({
  itens,
  mostrarInterno = false,
}: {
  itens?: SolicitacaoSuporteHistorico[];
  mostrarInterno?: boolean;
}) {
  const lista = (itens ?? []).filter((h) => mostrarInterno || h.visivelParaCliente !== false);

  if (lista.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Histórico</p>
      <ol className="relative border-l border-border ml-2 space-y-4 pl-4">
        {lista.map((h) => (
          <li key={h.id} className="relative">
            <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
            <div className="rounded-lg border bg-card p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="outline">{LABEL_ACAO[h.acao] ?? h.acao}</Badge>
                {h.statusNovo && (
                  <Badge variant="secondary">{LABEL_STATUS[h.statusNovo] ?? h.statusNovo}</Badge>
                )}
                {mostrarInterno && h.visivelParaCliente === false && (
                  <Badge variant="destructive" className="text-xs">Interno</Badge>
                )}
              </div>
              {h.mensagem && <p className="whitespace-pre-wrap mt-1">{h.mensagem}</p>}
              <p className="text-xs text-muted-foreground mt-2">
                {h.usuarioNome && `${h.usuarioNome} · `}
                {formatarData(h.dataAcao)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
