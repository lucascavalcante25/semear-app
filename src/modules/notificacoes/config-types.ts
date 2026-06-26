export type TipoAudienciaNotificacao =
  | "TODOS"
  | "INSCRITOS"
  | "DEPARTAMENTOS"
  | "HOMENS"
  | "MULHERES";

export type ConfigNotificacao = {
  ativo?: boolean;
  enviarNaPublicacao?: boolean;
  enviarNaAlteracao?: boolean;
  audiencia?: TipoAudienciaNotificacao;
  departamentoIds?: number[];
  diasAntesInicio?: number;
  diasAntesEspecificos?: number[];
  lembreteDiario?: boolean;
  horaLembrete?: string;
  mensagemPersonalizada?: string;
};

export const configNotificacaoPadrao = (): ConfigNotificacao => ({
  ativo: false,
  enviarNaPublicacao: true,
  enviarNaAlteracao: false,
  audiencia: "TODOS",
  departamentoIds: [],
  diasAntesInicio: 3,
  diasAntesEspecificos: [1, 0],
  lembreteDiario: true,
  horaLembrete: "08:00",
  mensagemPersonalizada: "",
});

export const LABEL_AUDIENCIA: Record<TipoAudienciaNotificacao, string> = {
  TODOS: "Todos os membros",
  INSCRITOS: "Apenas inscritos no evento",
  DEPARTAMENTOS: "Departamento(s) específico(s)",
  HOMENS: "Apenas homens",
  MULHERES: "Apenas mulheres",
};
