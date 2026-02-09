import { leiturasDiarias } from "@/data/daily-reading";
import { livrosBiblia } from "@/data/bible-books";
import type { LivroBiblia } from "@/data/bible-books";
import {
  type CapituloBibliaCache,
  type CorDestaque,
  type DestaqueBiblia,
  type FavoritoBiblia,
  type FiltroBuscaBiblia,
  type HistoricoLeituraBiblia,
  type NotaBiblia,
  type PlanoLeitura,
  type DiaPlanoLeitura,
  type ReferenciaBiblia,
  type ResultadoBuscaBiblia,
  type VersiculoBiblia,
  type TrechoLeitura,
  type LeituraCapitulo,
  type PreferenciaBibliaUsuario,
  type ProgressoLeituraUsuario,
} from "./types";
import { criarId, obterChaveUsuario, lerArmazenamento, salvarArmazenamento } from "./storage";
import {
  montarRotuloReferencia,
  normalizarIntervalo,
  versiculoNoIntervalo,
  gerarTrecho,
} from "./utils";

const CHAVE_FAVORITOS = "favorites";
const CHAVE_DESTAQUES = "highlights";
const CHAVE_NOTAS = "notes";
const CHAVE_HISTORICO = "history";
const CHAVE_PREFERENCIAS = "preferences";
const CHAVE_CACHE = "cache";
const CHAVE_PLANOS = "plans";
const CHAVE_DIAS_PLANO = "planDays";
const CHAVE_PROGRESSO = "readingProgress";
const CHAVE_PROGRESSO_COMUNITARIO = "progressoComunitario";
const CHAVE_LEITURA_CAPITULOS = "leituraCapitulos";

const PLANO_ANUAL_ID = "plan-anual-igreja";
const PLANO_INICIO = new Date(2026, 4, 1);
const TOTAL_DIAS_PLANO = 365;

const preferenciasPadrao = (userId: string): PreferenciaBibliaUsuario => ({
  id: `pref_${userId}`,
  userId,
  mode: "reading",
  fontSize: "md",
  theme: "system",
  showHighlights: true,
  showNotes: true,
  showFavorites: true,
});

const obterNomeLivro = (book: LivroBiblia) => book.name;

export const obterIdUsuario = (userId?: string | null) => userId ?? "visitante";

const lerColecao = <T>(userId: string, key: string, fallback: T) =>
  lerArmazenamento<T>(obterChaveUsuario(userId, key), fallback);

const salvarColecao = <T>(userId: string, key: string, value: T) =>
  salvarArmazenamento<T>(obterChaveUsuario(userId, key), value);

export const obterFavoritos = (userId: string) =>
  lerColecao<FavoritoBiblia[]>(userId, CHAVE_FAVORITOS, []);

export const adicionarFavorito = (userId: string, reference: ReferenciaBiblia, version: string) => {
  const favorites = obterFavoritos(userId);
  const exists = favorites.find(
    (favorite) =>
      favorite.version === version &&
      favorite.reference.bookId === reference.bookId &&
      favorite.reference.chapter === reference.chapter &&
      favorite.reference.verseRange.start === reference.verseRange.start &&
      favorite.reference.verseRange.end === reference.verseRange.end,
  );
  if (exists) {
    return favorites;
  }
  const next = [
    {
      id: criarId(),
      userId,
      reference,
      version,
      createdAt: new Date().toISOString(),
    },
    ...favorites,
  ];
  salvarColecao(userId, CHAVE_FAVORITOS, next);
  return next;
};

export const removerFavorito = (userId: string, favoriteId: string) => {
  const favorites = obterFavoritos(userId);
  const next = favorites.filter((favorite) => favorite.id !== favoriteId);
  salvarColecao(userId, CHAVE_FAVORITOS, next);
  return next;
};

export const obterDestaques = (userId: string) =>
  lerColecao<DestaqueBiblia[]>(userId, CHAVE_DESTAQUES, []);

export const salvarDestaque = (
  userId: string,
  reference: ReferenciaBiblia,
  version: string,
  color: CorDestaque,
) => {
  const highlights = obterDestaques(userId);
  const now = new Date().toISOString();
  const existing = highlights.find(
    (highlight) =>
      highlight.version === version &&
      highlight.reference.bookId === reference.bookId &&
      highlight.reference.chapter === reference.chapter &&
      highlight.reference.verseRange.start === reference.verseRange.start &&
      highlight.reference.verseRange.end === reference.verseRange.end,
  );
  const next = existing
    ? highlights.map((highlight) =>
        highlight.id === existing.id
          ? {
              ...highlight,
              color,
              updatedAt: now,
            }
          : highlight,
      )
    : [
        {
          id: criarId(),
          userId,
          reference,
          version,
          color,
          createdAt: now,
          updatedAt: now,
        },
        ...highlights,
      ];
  salvarColecao(userId, CHAVE_DESTAQUES, next);
  return next;
};

