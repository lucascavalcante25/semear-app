import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  confirmarComunicado,
  listarComunicadosPendentesLogin,
  LABEL_TIPO,
  type ComunicadoDTO,
} from "@/modules/comunicados/api";
import { usarAutenticacao } from "@/contexts/AuthContext";

export function ModalInformativoLogin() {
  const { user } = usarAutenticacao();
  const [fila, setFila] = useState<ComunicadoDTO[]>([]);
  const [indice, setIndice] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const lista = await listarComunicadosPendentesLogin();
      setFila(lista ?? []);
      setIndice(0);
    } catch {
      setFila([]);
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const atual = fila[indice];
  const aberto = !carregando && fila.length > 0 && indice < fila.length;

  const avancar = () => {
    if (indice + 1 < fila.length) {
      setIndice((i) => i + 1);
    } else {
      setFila([]);
      setIndice(0);
    }
  };

  const confirmar = async () => {
    if (!atual?.id) return;
    setConfirmando(true);
    try {
      await confirmarComunicado(atual.id);
      avancar();
    } catch {
      avancar();
    } finally {
      setConfirmando(false);
    }
  };

  if (!aberto || !atual) return null;

  const tipoLabel = atual.tipo ? LABEL_TIPO[atual.tipo] : "Comunicado";

  return (
    <Dialog open={aberto} onOpenChange={() => {}}>
      <DialogContent
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={atual.tipo === "URGENTE" ? "destructive" : "secondary"}>
              {tipoLabel}
            </Badge>
            {fila.length > 1 && (
              <span className="text-xs text-muted-foreground">
                {indice + 1} de {fila.length}
              </span>
            )}
          </div>
          <DialogTitle>{atual.titulo}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-2">
              {atual.imagemUrl && (
                <img
                  src={atual.imagemUrl}
                  alt=""
                  className="w-full max-h-48 object-cover rounded-lg border"
                />
              )}
              <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {atual.conteudo}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
          {atual.ctaRotulo && atual.ctaRota && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to={atual.ctaRota}>{atual.ctaRotulo}</Link>
            </Button>
          )}
          <Button onClick={() => void confirmar()} disabled={confirmando} className="w-full sm:w-auto">
            {confirmando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar leitura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
