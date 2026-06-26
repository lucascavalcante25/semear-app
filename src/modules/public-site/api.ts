import { requisicaoApi } from "@/modules/api/client";

export type CultoPublicoDTO = {
  nome: string;
  diaSemana?: string;
  horario?: string;
  descricao?: string;
};

export type EventoPublicoDTO = {
  id?: number;
  titulo: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  local?: string;
  publico?: string;
  categoria?: string;
  linkExterno?: string;
  imagemUrl?: string;
};

export type AvisoPublicoDTO = {
  id?: number;
  titulo: string;
  conteudo?: string;
};

export type IgrejaPublicaSiteDTO = {
  slug?: string;
  nome?: string;
  nomeFantasia?: string;
  logoUrl?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  textoBoasVindas?: string;
  descricaoIgreja?: string;
  subtituloIgreja?: string;
  horarioCulto?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  exibirComunicadosPublicos?: boolean;
  exibirAvisosPublicos?: boolean;
  cultos?: CultoPublicoDTO[];
  eventos?: EventoPublicoDTO[];
  eventosPublicos?: EventoPublicoDTO[];
  comunicadosPublicos?: AvisoPublicoDTO[];
  avisosPublicos?: AvisoPublicoDTO[];
};

export type PedidoOracaoPublicoCriarDTO = {
  titulo: string;
  descricao: string;
  nome?: string;
  anonimo?: boolean;
};

export const obterIgrejaPublicaPorSlug = (slug: string) =>
  requisicaoApi<IgrejaPublicaSiteDTO>(`/api/public/igrejas/${encodeURIComponent(slug)}`);

export const criarPedidoOracaoPublico = (slug: string, body: PedidoOracaoPublicoCriarDTO) =>
  requisicaoApi<void>(`/api/public/igrejas/${encodeURIComponent(slug)}/pedidos-oracao`, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const formatarDataEventoPublico = (dataInicio?: string): string => {
  if (!dataInicio) return "";
  const d = new Date(dataInicio);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const LABEL_CATEGORIA_PUBLICA: Record<string, string> = {
  CULTO: "Culto",
  EBD: "EBD",
  JOVENS: "Jovens",
  CASAIS: "Casais",
  MULHERES: "Mulheres",
  HOMENS: "Homens",
  LOUVOR: "Louvor",
  TREINAMENTO: "Treinamento",
  OUTRO: "Outro",
};

export const LABEL_DIA_SEMANA: Record<string, string> = {
  DOMINGO: "Domingo",
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
};
