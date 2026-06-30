import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { obterMenuResumoAdmin } from "@/modules/admin/monitoramento";
import { usarPollingInteligente } from "@/hooks/use-polling-inteligente";

const INTERVALO_VISIVEL_MS = 45_000;
const INTERVALO_OCULTO_MS = 120_000;

type TipoVisto = "solicitacoes" | "suporte";

function chaveVisto(userId: string, tipo: TipoVisto) {
  return `semear.super-admin.visto.${userId}.${tipo}`;
}

function lerVisto(userId: string, tipo: TipoVisto): number | null {
  try {
    const raw = localStorage.getItem(chaveVisto(userId, tipo));
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function salvarVisto(userId: string, tipo: TipoVisto, valor: number) {
  try {
    localStorage.setItem(chaveVisto(userId, tipo), String(valor));
  } catch {
    // ignore
  }
}

function contagemNaoVista(atual: number, visto: number | null): number {
  if (atual <= 0) return 0;
  if (visto === null) return atual;
  return Math.max(0, atual - visto);
}

export function usarNotificacoesSuperAdmin() {
  const { user } = usarAutenticacao();
  const location = useLocation();
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState(0);
  const [suporteNaoLidas, setSuporteNaoLidas] = useState(0);
  const [vistoSolicitacoes, setVistoSolicitacoes] = useState<number | null>(null);
  const [vistoSuporte, setVistoSuporte] = useState<number | null>(null);

  const userId = user?.id ?? "";

  const carregar = useCallback(async () => {
    if (!userId) return;

    try {
      const resumo = await obterMenuResumoAdmin();
      setSolicitacoesPendentes(resumo.solicitacoesPendentes ?? 0);
      setSuporteNaoLidas(resumo.suporteAguardandoResposta ?? 0);
    } catch {
      setSolicitacoesPendentes(0);
      setSuporteNaoLidas(0);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setVistoSolicitacoes(lerVisto(userId, "solicitacoes"));
    setVistoSuporte(lerVisto(userId, "suporte"));
  }, [userId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  usarPollingInteligente({
    ativo: !!userId,
    aoAtualizar: () => void carregar(),
    intervaloVisivelMs: INTERVALO_VISIVEL_MS,
    intervaloOcultoMs: INTERVALO_OCULTO_MS,
  });

  useEffect(() => {
    if (!userId) return;

    if (location.pathname.startsWith("/super-admin/solicitacoes")) {
      salvarVisto(userId, "solicitacoes", solicitacoesPendentes);
      setVistoSolicitacoes(solicitacoesPendentes);
    }
  }, [location.pathname, userId, solicitacoesPendentes]);

  useEffect(() => {
    if (!userId) return;

    if (location.pathname.startsWith("/super-admin/suporte")) {
      salvarVisto(userId, "suporte", suporteNaoLidas);
      setVistoSuporte(suporteNaoLidas);
    }
  }, [location.pathname, userId, suporteNaoLidas]);

  const badgeSolicitacoes = contagemNaoVista(solicitacoesPendentes, vistoSolicitacoes);
  const badgeSuporte = contagemNaoVista(suporteNaoLidas, vistoSuporte);

  return {
    badgeSolicitacoes,
    badgeSuporte,
    temAlgumaNotificacao: badgeSolicitacoes > 0 || badgeSuporte > 0,
    recarregar: carregar,
  };
}
