import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usarAutenticacao } from "@/contexts/AuthContext";
import { API_ATIVA } from "@/modules/api/client";
import {
  obterConfiguracaoPublica,
  obterIgrejaAtual,
  obterPixIgreja,
  resolverUrlLogo,
  type IgrejaConfiguracao,
  type IgrejaPix,
  type IgrejaPublica,
} from "@/modules/igreja/api";
import { aplicarCoresIgreja, limparCoresIgreja } from "@/lib/cores-igreja";
import { definirInicioPlanoIgreja } from "@/modules/bible/service";
import { isRotaIgreja, isRotaPublica, isRotaSuperAdmin } from "@/lib/rotas-app";

const FALLBACK_PUBLICA: IgrejaPublica = {
  nome: "Sua igreja",
  nomeFantasia: "Sua igreja",
  logoUrl: "/logo-willsas.svg",
  corPrimaria: "#5a7a3a",
  corSecundaria: "#1f4d7a",
  temaPreferido: "SISTEMA",
  textoBoasVindas: "Bem-vindo",
  descricaoIgreja: "",
  cidade: "Eusébio",
  estado: "CE",
};

type ValorContextoIgreja = {
  configuracao: IgrejaConfiguracao | null;
  publica: IgrejaPublica;
  pix: IgrejaPix | null;
  carregando: boolean;
  recarregar: () => Promise<void>;
  nomeExibicao: string;
  subtituloExibicao: string;
  logoUrl: string;
};

const IgrejaContext = createContext<ValorContextoIgreja | undefined>(undefined);

export function ProvedorIgreja({ children }: { children: React.ReactNode }) {
  const { user } = usarAutenticacao();
  const [configuracao, setConfiguracao] = useState<IgrejaConfiguracao | null>(null);
  const [publica, setPublica] = useState<IgrejaPublica>(FALLBACK_PUBLICA);
  const [pix, setPix] = useState<IgrejaPix | null>(null);
  const [carregando, setCarregando] = useState(false);

  const recarregar = useCallback(async () => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    const aplicarBrandingIgreja = isRotaIgreja(path) && !isRotaPublica(path) && !isRotaSuperAdmin(path);

    if (!aplicarBrandingIgreja) {
      limparCoresIgreja();
      definirInicioPlanoIgreja(null);
    }

    if (!API_ATIVA) {
      setPublica(FALLBACK_PUBLICA);
      setConfiguracao({
        ...FALLBACK_PUBLICA,
        cnpj: "10.884.335/0001-73",
        chavePix: "10884335000173",
        tipoChavePix: "CNPJ",
        nomeTitularPix: "COMUNIDADE EVANGELICA SEM",
        textoAgradecimentoOferta: "Obrigado por sua oferta!",
      });
      setPix({
        nome: FALLBACK_PUBLICA.nome,
        nomeFantasia: FALLBACK_PUBLICA.nomeFantasia,
        cnpj: "10.884.335/0001-73",
        logoUrl: FALLBACK_PUBLICA.logoUrl,
        chavePix: "10884335000173",
        tipoChavePix: "CNPJ",
        nomeTitularPix: "COMUNIDADE EVANGELICA SEM",
        cidade: "Eusébio",
      });
      if (aplicarBrandingIgreja) {
        aplicarCoresIgreja(FALLBACK_PUBLICA.corPrimaria, FALLBACK_PUBLICA.corSecundaria);
      }
      return;
    }

    setCarregando(true);
    try {
      if (aplicarBrandingIgreja) {
        const pub = await obterConfiguracaoPublica();
        if (pub) {
          setPublica(pub);
          aplicarCoresIgreja(pub.corPrimaria, pub.corSecundaria);
        }
      }

      if (user && aplicarBrandingIgreja) {
        const [cfg, pixData] = await Promise.all([obterIgrejaAtual(), obterPixIgreja()]);
        if (cfg) {
          setConfiguracao(cfg);
          setPublica((prev) => ({
            ...prev,
            ...cfg,
            logoUrl: cfg.logoUrl || prev.logoUrl,
            corPrimaria: cfg.corPrimaria || prev.corPrimaria,
            corSecundaria: cfg.corSecundaria || prev.corSecundaria,
          }));
          aplicarCoresIgreja(cfg.corPrimaria, cfg.corSecundaria);
          definirInicioPlanoIgreja(cfg.dataInicioPlanoLeitura ?? null);
        }
        if (pixData) setPix(pixData);
      }
    } finally {
      setCarregando(false);
    }
  }, [user]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  useEffect(() => {
    definirInicioPlanoIgreja(configuracao?.dataInicioPlanoLeitura ?? null);
  }, [configuracao?.dataInicioPlanoLeitura]);

  const nomeExibicao = useMemo(
    () =>
      configuracao?.nomeFantasia ||
      configuracao?.nome ||
      publica.nomeFantasia ||
      publica.nome ||
      "Igreja",
    [configuracao, publica],
  );

  const subtituloExibicao = useMemo(
    () =>
      configuracao?.subtituloIgreja?.trim() ||
      publica.subtituloIgreja?.trim() ||
      "",
    [configuracao?.subtituloIgreja, publica.subtituloIgreja],
  );

  const logoUrl = useMemo(
    () =>
      resolverUrlLogo(
        configuracao?.logoUrl || publica.logoUrl,
        configuracao?.dataAtualizacao,
      ),
    [configuracao?.logoUrl, configuracao?.dataAtualizacao, publica.logoUrl],
  );

  const valor = useMemo(
    () => ({
      configuracao,
      publica,
      pix,
      carregando,
      recarregar,
      nomeExibicao,
      subtituloExibicao,
      logoUrl,
    }),
    [configuracao, publica, pix, carregando, recarregar, nomeExibicao, subtituloExibicao, logoUrl],
  );

  return <IgrejaContext.Provider value={valor}>{children}</IgrejaContext.Provider>;
}

export function useIgrejaConfiguracao() {
  const ctx = useContext(IgrejaContext);
  if (!ctx) {
    throw new Error("useIgrejaConfiguracao deve ser usado dentro de ProvedorIgreja");
  }
  return ctx;
}
