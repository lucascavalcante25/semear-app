import { useCallback, useEffect, useState } from "react";
import { Download, Eye, FileText, Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  baixarAnexo,
  baixarTodosAnexos,
  formatarTamanhoArquivo,
  type SolicitacaoSuporteAnexo,
} from "@/modules/suporte/api";
import { baixarAnexoAdmin, baixarTodosAnexosAdmin } from "@/modules/admin/suporte";
import { toast } from "sonner";

type VisaoAnexo = "cliente" | "admin";

type Props = {
  solicitacaoId: number;
  anexos: SolicitacaoSuporteAnexo[];
  visao?: VisaoAnexo;
  compacto?: boolean;
};

function ehImagem(tipo: string) {
  return tipo.startsWith("image/");
}

function ehPdf(tipo: string) {
  return tipo === "application/pdf";
}

export function PainelAnexosSuporte({ solicitacaoId, anexos, visao = "cliente", compacto = false }: Props) {
  const [visualizando, setVisualizando] = useState<SolicitacaoSuporteAnexo | null>(null);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [carregandoPreview, setCarregandoPreview] = useState(false);
  const [baixandoZip, setBaixandoZip] = useState(false);

  const baixarUm = useCallback(
    async (anexo: SolicitacaoSuporteAnexo) => {
      try {
        const blob =
          visao === "admin"
            ? await baixarAnexoAdmin(solicitacaoId, anexo.id)
            : await baixarAnexo(solicitacaoId, anexo.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = anexo.nomeArquivo;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast.error("Não foi possível baixar o anexo.");
      }
    },
    [solicitacaoId, visao],
  );

  const baixarTodos = async () => {
    setBaixandoZip(true);
    try {
      const blob =
        visao === "admin"
          ? await baixarTodosAnexosAdmin(solicitacaoId)
          : await baixarTodosAnexos(solicitacaoId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `anexos-solicitacao-${solicitacaoId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Não foi possível baixar os anexos.");
    } finally {
      setBaixandoZip(false);
    }
  };

  const abrirPreview = async (anexo: SolicitacaoSuporteAnexo) => {
    if (!ehImagem(anexo.tipoArquivo) && !ehPdf(anexo.tipoArquivo)) {
      void baixarUm(anexo);
      return;
    }
    setVisualizando(anexo);
    setCarregandoPreview(true);
    setUrlPreview(null);
    try {
      const blob =
        visao === "admin"
          ? await baixarAnexoAdmin(solicitacaoId, anexo.id)
          : await baixarAnexo(solicitacaoId, anexo.id);
      setUrlPreview(URL.createObjectURL(blob));
    } catch {
      toast.error("Não foi possível carregar a visualização.");
      setVisualizando(null);
    } finally {
      setCarregandoPreview(false);
    }
  };

  const fecharPreview = () => {
    if (urlPreview) URL.revokeObjectURL(urlPreview);
    setUrlPreview(null);
    setVisualizando(null);
  };

  useEffect(() => () => {
    if (urlPreview) URL.revokeObjectURL(urlPreview);
  }, [urlPreview]);

  if (!anexos.length) return null;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {anexos.length} anexo{anexos.length !== 1 ? "s" : ""}
          </span>
          <Badge variant="secondary">{anexos.length}</Badge>
        </div>
        {anexos.length > 1 && (
          <Button variant="outline" size="sm" className="gap-2" disabled={baixandoZip} onClick={() => void baixarTodos()}>
            {baixandoZip ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Baixar todos (.zip)
          </Button>
        )}
      </div>

      <div className={compacto ? "flex flex-wrap gap-2" : "grid gap-3 sm:grid-cols-2"}>
        {anexos.map((anexo) => (
          <div
            key={anexo.id}
            className="flex items-center gap-3 rounded-md border bg-background p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
              {ehImagem(anexo.tipoArquivo) ? (
                <span className="text-xs font-medium text-muted-foreground">IMG</span>
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={anexo.nomeArquivo}>
                {anexo.nomeArquivo}
              </p>
              <p className="text-xs text-muted-foreground">{formatarTamanhoArquivo(anexo.tamanhoArquivo)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              {(ehImagem(anexo.tipoArquivo) || ehPdf(anexo.tipoArquivo)) && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Visualizar"
                  onClick={() => void abrirPreview(anexo)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                title="Baixar"
                onClick={() => void baixarUm(anexo)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!visualizando} onOpenChange={(open) => !open && fecharPreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{visualizando?.nomeArquivo}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto">
            {carregandoPreview ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : urlPreview && visualizando ? (
              ehImagem(visualizando.tipoArquivo) ? (
                <img src={urlPreview} alt={visualizando.nomeArquivo} className="mx-auto max-h-[70vh] w-auto rounded-md" />
              ) : (
                <iframe src={urlPreview} title={visualizando.nomeArquivo} className="h-[70vh] w-full rounded-md border" />
              )
            ) : null}
          </div>
          {visualizando && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => void baixarUm(visualizando)}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button variant="secondary" onClick={fecharPreview}>
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function BadgeQuantidadeAnexos({ quantidade }: { quantidade?: number }) {
  if (!quantidade || quantidade <= 0) return null;
  return (
    <Badge variant="outline" className="gap-1 text-xs">
      <Paperclip className="h-3 w-3" />
      {quantidade} anexo{quantidade !== 1 ? "s" : ""}
    </Badge>
  );
}
