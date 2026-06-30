import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  alertasSecretariaEscalas,
  type EscalaAlertaSecretariaDTO,
} from "@/modules/escalas/automacao-api";
import { canWrite } from "@/auth/permissions";
import { usarAutenticacao } from "@/contexts/AuthContext";

export function AlertasSecretariaEscalas() {
  const { user } = usarAutenticacao();
  const [alertas, setAlertas] = useState<EscalaAlertaSecretariaDTO[]>([]);

  useEffect(() => {
    if (!user || !canWrite(user, "/escalas")) return;
    void alertasSecretariaEscalas()
      .then((lista) => setAlertas(lista ?? []))
      .catch(() => setAlertas([]));
  }, [user]);

  if (alertas.length === 0) return null;

  return (
    <div className="space-y-2">
      {alertas.map((alerta, i) => (
        <Card key={`${alerta.tipo}-${i}`} className="border-amber-300 bg-amber-50/80 dark:bg-amber-950/20">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
              {alerta.tipo === "RASCUNHO_PENDENTE" ? (
                <Bell className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p className="font-medium">{alerta.titulo}</p>
                <p className="text-sm text-muted-foreground">{alerta.mensagem}</p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
              <Link
                to={
                  alerta.geracaoId
                    ? `/escalas?aba=automacao&geracao=${alerta.geracaoId}`
                    : "/escalas?aba=automacao"
                }
              >
                {alerta.tipo === "RASCUNHO_PENDENTE" ? "Ver rascunho" : "Ir para automação"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
