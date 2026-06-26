import type { ComunicadoApp } from "@/modules/comunicados/api";

const inicioDoDia = (data: Date) =>
  new Date(data.getFullYear(), data.getMonth(), data.getDate());

export function comunicadoEstaVigente(comunicado: ComunicadoApp, referencia = new Date()): boolean {
  if (!comunicado.isActive) return false;

  const hoje = inicioDoDia(referencia);
  const inicio = inicioDoDia(comunicado.startDate);
  if (hoje < inicio) return false;

  if (comunicado.endDate) {
    const fim = inicioDoDia(comunicado.endDate);
    if (hoje > fim) return false;
  }

  return true;
}

export function filtrarComunicadosVigentes(
  comunicados: ComunicadoApp[],
  referencia = new Date(),
): ComunicadoApp[] {
  return comunicados.filter((c) => comunicadoEstaVigente(c, referencia));
}

const prioridadeTipo: Record<ComunicadoApp["type"], number> = {
  urgent: 0,
  fixed: 1,
  campanha: 2,
  sistema: 3,
  boas_vindas: 4,
  normal: 5,
};

export function ordenarComunicadosPorDestaque(comunicados: ComunicadoApp[]): ComunicadoApp[] {
  return [...comunicados].sort((a, b) => {
    const diff = prioridadeTipo[a.type] - prioridadeTipo[b.type];
    if (diff !== 0) return diff;
    return b.startDate.getTime() - a.startDate.getTime();
  });
}

/** @deprecated use comunicadoEstaVigente */
export const avisoEstaVigente = comunicadoEstaVigente;
/** @deprecated use filtrarComunicadosVigentes */
export const filtrarAvisosVigentes = filtrarComunicadosVigentes;
/** @deprecated use ordenarComunicadosPorDestaque */
export const ordenarAvisosPorDestaque = ordenarComunicadosPorDestaque;
