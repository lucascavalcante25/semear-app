import { useState } from "react";
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
  descartarGeracaoEscalas,
  excluirEscalasPortariaRecepcao,
  listarEscalasDaGeracao,
  publicarGeracaoEscalas,
  type EscalaGeracaoDTO,
} from "@/modules/escalas/automacao-api";
import {
  agruparEscalasPorCulto,
  formatarDataEscala,
  nomesCoincidem,
  usuarioEstaNoGrupo,
} from "@/modules/escalas/escala-agrupamento";

type Props = {
  geracoes: EscalaGeracaoDTO[];
  onRecarregar: () => void;
};

const ehEscalaLimpeza = (escala: EscalaDTO) => {
  const nome = (escala.departamentoNome ?? "").toLowerCase();
  const obs = escala.observacao ?? escala.observacoes ?? "";
  return nome.includes("limpeza") || obs.startsWith("__loteLimpeza:");
};

export function EscalasCiclosGerados({ geracoes, onRecarregar }: Props) {
  const { user } = usarAutenticacao();
  const [verGeracaoId, setVerGeracaoId] = useState<number | null>(null);
  const [escalasGeracao, setEscalasGeracao] = useState<EscalaDTO[]>([]);
  const [carregandoEscalas, setCarregandoEscalas] = useState(false);
  const [descartarGeracaoId, setDescartarGeracaoId] = useState<number | null>(null);
  const [excluirGeracaoId, setExcluirGeracaoId] = useState<number | null>(null);
  const [descartando, setDescartando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const abrirEscalasGeracao = async (id: number) => {
    setVerGeracaoId(id);
    setCarregandoEscalas(true);
    setEscalasGeracao([]);
    try {
      const lista = await listarEscalasDaGeracao(id);
      setEscalasGeracao((lista ?? []).filter((e) => !ehEscalaLimpeza(e)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar escalas do ciclo.");
      setVerGeracaoId(null);
    } finally {
      setCarregandoEscalas(false);
    }
  };

  const publicar = async (id: number) => {
    try {
      await publicarGeracaoEscalas(id);
      toast.success("Ciclo publicado! Membros escalados serão avisados ao logar.");
      onRecarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao publicar.");
    }
  };

  const descartarRascunho = async () => {
    if (descartarGeracaoId == null) return;
    setDescartando(true);
    try {
      await descartarGeracaoEscalas(descartarGeracaoId);
      setDescartarGeracaoId(null);
      toast.success("Rascunho descartado.");
      onRecarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao descartar rascunho.");
    } finally {
      setDescartando(false);
    }
  };

  const excluirCicloPublicado = async () => {
    if (excluirGeracaoId == null) return;
    setExcluindo(true);
    try {
      await excluirEscalasPortariaRecepcao(excluirGeracaoId);
      setExcluirGeracaoId(null);
      toast.success("Escalas de portaria e recepção excluídas.");
      onRecarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir ciclo.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de portaria e recepção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {geracoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum ciclo de portaria e recepção gerado ainda.</p>
          ) : (
            geracoes.map((g) => (
              <div
                key={g.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium text-sm">
                    {g.dataInicio && new Date(`${g.dataInicio}T00:00:00`).toLocaleDateString("pt-BR")}
                    {" — "}
                    {g.dataFim && new Date(`${g.dataFim}T00:00:00`).toLocaleDateString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {g.totalEscalas ?? 0} escalas · {g.origem === "AGENDADO" ? "automático" : "manual"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={g.status === "PUBLICADA" ? "default" : "secondary"}>
                    {g.status === "PUBLICADA" ? "Publicada" : "Rascunho"}
                  </Badge>
                  {g.id && (
                    <Button type="button" size="sm" variant="outline" onClick={() => void abrirEscalasGeracao(g.id!)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver escalas
                    </Button>
                  )}
                  {g.status === "RASCUNHO" && g.id && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => setDescartarGeracaoId(g.id!)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Descartar
                      </Button>
                      <Button size="sm" onClick={() => void publicar(g.id!)}>
                        Publicar
                      </Button>
                    </>
                  )}
                  {g.status === "PUBLICADA" && g.id && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/40 hover:bg-destructive/10"
                      onClick={() => setExcluirGeracaoId(g.id!)}
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

      <Dialog open={verGeracaoId != null} onOpenChange={(open) => !open && setVerGeracaoId(null)}>
        <DialogContent className={cn("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0", dialogContentSizeWide)}>
          <DialogHeader className="shrink-0 border-b px-6 pb-4 pt-6">
            <DialogTitle>Escalas do ciclo</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {carregandoEscalas ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : escalasGeracao.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma escala neste ciclo.</p>
            ) : (
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {agruparEscalasPorCulto(escalasGeracao).map((grupo) => {
                  const meuDia = usuarioEstaNoGrupo(grupo, user?.name);
                  return (
                    <div
                      key={grupo.chave}
                      className={cn(
                        "w-full rounded-lg border p-4 text-sm shadow-sm transition-colors",
                        meuDia
                          ? "border-primary/60 bg-primary/10 ring-1 ring-primary/25"
                          : "border-border bg-card",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold leading-tight">{grupo.titulo}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatarDataEscala(grupo.dataEvento)}
                          </p>
                        </div>
                        {meuDia && (
                          <Badge variant="default" className="shrink-0 text-[10px]">
                            Você
                          </Badge>
                        )}
                      </div>
                      <div
                        className={cn(
                          "mt-3 grid w-full gap-2",
                          grupo.funcoes.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
                        )}
                      >
                        {grupo.funcoes.map((item, idx) => {
                          const souEu = nomesCoincidem(item.nome, user?.name);
                          return (
                            <div
                              key={`${grupo.chave}-${item.departamento}-${idx}`}
                              className={cn(
                                "rounded-md px-3 py-2",
                                souEu ? "border border-primary/40 bg-primary/20" : "bg-muted/50",
                              )}
                            >
                              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                {item.departamento}
                              </p>
                              <p className={cn("mt-0.5 text-sm font-medium", souEu && "text-primary")}>
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
        open={descartarGeracaoId != null}
        onOpenChange={(open) => !open && !descartando && setDescartarGeracaoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar rascunho?</AlertDialogTitle>
            <AlertDialogDescription>
              As escalas de portaria e recepção deste rascunho serão removidas. Escalas de limpeza do mesmo ciclo não
              são afetadas.
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
        open={excluirGeracaoId != null}
        onOpenChange={(open) => !open && !excluindo && setExcluirGeracaoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir escalas de portaria e recepção?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as escalas de portaria e recepção deste ciclo publicado serão removidas. Escalas de limpeza do mesmo
              período não são afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={excluindo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void excluirCicloPublicado();
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
