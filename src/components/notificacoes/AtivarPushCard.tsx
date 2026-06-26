import { useEffect, useState } from "react";
import { Bell, Loader2, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
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

  if (!user || carregando || !disponivel) {
    return null;
  }

  if (negado) {
    return (
      <Card className="border-dashed border-amber-500/40 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações bloqueadas
          </CardTitle>
          <CardDescription className="text-sm">
            O navegador bloqueou as notificações deste site. Abra as configurações do site (ícone
            ao lado da URL) e permita notificações, depois recarregue a página.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (jaAtivou) {
    return (
      <Card className="border-dashed border-muted">
        <CardContent className="py-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Lembretes no celular já estão ativos neste dispositivo.
          </p>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/configuracoes">
              <Settings2 className="h-4 w-4 mr-2" />
              Configurações
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleAtivar = async () => {
    setAtivando(true);
    try {
      await ativarPushCompleto();
      setJaAtivou(true);
      toast.success("Lembretes no celular ativados!");
    } catch (erro) {
      const msg = erro instanceof Error ? erro.message : "Erro ao ativar lembretes.";
      toast.error(msg);
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
