export function BadgeNotificacaoMenu({ quantidade }: { quantidade: number }) {
  if (quantidade <= 0) return null;

  return (
    <span
      className="ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground"
      aria-label={`${quantidade} não ${quantidade === 1 ? "vista" : "vistas"}`}
    >
      {quantidade > 9 ? "9+" : quantidade}
    </span>
  );
}
