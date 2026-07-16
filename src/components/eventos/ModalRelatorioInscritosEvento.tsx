import { useState } from "react";
import { FileDown, Loader2, Printer, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { EventoInscricaoDTO } from "@/modules/eventos/api";
import {
  imprimirRelatorioInscritos,
  ordenarInscritosRelatorio,
  salvarOuCompartilharPdfInscritos,
  type DadosRelatorioInscritos,
} from "@/lib/relatorio-inscritos-evento";

interface ModalRelatorioInscritosEventoProps {
  aberto: boolean;
  onFechar: () => void;
  dados: DadosRelatorioInscritos;
  inscritos: EventoInscricaoDTO[];
}

export function ModalRelatorioInscritosEvento({
  aberto,
  onFechar,
  dados,
  inscritos,
}: ModalRelatorioInscritosEventoProps) {
  const [exportando, setExportando] = useState(false);
  const lista = ordenarInscritosRelatorio(inscritos);

  const rotuloStatus = (inscricao: EventoInscricaoDTO) => {
    if (inscricao.status === "CANCELADA") return "Cancelada";
    return "Ativa";
  };

  const handlePdfOuCompartilhar = async () => {
    setExportando(true);
    try {
      const resultado = await salvarOuCompartilharPdfInscritos(dados, lista);
      toast.success(resultado === "compartilhado" ? "Relatório compartilhado." : "PDF salvo com sucesso.");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar o PDF.");
    } finally {
      setExportando(false);
    }
  };

  const handleImprimir = () => {
    try {
      imprimirRelatorioInscritos(dados, lista);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível imprimir.");
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b p-4">
          <DialogTitle>Relatório de inscritos</DialogTitle>
          <DialogDescription>
            {dados.tituloEvento} · {lista.length} inscrição(ões)
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-4 rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
            {dados.dataEvento && (
              <p>
                <span className="font-medium">Data:</span>{" "}
                {new Date(dados.dataEvento).toLocaleString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
            {dados.local && (
              <p>
                <span className="font-medium">Local:</span> {dados.local}
              </p>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">E-mail</th>
                  <th className="px-3 py-2">Telefone</th>
                  <th className="px-3 py-2">Inscrição</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((inscricao, indice) => (
                  <tr key={inscricao.id ?? `${inscricao.userNome}-${indice}`} className="border-t">
                    <td className="px-3 py-2 text-muted-foreground">{indice + 1}</td>
                    <td className="px-3 py-2 font-medium">{inscricao.userNome ?? "Participante"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{inscricao.userEmail ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{inscricao.userTelefone ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {inscricao.criadoEm
                        ? new Date(inscricao.criadoEm).toLocaleString("pt-BR")
                        : "—"}
                    </td>
                    <td className="px-3 py-2">{rotuloStatus(inscricao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t bg-background p-4 sm:justify-end">
          <Button variant="outline" onClick={onFechar}>
            Fechar
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={handleImprimir}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button className="gap-1.5" disabled={exportando} onClick={() => void handlePdfOuCompartilhar()}>
            {exportando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <FileDown className="h-4 w-4" />
              </>
            )}
            PDF / Compartilhar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
