import { Cake, Gift, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Birthday {
  id: string;
  name: string;
  date: Date;
  photoUrl?: string;
}

// Sample birthdays for demonstration
const sampleBirthdays: Birthday[] = [
  {
    id: "1",
    name: "Maria Santos",
    date: new Date(),
    photoUrl: undefined,
  },
  {
    id: "2",
    name: "João Silva",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    photoUrl: undefined,
  },
  {
    id: "3",
    name: "Ana Paula Oliveira",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    photoUrl: undefined,
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(today.getFullYear() + 1);
  }
  return Math.ceil((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface BirthdayItemProps {
  birthday: Birthday;
}

function BirthdayItem({ birthday }: BirthdayItemProps) {
  const daysUntil = getDaysUntil(birthday.date);
  const isToday = daysUntil === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        isToday ? "bg-gold/10" : "hover:bg-muted/50"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={birthday.photoUrl} alt={birthday.name} />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          isToday ? "bg-gold text-gold-foreground" : "bg-olive-light text-olive-dark"
        )}>
          {getInitials(birthday.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{birthday.name}</p>
        <p className="text-xs text-muted-foreground">
          {birthday.date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
        </p>
      </div>
      {isToday ? (
        <Badge className="bg-gold text-gold-foreground border-0 gap-1">
          <Gift className="h-3 w-3" />
          Hoje!
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          em {daysUntil} {daysUntil === 1 ? "dia" : "dias"}
        </span>
      )}
    </div>
  );
}

export function Birthdays() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10 text-gold-dark">
              <Cake className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Aniversariantes</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
            Ver todos
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        {sampleBirthdays.map((birthday) => (
          <BirthdayItem key={birthday.id} birthday={birthday} />
        ))}
      </CardContent>
    </Card>
  );
}
