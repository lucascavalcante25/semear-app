import { useState } from "react";
import { Copy, QrCode, Check, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PIX_CNPJ = "10884335000173";
const PIX_QR_IMAGE = "/qrcode-pix-semear.png";

function PixQrCodeImage({ className }: { className?: string }) {
  const [erro, setErro] = useState(false);
  if (erro) {
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
      src={PIX_QR_IMAGE}
      alt="QR Code PIX - Comunidade Evangélica Semear"
      className={`object-contain border ${className ?? ""}`}
      onError={() => setErro(true)}
    />
  );
}
const PIX_COPIA_COLA =
  "00020126360014br.gov.bcb.pix0114108843350001735204000053039865802BR5925COMUNIDADE EVANGELICA SEM6007EUSEBIO622605227AYSkr1gn7xCuJ8iTSb0HC630490FC";

function copiarPix() {
  navigator.clipboard.writeText(PIX_COPIA_COLA);
  toast.success("Chave PIX copiada! Cole no seu banco.");
}

export function PixOfertaCompacto() {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(PIX_CNPJ);
    setCopiado(true);
    toast.success("CNPJ copiado! Cole no seu banco.");
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
          <p className="text-sm font-medium text-foreground">
            Comunidade Evangélica Semear
          </p>
          <p className="text-xs text-muted-foreground">
            Você pode ofertar pelo PIX usando o CNPJ ou escaneando o QR Code.
          </p>
          <div className="flex justify-center py-2">
            <PixQrCodeImage className="h-40 w-40" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Chave CNPJ:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1.5 rounded truncate">
                {PIX_CNPJ}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleCopiar}
              >
                {copiado ? (
                  <Check className="h-4 w-4 text-olive" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              copiarPix();
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
  const [copiado, setCopiado] = useState(false);

  const handleCopiarCnpj = () => {
    navigator.clipboard.writeText(PIX_CNPJ);
    setCopiado(true);
    toast.success("CNPJ copiado!");
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-olive-light/30 border-olive/20 overflow-hidden",
        className
      )}
    >
      <div className={cn("p-3", compact && "p-2")}>
        <div className={cn("flex gap-3", compact && "flex-col items-center")}>
          {!compact && (
            <div className="shrink-0 flex justify-center">
              <PixQrCodeImage className="h-24 w-24 border bg-white" />
            </div>
          )}
          <div className={cn("flex-1 min-w-0", compact && "text-center")}>
            <p
              className={cn(
                "font-medium text-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              Ofertar via PIX
            </p>
            <p
              className={cn(
                "text-muted-foreground",
                compact ? "text-[10px] leading-tight mt-0.5" : "text-xs mt-1"
              )}
            >
              CNPJ: {PIX_CNPJ}
            </p>
            <p
              className={cn(
                "text-muted-foreground",
                compact ? "text-[10px]" : "text-xs"
              )}
            >
              Comunidade Evangélica Semear
            </p>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "mt-2 gap-1.5 text-olive hover:bg-olive/10",
                compact && "h-7 text-[10px] px-2"
              )}
              onClick={handleCopiarCnpj}
            >
              {copiado ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiado ? "Copiado!" : "Copiar CNPJ"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
