import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "semear_sidebar_aberta";

type Ctx = {
  aberta: boolean;
  setAberta: (v: boolean) => void;
  alternar: () => void;
};

const SidebarLayoutContext = createContext<Ctx | null>(null);

function lerInicial(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === null) return true;
    return v === "1";
  } catch {
    return true;
  }
}

export function ProvedorSidebarLayout({ children }: { children: ReactNode }) {
  const [aberta, setAbertaState] = useState(lerInicial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, aberta ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [aberta]);

  const setAberta = useCallback((v: boolean) => setAbertaState(v), []);
  const alternar = useCallback(() => setAbertaState((a) => !a), []);

  const value = useMemo(() => ({ aberta, setAberta, alternar }), [aberta, setAberta, alternar]);

  return <SidebarLayoutContext.Provider value={value}>{children}</SidebarLayoutContext.Provider>;
}

export function useSidebarLayout() {
  const ctx = useContext(SidebarLayoutContext);
  if (!ctx) {
    throw new Error("useSidebarLayout deve ser usado dentro de ProvedorSidebarLayout");
  }
  return ctx;
}
