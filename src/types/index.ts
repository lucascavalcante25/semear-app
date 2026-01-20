// SEMEAR App Type Definitions

// ============ Members ============
export interface Member {
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

// ============ Visitors ============
export interface Visitor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  visitDate: Date;
  notes?: string;
  howHeard?: string;
  createdAt: Date;
}

// ============ Announcements ============
export interface Announcement {
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

// ============ Praise/Worship ============
export interface Praise {
  id: string;
  title: string;
  artist: string;
  key: string; // Tonality
  tempo?: string;
  type: "worship" | "jubilee" | "communion" | "offering";
  lyricsUrl?: string;
  chordsUrl?: string; // PDF URL
  youtubeUrl?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PraiseGroup {
  id: string;
  name: string;
  date: Date;
  praises: string[]; // Array of Praise IDs
  order: number;
  createdAt: Date;
  createdBy: string;
}

// ============ Financial ============
export interface FinancialEntry {
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

export type IncomeCategory = "tithe" | "offering" | "donation" | "special" | "other";
export type ExpenseCategory = 
  | "utilities" 
  | "maintenance" 
  | "supplies" 
  | "salaries" 
  | "events" 
  | "missions" 
  | "other";

// ============ Devotionals ============
export interface Devotional {
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

// ============ Bible Reading ============
export interface ReadingProgress {
  id: string;
  userId: string;
  readingId: string;
  date: string;
  completed: boolean;
  completedAt?: Date;
}

export interface UserStats {
  totalReadings: number;
  completedReadings: number;
  currentStreak: number;
  longestStreak: number;
  percentComplete: number;
}

// ============ Feed / Sharing ============
export interface FeedPost {
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
