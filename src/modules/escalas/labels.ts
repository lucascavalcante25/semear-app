import type { EscalaGeracaoDTO } from "@/modules/escalas/automacao-api";

export const ABA_ESCALAS = {
  lista: { valor: "lista", rotulo: "Escalas do ciclo" },
  automacao: { valor: "automacao", rotulo: "Portaria e recepção" },
  limpeza: { valor: "limpeza", rotulo: "Limpeza" },
} as const;

export type AbaEscalas = (typeof ABA_ESCALAS)[keyof typeof ABA_ESCALAS]["valor"];

export const formatarPeriodoCiclo = (inicio?: string, fim?: string) => {
  if (!inicio || !fim) return null;
  const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR");
  return `${fmt(inicio)} a ${fmt(fim)}`;
};

export const rotuloStatusCiclo = (status?: EscalaGeracaoDTO["status"]) => {
  if (status === "RASCUNHO") return "Em rascunho";
  if (status === "PUBLICADA") return "Publicado";
  return null;
};

export const montarSubtituloEscalas = (opts: {
  aba: AbaEscalas;
  infoCiclo: EscalaGeracaoDTO | null;
  diasComEscala: number;
  totalEscalas: number;
  legadoSemCiclo: boolean;
}): string => {
  const { aba, infoCiclo, diasComEscala, totalEscalas, legadoSemCiclo } = opts;
  if (aba === "automacao") {
    return "Cadastre cultos, gere sorteios e publique portaria e recepção.";
  }
  if (aba === "limpeza") {
    return "Configure a frequência e gere as escalas de limpeza.";
  }

  const periodo = formatarPeriodoCiclo(infoCiclo?.dataInicio, infoCiclo?.dataFim);
  const status = rotuloStatusCiclo(infoCiclo?.status);

  if (legadoSemCiclo) {
    return `${totalEscalas} escala${totalEscalas !== 1 ? "s" : ""} · cadastro manual`;
  }

  if (periodo) {
    const partes = [`Período ${periodo}`];
    if (diasComEscala > 0) {
      partes.push(`${diasComEscala} dia${diasComEscala !== 1 ? "s" : ""} com escala`);
    }
    if (status) partes.push(status);
    return partes.join(" · ");
  }

  if (diasComEscala > 0) {
    return `${diasComEscala} dia${diasComEscala !== 1 ? "s" : ""} com escala`;
  }

  return "Nenhuma escala no período vigente";
};
