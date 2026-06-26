import { useEffect, useState } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  atualizarPreferenciasNotificacao,
  enviarTestePush,
  enviarVersiculoDoDiaTeste,
  dispararJobVersiculoDoDiaDev,
  obterPreferenciasNotificacao,
  type PreferenciasNotificacao,
} from "@/modules/notificacoes/api";
import {
  ativarPushCompleto,
  desativarPushLocal,
  verificarSuportePush,
} from "@/modules/notificacoes/push";
import { toast } from "sonner";

export function PushPreferenciasCard() {
  const [disponivel, setDisponivel] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [testandoVersiculo, setTestandoVersiculo] = useState(false);
  const [simulandoJob, setSimulandoJob] = useState(false);
  const [prefs, setPrefs] = useState<PreferenciasNotificacao>({});

  useEffect(() => {
    const carregar = async () => {
      try {
        const suporte = await verificarSuportePush();
        setDisponivel(suporte);
        if (suporte) {
          const dados = await obterPreferenciasNotificacao();
          setPrefs(dados);
        }
      } catch {
        setDisponivel(false);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  if (carregando) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!disponivel) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Lembretes no celular
          </CardTitle>
          <CardDescription>
            Notificações push não estão disponíveis neste dispositivo ou ambiente.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const atualizarCampo = async (campo: keyof PreferenciasNotificacao, valor: boolean) => {
    setSalvando(true);
    try {
      if (campo === "pushAtivo") {
        if (valor) {
          const ok = await ativarPushCompleto();
          if (!ok) {
            toast.error("Permissão negada ou erro ao registrar dispositivo.");
            return;
          }
        } else {
          await desativarPushLocal();
        }
      }
      const atualizado = await atualizarPreferenciasNotificacao({ [campo]: valor });
      setPrefs(atualizado);
      toast.success("Preferências atualizadas.");
    } catch {
      toast.error("Erro ao salvar preferências.");
    } finally {
      setSalvando(false);
    }
  };

  const handleTeste = async () => {
    setTestando(true);
    try {
      await enviarTestePush();
      toast.success("Notificação de teste enviada!");
    } catch {
      toast.error("Não foi possível enviar o teste. Verifique se push está ativo.");
    } finally {
      setTestando(false);
    }
  };

  const handleVersiculoTeste = async () => {
    setTestandoVersiculo(true);
    try {
      await enviarVersiculoDoDiaTeste();
      toast.success("Versículo do dia enviado!");
    } catch {
      toast.error("Não foi possível enviar o versículo. Verifique push e preferências.");
    } finally {
      setTestandoVersiculo(false);
    }
  };

  const handleSimularJob = async () => {
    setSimulandoJob(true);
    try {
      await dispararJobVersiculoDoDiaDev();
      toast.success("Job do versículo do dia executado — veja os logs do backend.");
    } catch {
      toast.error("Falha ao simular job. Push/teste habilitados no backend?");
    } finally {
      setSimulandoJob(false);
    }
  };

  const campos: { key: keyof PreferenciasNotificacao; label: string }[] = [
    { key: "eventosAtivo", label: "Eventos" },
    { key: "escalasAtivo", label: "Escalas" },
    { key: "devocionalAtivo", label: "Devocional diário" },
    { key: "avisosGeraisAtivo", label: "Avisos gerais" },
    { key: "departamentosAtivo", label: "Ministérios / departamentos" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Lembretes no celular
        </CardTitle>
        <CardDescription>
          As notificações serão usadas apenas para lembretes importantes, como eventos, escalas e
          avisos da igreja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="pushAtivo" className="flex-1">
            Ativar notificações push
          </Label>
          <Switch
            id="pushAtivo"
            checked={Boolean(prefs.pushAtivo)}
            disabled={salvando}
            onCheckedChange={(v) => void atualizarCampo("pushAtivo", v)}
          />
        </div>

        {prefs.pushAtivo && (
          <div className="space-y-4 pl-1 border-l-2 border-muted ml-1">
            {campos.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 pl-3">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={Boolean(prefs[key])}
                  disabled={salvando}
                  onCheckedChange={(v) => void atualizarCampo(key, v)}
                />
              </div>
            ))}
          </div>
        )}

        {prefs.pushAtivo && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleTeste} disabled={testando}>
              {testando ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar teste para mim
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleVersiculoTeste}
              disabled={testandoVersiculo}
            >
              {testandoVersiculo ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar versículo do dia
            </Button>
            {import.meta.env.DEV && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSimularJob}
                disabled={simulandoJob}
              >
                {simulandoJob ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Simular job 14:33 (dev)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
