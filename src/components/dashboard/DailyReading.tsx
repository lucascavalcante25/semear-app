import { BookMarked, Check, X, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getTodayReading, formatDate, type ReadingPassage } from "@/data/daily-reading";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ReadingItemProps {
  reading: ReadingPassage;
  isCompleted: boolean;
  onMarkComplete: (id: string, completed: boolean) => void;
}

function ReadingItem({ reading, isCompleted, onMarkComplete }: ReadingItemProps) {
  const typeColors = {
    gospel: "bg-deep-blue/10 text-deep-blue border-deep-blue/20",
    oldTestament: "bg-olive/10 text-olive border-olive/20",
    psalm: "bg-gold/10 text-gold-dark border-gold/20",
    proverb: "bg-gold/10 text-gold-dark border-gold/20",
    epistle: "bg-deep-blue/10 text-deep-blue border-deep-blue/20",
  };

  const typeLabels = {
    gospel: "Evangelho",
    oldTestament: "Antigo Testamento",
    psalm: "Salmo",
    proverb: "Provérbio",
    epistle: "Epístola",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200",
        isCompleted
          ? "bg-olive/5 border-olive/30"
          : "bg-card border-border hover:border-muted-foreground/30"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border",
              typeColors[reading.type]
            )}
          >
            {typeLabels[reading.type]}
          </span>
        </div>
        <p
          className={cn(
            "text-sm font-medium truncate",
            isCompleted && "line-through text-muted-foreground"
          )}
        >
          {reading.reference}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant={isCompleted ? "reading-complete" : "reading"}
          size="icon-sm"
          onClick={() => onMarkComplete(reading.id, true)}
          className={cn(isCompleted && "pointer-events-none")}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant={!isCompleted ? "reading-pending" : "reading"}
          size="icon-sm"
          onClick={() => onMarkComplete(reading.id, false)}
          className={cn(!isCompleted && "opacity-50")}
          disabled={!isCompleted}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function DailyReading() {
  const todayReading = getTodayReading();
  const [completedReadings, setCompletedReadings] = useState<Set<string>>(new Set());

  const handleMarkComplete = (id: string, completed: boolean) => {
    setCompletedReadings((prev) => {
      const newSet = new Set(prev);
      if (completed) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const totalReadings = todayReading?.readings.length || 0;
  const completedCount = completedReadings.size;
  const progress = totalReadings > 0 ? (completedCount / totalReadings) * 100 : 0;

  // Fallback readings if no reading found for today
  const readings = todayReading?.readings || [
    { id: "r1", book: "João", reference: "João 18:38 - 19:16", type: "gospel" as const },
    { id: "r2", book: "2 Crônicas", reference: "2 Crônicas 29", type: "oldTestament" as const },
    { id: "r3", book: "Salmos", reference: "Salmos 85", type: "psalm" as const },
  ];

  return (
    <Card className="shadow-spiritual">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-deep-blue text-deep-blue-foreground">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Leitura do Dia</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Ver plano
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedCount} de {totalReadings} concluídas
            </span>
            <span className="font-medium text-olive">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {readings.map((reading) => (
          <ReadingItem
            key={reading.id}
            reading={reading}
            isCompleted={completedReadings.has(reading.id)}
            onMarkComplete={handleMarkComplete}
          />
        ))}
      </CardContent>
    </Card>
  );
}
