import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { CultoAgendaItemDTO } from "@/modules/cultos/api";
import {
  enviarMensagemWhatsApp,
  formatarDataCultoWhatsApp,
  formatarHorarioCulto,
  montarMensagemCultoWhatsApp,
  type OpcoesCompartilharCulto,
} from "@/lib/compartilhar-culto";

type Props = {
  item: CultoAgendaItemDTO | null;
  aberto: boolean;
  onFechar: () => void;
};

export function ModalCompartilharCulto({ item, aberto, onFechar }: Props) {
  const temPregador = Boolean(item?.pregador?.trim());
  const temLouvores = (item?.louvores?.length ?? 0) > 0;
  const temPortaria = Boolean(item?.responsaveis?.some((r) => r.papel === "PORTARIA" && r.nome?.trim()));
  const temRecepcao = Boolean(item?.responsaveis?.some((r) => r.papel === "RECEPCAO" && r.nome?.trim()));
  const temLimpeza = Boolean(item?.responsaveis?.some((r) => r.papel === "LIMPEZA" && r.nome?.trim()));

  const [opcoes, setOpcoes] = useState<OpcoesCompartilharCulto>({
    pregador: true,
    louvores: true,
    portaria: true,
    recepcao: true,
    limpeza: true,
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!aberto || !item) return;
    setOpcoes({
      pregador: temPregador,
      louvores: temLouvores,
      portaria: temPortaria,
      recepcao: temRecepcao,
      limpeza: temLimpeza,
    });
  }, [aberto, item, temPregador, temLouvores, temPortaria, temRecepcao, temLimpeza]);

  const preview = useMemo(() => {
    if (!item) return "";
    return montarMensagemCultoWhatsApp(item, {
      pregador: opcoes.pregador && temPregador,
      louvores: opcoes.louvores && temLouvores,
      portaria: opcoes.portaria && temPortaria,
      recepcao: opcoes.recepcao && temRecepcao,
      limpeza: opcoes.limpeza && temLimpeza,
    });
  }, [item, opcoes, temPregador, temLouvores, temPortaria, temRecepcao, temLimpeza]);

  const compartilhar = async () => {
    if (!item) return;
    setEnviando(true);
    try {
      const resultado = await enviarMensagemWhatsApp(preview, item.nome);
      if (resultado === "copiado") {
        toast.success("Texto copiado. Cole no WhatsApp.");
      } else {
        toast.success("Pronto para enviar no WhatsApp.");
      }
      onFechar();
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      toast.error(e instanceof Error ? e.message : "Não foi possível compartilhar.");
    } finally {
      setEnviando(false);
    }
  };

  const linha = (
    id: keyof OpcoesCompartilharCulto,
    label: string,
    disponivel: boolean,
    vazio: string,
  ) => (
    <label
      className={`flex items-start gap-2.5 rounded-md border px-2.5 py-2 ${disponivel ? "cursor-pointer" : "opacity-60"}`}
    >
      <Checkbox
        id={`share-culto-${id}`}
        checked={disponivel && opcoes[id]}
        disabled={!disponivel}
        onCheckedChange={(v) => setOpcoes((o) => ({ ...o, [id]: v === true }))}
        className="mt-0.5"
      />
      <span className="min-w-0 text-sm leading-snug">
        <span className="font-medium">{label}</span>
        {!disponivel && <span className="block text-xs text-muted-foreground">{vazio}</span>}
      </span>
    </label>
  );

  return (
    <Dialog open={aberto && !!item} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-sm gap-3 p-4 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            Compartilhar culto
          </DialogTitle>
          <DialogDescription className="text-xs">
            Data e hora vão sempre. Marque o que mais quiser na mensagem do WhatsApp.
          </DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-2">
            <div className="rounded-md bg-muted/50 px-2.5 py-2 text-sm">
              <p className="font-medium">{item.nome}</p>
              <p className="text-xs text-muted-foreground">
                {formatarDataCultoWhatsApp(item.data)} às {formatarHorarioCulto(item.horario)}
              </p>
            </div>
            <div className="grid gap-1.5">
              {linha("pregador", "Pregador", temPregador, "Nenhum pregador neste culto")}
              {linha("louvores", "Louvores (título e artista)", temLouvores, "Nenhum louvor neste culto")}
              {linha("portaria", "Portaria", temPortaria, "Ninguém na portaria")}
              {linha("recepcao", "Recepção", temRecepcao, "Ninguém na recepção")}
              {linha("limpeza", "Limpeza da semana", temLimpeza, "Ninguém na limpeza desta semana")}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void compartilhar()} disabled={enviando}>
            {enviando ? "Abrindo…" : "Enviar no WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