export const removerDestaque = (userId: string, highlightId: string) => {
  const highlights = obterDestaques(userId);
  const next = highlights.filter((highlight) => highlight.id !== highlightId);
  salvarColecao(userId, CHAVE_DESTAQUES, next);
  return next;
};

export const obterNotas = (userId: string) =>
  lerColecao<NotaBiblia[]>(userId, CHAVE_NOTAS, []);

export const adicionarNota = (
  userId: string,
  reference: ReferenciaBiblia,
  version: string,
  content: string,
) => {
  const notes = obterNotas(userId);
  const now = new Date().toISOString();
  const next = [
    {
      id: criarId(),
      userId,
      reference,
      version,
      content,
      createdAt: now,
      updatedAt: now,
    },
    ...notes,
  ];
  salvarColecao(userId, CHAVE_NOTAS, next);
  return next;
};

export const atualizarNota = (userId: string, noteId: string, content: string) => {
  const notes = obterNotas(userId);
  const next = notes.map((note) =>
    note.id === noteId
      ? {
          ...note,
          content,
          updatedAt: new Date().toISOString(),
        }
      : note,
  );
  salvarColecao(userId, CHAVE_NOTAS, next);
  return next;
};

export const removerNota = (userId: string, noteId: string) => {
  const notes = obterNotas(userId);
  const next = notes.filter((note) => note.id !== noteId);
  salvarColecao(userId, CHAVE_NOTAS, next);
  return next;
};

export const obterHistoricoLeitura = (userId: string) =>
  lerColecao<HistoricoLeituraBiblia[]>(userId, CHAVE_HISTORICO, []);

