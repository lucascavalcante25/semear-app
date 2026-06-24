import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  excluirLoteLimpeza,
  listarLotesLimpeza,
  LABEL_MODO_LIMPEZA,
  type EscalaLimpezaLoteDTO,
} from "@/modules/escalas/automacao-api";

const labelModo = (modo?: string) => {
  if (modo && modo in LABEL_MODO_LIMPEZA) {
    return LABEL_MODO_LIMPEZA[modo as keyof typeof LABEL_MODO_LIMPEZA];
  }
  return modo ?? "Limpeza";
};

type Props = {
  onRecarregar?: () => void;
};

export function EscalasLimpezaHistorico({ onRecarregar }: Props) {
  const [lotes, setLotes] = useState<EscalaLimpezaLoteDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluirChave, setExcluirChave] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLotes((await listarLotesLimpeza()) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar histórico de limpeza.");
      setLotes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const confirmarExcluir = async () => {
    if (!excluirChave) return;
    setExcluindo(true);
    try {
      await excluirLoteLimpeza(excluirChave);
      setExcluirChave(null);
      toast.success("Lote de limpeza excluído.");
      await carregar();
      onRecarregar?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir lote.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de limpeza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {carregando ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma geração de limpeza registrada.</p>
          ) : (
            lotes.map((lote) => (
              <div
                key={lote.chave}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-sm">{labelModo(lote.modo)}</p>
                    <Badge variant="secondary">{lote.totalEscalas ?? 0} escalas</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lote.cicloPeriodo && <>Ciclo {lote.cicloPeriodo} · </>}
                    {lote.criadoEm &&
                      new Date(lote.criadoEm).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10 shrink-0"
                  onClick={() => setExcluirChave(lote.chave)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir lote
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={excluirChave != null} onOpenChange={(open) => !open && !excluindo && setExcluirChave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lote de limpeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as escalas desta geração de limpeza serão removidas. Portaria e recepção do mesmo ciclo não são
              afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void confirmarExcluir();
              }}
            >
              {excluindo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
