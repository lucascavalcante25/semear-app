// Daily Bible Reading Plan for SEMEAR app
// One year reading plan covering the entire Bible

export interface DailyReading {
  date: string; // Format: MM-DD
  readings: ReadingPassage[];
}

export interface ReadingPassage {
  id: string;
  book: string;
  reference: string; // e.g., "João 18:38 - 19:16"
  type: "gospel" | "oldTestament" | "psalm" | "proverb" | "epistle";
}

// Sample readings for demonstration - in production this would be complete
export const dailyReadings: DailyReading[] = [
  {
    date: "01-20",
    readings: [
      { id: "r1", book: "João", reference: "João 18:38 - 19:16", type: "gospel" },
      { id: "r2", book: "2 Crônicas", reference: "2 Crônicas 29", type: "oldTestament" },
      { id: "r3", book: "Salmos", reference: "Salmos 85", type: "psalm" },
    ],
  },
  {
    date: "01-21",
    readings: [
      { id: "r4", book: "João", reference: "João 19:17-42", type: "gospel" },
      { id: "r5", book: "2 Crônicas", reference: "2 Crônicas 30", type: "oldTestament" },
      { id: "r6", book: "Salmos", reference: "Salmos 86", type: "psalm" },
    ],
  },
  {
    date: "01-22",
    readings: [
      { id: "r7", book: "João", reference: "João 20:1-18", type: "gospel" },
      { id: "r8", book: "2 Crônicas", reference: "2 Crônicas 31", type: "oldTestament" },
      { id: "r9", book: "Salmos", reference: "Salmos 87", type: "psalm" },
    ],
  },
];

export function getTodayReading(): DailyReading | undefined {
  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return dailyReadings.find((r) => r.date === monthDay);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
