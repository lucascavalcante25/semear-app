import { useState } from "react";
import { Copy, Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { labelTipoChave } from "@/lib/pix-payload";

export function PixOfertaCompacto() {
  const { pix, nomeExibicao } = useIgrejaConfiguracao();
  const [copiado, setCopiado] = useState(false);

  if (!pix?.chavePix) {
    return null;
  }

  const handleCopiar = () => {
    navigator.clipboard.writeText(pix.chavePix!);
    setCopiado(true);
    toast.success(`${labelTipoChave(pix.tipoChavePix)} copiado! Cole no seu banco.`);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 sm:gap-2 text-primary hover:bg-primary/10 hover:text-primary text-xs sm:text-sm"
        >
          <Wallet className="h-4 w-4 shrink-0" />
          <span className="sm:hidden">Oferta</span>
          <span className="hidden sm:inline">Ofertar via PIX</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">{nomeExibicao}</p>
          {pix.nomeTitularPix?.trim() && (
            <p className="text-xs text-muted-foreground">
              Titular: {pix.nomeTitularPix.trim()}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Copie a chave PIX abaixo e cole no app do seu banco para ofertar.
          </p>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Chave {labelTipoChave(pix.tipoChavePix)}:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded break-all">
                {pix.chavePix}
              </code>
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopiar}>
                {copiado ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full gap-2" onClick={handleCopiar}>
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiado ? "Chave copiada!" : `Copiar ${labelTipoChave(pix.tipoChavePix)}`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface PixOfertaBlocoProps {
  className?: string;
  compact?: boolean;
}

export function PixOfertaBloco({ className, compact }: PixOfertaBlocoProps) {
  const { pix, nomeExibicao } = useIgrejaConfiguracao();
  const [copiado, setCopiado] = useState(false);

  if (!pix?.chavePix) {
    return (
      <div className={cn("rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground leading-snug", className)}>
        Esta igreja ainda não configurou uma chave PIX.
      </div>
    );
  }

  const titular =
    pix.nomeTitularPix?.trim() ||
    pix.nomeFantasia?.trim() ||
    pix.nome?.trim() ||
    nomeExibicao;

  const handleCopiar = () => {
    navigator.clipboard.writeText(pix.chavePix!);
    setCopiado(true);
    toast.success(`${labelTipoChave(pix.tipoChavePix)} copiado!`);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-lg border border-primary/20 bg-primary/5 overflow-hidden",
          className,
        )}
      >
        <div className="p-2.5 space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Wallet className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-xs font-semibold text-foreground truncate">Ofertar via PIX</p>
          </div>
          <p className="text-[10px] text-muted-foreground truncate" title={pix.chavePix}>
            {labelTipoChave(pix.tipoChavePix)}: {pix.chavePix}
          </p>
          <p className="text-[10px] text-foreground/80 truncate" title={titular}>
            Titular: {titular}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full gap-1.5 text-xs text-primary hover:bg-primary/10 px-2"
            onClick={handleCopiar}
          >
            {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiado ? "Copiado!" : `Copiar ${labelTipoChave(pix.tipoChavePix)}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-primary/5 overflow-hidden",
        className,
      )}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 shrink-0 text-primary" />
          <p className="font-medium text-sm text-foreground">Ofertar via PIX</p>
        </div>
        <p className="text-xs text-muted-foreground break-all" title={pix.chavePix}>
          {labelTipoChave(pix.tipoChavePix)}: {pix.chavePix}
        </p>
        <p className="text-xs text-foreground/80 truncate" title={titular}>
          Titular: {titular}
        </p>
        {titular !== nomeExibicao && (
          <p className="text-[10px] text-muted-foreground truncate" title={nomeExibicao}>
            {nomeExibicao}
          </p>
        )}
        {pix.textoAgradecimentoOferta && (
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            {pix.textoAgradecimentoOferta}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-primary hover:bg-primary/10"
          onClick={handleCopiar}
        >
          {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copiado ? "Copiado!" : `Copiar ${labelTipoChave(pix.tipoChavePix)}`}
        </Button>
      </div>
    </div>
  );
}
