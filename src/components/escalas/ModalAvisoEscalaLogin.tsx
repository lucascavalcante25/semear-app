import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  dialogContentSizeCompact,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2, HandHeart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { avisosLoginEscalas, type EscalaLoginAvisoDTO } from "@/modules/escalas/automacao-api";
import { confirmarItemEscala } from "@/modules/escalas/api";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { usarNotificacoes } from "@/contexts/NotificationsContext";

export function ModalAvisoEscalaLogin() {
  const { user } = usarAutenticacao();
  const { refreshNotificacoes } = usarNotificacoes();
  const [avisos, setAvisos] = useState<EscalaLoginAvisoDTO[]>([]);
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const carregarAvisos = () => {
    if (!user) return;
    void avisosLoginEscalas()
      .then((lista) => {
        const pendentes = lista ?? [];
        setAvisos(pendentes);
        setIndice(0);
        setAberto(pendentes.length > 0);
      })
      .catch(() => setAberto(false));
  };

  useEffect(() => {
    carregarAvisos();
  }, [user]);

  const atual = avisos[indice];

  const avancar = () => {
    if (indice + 1 < avisos.length) {
      setIndice(indice + 1);
    } else {
      setAberto(false);
      setAvisos([]);
    }
  };

  const fecharSemConfirmar = () => {
    avancar();
  };

  const confirmarPresenca = async () => {
    if (!atual?.escalaId || !atual.escalaItemId) return;
    setConfirmando(true);
    try {
      await confirmarItemEscala(atual.escalaId, atual.escalaItemId);
      toast.success("Presença confirmada.");
      void refreshNotificacoes();
      avancar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível confirmar presença.");
    } finally {
      setConfirmando(false);
    }
  };

  if (!atual) return null;

  const dataFmt = atual.dataEvento
    ? new Date(atual.dataEvento).toLocaleString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Dialog
      open={aberto}
      onOpenChange={(open) => {
        if (!open) fecharSemConfirmar();
        else setAberto(open);
      }}
    >
      <DialogContent className={dialogContentSizeCompact}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" />
            Você está escalado para servir
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Este aviso aparece em cada acesso até você confirmar presença na escala.
        </p>
        <div className="space-y-3 text-sm">
          <div className="space-y-1 rounded-lg border bg-muted/40 p-3">
            <p className="font-semibold">{atual.tituloEscala ?? atual.departamentoNome}</p>
            {atual.departamentoNome && atual.tituloEscala && (
              <p className="text-muted-foreground">{atual.departamentoNome}</p>
            )}
            {atual.cultoNome && <p className="text-muted-foreground">{atual.cultoNome}</p>}
            {dataFmt && (
              <p className="flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {dataFmt}
              </p>
            )}
            {atual.funcao && <p>Função: {atual.funcao}</p>}
          </div>
          {atual.orientacoesServico && (
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Orientações</p>
              <p className="whitespace-pre-line text-muted-foreground">{atual.orientacoesServico}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={fecharSemConfirmar} disabled={confirmando}>
            Lembrar depois
          </Button>
          <Button onClick={() => void confirmarPresenca()} disabled={confirmando}>
            {confirmando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar presença
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
