import { TrendingUp, Flame, BookOpen, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ progress, size = 80, strokeWidth = 6 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-olive transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{progress}%</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}

export function SpiritualProgress() {
  // Sample data - would come from user's reading progress
  const stats = {
    annualProgress: 5, // 5% of yearly reading plan
    currentStreak: 7,
    totalReadings: 15,
    daysActive: 20,
  };

  return (
    <Card className="shadow-spiritual overflow-hidden">
      <div className="gradient-spiritual p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-white/90" />
          <h3 className="text-sm font-semibold text-white">Seu Progresso Espiritual</h3>
        </div>
        <p className="text-xs text-white/70">
          Continue firme na Palavra! Você está crescendo.
        </p>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-6">
          {/* Progress Ring */}
          <div className="flex flex-col items-center">
            <ProgressRing progress={stats.annualProgress} />
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              Plano Anual
            </p>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <StatCard
              icon={Flame}
              label="Dias seguidos"
              value={stats.currentStreak}
              color="bg-gold/10 text-gold-dark"
            />
            <StatCard
              icon={BookOpen}
              label="Leituras feitas"
              value={stats.totalReadings}
              color="bg-olive/10 text-olive"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
