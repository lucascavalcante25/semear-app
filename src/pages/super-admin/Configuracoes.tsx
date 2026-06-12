import { useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditoEmpresa } from "@/components/brand/CreditoEmpresa";
import { PLATAFORMA } from "@/lib/plataforma";
import { obterConfigPlataformaAdmin, type PlataformaConfig } from "@/modules/admin/api";

export default function ConfiguracoesSuperAdmin() {
  const [config, setConfig] = useState<PlataformaConfig | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        setConfig(await obterConfigPlataformaAdmin());
      } catch {
        setConfig(null);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, []);

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações da Plataforma</h1>
          <p className="text-muted-foreground">
            Informações gerais do {PLATAFORMA.nome} — {PLATAFORMA.empresa}.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresa desenvolvedora</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditoEmpresa mostrarTexto={false} />
            <p className="mt-3 text-center text-sm text-muted-foreground">{PLATAFORMA.empresa}</p>
          </CardContent>
        </Card>

        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : config ? (
          <Card>
            <CardHeader>
              <CardTitle>{config.nomePlataforma}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Versão do app</span>
                <span>{config.versao || "—"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">E-mail de suporte</span>
                <span>{config.emailSuporte || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">URL base</span>
                <span className="truncate max-w-[60%] text-right">{config.urlBase || "—"}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Configurações avançadas (SMTP, domínio personalizado, webhooks) podem ser adicionadas em versões futuras.
              </p>
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground">Não foi possível carregar as configurações.</p>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
