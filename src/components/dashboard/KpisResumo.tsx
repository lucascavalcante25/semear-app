import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Heart,
  Wallet,
  Megaphone,
  FileWarning,
  Cake,
  Loader2,
} from "lucide-react";
import { obterResumoDashboard, type DashboardResumoDTO } from "@/modules/dashboard/api";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { canAccess, canWrite, podeVerVisaoGerencial } from "@/auth/permissions";
import { cn } from "@/lib/utils";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type KpiItem = {
  label: string;
  valor: string | number;
  icon: React.ElementType;
  path?: string;
  destaque?: boolean;
};

export function KpisResumo() {
  const { user } = usarAutenticacao();
  const [resumo, setResumo] = useState<DashboardResumoDTO | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!podeVerVisaoGerencial(user)) {
      setCarregando(false);
      return;
    }
    let ativo = true;
    (async () => {
      try {
        const dados = await obterResumoDashboard();
        if (ativo) setResumo(dados);
      } catch {
        if (ativo) setResumo(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [user]);

  if (!podeVerVisaoGerencial(user)) return null;

  if (carregando) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resumo) return null;

  const kpis: KpiItem[] = [];

  if (canAccess(user, "/membros")) {
    kpis.push({ label: "Membros", valor: resumo.totalMembros, icon: Users, path: "/membros" });
  }
  if (canAccess(user, "/visitantes")) {
    kpis.push({
      label: "Visitantes",
      valor: resumo.totalVisitantes,
      icon: UserPlus,
      path: "/visitantes",
    });
    if (resumo.visitantesMes > 0) {
      kpis.push({
        label: "Visitantes no mês",
        valor: resumo.visitantesMes,
        icon: UserPlus,
        path: "/visitantes",
      });
    }
  }
  if (canAccess(user, "/oracao")) {
    kpis.push({
      label: "Pedidos de oração",
      valor: resumo.pedidosOracaoAbertos,
      icon: Heart,
      path: "/oracao",
      destaque: resumo.pedidosOracaoAbertos > 0,
    });
  }
  if (canWrite(user, "/aprovar-pre-cadastros") && resumo.preCadastrosPendentes > 0) {
    kpis.push({
      label: "Pré-cadastros",
      valor: resumo.preCadastrosPendentes,
      icon: Users,
      path: "/aprovar-pre-cadastros",
      destaque: true,
    });
  }
  if (canAccess(user, "/financeiro") && resumo.saldoMes != null) {
    kpis.push({
      label: "Saldo do mês",
      valor: formatarMoeda(resumo.saldoMes),
      icon: Wallet,
      path: "/financeiro",
    });
  }
  if (resumo.aniversariantesHoje > 0) {
    kpis.push({
      label: "Aniversariantes hoje",
      valor: resumo.aniversariantesHoje,
      icon: Cake,
      path: "/aniversariantes",
    });
  }
  if (canAccess(user, "/comunicados")) {
    kpis.push({
      label: "Comunicados ativos",
      valor: resumo.comunicadosAtivos,
      icon: Megaphone,
      path: "/comunicados",
    });
  }
  if (canWrite(user, "/configuracoes-igreja") && resumo.documentosVencendo > 0) {
    kpis.push({
      label: "Docs vencendo",
      valor: resumo.documentosVencendo,
      icon: FileWarning,
      path: "/configuracoes-igreja",
      destaque: true,
    });
  }

  if (kpis.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Visão geral
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const conteudo = (
            <Card
              className={cn(
                "transition-shadow hover:shadow-md",
                kpi.destaque && "border-primary/40 bg-primary/5",
              )}
            >
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">{kpi.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{kpi.valor}</p>
              </CardContent>
            </Card>
          );
          return kpi.path ? (
            <Link key={kpi.label} to={kpi.path} className="block">
              {conteudo}
            </Link>
          ) : (
            <div key={kpi.label}>{conteudo}</div>
          );
        })}
      </div>
    </section>
  );
}
