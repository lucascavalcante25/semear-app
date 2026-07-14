import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  atualizarPreferenciasNotificacao,
  obterPreferenciasNotificacao,
  type PreferenciasNotificacao,
} from "@/modules/notificacoes/api";
import { ErroRequisicaoApi } from "@/modules/api/client";
import {
  ativarPushCompleto,
  desativarPushLocal,
  verificarSuportePush,
} from "@/modules/notificacoes/push";
import { toast } from "sonner";

type CampoPreferencia = keyof PreferenciasNotificacao;

function mensagemSalvando(campo: CampoPreferencia, ativando: boolean): string {
  if (campo === "pushAtivo") {
    return ativando ? "Ativando notificações push…" : "Desativando notificações push…";
  }
  return ativando ? "Ativando preferência…" : "Desativando preferência…";
}

export function PushPreferenciasCard() {
  const [disponivel, setDisponivel] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [campoSalvando, setCampoSalvando] = useState<CampoPreferencia | null>(null);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);
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

  const atualizarCampo = async (campo: CampoPreferencia, valor: boolean) => {
    setSalvando(true);
    setCampoSalvando(campo);
    setMensagemStatus(mensagemSalvando(campo, valor));
    try {
      if (campo === "pushAtivo") {
        if (valor) {
          await ativarPushCompleto();
          const dados = await obterPreferenciasNotificacao();
          setPrefs(dados);
          if (dados.dispositivoRegistrado && dados.pushAtivo) {
            toast.success("Dispositivo registrado para receber notificações.");
          } else {
            toast.warning("Push ativado, mas o registro do dispositivo não foi confirmado.");
          }
          return;
        }
        await desativarPushLocal();
        const dados = await obterPreferenciasNotificacao();
        setPrefs(dados);
        toast.success("Notificações push desativadas neste dispositivo.");
        return;
      }
      const atualizado = await atualizarPreferenciasNotificacao({ [campo]: valor });
      setPrefs(atualizado);
      toast.success("Preferências atualizadas.");
    } catch (erro) {
      const msg =
        erro instanceof ErroRequisicaoApi
          ? erro.message
          : erro instanceof Error
            ? erro.message
            : "Erro ao salvar preferências.";
      toast.error(msg);
    } finally {
      setSalvando(false);
      setCampoSalvando(null);
      setMensagemStatus(null);
    }
  };

  const campos: { key: CampoPreferencia; label: string }[] = [
    { key: "eventosAtivo", label: "Eventos" },
    { key: "escalasAtivo", label: "Escalas" },
    { key: "cultosAtivo", label: "Lembretes de culto" },
    { key: "devocionalAtivo", label: "Devocional diário" },
    { key: "avisosGeraisAtivo", label: "Avisos gerais" },
    { key: "departamentosAtivo", label: "Ministérios / departamentos" },
  ];

  return (
    <Card className="relative">
      {salvando && mensagemStatus && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">{mensagemStatus}</p>
          <p className="text-xs text-muted-foreground">Aguarde um instante…</p>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Lembretes no celular
        </CardTitle>
        <CardDescription>
          As notificações serão usadas apenas para lembretes importantes, como eventos, cultos, escalas e
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

        {salvando && campoSalvando === "pushAtivo" && mensagemStatus && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            {mensagemStatus}
          </p>
        )}

        {prefs.pushAtivo && prefs.dispositivoRegistrado && !salvando && (
          <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Este dispositivo está registrado para receber notificações.
          </p>
        )}

        {prefs.pushAtivo && !prefs.dispositivoRegistrado && !salvando && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Permissão concedida, mas o dispositivo ainda não foi registrado no servidor.
          </p>
        )}

        {prefs.pushAtivo && (
          <div className="space-y-4 pl-1 border-l-2 border-muted ml-1">
            {campos.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4 pl-3">
                <Label htmlFor={key} className={salvando && campoSalvando === key ? "opacity-70" : ""}>
                  {label}
                </Label>
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
      </CardContent>
    </Card>
  );
}