export const registrarHistoricoLeitura = (
  userId: string,
  reference: ReferenciaBiblia,
  version: string,
) => {
  const history = obterHistoricoLeitura(userId);
  const now = new Date().toISOString();
  const existing = history.find(
    (entry) =>
      entry.reference.bookId === reference.bookId &&
      entry.version === version,
  );
  const next = existing
    ? history.map((entry) =>
        entry.id === existing.id
          ? {
              ...entry,
              reference,
              readAt: now,
            }
          : entry,
      )
    : [
        {
          id: criarId(),
          userId,
          reference,
          version,
          readAt: now,
        },
        ...history,
      ];
  const ordenado = [...next].sort(
    (a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime(),
  );
  const limitado = ordenado.slice(0, 10);
  salvarColecao(userId, CHAVE_HISTORICO, limitado);
  return limitado;
};

export const removerHistorico = (userId: string, entryId: string) => {
  const history = obterHistoricoLeitura(userId);
  const next = history.filter((entry) => entry.id !== entryId);
  salvarColecao(userId, CHAVE_HISTORICO, next);
  return next;
};

export const obterPreferencias = (userId: string) =>
  lerColecao<PreferenciaBibliaUsuario>(
    userId,
    CHAVE_PREFERENCIAS,
    preferenciasPadrao(userId),
  );

export const salvarPreferencias = (userId: string, preferences: PreferenciaBibliaUsuario) => {
  salvarColecao(userId, CHAVE_PREFERENCIAS, preferences);
  return preferences;
};

export const obterCapitulosCache = (userId: string) =>
  lerColecao<CapituloBibliaCache[]>(userId, CHAVE_CACHE, []);

export const obterCapituloCache = (
  userId: string,
  bookId: string,
  chapter: number,
  version: string,
) => {
  const cache = obterCapitulosCache(userId);
  return cache.find(
    (item) => item.bookId === bookId && item.chapter === chapter && item.version === version,
  );
};

export const salvarCapituloCache = (
  userId: string,
  book: LivroBiblia,
  chapter: number,
  version: string,
  verses: VersiculoBiblia[],
) => {
  const cache = obterCapitulosCache(userId);
  const existingIndex = cache.findIndex(
    (item) => item.bookId === book.id && item.chapter === chapter && item.version === version,
  );
  const entry: CapituloBibliaCache = {
    id: existingIndex >= 0 ? cache[existingIndex].id : criarId(),
    bookId: book.id,
    bookName: obterNomeLivro(book),
    chapter,
    version,
    verses,
    cachedAt: new Date().toISOString(),
  };
  const next =
    existingIndex >= 0
      ? cache.map((item, index) => (index === existingIndex ? entry : item))
      : [entry, ...cache].slice(0, 200);
  salvarColecao(userId, CHAVE_CACHE, next);
  return next;
};

export const buscarNoCache = (userId: string, filter: FiltroBuscaBiblia) => {
  const { query, bookId, version } = filter;
  if (!query.trim()) {
    return [] as ResultadoBuscaBiblia[];
  }
  const cache = obterCapitulosCache(userId).filter((item) => {
    if (version && item.version !== version) {
      return false;
    }
    if (bookId && item.bookId !== bookId) {
      return false;
    }
    return true;
  });
  const results: ResultadoBuscaBiblia[] = [];
  cache.forEach((chapter) => {
    chapter.verses.forEach((verse) => {
      if (verse.text.toLowerCase().includes(query.toLowerCase())) {
        const reference: ReferenciaBiblia = {
          bookId: chapter.bookId,
          bookName: chapter.bookName,
          chapter: chapter.chapter,
          verseRange: normalizarIntervalo(verse.verse, verse.verse),
        };
        results.push({
          id: criarId(),
          reference,
          version: chapter.version,
          verse,
          snippet: gerarTrecho(verse.text, query),
        });
      }
    });
  });
  return results;
};

export const resolverRotuloIntervalo = (reference: ReferenciaBiblia) =>
  montarRotuloReferencia(reference);

export const obterReferenciaSelecao = (
  book: LivroBiblia,
  chapter: number,
  startVerse: number,
  endVerse: number,
) => ({
  bookId: book.id,
  bookName: obterNomeLivro(book),
  chapter,
  verseRange: normalizarIntervalo(startVerse, endVerse),
});

export const obterDestaquePorVersiculo = (
  highlights: DestaqueBiblia[],
  version: string,
  bookId: string,
  chapter: number,
  verse: number,
) =>
  highlights.find(
    (highlight) =>
      highlight.version === version &&
      highlight.reference.bookId === bookId &&
      highlight.reference.chapter === chapter &&
      versiculoNoIntervalo(verse, highlight.reference.verseRange),
  );

export const obterFavoritoCorrespondente = (
  favorites: FavoritoBiblia[],
  version: string,
  bookId: string,
  chapter: number,
  verse: number,
) =>
  favorites.find(
    (favorite) =>
      favorite.version === version &&
      favorite.reference.bookId === bookId &&
      favorite.reference.chapter === chapter &&
      versiculoNoIntervalo(verse, favorite.reference.verseRange),
  );

const defaultPlans = (): PlanoLeitura[] => {
  const now = new Date().toISOString();
  return [
    {
      id: PLANO_ANUAL_ID,
      name: "Plano anual da igreja",
      description: "Leitura da Bíblia completa em 1 ano",
      type: "church",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

export const obterPlanosLeitura = (userId: string) => {
  const plans = lerColecao<PlanoLeitura[]>(userId, CHAVE_PLANOS, []);
  if (plans.length > 0) {
    const ativo = plans.find((plan) => plan.isActive) ?? plans[0];
    return [
      {
        ...ativo,
        isActive: true,
      },
    ];
  }
  const seeded = defaultPlans();
  salvarColecao(userId, CHAVE_PLANOS, seeded);
  return seeded;
};

const getTipoLeitura = (bookId: string): TrechoLeitura["type"] => {
  if (bookId === "sl") {
    return "psalm";
  }
  if (bookId === "pv") {
    return "proverb";
  }
  if (["mt", "mc", "lc", "jo2"].includes(bookId)) {
    return "gospel";
  }
  if (["at", "rm", "1co", "2co", "gl", "ef", "fp", "cl", "1ts", "2ts", "1tm", "2tm", "tt", "fm", "hb", "tg", "1pe", "2pe", "1jo", "2jo", "3jo", "jd", "ap"].includes(bookId)) {
    return "epistle";
  }
  return "oldTestament";
};

const gerarPlanoAnual = (planId: string): DiaPlanoLeitura[] => {
  const capitulos: TrechoLeitura[] = [];
  livrosBiblia.forEach((book) => {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      capitulos.push({
        id: criarId(),
        book: book.name,
        reference: `${book.name} ${chapter}`,
        type: getTipoLeitura(book.id),
      });
    }
  });
  const totalDias = TOTAL_DIAS_PLANO;
  const base = Math.floor(capitulos.length / totalDias);
  const resto = capitulos.length % totalDias;
  const days: DiaPlanoLeitura[] = [];
  let cursor = 0;
  for (let i = 0; i < totalDias; i += 1) {
    const tamanho = base + (i < resto ? 1 : 0);
    const readings = capitulos.slice(cursor, cursor + tamanho);
    cursor += tamanho;
    days.push({
      id: criarId(),
      planId,
      dayNumber: i + 1,
      title: `Dia ${i + 1}`,
      readings,
    });
  }
  if (days.length === 0) {
    return [
      {
        id: criarId(),
        planId,
        dayNumber: 1,
        title: "Dia 1",
        readings: leiturasDiarias[0]?.readings as TrechoLeitura[] ?? [],
      },
    ];
  }
  return days;
};

export const obterDiasPlanoLeitura = (userId: string, planId: string) => {
  const allDays = lerColecao<Record<string, DiaPlanoLeitura[]>>(userId, CHAVE_DIAS_PLANO, {});
  const existente = allDays[planId];
  if (!existente || existente.length < TOTAL_DIAS_PLANO) {
    const seeded = gerarPlanoAnual(planId);
    const next = { ...allDays, [planId]: seeded };
    salvarColecao(userId, CHAVE_DIAS_PLANO, next);
    return seeded;
  }
  return existente;
};

export const getLeituraDoDia = (userId: string) => {
  const plano = obterPlanosLeitura(userId)[0];
  const dias = obterDiasPlanoLeitura(userId, plano.id);
  if (dias.length === 0) {
    return null;
  }
  const hoje = new Date();
  const diff = Math.floor((hoje.getTime() - PLANO_INICIO.getTime()) / 86400000);
  const index = Math.min(Math.max(diff, 0), dias.length - 1);
  return { plano, dia: dias[index] };
};

export const obterProgressoLeitura = (userId: string) =>
  lerColecao<ProgressoLeituraUsuario[]>(userId, CHAVE_PROGRESSO, []);

export const alternarProgressoLeitura = (
  userId: string,
  planId: string,
  dayId: string,
  date: string,
  completed: boolean,
) => {
  const progress = obterProgressoLeitura(userId);
  const now = new Date().toISOString();
  const existing = progress.find(
    (item) => item.planId === planId && item.dayId === dayId,
  );
  const next = existing
    ? progress.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              completed,
              completedAt: completed ? now : undefined,
              date,
            }
          : item,
      )
    : [
        {
          id: criarId(),
          userId,
          planId,
          dayId,
          date,
          completed,
          completedAt: completed ? now : undefined,
        },
        ...progress,
      ];
  salvarColecao(userId, CHAVE_PROGRESSO, next);
  atualizarProgressoComunitario(userId, date.split("T")[0], completed);
  return next;
};

export const obterProgressoLeituraPorDia = (
  progress: ProgressoLeituraUsuario[],
  planId: string,
  dayId: string,
) => progress.find((item) => item.planId === planId && item.dayId === dayId);

type ProgressoComunitario = {
  datas: Record<string, string[]>;
};

const getProgressoComunitario = () =>
  lerArmazenamento<ProgressoComunitario>(CHAVE_PROGRESSO_COMUNITARIO, { datas: {} });

const salvarProgressoComunitario = (value: ProgressoComunitario) =>
  salvarArmazenamento(CHAVE_PROGRESSO_COMUNITARIO, value);

export const atualizarProgressoComunitario = (userId: string, data: string, completed: boolean) => {
  const atual = getProgressoComunitario();
  const usuarios = new Set(atual.datas[data] ?? []);
  if (completed) {
    usuarios.add(userId);
  } else {
    usuarios.delete(userId);
  }
  const next = {
    datas: {
      ...atual.datas,
      [data]: Array.from(usuarios),
    },
  };
  salvarProgressoComunitario(next);
  return next;
};

const normalizarData = (value: string) => value.split("T")[0];

const diffDias = (a: string, b: string) => {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.floor((da.getTime() - db.getTime()) / 86400000);
};

export const obterEstatisticasLeitura = (
  progress: ProgressoLeituraUsuario[],
  totalDias: number,
) => {
  const concluidas = progress.filter((item) => item.completed);
  const datas = new Set(concluidas.map((item) => normalizarData(item.date)));
  const datasOrdenadas = Array.from(datas).sort();
  const totalConcluido = concluidas.length;
  const percentual = totalDias > 0 ? Math.round((totalConcluido / totalDias) * 100) : 0;

  let maiorSequencia = 0;
  let sequenciaAtual = 0;
  for (let i = 0; i < datasOrdenadas.length; i += 1) {
    if (i === 0) {
      sequenciaAtual = 1;
    } else {
      const atual = datasOrdenadas[i];
      const anterior = datasOrdenadas[i - 1];
      if (diffDias(atual, anterior) === 1) {
        sequenciaAtual += 1;
      } else {
        sequenciaAtual = 1;
      }
    }
    maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
  }

  const hoje = normalizarData(new Date().toISOString());
  const ultimaLeitura = datasOrdenadas[datasOrdenadas.length - 1];
  const diasSemLer = ultimaLeitura ? Math.max(0, diffDias(hoje, ultimaLeitura)) : 0;
  const sequenciaHoje =
    ultimaLeitura && diffDias(hoje, ultimaLeitura) === 0
      ? sequenciaAtual
      : ultimaLeitura && diffDias(hoje, ultimaLeitura) === 1
        ? sequenciaAtual
        : 0;

  return {
    percentual,
    totalConcluido,
    diasComLeitura: datas.size,
    diasSemLer,
    sequenciaAtual: sequenciaHoje,
    maiorSequencia,
  };
};

export const obterEstatisticasComunitarias = () => {
  const { datas } = getProgressoComunitario();
  const datasOrdenadas = Object.keys(datas).sort();
  const totalLeituras = datasOrdenadas.reduce(
    (acc, data) => acc + (datas[data]?.length ?? 0),
    0,
  );
  let maiorSequencia = 0;
  let sequenciaAtual = 0;
  for (let i = 0; i < datasOrdenadas.length; i += 1) {
    if (i === 0) {
      sequenciaAtual = 1;
    } else {
      const atual = datasOrdenadas[i];
      const anterior = datasOrdenadas[i - 1];
      if (diffDias(atual, anterior) === 1) {
        sequenciaAtual += 1;
      } else {
        sequenciaAtual = 1;
      }
    }
    maiorSequencia = Math.max(maiorSequencia, sequenciaAtual);
  }
  const hoje = normalizarData(new Date().toISOString());
  const leuHoje = datas[hoje]?.length ?? 0;
  return {
    totalLeituras,
    diasAtivos: datasOrdenadas.length,
    maiorSequencia,
    leuHoje,
  };
};

export const obterPercentualPlano = (totalDias: number) => {
  if (totalDias <= 0) {
    return 0;
  }
  const hoje = new Date();
  const diff = Math.floor((hoje.getTime() - PLANO_INICIO.getTime()) / 86400000);
  const diasPassados = Math.min(Math.max(diff + 1, 0), totalDias);
  return Math.round((diasPassados / totalDias) * 100);
};

export const obterPlanoInicio = () => PLANO_INICIO;

export const obterDiasPassadosPlano = (totalDias: number) => {
  if (totalDias <= 0) {
    return 0;
  }
  const hoje = new Date();
  const diff = Math.floor((hoje.getTime() - PLANO_INICIO.getTime()) / 86400000);
  return Math.min(Math.max(diff + 1, 0), totalDias);
};

export const obterResumoPlanoLeitura = (progress: ProgressoLeituraUsuario[], planId: string) => {
  const planProgress = progress.filter((item) => item.planId === planId);
  const completed = planProgress.filter((item) => item.completed).length;
  return {
    totalReadings: planProgress.length,
    completedReadings: completed,
  };
};

export const obterLeiturasCapitulos = (userId: string) =>
  lerColecao<LeituraCapitulo[]>(userId, CHAVE_LEITURA_CAPITULOS, []);

export const foiCapituloLido = (
  leituras: LeituraCapitulo[],
  bookId: string,
  chapter: number,
  version: string,
) =>
  leituras.some(
    (item) =>
      item.bookId === bookId &&
      item.chapter === chapter &&
      item.version === version,
  );

export const alternarLeituraCapitulo = (
  userId: string,
  book: LivroBiblia,
  chapter: number,
  version: string,
) => {
  const leituras = obterLeiturasCapitulos(userId);
  const existe = leituras.find(
    (item) =>
      item.bookId === book.id &&
      item.chapter === chapter &&
      item.version === version,
  );
  let next: LeituraCapitulo[];
  if (existe) {
    next = leituras.filter((item) => item.id !== existe.id);
  } else {
    next = [
      {
        id: criarId(),
        userId,
        bookId: book.id,
        bookName: obterNomeLivro(book),
        chapter,
        version,
        lidoEm: new Date().toISOString(),
      },
      ...leituras,
    ];
  }
  salvarColecao(userId, CHAVE_LEITURA_CAPITULOS, next);
  return next;
};

export const calcularProgressoLivro = (
  leituras: LeituraCapitulo[],
  bookId: string,
  version: string,
  totalCapitulos: number,
) => {
  const lidos = leituras.filter(
    (item) => item.bookId === bookId && item.version === version,
  ).length;
  const percentual = totalCapitulos > 0 ? Math.round((lidos / totalCapitulos) * 100) : 0;
  return { lidos, total: totalCapitulos, percentual };
};
