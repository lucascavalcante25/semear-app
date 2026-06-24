import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, HandHeart } from "lucide-react";
import {
  avisosLoginEscalas,
  marcarAvisoLoginEscalaVisto,
  type EscalaLoginAvisoDTO,
} from "@/modules/escalas/automacao-api";
import { usarAutenticacao } from "@/contexts/AuthContext";

export function ModalAvisoEscalaLogin() {
  const { user } = usarAutenticacao();
  const [avisos, setAvisos] = useState<EscalaLoginAvisoDTO[]>([]);
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!user) return;
    void avisosLoginEscalas()
      .then((lista) => {
        const pendentes = lista ?? [];
        setAvisos(pendentes);
        setIndice(0);
        setAberto(pendentes.length > 0);
      })
      .catch(() => setAberto(false));
  }, [user]);

  const atual = avisos[indice];

  const fecharAtual = async () => {
    if (!atual) {
      setAberto(false);
      return;
    }
    try {
      await marcarAvisoLoginEscalaVisto(atual.escalaItemId);
    } catch {
      // segue mesmo se falhar marcar visto
    }
    if (indice + 1 < avisos.length) {
      setIndice(indice + 1);
    } else {
      setAberto(false);
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
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-primary" />
            Você está escalado para servir
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
            <p className="font-semibold">{atual.tituloEscala ?? atual.departamentoNome}</p>
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
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Orientações</p>
              <p className="whitespace-pre-line text-muted-foreground">{atual.orientacoesServico}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => void fecharAtual()}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
