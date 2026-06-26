import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { ativarPushCompleto, verificarSuportePush } from "@/modules/notificacoes/push";
import { obterPreferenciasNotificacao } from "@/modules/notificacoes/api";
import { toast } from "sonner";

/**
 * Card discreto para opt-in de push — exibido apenas quando disponível e usuário ainda não ativou.
 */
export function AtivarPushCard() {
  const { user } = usarAutenticacao();
  const [disponivel, setDisponivel] = useState(false);
  const [jaAtivou, setJaAtivou] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [ativando, setAtivando] = useState(false);
  const [negado, setNegado] = useState(false);

  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }
    const verificar = async () => {
      try {
        const suporte = await verificarSuportePush();
        setDisponivel(suporte);
        if (suporte) {
          const prefs = await obterPreferenciasNotificacao();
          setJaAtivou(Boolean(prefs.pushAtivo && prefs.dispositivoRegistrado));
          if (Notification.permission === "denied") {
            setNegado(true);
          }
        }
      } catch {
        setDisponivel(false);
      } finally {
        setCarregando(false);
      }
    };
    void verificar();
  }, [user]);

  if (!user || carregando || !disponivel || jaAtivou) {
    return null;
  }

  if (negado) {
    return null;
  }

  const handleAtivar = async () => {
    setAtivando(true);
    try {
      const ok = await ativarPushCompleto();
      if (ok) {
        setJaAtivou(true);
        toast.success("Lembretes no celular ativados!");
      } else {
        toast.error("Não foi possível ativar. Verifique as permissões do navegador.");
      }
    } catch {
      toast.error("Erro ao ativar lembretes.");
    } finally {
      setAtivando(false);
    }
  };

  return (
    <Card className="border-dashed border-olive/30 bg-olive-light/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-olive-dark" />
          Lembretes no celular
        </CardTitle>
        <CardDescription className="text-sm">
          Receba avisos de eventos e escalas direto no celular, sem precisar abrir o app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAtivar}
          disabled={ativando}
          className="border-olive/40"
        >
          {ativando ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Ativar lembretes no celular
        </Button>
      </CardContent>
    </Card>
  );
}
