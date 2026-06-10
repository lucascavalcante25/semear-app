import { avaliarSenha } from "@/lib/validacao-senha";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

type Props = {
  senha: string;
  confirmarSenha: string;
  className?: string;
};

export function IndicadorValidacaoSenha({ senha, confirmarSenha, className }: Props) {
  const resultado = avaliarSenha(senha, confirmarSenha);

  if (!senha && !confirmarSenha) return null;

  const itens = [
    {
      ok: resultado.tamanhoOk,
      label: "Mínimo de 6 caracteres (segurança média)",
    },
    {
      ok: confirmarSenha.length > 0 && resultado.coincidem,
      label: "As senhas coincidem",
    },
  ];

  return (
    <div className={cn("space-y-2 rounded-lg border bg-muted/30 p-3 text-sm", className)}>
      <p className="font-medium text-foreground">
        Força da senha:{" "}
        <span
          className={cn(
            resultado.nivel === "forte" && "text-green-600",
            resultado.nivel === "media" && "text-amber-600",
            resultado.nivel === "fraca" && "text-muted-foreground",
          )}
        >
          {resultado.nivel === "forte" ? "Forte" : resultado.nivel === "media" ? "Média" : "Fraca"}
        </span>
      </p>
      <ul className="space-y-1">
        {itens.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.ok ? (
              <Check className="h-4 w-4 shrink-0 text-green-600" aria-hidden />
            ) : (
              <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
