// Semear App Type Definitions

// ============ Membros ============
export interface Membro {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  birthDate: Date;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  ministry?: string;
  role?: string;
  baptismDate?: Date;
  maritalStatus: "single" | "married" | "widowed" | "divorced";
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// ============ Visitantes ============
export interface Visitante {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  visitDate: Date;
  notes?: string;
  howHeard?: string;
  createdAt: Date;
}

// ============ Avisos ============
export interface Aviso {
  id: string;
  title: string;
  content: string;
  type: "normal" | "urgent" | "fixed";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

// ============ Louvor/Adoracao ============
export interface Louvor {
  id: string;
  title: string;
  artist: string;
  key: string; // Tonality
  tempo?: string;
  type: "jubilo" | "adoracao" | "ceia";
  chordsUrl?: string; // PDF URL
  youtubeUrl?: string;
  hasCifra?: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrupoLouvor {
  id: string;
  idNum: number;
  name: string;
  ordem: number;
  louvorIds: string[]; // IDs dos louvores na ordem do grupo
}

// ============ Financeiro ============
export interface LancamentoFinanceiro {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: Date;
  paymentMethod?: "cash" | "pix" | "card" | "transfer";
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export type CategoriaReceita = "tithe" | "offering" | "donation" | "special" | "other";
export type CategoriaDespesa = 
  | "utilities" 
  | "maintenance" 
  | "supplies" 
  | "salaries" 
  | "events" 
  | "missions" 
  | "other";

// ============ Devocionais ============
export interface Devocional {
  id: string;
  title: string;
  content: string;
  verseReference: string;
  verseText: string;
  author: string;
  publishDate: Date;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ Leitura Biblica ============
export interface ProgressoLeitura {
  id: string;
  userId: string;
  readingId: string;
  date: string;
  completed: boolean;
  completedAt?: Date;
}

export interface EstatisticasUsuario {
  totalReadings: number;
  completedReadings: number;
  currentStreak: number;
  longestStreak: number;
  percentComplete: number;
}

// ============ Feed / Compartilhamento ============
export interface PostagemFeed {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "verse" | "reading" | "devotional" | "testimony";
  content: string;
  reference?: string;
  reactions: {
    pray: number;
    amen: number;
  };
  createdAt: Date;
}
