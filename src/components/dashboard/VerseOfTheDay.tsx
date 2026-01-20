import { BookOpen, Share2, Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVerseOfTheDay } from "@/data/verses";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function VerseOfTheDay() {
  const verse = getVerseOfTheDay();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = () => {
    const text = `📖 ${verse.reference}\n\n"${verse.text}"\n\n— Enviado pelo app SEMEAR`;
    
    if (navigator.share) {
      navigator.share({
        title: "Versículo do Dia - SEMEAR",
        text,
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-spiritual bg-gradient-to-br from-olive-light via-card to-gold-light">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-olive/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive text-olive-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-olive-dark">
              Versículo do Dia
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-gold-dark hover:text-gold hover:bg-gold/10"
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-all",
                  isFavorite && "fill-gold text-gold"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleShare}
              className="text-olive-dark hover:text-olive hover:bg-olive/10"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-5 relative">
          <Quote className="absolute top-3 left-3 h-8 w-8 text-gold/20" />
          <p className="text-base md:text-lg leading-relaxed text-foreground pl-4 italic">
            "{verse.text}"
          </p>
          <div className="mt-4 flex items-center justify-end">
            <span className="text-sm font-semibold text-olive-dark bg-olive/10 px-3 py-1 rounded-full">
              {verse.reference}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
