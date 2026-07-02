import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgesCargosProps = {
  rotulos: string[];
  className?: string;
  badgeClassName?: string;
};

export function BadgesCargos({ rotulos, className, badgeClassName }: BadgesCargosProps) {
  if (rotulos.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {rotulos.map((label, index) => (
        <Badge key={`${label}-${index}`} variant="secondary" className={cn("text-xs", badgeClassName)}>
          {label}
        </Badge>
      ))}
    </div>
  );
}
