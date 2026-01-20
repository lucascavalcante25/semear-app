import { AppLayout } from "@/components/layout";
import {
  VerseOfTheDay,
  DailyReading,
  QuickActions,
  Announcements,
  Birthdays,
  SpiritualProgress,
} from "@/components/dashboard";

const Index = () => {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}! 🙏
          </h1>
          <p className="text-sm text-muted-foreground">
            Paz do Senhor Jesus Cristo. Que Deus abençoe seu dia.
          </p>
        </div>

        {/* Verse of the Day */}
        <VerseOfTheDay />

        {/* Spiritual Progress */}
        <SpiritualProgress />

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Acesso Rápido
          </h2>
          <QuickActions />
        </section>

        {/* Daily Reading */}
        <DailyReading />

        {/* Announcements & Birthdays Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Announcements />
          <Birthdays />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
