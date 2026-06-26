import { LayoutApp } from "@/components/layout";
import {
  VersiculoDoDia,
  AcoesRapidas,
  Aniversariantes,
  ProgressoEspiritual,
  DestaqueVisitantesHoje,
  DestaqueAniversariantesSemana,
  DestaqueAvisos,
  DestaqueEventosProximos,
  DestaqueMinhasEscalas,
} from "@/components/dashboard";
import { BannerInformativoDashboard } from "@/components/dashboard/BannerInformativoDashboard";
import { AlertasSecretariaEscalas } from "@/components/escalas/AlertasSecretariaEscalas";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { useIgrejaConfiguracao } from "@/contexts/IgrejaContext";
import { canAccess, podeVerVisaoGerencial } from "@/auth/permissions";
const Inicio = () => {
  const { user } = usarAutenticacao();
  const { configuracao, publica } = useIgrejaConfiguracao();
  const visaoGerencial = podeVerVisaoGerencial(user);
  const mostrarEventos = canAccess(user, "/eventos");
  const mostrarEscalas = canAccess(user, "/escalas");
  const textoBoasVindas =
    configuracao?.textoBoasVindas?.trim() || publica.textoBoasVindas?.trim() || "";

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const obterGeneroSaudacao = (nome: string) => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("semear.saudacao.genero");
      if (saved === "irmao") return "irmão";
      if (saved === "irma") return "irmã";
    }
    const primeiroNome = nome.trim().split(/\s+/)[0]?.toLowerCase();
    if (!primeiroNome) return "irmão(ã)";
    return primeiroNome.endsWith("a") ? "irmã" : "irmão";
  };

  const saudacao = () => {
    if (!user?.name) {
      return `${getGreeting()}!`;
    }
    const genero = obterGeneroSaudacao(user.name);
    return `${getGreeting()}, ${genero} ${user.name}!`;
  };

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in min-w-0">
        {/* Header Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {saudacao()} 🙏
          </h1>
          <p className="text-sm text-muted-foreground">
            Paz do Senhor Jesus Cristo. Que Deus abençoe seu dia.
          </p>
          {textoBoasVindas && textoBoasVindas !== "Bem-vindo" && (
            <p className="text-sm text-primary/90 bg-primary/10 rounded-lg px-3 py-2 mt-2">
              {textoBoasVindas}
            </p>
          )}
        </div>

        {/* Alertas de escalas — somente liderança / administração */}
        {visaoGerencial && <AlertasSecretariaEscalas />}

        <BannerInformativoDashboard />

        {visaoGerencial && <DestaqueVisitantesHoje />}
        {visaoGerencial && <DestaqueAniversariantesSemana />}
        <DestaqueAvisos />

        {/* Versiculo do dia */}
        <VersiculoDoDia />

        {/* Progresso espiritual */}
        <ProgressoEspiritual />

        {/* Acoes rapidas */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Acesso Rápido
          </h2>
          <AcoesRapidas />
        </section>

        {/* Eventos, escalas e aniversariantes */}
        <div className="grid gap-4 md:grid-cols-2">
          {mostrarEventos && <DestaqueEventosProximos />}
          {mostrarEscalas && <DestaqueMinhasEscalas />}
          <div className={!mostrarEventos && !mostrarEscalas ? "md:col-span-2" : undefined}>
            <Aniversariantes />
          </div>
        </div>
      </div>
    </LayoutApp>
  );
};

export default Inicio;
