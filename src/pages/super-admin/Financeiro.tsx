import { useEffect, useMemo, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ativarAssinaturaAdmin,
  listarAssinaturasAdmin,
  marcarImplantacaoPagaAdmin,
  marcarMensalidadePagaAdmin,
  obterResumoFinanceiroAdmin,
  prorrogarTesteAdmin,
  registrarPagamentoAnualAdmin,
  suspenderAssinaturaAdmin,
  type AssinaturaIgreja,
  type FinanceiroResumo,
} from "@/modules/admin/api";
import { toast } from "sonner";
import { CopiarMensagemIgreja } from "@/components/comercial/CopiarMensagemIgreja";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function badgePagamento(status?: string) {
  switch (status) {
    case "PAGO":
      return <Badge className="bg-green-600">Pago</Badge>;
    case "PENDENTE":
      return <Badge variant="secondary">Pendente</Badge>;
    case "ATRASADO":
      return <Badge variant="destructive">Atrasado</Badge>;
    case "ISENTO":
      return <Badge variant="outline">Isento</Badge>;
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
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | "EM_TESTE" | "VENCENDO" | "ATRASADAS">("TODOS");

  const carregar = async () => {
    setCarregando(true);
    try {
      const [r, a] = await Promise.all([obterResumoFinanceiroAdmin(), listarAssinaturasAdmin()]);
      setResumo(r);
      setAssinaturas(a);
    } catch {
      setResumo(null);
      setAssinaturas([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    void carregar();
  }, []);

  const aplicarAssinatura = (atualizada: AssinaturaIgreja) => {
    setAssinaturas((prev) => prev.map((a) => (a.id === atualizada.id ? atualizada : a)));
  };

  const filtradas = useMemo(() => {
    return assinaturas.filter((a) => {
      const nome = (a.igrejaNome ?? "").toLowerCase();
      if (busca && !nome.includes(busca.toLowerCase())) return false;
      if (filtro === "EM_TESTE") return a.statusAssinatura === "EM_TESTE";
      if (filtro === "VENCENDO")
        return a.statusAssinatura === "EM_TESTE" && (a.diasRestantesTeste ?? 99) <= 3;
      if (filtro === "ATRASADAS")
        return a.statusMensalidade === "ATRASADO" || a.statusAssinatura === "ATRASADA";
      return true;
    });
  }, [assinaturas, busca, filtro]);

  const emTeste = assinaturas.filter((a) => a.statusAssinatura === "EM_TESTE").length;
  const suspensas = assinaturas.filter((a) => a.statusAssinatura === "SUSPENSA").length;

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Meu Financeiro</h1>
          <p className="text-muted-foreground">Rastreabilidade de pagamentos e assinaturas das igrejas na plataforma.</p>
        </div>

        {carregando ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <>
            {resumo && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {[
                  { label: "Receita mensal prevista", val: formatarMoeda(resumo.receitaMensalPrevista) },
                  { label: "Receita recebida no mês", val: formatarMoeda(resumo.receitaMensalRecebida) },
                  { label: "Assinaturas pagas", val: resumo.assinaturasPagas },
                  { label: "Mensalidades pendentes", val: resumo.assinaturasPendentes },
                  { label: "Mensalidades atrasadas", val: resumo.assinaturasAtrasadas },
                  { label: "Igrejas em teste", val: emTeste },
                  { label: "Igrejas suspensas", val: suspensas },
                ].map((c) => (
                  <Card key={c.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{c.val}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(["TODOS", "EM_TESTE", "VENCENDO", "ATRASADAS"] as const).map((f) => (
                <Button key={f} size="sm" variant={filtro === f ? "default" : "outline"} onClick={() => setFiltro(f)}>
                  {f === "TODOS" ? "Todos" : f === "EM_TESTE" ? "Em teste" : f === "VENCENDO" ? "Vencendo ≤3 dias" : "Atrasadas"}
                </Button>
              ))}
              <Input
                placeholder="Buscar igreja..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assinaturas e pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {filtradas.length === 0 ? (
                  <p className="text-muted-foreground">
                    Nenhuma assinatura encontrada. Assinaturas são criadas ao aprovar solicitações de acesso.
                  </p>
                ) : (
                  <table className="w-full min-w-[900px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-3">Igreja</th>
                        <th className="pb-2 pr-3">Plano</th>
                        <th className="pb-2 pr-3">Status</th>
                        <th className="pb-2 pr-3">Fim teste</th>
                        <th className="pb-2 pr-3">Dias</th>
                        <th className="pb-2 pr-3">Implantação</th>
                        <th className="pb-2 pr-3">Mensalidade</th>
                        <th className="pb-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.map((a) => (
                        <tr key={a.id} className="border-b last:border-0 align-top">
                          <td className="py-3 pr-3">
                            <p className="font-medium">{a.igrejaNome}</p>
                            <p className="text-xs text-muted-foreground">{a.responsavelNome}</p>
                          </td>
                          <td className="py-3 pr-3">{a.planoNome}</td>
                          <td className="py-3 pr-3">
                            <Badge variant="outline">{a.statusAssinatura ?? "—"}</Badge>
                          </td>
                          <td className="py-3 pr-3">{a.dataFimTeste ?? "—"}</td>
                          <td className="py-3 pr-3">{a.diasRestantesTeste ?? "—"}</td>
                          <td className="py-3 pr-3">
                            <p>{a.valorImplantacaoContratado != null ? formatarMoeda(a.valorImplantacaoContratado) : "—"}</p>
                            {badgePagamento(a.statusImplantacao)}
                          </td>
                          <td className="py-3 pr-3">
                            <p>{formatarMoeda(a.valorMensalContratado ?? a.valorMensal)}</p>
                            {badgePagamento(a.statusMensalidade ?? a.statusPagamento)}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-col gap-1 min-w-[140px]">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  marcarImplantacaoPagaAdmin(a.id)
                                    .then((atualizada) => {
                                      toast.success("Implantação marcada");
                                      aplicarAssinatura(atualizada);
                                    })
                                    .catch(() => toast.error("Erro"))
                                }
                              >
                                Impl. paga
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  marcarMensalidadePagaAdmin(a.id)
                                    .then((atualizada) => {
                                      toast.success("Mensalidade marcada");
                                      aplicarAssinatura(atualizada);
                                    })
                                    .catch(() => toast.error("Erro"))
                                }
                              >
                                Mens. paga
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  registrarPagamentoAnualAdmin(a.id)
                                    .then((atualizada) => {
                                      toast.success("Anual registrado");
                                      aplicarAssinatura(atualizada);
                                    })
                                    .catch(() => toast.error("Erro"))
                                }
                              >
                                Anual PIX
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  ativarAssinaturaAdmin(a.id)
                                    .then((atualizada) => {
                                      toast.success("Ativada");
                                      aplicarAssinatura(atualizada);
                                    })
                                    .catch(() => toast.error("Erro"))
                                }
                              >
                                Ativar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  prorrogarTesteAdmin(a.id)
                                    .then((atualizada) => {
                                      toast.success("Prorrogado");
                                      aplicarAssinatura(atualizada);
                                    })
                                    .catch(() => toast.error("Erro"))
                                }
                              >
                                +7 dias teste
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() =>
                                  suspenderAssinaturaAdmin(a.id)
                                    .then((atualizada) => {
                                      toast.success("Suspensa");
                                      aplicarAssinatura(atualizada);
                                    })
                                    .catch(() => toast.error("Erro"))
                                }
                              >
                                Suspender
                              </Button>
                              <CopiarMensagemIgreja assinatura={a} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
