import { LayoutApp } from "@/components/layout";
import {
  VersiculoDoDia,
  AcoesRapidas,
  Avisos,
  Aniversariantes,
  ProgressoEspiritual,
} from "@/components/dashboard";

const Inicio = () => {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <LayoutApp>
      <div className="space-y-6 animate-fade-in">
        {/* Header Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}! 🙏
          </h1>
          <p className="text-sm text-muted-foreground">
            Paz do Senhor Jesus Cristo. Que Deus abençoe seu dia.
          </p>
        </div>

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

        {/* Avisos e aniversariantes */}
        <div className="grid gap-4 md:grid-cols-2">
          <Avisos />
          <Aniversariantes />
        </div>
      </div>
    </LayoutApp>
  );
};

export default Inicio;
