import { useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { requisicaoApi } from "@/modules/api/client";
import type { IgrejaConfiguracao, StatusIgreja } from "@/modules/igreja/api";

export default function IgrejasSuperAdmin() {
  const [igrejas, setIgrejas] = useState<IgrejaConfiguracao[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const params = busca ? `?nome=${encodeURIComponent(busca)}` : "";
        const lista = await requisicaoApi<IgrejaConfiguracao[]>(`/api/admin/igrejas${params}`, {
          auth: true,
        });
        setIgrejas(lista);
      } catch {
        setIgrejas([]);
      } finally {
        setCarregando(false);
      }
    };
    void carregar();
  }, [busca]);

  const badgeStatus = (status?: StatusIgreja) => {
    switch (status) {
      case "ATIVA":
        return <Badge className="bg-green-600">Ativa</Badge>;
      case "EM_TESTE":
        return <Badge variant="secondary">Em teste</Badge>;
      case "INATIVA":
        return <Badge variant="destructive">Inativa</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Igrejas</h1>
          <p className="text-muted-foreground">Gerencie as igrejas clientes da plataforma.</p>
        </div>
        <Input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-md"
        />
        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {igrejas.map((igreja) => (
              <Card key={igreja.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{igreja.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{igreja.nomeFantasia}</p>
                  </div>
                  {badgeStatus(igreja.status)}
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {igreja.cnpj && <p>CNPJ: {igreja.cnpj}</p>}
                  {(igreja.cidade || igreja.estado) && (
                    <p>
                      {[igreja.cidade, igreja.estado].filter(Boolean).join(" - ")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
