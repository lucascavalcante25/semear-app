import type { EscalaDTO } from "@/modules/escalas/api";

export type GrupoEscalasCulto = {
  chave: string;
  titulo: string;
  dataEvento?: string;
  escalas: EscalaDTO[];
  funcoes: {
    escalaId?: number;
    itemId?: number;
    departamento: string;
    nome: string;
    confirmado?: boolean;
  }[];
};

export const normalizarNome = (nome?: string) =>
  (nome ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export const nomesCoincidem = (a?: string, b?: string) => {
  const na = normalizarNome(a);
  const nb = normalizarNome(b);
  return na.length > 0 && nb.length > 0 && na === nb;
};

export const extrairTituloCulto = (titulo?: string) => {
  if (!titulo) return "Culto";
  return (
    titulo
      .replace(/^(Portaria e Recepção|Portaria|Recepção|Limpeza)\s*—\s*/i, "")
      .replace(/\s+\d{2}\/\d{2}\/\d{4}$/, "")
      .trim() || titulo
  );
};

const ordemDepartamento = (nome: string) => {
  const n = nome.toLowerCase();
  if (n.includes("portaria")) return 0;
  if (n.includes("recep")) return 1;
  if (n.includes("limpeza")) return 2;
  return 3;
};

const chaveDiaEscala = (escala: EscalaDTO) => {
  const iso = escala.dataEvento ?? escala.data;
  if (!iso) return `${escala.titulo}-${escala.id}`;
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Mantém escalas de hoje em diante (calendário local). */
export const escalaNaoPassou = (escala: EscalaDTO) => {
  const iso = escala.dataEvento ?? escala.data;
  if (!iso) return true;
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return dia.getTime() >= hoje.getTime();
};

export const agruparEscalasPorCulto = (escalas: EscalaDTO[]): GrupoEscalasCulto[] => {
  const mapa = new Map<string, GrupoEscalasCulto>();

  for (const escala of escalas) {
    const chave = chaveDiaEscala(escala);
    const funcoes = (escala.itens ?? []).map((item) => ({
      escalaId: escala.id,
      itemId: item.id,
      departamento: item.funcao ?? escala.departamentoNome ?? "Função",
      nome: item.userNome ?? item.membroNome ?? "—",
      confirmado: item.confirmado,
    }));

    const existente = mapa.get(chave);
    const tituloGrupo = extrairTituloCulto(escala.titulo);
    if (!existente) {
      mapa.set(chave, {
        chave,
        titulo: tituloGrupo,
        dataEvento: escala.dataEvento ?? (escala.data ? `${escala.data}T12:00:00.000Z` : undefined),
        escalas: [escala],
        funcoes: [...funcoes],
      });
    } else {
      existente.escalas.push(escala);
      existente.funcoes.push(...funcoes);
      if (!existente.titulo.toLowerCase().includes("culto") && tituloGrupo.toLowerCase().includes("culto")) {
        existente.titulo = tituloGrupo;
      }
    }
  }

  return Array.from(mapa.values())
    .map((grupo) => ({
      ...grupo,
      funcoes: [...grupo.funcoes].sort(
        (a, b) => ordemDepartamento(a.departamento) - ordemDepartamento(b.departamento),
      ),
    }))
    .sort(
      (a, b) =>
        new Date(a.dataEvento ?? 0).getTime() - new Date(b.dataEvento ?? 0).getTime(),
    );
};

export const usuarioEstaNoGrupo = (grupo: GrupoEscalasCulto, nomeUsuario?: string) =>
  grupo.funcoes.some((f) => nomesCoincidem(f.nome, nomeUsuario));

export const formatarDataEscala = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
