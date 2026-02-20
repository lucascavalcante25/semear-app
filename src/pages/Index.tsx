import { LayoutApp } from "@/components/layout";
import {
  VersiculoDoDia,
  AcoesRapidas,
  Avisos,
  Aniversariantes,
  ProgressoEspiritual,
} from "@/components/dashboard";
import { usarAutenticacao } from "@/contexts/AuthContext";

const Inicio = () => {
  const { user } = usarAutenticacao();

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
      <div className="space-y-6 animate-fade-in">
        {/* Header Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {saudacao()} 🙏
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
