import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  dialogContentSizeWide,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Eye, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usarAutenticacao } from "@/contexts/AuthContext";
import type { EscalaDTO } from "@/modules/escalas/api";
import {
  excluirLoteLimpeza,
  listarEscalasDoLoteLimpeza,
  listarLotesLimpeza,
  publicarLoteLimpeza,
  LABEL_MODO_LIMPEZA,
  type EscalaLimpezaLoteDTO,
} from "@/modules/escalas/automacao-api";
import {
  agruparEscalasPorCulto,
  formatarDataEscala,
  nomesCoincidem,
  usuarioEstaNoGrupo,
} from "@/modules/escalas/escala-agrupamento";

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
  const { user } = usarAutenticacao();
  const [lotes, setLotes] = useState<EscalaLimpezaLoteDTO[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [verChave, setVerChave] = useState<string | null>(null);
  const [escalasLote, setEscalasLote] = useState<EscalaDTO[]>([]);
  const [carregandoEscalas, setCarregandoEscalas] = useState(false);
  const [descartarChave, setDescartarChave] = useState<string | null>(null);
  const [excluirChave, setExcluirChave] = useState<string | null>(null);
  const [descartando, setDescartando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLotes((await listarLotesLimpeza()) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar lotes de limpeza.");
      setLotes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const abrirEscalasLote = async (chave: string) => {
    setVerChave(chave);
    setCarregandoEscalas(true);
    setEscalasLote([]);
    try {
      setEscalasLote((await listarEscalasDoLoteLimpeza(chave)) ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar escalas do lote.");
      setVerChave(null);
    } finally {
      setCarregandoEscalas(false);
    }
  };

  const publicar = async (chave: string) => {
    try {
      const publicado = await publicarLoteLimpeza(chave);
      toast.success("Lote publicado! Membros escalados serão avisados ao logar.");
      setLotes((prev) =>
        prev.map((l) => (l.chave === chave ? { ...l, ...publicado, status: "PUBLICADA" } : l)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao publicar lote.");
    }
  };

  const descartarRascunho = async () => {
    if (!descartarChave) return;
    setDescartando(true);
    try {
      await excluirLoteLimpeza(descartarChave);
      const chave = descartarChave;
      setDescartarChave(null);
      toast.success("Rascunho descartado.");
      setLotes((prev) => prev.filter((l) => l.chave !== chave));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao descartar rascunho.");
    } finally {
      setDescartando(false);
    }
  };

  const excluirLotePublicado = async () => {
    if (!excluirChave) return;
    setExcluindo(true);
    try {
      await excluirLoteLimpeza(excluirChave);
      const chave = excluirChave;
      setExcluirChave(null);
      toast.success("Lote de limpeza excluído.");
      setLotes((prev) => prev.filter((l) => l.chave !== chave));
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
          <CardTitle className="text-base">Lotes de limpeza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {carregando ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : lotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lote de limpeza gerado ainda.</p>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={lote.status === "PUBLICADA" ? "default" : "secondary"}>
                    {lote.status === "PUBLICADA" ? "Publicada" : "Rascunho"}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void abrirEscalasLote(lote.chave)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver escalas
                  </Button>
                  {lote.status === "RASCUNHO" && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => setDescartarChave(lote.chave)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Descartar
                      </Button>
                      <Button size="sm" onClick={() => void publicar(lote.chave)}>
                        Publicar
                      </Button>
                    </>
                  )}
                  {lote.status === "PUBLICADA" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      onClick={() => setExcluirChave(lote.chave)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={verChave != null} onOpenChange={(open) => !open && setVerChave(null)}>
        <DialogContent className={cn("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0", dialogContentSizeWide)}>
          <DialogHeader className="shrink-0 border-b px-6 pb-4 pt-6">
            <DialogTitle>Escalas do lote de limpeza</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {carregandoEscalas ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : escalasLote.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma escala neste lote.</p>
            ) : (
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {agruparEscalasPorCulto(escalasLote).map((grupo) => {
                  const meuDia = usuarioEstaNoGrupo(grupo, user?.name);
                  return (
                    <div
                      key={grupo.chave}
                      className={cn(
                        "flex w-full flex-col rounded-lg border p-4 text-sm shadow-sm transition-colors",
                        meuDia
                          ? "border-primary/60 bg-primary/10 ring-1 ring-primary/25"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold leading-tight">
                            {formatarDataEscala(grupo.dataEvento)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{grupo.titulo}</p>
                        </div>
                        {meuDia && (
                          <Badge variant="default" className="shrink-0 text-[10px]">
                            Você
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3 flex w-full flex-col gap-2">
                        {grupo.funcoes.map((item, idx) => {
                          const souEu = nomesCoincidem(item.nome, user?.name);
                          return (
                            <div
                              key={`${grupo.chave}-${item.departamento}-${idx}`}
                              className={cn(
                                "w-full rounded-md px-3 py-2.5",
                                souEu ? "border border-primary/40 bg-primary/20" : "bg-muted/50",
                              )}
                            >
                              <p className={cn("text-sm font-medium", souEu && "text-primary")}>
                                {item.nome}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={descartarChave != null}
        onOpenChange={(open) => !open && !descartando && setDescartarChave(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar rascunho?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as escalas deste rascunho de limpeza serão removidas. Portaria e recepção do mesmo ciclo não são
              afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={descartando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={descartando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void descartarRascunho();
              }}
            >
              {descartando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Descartar rascunho"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={excluirChave != null}
        onOpenChange={(open) => !open && !excluindo && setExcluirChave(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lote de limpeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as escalas deste lote publicado serão removidas. Portaria e recepção do mesmo ciclo não são
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
                void excluirLotePublicado();
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
