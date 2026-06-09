import { useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listarAssinaturasAdmin,
  obterResumoFinanceiroAdmin,
  type AssinaturaIgreja,
  type FinanceiroResumo,
} from "@/modules/admin/api";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function badgeStatus(status: AssinaturaIgreja["statusPagamento"]) {
  switch (status) {
    case "PAGO":
      return <Badge className="bg-green-600">Pago</Badge>;
    case "PENDENTE":
      return <Badge variant="secondary">Pendente</Badge>;
    case "ATRASADO":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "CANCELADO":
      return <Badge variant="outline">Cancelado</Badge>;
    default:
      return <Badge variant="outline">—</Badge>;
  }
}

export default function FinanceiroSuperAdmin() {
  const [resumo, setResumo] = useState<FinanceiroResumo | null>(null);
  const [assinaturas, setAssinaturas] = useState<AssinaturaIgreja[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const [r, a] = await Promise.all([
          obterResumoFinanceiroAdmin(),
          listarAssinaturasAdmin(),
        ]);
        setResumo(r);
        setAssinaturas(a);
      } catch {
        setResumo(null);
        setAssinaturas([]);
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
          <h1 className="text-2xl font-bold">Meu Financeiro</h1>
          <p className="text-muted-foreground">Receitas e assinaturas das igrejas na plataforma.</p>
        </div>

        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <>
            {resumo && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita prevista
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatarMoeda(resumo.receitaMensalPrevista)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita recebida
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(resumo.receitaMensalRecebida)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Assinaturas pagas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{resumo.assinaturasPagas}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pendentes / atrasadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {resumo.assinaturasPendentes} / {resumo.assinaturasAtrasadas}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Assinaturas</h2>
              {assinaturas.map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{a.igrejaNome || "Igreja"}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.planoNome || "Plano"} — {formatarMoeda(a.valorMensal)}/mês
                      </p>
                    </div>
                    {badgeStatus(a.statusPagamento)}
                  </CardContent>
                </Card>
              ))}
              {assinaturas.length === 0 && (
                <p className="text-muted-foreground">
                  Nenhuma assinatura registrada ainda. As assinaturas aparecerão aqui quando igrejas forem vinculadas a planos.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
