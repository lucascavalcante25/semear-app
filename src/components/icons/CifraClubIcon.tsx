import { Icon } from "@iconify/react";

interface CifraClubIconProps {
  className?: string;
  size?: number;
}

/**
 * Ícone do Cifra Club (guitarra em quadrado arredondado).
 * Usa o ícone arcticons:cifra-club do Iconify (mesmo do shadcn.io).
 */
export function CifraClubIcon({ className, size = 24 }: CifraClubIconProps) {
  return (
    <Icon
      icon="arcticons:cifra-club"
      width={size}
      height={size}
      className={className}
    />
  );
}
