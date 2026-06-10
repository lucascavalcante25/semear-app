import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obterAssinaturaAcesso } from "@/modules/admin/api";
import { Sparkles } from "lucide-react";

export function BannerTesteGratis() {
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const status = await obterAssinaturaAcesso();
        if (status.statusAssinatura === "EM_TESTE" && status.mensagem) {
          setMensagem(status.mensagem);
        }
      } catch {
        setMensagem(null);
      }
    };
    void carregar();
  }, []);

  if (!mensagem) return null;

  const dias = mensagem.match(/(\d+)/)?.[1];
  const alerta = dias !== undefined && Number(dias) <= 3;

  return (
    <div
      className={`mx-4 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm ${
        alerta
          ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
          : "border-primary/20 bg-primary/5 text-foreground"
      }`}
    >
      <div className="flex items-center gap-2">
        <Sparkles className={`h-4 w-4 shrink-0 ${alerta ? "text-amber-600" : "text-primary"}`} />
        <span>{mensagem}</span>
      </div>
      {alerta && (
        <Link to="/suporte" className="font-medium underline underline-offset-2 hover:no-underline">
          Falar com suporte
        </Link>
      )}
    </div>
  );
}
