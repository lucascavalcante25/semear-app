import { MARCA } from "@/lib/plataforma";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Versão menor para login e páginas públicas */
  compacto?: boolean;
  /** Exibir texto "Desenvolvido por..." abaixo do logo */
  mostrarTexto?: boolean;
};

export function CreditoEmpresa({ className, compacto = false, mostrarTexto = true }: Props) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <img
        src={MARCA.logoEmpresa}
        alt={MARCA.empresa}
        className={cn(
          "object-contain",
          compacto ? "h-10 max-w-[200px]" : "h-14 max-w-[280px] sm:h-16 sm:max-w-[320px]",
        )}
      />
      {mostrarTexto && (
        <p className="text-xs text-muted-foreground text-center">{MARCA.creditoRodape}</p>
      )}
    </div>
  );
}
