import { useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listarPlanosAdmin, type Plano } from "@/modules/admin/api";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PlanosSuperAdmin() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        setPlanos(await listarPlanosAdmin());
      } catch {
        setPlanos([]);
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
          <h1 className="text-2xl font-bold">Planos</h1>
          <p className="text-muted-foreground">Planos de assinatura disponíveis para as igrejas.</p>
        </div>
        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {planos.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{p.nome}</CardTitle>
                    <Badge variant={p.ativo ? "default" : "secondary"}>
                      {p.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-2xl font-bold text-primary">{formatarMoeda(p.valorMensal)}</p>
                  <p className="text-sm text-muted-foreground">/ mês</p>
                  {p.descricao && <p className="text-sm">{p.descricao}</p>}
                </CardContent>
              </Card>
            ))}
            {planos.length === 0 && (
              <p className="text-muted-foreground">Nenhum plano cadastrado.</p>
            )}
          </div>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
