export type Testamento = "old" | "new";

export type VersaoBiblia = string;

export type IntervaloVersiculo = {
  start: number;
  end: number;
};

export type ReferenciaBiblia = {
  bookId: string;
  bookName: string;
  chapter: number;
  verseRange: IntervaloVersiculo;
};

export type FavoritoBiblia = {
  id: string;
  userId: string;
  reference: ReferenciaBiblia;
  version: VersaoBiblia;
  createdAt: string;
};

export type CorDestaque = "yellow" | "green" | "blue" | "red" | "purple";

export type DestaqueBiblia = {
  id: string;
  userId: string;
  reference: ReferenciaBiblia;
  version: VersaoBiblia;
  color: CorDestaque;
  createdAt: string;
  updatedAt: string;
};

export type NotaBiblia = {
  id: string;
  userId: string;
  reference: ReferenciaBiblia;
  version: VersaoBiblia;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type TrechoLeitura = {
  id: string;
  book: string;
  reference: string;
  type: "gospel" | "oldTestament" | "psalm" | "proverb" | "epistle";
};

export type TipoPlanoLeitura = "predefined" | "church" | "custom";

export type PlanoLeitura = {
  id: string;
  name: string;
  description?: string;
  type: TipoPlanoLeitura;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DiaPlanoLeitura = {
  id: string;
  planId: string;
  dayNumber: number;
  title?: string;
  readings: TrechoLeitura[];
};

export type ProgressoLeituraUsuario = {
  id: string;
  userId: string;
  planId: string;
  dayId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
};

export type HistoricoLeituraBiblia = {
  id: string;
  userId: string;
  reference: ReferenciaBiblia;
  version: VersaoBiblia;
  readAt: string;
};

export type PreferenciaBibliaUsuario = {
  id: string;
  userId: string;
  mode: "reading" | "study";
  fontSize: "sm" | "md" | "lg" | "xl";
  theme: "system" | "light" | "dark";
  showHighlights: boolean;
  showNotes: boolean;
  showFavorites: boolean;
};

export type VersiculoBiblia = {
  verse: number;
  text: string;
};

export type CapituloBibliaCache = {
  id: string;
  bookId: string;
  bookName: string;
  chapter: number;
  version: VersaoBiblia;
  verses: VersiculoBiblia[];
  cachedAt: string;
};

export type FiltroBuscaBiblia = {
  query: string;
  bookId?: string;
  testament?: Testamento;
  version?: VersaoBiblia;
};

export type ResultadoBuscaBiblia = {
  id: string;
  reference: ReferenciaBiblia;
  version: VersaoBiblia;
  verse: VersiculoBiblia;
  snippet: string;
};

export type LeituraCapitulo = {
  id: string;
  userId: string;
  bookId: string;
  bookName: string;
  chapter: number;
  version: VersaoBiblia;
  lidoEm?: string;
};
