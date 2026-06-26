import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { EscalaConfigAutomaticaDTO, EscopoGeracaoEscala } from "@/modules/escalas/automacao-api";

type Props = {
  aberto: boolean;
  onAbertoChange: (aberto: boolean) => void;
  escopo: EscopoGeracaoEscala;
  config: EscalaConfigAutomaticaDTO;
  onConfigChange: (config: EscalaConfigAutomaticaDTO) => void;
  onConfirmar: () => Promise<void>;
  gerando: boolean;
  bloqueado?: boolean;
  motivoBloqueio?: string | null;
  substituirLimpezaExistente?: boolean;
  onSubstituirLimpezaChange?: (valor: boolean) => void;
};

export function ModalGerarCicloEscalas({
  aberto,
  onAbertoChange,
  escopo,
  config,
  onConfigChange,
  onConfirmar,
  gerando,
  bloqueado,
  motivoBloqueio,
  substituirLimpezaExistente,
  onSubstituirLimpezaChange,
}: Props) {
  const titulo =
    escopo === "LIMPEZA" ? "Gerar rascunho de limpeza" : "Gerar ciclo de portaria e recepção";

  return (
    <Dialog open={aberto} onOpenChange={onAbertoChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            {escopo === "LIMPEZA"
              ? "Um rascunho será criado no ciclo vigente. Revise as escalas em Lotes de limpeza e publique quando estiver tudo certo."
              : "Defina o período do ciclo e como as escalas serão sorteadas antes de gerar o rascunho."}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Meses por ciclo</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={config.mesesCiclo ?? 3}
                onChange={(e) => onConfigChange({ ...config, mesesCiclo: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Dias de antecedência</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={config.diasAntecedencia ?? 14}
                onChange={(e) => onConfigChange({ ...config, diasAntecedencia: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <Label>Renovação automática</Label>
              <p className="text-xs text-muted-foreground">
                Gera rascunho automaticamente antes do fim do ciclo.
              </p>
            </div>
            <Switch
              checked={config.ativo ?? true}
              onCheckedChange={(v) => onConfigChange({ ...config, ativo: v })}
            />
          </div>

          {escopo === "LIMPEZA" && (
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <Label>Substituir escalas existentes</Label>
                <p className="text-xs text-muted-foreground">
                  Remove as escalas de limpeza do ciclo vigente e gera um novo sorteio.
                </p>
              </div>
              <Switch
                checked={substituirLimpezaExistente ?? false}
                onCheckedChange={(v) => onSubstituirLimpezaChange?.(v)}
              />
            </div>
          )}

          {escopo === "PORTARIA_RECEPCAO" && (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Departamentos no sorteio</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Portaria</Label>
                  <p className="text-xs text-muted-foreground">Homens nos cultos cadastrados</p>
                </div>
                <Switch
                  checked={config.gerarPortaria ?? true}
                  onCheckedChange={(v) => onConfigChange({ ...config, gerarPortaria: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Recepção</Label>
                  <p className="text-xs text-muted-foreground">Mulheres nos cultos cadastrados</p>
                </div>
                <Switch
                  checked={config.gerarRecepcao ?? true}
                  onCheckedChange={(v) => onConfigChange({ ...config, gerarRecepcao: v })}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t pt-3">
                <div>
                  <Label>Escalas combinadas</Label>
                  <p className="text-xs text-muted-foreground">
                    Portaria e recepção no mesmo card (homem + mulher)
                  </p>
                </div>
                <Switch
                  checked={config.agruparPortariaRecepcao ?? false}
                  disabled={!(config.gerarPortaria && config.gerarRecepcao)}
                  onCheckedChange={(v) => onConfigChange({ ...config, agruparPortariaRecepcao: v })}
                />
              </div>
            </div>
          )}

          {bloqueado && motivoBloqueio && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
              {motivoBloqueio}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onAbertoChange(false)} disabled={gerando}>
            Cancelar
          </Button>
          <Button onClick={() => void onConfirmar()} disabled={gerando || bloqueado}>
            {gerando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar rascunho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
