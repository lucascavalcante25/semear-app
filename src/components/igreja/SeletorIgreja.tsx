import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Church, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { resolverUrlLogo, type IgrejaPublica } from "@/modules/igreja/api";

function rotuloIgreja(igreja: IgrejaPublica): string {
  return igreja.nomeFantasia?.trim() || igreja.nome?.trim() || "Igreja";
}

function localIgreja(igreja: IgrejaPublica): string {
  const partes = [igreja.cidade, igreja.estado].filter(Boolean);
  return partes.join(" - ");
}

function enderecoIgreja(igreja: IgrejaPublica): string | null {
  const partes = [igreja.endereco, igreja.bairro].filter(Boolean);
  if (partes.length === 0) return null;
  return partes.join(", ");
}

type Props = {
  igrejas: IgrejaPublica[];
  value?: number;
  onChange: (id: number | undefined) => void;
  carregando?: boolean;
  erro?: string;
  id?: string;
};

export function SeletorIgreja({ igrejas, value, onChange, carregando, erro, id = "igreja" }: Props) {
  const [aberto, setAberto] = useState(false);

  const selecionada = useMemo(
    () => igrejas.find((igreja) => igreja.id === value),
    [igrejas, value],
  );

  return (
    <div className="space-y-3">
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={aberto}
            aria-invalid={Boolean(erro)}
            className={cn(
              "w-full justify-between h-auto min-h-10 py-2 font-normal",
              erro && "border-destructive",
            )}
            disabled={carregando}
          >
            {carregando ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando igrejas...
              </span>
            ) : selecionada ? (
              <span className="flex flex-col items-start text-left min-w-0">
                <span className="font-medium truncate w-full">{rotuloIgreja(selecionada)}</span>
                {localIgreja(selecionada) && (
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {localIgreja(selecionada)}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">Selecione sua igreja...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar igreja por nome ou cidade..." />
            <CommandList className="max-h-64">
              <CommandEmpty>Nenhuma igreja encontrada.</CommandEmpty>
              <CommandGroup>
                {igrejas.map((igreja) => {
                  if (igreja.id == null) return null;
                  const endereco = enderecoIgreja(igreja);
                  const local = localIgreja(igreja);
                  return (
                    <CommandItem
                      key={igreja.id}
                      value={[rotuloIgreja(igreja), igreja.nome, local, endereco]
                        .filter(Boolean)
                        .join(" ")}
                      onSelect={() => {
                        onChange(igreja.id);
                        setAberto(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === igreja.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{rotuloIgreja(igreja)}</span>
                        {igreja.nomeFantasia && igreja.nome && igreja.nomeFantasia !== igreja.nome && (
                          <span className="text-xs text-muted-foreground truncate">{igreja.nome}</span>
                        )}
                        {(local || endereco) && (
                          <span className="text-xs text-muted-foreground truncate">
                            {[local, endereco].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selecionada && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start gap-3">
            {selecionada.logoUrl ? (
              <img
                src={resolverUrlLogo(selecionada.logoUrl)}
                alt=""
                className="h-12 w-12 rounded-lg object-contain bg-background border shrink-0"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-olive/10 shrink-0">
                <Church className="h-6 w-6 text-olive" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{rotuloIgreja(selecionada)}</p>
              {selecionada.subtituloIgreja && (
                <p className="text-sm text-muted-foreground">{selecionada.subtituloIgreja}</p>
              )}
            </div>
          </div>
          {(localIgreja(selecionada) || enderecoIgreja(selecionada)) && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                {[enderecoIgreja(selecionada), localIgreja(selecionada)].filter(Boolean).join(" — ")}
              </p>
            </div>
          )}
          {selecionada.descricaoIgreja && (
            <p className="text-sm text-muted-foreground">{selecionada.descricaoIgreja}</p>
          )}
        </div>
      )}
    </div>
  );
}
