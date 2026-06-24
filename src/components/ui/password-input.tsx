import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CampoSenhaProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
};

export function CampoSenha({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "new-password",
  required,
  className,
  inputClassName,
  "aria-label": ariaLabel = "Senha",
}: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        type={visivel ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-label={ariaLabel}
        className={cn("pr-10 password-with-toggle", inputClassName)}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        title={visivel ? "Ocultar senha" : "Mostrar senha"}
      >
        {visivel ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
