import { useEffect, useState } from "react";
import { Copy, QrCode, Check, ImageOff } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { gerarPayloadPix, labelTipoChave } from "@/lib/pix-payload";

function PixQrCodeImage({ payload, className }: { payload: string; className?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!payload) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(payload, { width: 200, margin: 1 })
      .then(setDataUrl)
      .catch(() => setErro(true));
  }, [payload]);

  if (erro || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border bg-muted text-muted-foreground ${className ?? ""}`}
      >
        <ImageOff className="h-12 w-12" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code PIX"
      className={`object-contain border bg-white ${className ?? ""}`}
      onError={() => setErro(true)}
    />
  );
}

export function PixOfertaCompacto() {
  const { pix, nomeExibicao } = useIgrejaConfiguracao();
  const [copiado, setCopiado] = useState(false);

  if (!pix?.chavePix) {
    return null;
  }

  const payload = gerarPayloadPix({
    chavePix: pix.chavePix,
    tipoChavePix: pix.tipoChavePix,
    nomeTitular: pix.nomeTitularPix || pix.nome,
    cidade: pix.cidade,
  });

  const handleCopiar = () => {
    navigator.clipboard.writeText(pix.chavePix!);
    setCopiado(true);
    toast.success(`${labelTipoChave(pix.tipoChavePix)} copiado! Cole no seu banco.`);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 sm:gap-2 text-olive hover:bg-olive/10 hover:text-olive text-xs sm:text-sm"
        >
          <QrCode className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Ofertar via PIX</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">{nomeExibicao}</p>
          <p className="text-xs text-muted-foreground">
            Você pode ofertar pelo PIX usando a chave ou escaneando o QR Code.
          </p>
          <div className="flex justify-center py-2">
            <PixQrCodeImage payload={payload} className="h-40 w-40" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Chave {labelTipoChave(pix.tipoChavePix)}:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
                {pix.chavePix}
              </code>
              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopiar}>
                {copiado ? <Check className="h-4 w-4 text-olive" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              navigator.clipboard.writeText(payload);
              toast.success("Código PIX copiado! Cole no seu banco.");
            }}
          >
            <Copy className="h-4 w-4" />
            Copiar código PIX completo
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
      <div className={cn("rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground", className)}>
        Esta igreja ainda não configurou uma chave PIX.
      </div>
    );
  }

  const payload = gerarPayloadPix({
    chavePix: pix.chavePix,
    tipoChavePix: pix.tipoChavePix,
    nomeTitular: pix.nomeTitularPix || pix.nome,
    cidade: pix.cidade,
  });

  const handleCopiar = () => {
    navigator.clipboard.writeText(pix.chavePix!);
    setCopiado(true);
    toast.success(`${labelTipoChave(pix.tipoChavePix)} copiado!`);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-olive-light/30 border-olive/20 overflow-hidden",
        className,
      )}
    >
      <div className={cn("p-3", compact && "p-2")}>
        <div className={cn("flex gap-3", compact && "flex-col items-center")}>
          {!compact && <PixQrCodeImage payload={payload} className="h-24 w-24 shrink-0" />}
          <div className={cn("flex-1 min-w-0", compact && "text-center")}>
            <p className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
              Ofertar via PIX
            </p>
            <p className={cn("text-muted-foreground", compact ? "text-[10px] leading-tight mt-0.5" : "text-xs mt-1")}>
              {labelTipoChave(pix.tipoChavePix)}: {pix.chavePix}
            </p>
            <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
              {nomeExibicao}
            </p>
            {pix.textoAgradecimentoOferta && (
              <p className={cn("text-muted-foreground italic", compact ? "text-[10px] mt-1" : "text-xs mt-1")}>
                {pix.textoAgradecimentoOferta}
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn("mt-2 gap-1.5 text-olive hover:bg-olive/10", compact && "h-7 text-[10px] px-2")}
              onClick={handleCopiar}
            >
              {copiado ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiado ? "Copiado!" : `Copiar ${labelTipoChave(pix.tipoChavePix)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
