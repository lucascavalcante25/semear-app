import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getDefaultRouteForRole,
  ROLE_ALLOWED_MODULES,
  type ModuleKey,
  type Role,
} from "@/auth/permissions";
import { DEMO_CREDENTIALS } from "@/data/demo-credentials";
import { API_ATIVA, limparToken, obterToken, requisicaoApi, salvarToken } from "@/modules/api/client";
import { obterStatusCadastroPorIdentificador, type StatusCadastro } from "@/modules/auth/preCadastro";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: Role;
  modules: ModuleKey[];
};

type ResultadoLogin = {
  success: boolean;
  message?: string;
};

type ValorContextoAutenticacao = {
  user: Usuario | null;
  login: (identificador: string, password: string) => Promise<ResultadoLogin>;
  logout: () => void;
  defaultRoute: string;
};

const CHAVE_STORAGE_USUARIO = "semear.usuario";
const CHAVE_STORAGE_LEGACY = "semear.autenticacao";

/** Usuários master que não precisam de pré-cadastro na tabela pre_cadastro (login = CPF) */
const MASTER_CPFS = ["11111111111"];

const DEMO_USERS: Array<Usuario & { password: string }> = DEMO_CREDENTIALS.map(
  (credential, index) => ({
    id: String(index + 1),
    name: credential.name,
    email: credential.email,
    role: credential.role as Role,
    password: credential.password,
    modules:
      (credential.modules as ModuleKey[] | undefined) ??
      ROLE_ALLOWED_MODULES[(credential.role as Role) ?? "membro"] ??
      [],
  }),
);

const AuthContext = createContext<ValorContextoAutenticacao | undefined>(undefined);

const normalizarUsuario = (user: Partial<Usuario> | null): Usuario | null => {
  if (!user?.role) return null;
  const role = user.role as Role;
  const modules =
    Array.isArray((user as any).modules) && (user as any).modules.length > 0
      ? ((user as any).modules as ModuleKey[])
      : ROLE_ALLOWED_MODULES[role] ?? [];
  return {
    id: String(user.id ?? "0"),
    name: String(user.name ?? "Usuario"),
    email: String(user.email ?? ""),
    role,
    modules,
  };
};

const obterUsuarioArmazenado = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CHAVE_STORAGE_USUARIO);
  if (!raw) {
    const legacyRaw = window.localStorage.getItem(CHAVE_STORAGE_LEGACY);
    if (!legacyRaw) {
      return null;
    }
    try {
      return normalizarUsuario(JSON.parse(legacyRaw) as Partial<Usuario>);
    } catch {
      return null;
    }
  }
  if (!raw) {
    return null;
  }

  try {
    return normalizarUsuario(JSON.parse(raw) as Partial<Usuario>);
  } catch {
    return null;
  }
};

const salvarUsuario = (user: Usuario | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!user) {
    window.localStorage.removeItem(CHAVE_STORAGE_USUARIO);
    window.localStorage.removeItem(CHAVE_STORAGE_LEGACY);
    return;
  }
  window.localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(user));
  window.localStorage.removeItem(CHAVE_STORAGE_LEGACY);
};

type RespostaConta = {
  id?: number | string;
  login?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  authorities?: string[];
  modules?: string[];
};

const mapearAutoridadesParaPerfil = (authorities: string[] = []): Role => {
  const roleMap: Record<string, Role> = {
    ROLE_ADMIN: "admin",
    ROLE_PASTOR: "pastor",
    ROLE_SECRETARIA: "secretaria",
    ROLE_TESOURARIA: "tesouraria",
    ROLE_LIDER: "lider",
    ROLE_MEMBRO: "membro",
    ROLE_VISITANTE: "visitante",
  };
  const match = authorities.find((authority) => roleMap[authority]);
  return match ? roleMap[match] : "membro";
};

