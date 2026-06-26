import { useEffect, useState } from "react";
import { Bell, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { listarDepartamentos, type DepartamentoDTO } from "@/modules/departamentos/api";
import {
  type ConfigNotificacao,
  LABEL_AUDIENCIA,
  type TipoAudienciaNotificacao,
} from "@/modules/notificacoes/config-types";
import { cn } from "@/lib/utils";

type Props = {
  value: ConfigNotificacao;
  onChange: (config: ConfigNotificacao) => void;
  /** evento = lembretes + alteração; comunicado = publicação + mensagem custom */
  modo: "evento" | "comunicado";
  className?: string;
};

export function ConfigNotificacaoForm({ value, onChange, modo, className }: Props) {
  const [departamentos, setDepartamentos] = useState<DepartamentoDTO[]>([]);

  useEffect(() => {
    void listarDepartamentos()
      .then(setDepartamentos)
      .catch(() => setDepartamentos([]));
  }, []);

  const atualizar = (parcial: Partial<ConfigNotificacao>) => {
    onChange({ ...value, ...parcial });
  };

  const toggleDepartamento = (id: number, marcado: boolean) => {
    const atual = value.departamentoIds ?? [];
    const proximo = marcado ? [...new Set([...atual, id])] : atual.filter((d) => d !== id);
    atualizar({ departamentoIds: proximo });
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-olive/40 bg-olive-light/10 p-4 space-y-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-olive-dark" />
            Notificações no celular
          </p>
          <p className="text-xs text-muted-foreground">
            Somente quem ativou push receberá. Configure quem deve ser avisado e quando.
          </p>
        </div>
        <Switch
          checked={Boolean(value.ativo)}
          onCheckedChange={(ativo) => atualizar({ ativo })}
          aria-label="Ativar notificações configuráveis"
        />
      </div>

      {value.ativo && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between gap-3 rounded-md border bg-background/60 px-3 py-2">
              <Label htmlFor="enviar-publicacao" className="text-xs font-normal">
                Enviar ao publicar
              </Label>
              <Switch
                id="enviar-publicacao"
                checked={value.enviarNaPublicacao !== false}
                onCheckedChange={(v) => atualizar({ enviarNaPublicacao: v })}
              />
            </div>
            {modo === "evento" && (
              <>
                <div className="flex items-center justify-between gap-3 rounded-md border bg-background/60 px-3 py-2">
                  <Label htmlFor="enviar-alteracao" className="text-xs font-normal">
                    Avisar em alterações
                  </Label>
                  <Switch
                    id="enviar-alteracao"
                    checked={Boolean(value.enviarNaAlteracao)}
                    onCheckedChange={(v) => atualizar({ enviarNaAlteracao: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border bg-background/60 px-3 py-2">
                  <Label htmlFor="enviar-cancelamento" className="text-xs font-normal">
                    Avisar em cancelamento
                  </Label>
                  <Switch
                    id="enviar-cancelamento"
                    checked={value.enviarNoCancelamento !== false}
                    onCheckedChange={(v) => atualizar({ enviarNoCancelamento: v })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Quem deve receber?</Label>
            <Select
              value={value.audiencia ?? "TODOS"}
              onValueChange={(v) => atualizar({ audiencia: v as TipoAudienciaNotificacao })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LABEL_AUDIENCIA) as TipoAudienciaNotificacao[])
                  .filter((k) => modo === "evento" || k !== "INSCRITOS")
                  .map((k) => (
                    <SelectItem key={k} value={k}>
                      {LABEL_AUDIENCIA[k]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {value.audiencia === "DEPARTAMENTOS" && (
            <div className="space-y-2 max-h-36 overflow-y-auto rounded-md border bg-background/60 p-3">
              <p className="text-xs text-muted-foreground mb-2">Selecione um ou mais departamentos:</p>
              {departamentos.length === 0 ? (
                <p className="text-xs text-amber-600">Nenhum departamento cadastrado.</p>
              ) : (
                departamentos.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <Checkbox
                      checked={(value.departamentoIds ?? []).includes(d.id!)}
                      onCheckedChange={(c) => toggleDepartamento(d.id!, Boolean(c))}
                    />
                    {d.nome}
                  </label>
                ))
              )}
            </div>
          )}

          {modo === "evento" && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label className="text-xs">Lembrete diário até o evento</Label>
                  <p className="text-[11px] text-muted-foreground">
                    Um aviso por dia, no horário abaixo
                  </p>
                </div>
                <Switch
                  checked={value.lembreteDiario !== false}
                  onCheckedChange={(v) => atualizar({ lembreteDiario: v })}
                />
              </div>

              {value.lembreteDiario !== false ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="dias-antes" className="text-xs">
                      Começar quantos dias antes?
                    </Label>
                    <Input
                      id="dias-antes"
                      type="number"
                      min={0}
                      max={30}
                      value={value.diasAntesInicio ?? 3}
                      onChange={(e) =>
                        atualizar({ diasAntesInicio: Math.max(0, Number(e.target.value) || 0) })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="hora-lembrete" className="text-xs">
                      Horário do lembrete
                    </Label>
                    <Input
                      id="hora-lembrete"
                      type="time"
                      value={value.horaLembrete ?? "08:00"}
                      onChange={(e) => atualizar({ horaLembrete: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="dias-especificos" className="text-xs">
                    Dias antes (separados por vírgula, ex: 7, 3, 1, 0)
                  </Label>
                  <Input
                    id="dias-especificos"
                    placeholder="7, 3, 1, 0"
                    value={(value.diasAntesEspecificos ?? [1, 0]).join(", ")}
                    onChange={(e) => {
                      const nums = e.target.value
                        .split(",")
                        .map((s) => parseInt(s.trim(), 10))
                        .filter((n) => !Number.isNaN(n) && n >= 0);
                      atualizar({ diasAntesEspecificos: nums.length ? nums : [0] });
                    }}
                  />
                  <div className="space-y-1 pt-1">
                    <Label htmlFor="hora-lembrete-esp" className="text-xs">
                      Horário
                    </Label>
                    <Input
                      id="hora-lembrete-esp"
                      type="time"
                      value={value.horaLembrete ?? "08:00"}
                      onChange={(e) => atualizar({ horaLembrete: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {modo === "comunicado" && (
            <div className="space-y-1">
              <Label htmlFor="msg-comunicado" className="text-xs">
                Mensagem da notificação (opcional)
              </Label>
              <Textarea
                id="msg-comunicado"
                rows={2}
                placeholder="Se vazio, usa o início do conteúdo do comunicado."
                value={value.mensagemPersonalizada ?? ""}
                onChange={(e) => atualizar({ mensagemPersonalizada: e.target.value })}
              />
            </div>
          )}

          <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Push só chega a quem ativou lembretes no celular e manteve a categoria correspondente
            (eventos ou avisos gerais) ligada.
          </p>
        </>
      )}
    </div>
  );
}
