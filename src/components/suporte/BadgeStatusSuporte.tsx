import { Badge } from "@/components/ui/badge";
import { LABEL_STATUS, type StatusSolicitacaoSuporte } from "@/modules/suporte/api";
import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<StatusSolicitacaoSuporte, string> = {
  ABERTA: "!bg-blue-600 hover:!bg-blue-600 !text-white",
  EM_ANALISE: "!bg-amber-500 hover:!bg-amber-500 !text-white",
  RESPONDIDA: "!bg-purple-600 hover:!bg-purple-600 !text-white",
  RESOLVIDA: "!bg-green-600 hover:!bg-green-600 !text-white",
  FINALIZADA: "!bg-slate-500 hover:!bg-slate-500 !text-white",
  CANCELADA: "!bg-red-600 hover:!bg-red-600 !text-white",
};

export function BadgeStatusSuporte({ status }: { status: StatusSolicitacaoSuporte }) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-normal", STATUS_CLASSES[status])}>
      {LABEL_STATUS[status]}
    </Badge>
  );
}
