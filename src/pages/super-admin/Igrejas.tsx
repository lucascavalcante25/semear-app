import { useCallback, useEffect, useState } from "react";
import { LayoutSuperAdmin } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ativarIgreja,
  colocarIgrejaEmTeste,
  inativarIgreja,
  listarIgrejasAdmin,
} from "@/modules/admin/igrejas";
import type { IgrejaConfiguracao, StatusIgreja } from "@/modules/igreja/api";
import { ErroRequisicaoApi } from "@/modules/api/client";
import { CheckCircle2, FlaskConical, Loader2, XCircle } from "lucide-react";

export default function IgrejasSuperAdmin() {
  const [igrejas, setIgrejas] = useState<IgrejaConfiguracao[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusIgreja | "TODOS">("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoId, setAcaoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const lista = await listarIgrejasAdmin({
        nome: busca || undefined,
        status: filtroStatus === "TODOS" ? undefined : filtroStatus,
      });
      setIgrejas(lista);
    } catch (e) {
      const msg =
        e instanceof ErroRequisicaoApi
          ? e.message
          : "Não foi possível carregar as igrejas.";
      setErro(msg);
      setIgrejas([]);
      toast.error(msg);
    } finally {
      setCarregando(false);
    }
  }, [busca, filtroStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void carregar();
    }, 300);
    return () => clearTimeout(timer);
  }, [carregar]);

  const executarAcao = async (
    id: number,
    acao: "ativar" | "inativar" | "teste",
    label: string,
  ) => {
    setAcaoId(id);
    try {
      const atualizada =
        acao === "ativar"
          ? await ativarIgreja(id)
          : acao === "inativar"
            ? await inativarIgreja(id)
            : await colocarIgrejaEmTeste(id);
      setIgrejas((prev) => prev.map((i) => (i.id === id ? { ...i, ...atualizada } : i)));
      toast.success(`Igreja ${label} com sucesso.`);
    } catch (e) {
      const msg = e instanceof ErroRequisicaoApi ? e.message : `Falha ao ${label.toLowerCase()}.`;
      toast.error(msg);
    } finally {
      setAcaoId(null);
    }
  };

  const badgeStatus = (status?: StatusIgreja) => {
    switch (status) {
      case "ATIVA":
        return <Badge className="bg-green-600 hover:bg-green-600">Ativa</Badge>;
      case "EM_TESTE":
        return <Badge variant="secondary">Em teste</Badge>;
      case "INATIVA":
        return <Badge variant="destructive">Inativa</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  return (
    <LayoutSuperAdmin>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Igrejas</h1>
          <p className="text-muted-foreground">Gerencie as igrejas clientes da plataforma.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-md"
          />
          <Select
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as StatusIgreja | "TODOS")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os status</SelectItem>
              <SelectItem value="ATIVA">Ativas</SelectItem>
              <SelectItem value="EM_TESTE">Em teste</SelectItem>
              <SelectItem value="INATIVA">Inativas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {carregando ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando igrejas...
          </div>
        ) : erro ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">{erro}</p>
              <Button variant="outline" className="mt-4" onClick={() => void carregar()}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        ) : igrejas.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma igreja encontrada.
              {busca || filtroStatus !== "TODOS"
                ? " Tente ajustar os filtros."
                : " As igrejas aprovadas aparecerão aqui."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {igrejas.map((igreja) => (
              <Card key={igreja.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{igreja.nome}</CardTitle>
                    {igreja.nomeFantasia && (
                      <p className="text-sm text-muted-foreground">{igreja.nomeFantasia}</p>
                    )}
                  </div>
                  {badgeStatus(igreja.status)}
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {igreja.cnpj && <p>CNPJ: {igreja.cnpj}</p>}
                  {(igreja.cidade || igreja.estado) && (
                    <p>{[igreja.cidade, igreja.estado].filter(Boolean).join(" - ")}</p>
                  )}
                  {igreja.email && <p>{igreja.email}</p>}
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acaoId === igreja.id || igreja.status === "ATIVA"}
                    onClick={() => void executarAcao(igreja.id!, "ativar", "ativada")}
                  >
                    {acaoId === igreja.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                    )}
                    Ativar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acaoId === igreja.id || igreja.status === "EM_TESTE"}
                    onClick={() => void executarAcao(igreja.id!, "teste", "em teste")}
                  >
                    <FlaskConical className="mr-1 h-4 w-4" />
                    Em teste
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acaoId === igreja.id || igreja.status === "INATIVA"}
                    onClick={() => void executarAcao(igreja.id!, "inativar", "inativada")}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Inativar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutSuperAdmin>
  );
}
