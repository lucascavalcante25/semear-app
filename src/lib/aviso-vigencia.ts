import type { AvisoApp } from "@/modules/announcements/api";

const inicioDoDia = (data: Date) =>
  new Date(data.getFullYear(), data.getMonth(), data.getDate());

/** Aviso ativo e dentro do intervalo dataInicio–dataFim (inclusive). */
export function avisoEstaVigente(aviso: AvisoApp, referencia = new Date()): boolean {
  if (!aviso.isActive) return false;

  const hoje = inicioDoDia(referencia);
  const inicio = inicioDoDia(aviso.startDate);
  if (hoje < inicio) return false;

  if (aviso.endDate) {
    const fim = inicioDoDia(aviso.endDate);
    if (hoje > fim) return false;
  }

  return true;
}

export function filtrarAvisosVigentes(avisos: AvisoApp[], referencia = new Date()): AvisoApp[] {
  return avisos.filter((a) => avisoEstaVigente(a, referencia));
}

const prioridadeTipo: Record<AvisoApp["type"], number> = {
  urgent: 0,
  fixed: 1,
  normal: 2,
};

export function ordenarAvisosPorDestaque(avisos: AvisoApp[]): AvisoApp[] {
  return [...avisos].sort((a, b) => {
    const diff = prioridadeTipo[a.type] - prioridadeTipo[b.type];
    if (diff !== 0) return diff;
    return b.startDate.getTime() - a.startDate.getTime();
  });
}