const mapearContaParaUsuario = (account: RespostaConta): Usuario => {
  const name = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
  const role = mapearAutoridadesParaPerfil(account.authorities);
  const modulesFromApi = Array.isArray(account.modules) ? (account.modules as string[]) : [];
  const modules = modulesFromApi
    .map((m) => m as ModuleKey)
    .filter((m) => (ROLE_ALLOWED_MODULES[role] ?? []).includes(m));
  return {
    id: String(account.id ?? account.login ?? account.email ?? "0"),
    name: name || account.login || account.email || "Usuario",
    email: account.email || account.login || "",
    role,
    modules: modules.length > 0 ? modules : (ROLE_ALLOWED_MODULES[role] ?? []),
  };
};

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => obterUsuarioArmazenado());
  const [carregandoConta, setCarregandoConta] = useState(false);

  const normalizarEmail = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace("@semeare.com", "@semear.com")
      .replace("@semear.com.br", "@semear.com");

  const normalizarCpf = (value: string) => value.replace(/\D/g, "");

  const normalizarIdentificador = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.includes("@")) {
      return normalizarEmail(trimmed);
    }
    return normalizarCpf(trimmed);
  };

  const obterMensagemBloqueio = (status: StatusCadastro) => {
    if (status === "REJEITADO") {
      return "Seu cadastro foi rejeitado. Procure a secretaria da igreja.";
    }
    return "Seu cadastro está pendente de aprovação do administrador da igreja.";
  };

  useEffect(() => {
    if (!API_ATIVA || user || carregandoConta) {
      return;
    }
    const token = obterToken();
    if (!token) {
      return;
    }
    const fetchAccount = async () => {
      try {
        setCarregandoConta(true);
        const account = await requisicaoApi<RespostaConta>("/api/account", { auth: true });
        const mapped = mapearContaParaUsuario(account);
        setUser(mapped);
        salvarUsuario(mapped);
      } catch {
        limparToken();
        setUser(null);
        salvarUsuario(null);
      } finally {
        setCarregandoConta(false);
      }
    };
    void fetchAccount();
  }, [user, carregandoConta]);

  const login = async (identificador: string, password: string): Promise<ResultadoLogin> => {
    const identificadorNormalizado = normalizarIdentificador(identificador);

    const ehMaster = !identificadorNormalizado.includes("@") && MASTER_CPFS.includes(identificadorNormalizado);

    if (!ehMaster) {
      const statusCadastro = await obterStatusCadastroPorIdentificador(identificadorNormalizado);
      if (statusCadastro && statusCadastro !== "APROVADO") {
        return { success: false, message: obterMensagemBloqueio(statusCadastro) };
      }
    }

    if (API_ATIVA) {
      try {
        const authResponse = await requisicaoApi<{ id_token?: string; token?: string }>(
          "/api/authenticate",
          {
            method: "POST",
            body: JSON.stringify({
              username: identificadorNormalizado,
              password,
              rememberMe: true,
            }),
          },
        );
        const token = authResponse?.id_token || authResponse?.token;
        if (!token) {
          return { success: false, message: "Falha ao autenticar." };
        }
        salvarToken(token);
        const account = await requisicaoApi<RespostaConta>("/api/account", { auth: true });
        const identificadorConta = account.login || account.email || identificadorNormalizado;
        const ehMasterPosLogin =
          !identificadorConta.includes("@") && MASTER_CPFS.includes(normalizarCpf(identificadorConta));
        if (!ehMasterPosLogin) {
          const statusPosLogin = await obterStatusCadastroPorIdentificador(identificadorConta);
          if (statusPosLogin && statusPosLogin !== "APROVADO") {
            limparToken();
            return { success: false, message: obterMensagemBloqueio(statusPosLogin) };
          }
        }
        const mapped = mapearContaParaUsuario(account);
        setUser(mapped);
        salvarUsuario(mapped);
        return { success: true };
      } catch (error) {
        limparToken();
        const msg = error instanceof Error ? error.message : "";
        const is401 =
          msg.includes("401") ||
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("error.http");
        return {
          success: false,
          message: is401
            ? "CPF ou senha incorretos. Verifique e tente novamente. Se ainda não tem cadastro, faça seu pré-cadastro."
            : msg || "Falha ao autenticar. Se ainda não tem cadastro, faça seu pré-cadastro.",
        };
      }
    }

    const match = DEMO_USERS.find(
      (candidate) =>
        candidate.email.toLowerCase() === identificadorNormalizado &&
        candidate.password === password,
    );

    if (!match) {
      return {
        success: false,
        message:
          "CPF ou senha incorretos. Verifique e tente novamente. Se ainda não tem cadastro, faça seu pré-cadastro.",
      };
    }

    const { password: _password, ...safeUser } = match;
    setUser(safeUser);
    salvarUsuario(safeUser);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    salvarUsuario(null);
    limparToken();
  };

  const defaultRoute = useMemo(() => {
    return user ? getDefaultRouteForRole(user.role) : "/";
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      defaultRoute,
    }),
    [user, defaultRoute],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function usarAutenticacao() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("usarAutenticacao deve ser usado dentro de ProvedorAutenticacao.");
  }
  return context;
}
