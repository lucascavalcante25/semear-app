import { requisicaoApi } from "@/modules/api/client";

export type AniversarianteApi = {
  id: number;
  name: string;
  birthDate: string; // yyyy-mm-dd
  imageUrl?: string | null;
};

export type AniversarianteApp = {
  id: string;
  name: string;
  date: Date;
  photoUrl?: string;
};

const toDateLocal = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

const mapAniversariante = (a: AniversarianteApi): AniversarianteApp => ({
  id: String(a.id),
  name: a.name,
  date: toDateLocal(a.birthDate),
  photoUrl: a.imageUrl ?? undefined,
});

export const listarAniversariantes = async (days = 7): Promise<AniversarianteApp[]> => {
  const params = new URLSearchParams();
  params.set("days", String(days));
  const lista = await requisicaoApi<AniversarianteApi[]>(`/api/membros/aniversariantes?${params.toString()}`, {
    auth: true,
  });
  return (lista ?? []).map(mapAniversariante);
};

export const listarCalendarioAniversariantes = async (): Promise<AniversarianteApp[]> => {
  const lista = await requisicaoApi<AniversarianteApi[]>("/api/membros/aniversariantes/calendario", { auth: true });
  return (lista ?? []).map(mapAniversariante);
};

export const MESES_ANIVERSARIO = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export function obterIniciaisAniversariante(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ehAniversarioHoje(date: Date): boolean {
  const hoje = new Date();
  return date.getMonth() === hoje.getMonth() && date.getDate() === hoje.getDate();
}

export function obterDiasAteAniversario(date: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const aniversarioEsteAno = new Date(hoje.getFullYear(), date.getMonth(), date.getDate());
  if (aniversarioEsteAno < hoje) {
    aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
  }
  return Math.ceil((aniversarioEsteAno.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export function obterIdadeQueCompleta(date: Date): number {
  const hoje = new Date();
  const anoReferencia =
    hoje.getMonth() > date.getMonth() ||
    (hoje.getMonth() === date.getMonth() && hoje.getDate() > date.getDate())
      ? hoje.getFullYear() + 1
      : hoje.getFullYear();
  return anoReferencia - date.getFullYear();
}

export function agruparAniversariantesPorMes(
  lista: AniversarianteApp[],
): { mes: number; nomeMes: string; aniversariantes: AniversarianteApp[] }[] {
  const grupos = new Map<number, AniversarianteApp[]>();

  for (const aniversariante of lista) {
    const mes = aniversariante.date.getMonth();
    const atual = grupos.get(mes) ?? [];
    atual.push(aniversariante);
    grupos.set(mes, atual);
  }

  return Array.from(grupos.entries())
    .sort(([mesA], [mesB]) => mesA - mesB)
    .map(([mes, aniversariantes]) => ({
      mes,
      nomeMes: MESES_ANIVERSARIO[mes],
      aniversariantes: aniversariantes.sort((a, b) => a.date.getDate() - b.date.getDate()),
    }));
}

function normalizarData(data: Date): Date {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function inicioSemanaDomingo(referencia: Date): Date {
  const data = normalizarData(referencia);
  data.setDate(data.getDate() - data.getDay());
  return data;
}

function fimSemanaDomingo(referencia: Date): Date {
  const inicio = inicioSemanaDomingo(referencia);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  return fim;
}

function dataAniversarioNoAno(birthDate: Date, ano: number): Date {
  return normalizarData(new Date(ano, birthDate.getMonth(), birthDate.getDate()));
}

/** Data do aniversário que cai na semana atual (domingo a sábado). */
export function obterDataAniversarioNaSemanaAtual(birthDate: Date, referencia = new Date()): Date | null {
  const inicio = inicioSemanaDomingo(referencia);
  const fim = fimSemanaDomingo(referencia);
  const ano = referencia.getFullYear();

  for (const anoAniversario of [ano, ano + 1, ano - 1]) {
    const aniversario = dataAniversarioNoAno(birthDate, anoAniversario);
    if (aniversario >= inicio && aniversario <= fim) {
      return aniversario;
    }
  }

  return null;
}

export function aniversarioNaSemanaAtual(birthDate: Date, referencia = new Date()): boolean {
  return obterDataAniversarioNaSemanaAtual(birthDate, referencia) !== null;
}

export function filtrarAniversariantesSemanaAtual(
  lista: AniversarianteApp[],
  referencia = new Date(),
): AniversarianteApp[] {
  return lista
    .filter((a) => aniversarioNaSemanaAtual(a.date, referencia))
    .sort((a, b) => {
      const dataA = obterDataAniversarioNaSemanaAtual(a.date, referencia)!;
      const dataB = obterDataAniversarioNaSemanaAtual(b.date, referencia)!;
      return dataA.getTime() - dataB.getTime();
    });
}
