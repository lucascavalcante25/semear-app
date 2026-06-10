import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Church, Users, ClipboardList, Activity, Headphones, AlertTriangle, Wallet } from "lucide-react";
import { obterDashboardAdmin, type AdminDashboard } from "@/modules/igreja/solicitacao";
import { obterResumoSuporte, type SuporteResumo } from "@/modules/admin/suporte";
import {
  ativarAssinaturaAdmin,
  listarAssinaturasAdmin,
  prorrogarTesteAdmin,
  type AssinaturaIgreja,
} from "@/modules/admin/api";
import { formatarMoeda } from "@/lib/plano-comercial";
import { toast } from "sonner";
import { BadgeStatusSuporte } from "@/components/suporte/BadgeStatusSuporte";
import { LABEL_TIPO, type StatusSolicitacaoSuporte } from "@/modules/suporte/api";

function corDiasRestantes(dias?: number) {
  if (dias === undefined || dias === null) return "";
  if (dias <= 0) return "text-red-600 font-semibold";
  if (dias <= 3) return "text-amber-600 font-semibold";
  return "";
}

export default function DashboardSuperAdmin() {
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [suporte, setSuporte] = useState<SuporteResumo | null>(null);
  const [assinaturas, setAssinaturas] = useState<AssinaturaIgreja[]>([]);

  const recarregar = () => {
    void Promise.all([
      obterDashboardAdmin().then(setStats).catch(() => setStats(null)),
      obterResumoSuporte().then(setSuporte).catch(() => setSuporte(null)),
      listarAssinaturasAdmin().then(setAssinaturas).catch(() => setAssinaturas([])),
    ]);
  };

  useEffect(() => {
    recarregar();
  }, []);

  const emTeste = assinaturas.filter((a) => a.statusAssinatura === "EM_TESTE");

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard da Plataforma</h1>
          <p className="text-muted-foreground">Visão geral das igrejas e solicitações.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Igrejas cadastradas</CardTitle>
              <Church className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalIgrejas ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Igrejas ativas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.igrejasAtivas ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalUsuarios ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Solicitações pendentes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.solicitacoesPendentes ?? "—"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {[
            { label: "Igrejas em teste", val: stats?.igrejasEmTeste },
            { label: "Testes vencendo (3 dias)", val: stats?.testesVencendoEm3Dias },
            { label: "Testes vencidos", val: stats?.testesVencidos },
            { label: "Receita mensal prevista", val: stats?.receitaMensalPrevista != null ? formatarMoeda(Number(stats.receitaMensalPrevista)) : "—" },
            { label: "Receita anual prevista", val: stats?.receitaAnualPrevista != null ? formatarMoeda(Number(stats.receitaAnualPrevista)) : "—" },
            { label: "Pagamentos pendentes", val: stats?.pagamentosPendentes },
            { label: "Pagamentos atrasados", val: stats?.pagamentosAtrasados },
            { label: "Implantações pendentes", val: stats?.implantacoesPendentes },
            { label: "Suporte em aberto", val: stats?.suporteEmAberto ?? (suporte?.abertas ?? 0) + (suporte?.emAnalise ?? 0) },
          ].map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                {c.label.includes("Receita") ? (
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                ) : c.label.includes("venc") ? (
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{c.val ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {emTeste.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Igrejas em período de teste</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/super-admin/financeiro">Ver financeiro</Link>
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Igreja</th>
                    <th className="pb-2 pr-4">Responsável</th>
                    <th className="pb-2 pr-4">Início</th>
                    <th className="pb-2 pr-4">Fim</th>
                    <th className="pb-2 pr-4">Dias</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {emTeste.map((a) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{a.igrejaNome}</td>
                      <td className="py-3 pr-4">{a.responsavelNome ?? "—"}</td>
                      <td className="py-3 pr-4">{a.dataInicioTeste ?? "—"}</td>
                      <td className="py-3 pr-4">{a.dataFimTeste ?? "—"}</td>
                      <td className={`py-3 pr-4 ${corDiasRestantes(a.diasRestantesTeste)}`}>
                        {a.diasRestantesTeste ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{a.statusAssinatura}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              ativarAssinaturaAdmin(a.id)
                                .then(() => {
                                  toast.success("Assinatura ativada");
                                  recarregar();
                                })
                                .catch(() => toast.error("Erro ao ativar"))
                            }
                          >
                            Ativar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              prorrogarTesteAdmin(a.id, 7)
                                .then(() => {
                                  toast.success("Teste prorrogado");
                                  recarregar();
                                })
                                .catch(() => toast.error("Erro ao prorrogar"))
                            }
                          >
                            +7 dias
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to="/super-admin/igrejas">Ver igreja</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Suporte — abertas", val: suporte?.abertas },
            { label: "Suporte — em análise", val: suporte?.emAnalise },
            { label: "Suporte — não lidas", val: suporte?.aguardandoRespostaSuporte },
            { label: "Suporte — canceladas", val: suporte?.canceladas },
          ].map((c) => (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
                <Headphones className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{c.val ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {suporte && suporte.ultimas.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Últimas solicitações de suporte</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/super-admin/suporte">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {suporte.ultimas.map((s) => (
                <Link
                  key={s.id}
                  to={`/super-admin/suporte?id=${s.id}`}
                  className="flex flex-col gap-1 rounded-lg border p-3 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{s.igrejaNome}</p>
                    <p className="font-medium truncate">{s.titulo}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {s.tipo && (
                      <Badge variant="outline">
                        {LABEL_TIPO[s.tipo as keyof typeof LABEL_TIPO] ?? s.tipo}
                      </Badge>
                    )}
                    {s.status && (
                      <BadgeStatusSuporte status={s.status as StatusSolicitacaoSuporte} />
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
