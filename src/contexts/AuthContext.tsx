import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDefaultRouteForRole, type Role } from "@/auth/permissions";
import { DEMO_CREDENTIALS } from "@/data/demo-credentials";
import { API_ATIVA, limparToken, obterToken, requisicaoApi, salvarToken } from "@/modules/api/client";
import { obterStatusCadastroPorIdentificador, type StatusCadastro } from "@/modules/auth/preCadastro";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: Role;
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

/** Usuários master que não precisam de pré-cadastro na tabela pre_cadastro */
const MASTER_EMAILS = ["admin@semear.com"];

const DEMO_USERS: Array<Usuario & { password: string }> = DEMO_CREDENTIALS.map(
  (credential, index) => ({
    id: String(index + 1),
    name: credential.name,
    email: credential.email,
    role: credential.role as Role,
    password: credential.password,
  }),
);

const AuthContext = createContext<ValorContextoAutenticacao | undefined>(undefined);

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
      return JSON.parse(legacyRaw) as Usuario;
    } catch {
      return null;
    }
  }
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Usuario;
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
  return {
    id: String(account.id ?? account.login ?? account.email ?? "0"),
    name: name || account.login || account.email || "Usuario",
    email: account.email || account.login || "",
    role: mapearAutoridadesParaPerfil(account.authorities),
  };
};

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(() => obterUsuarioArmazenado());
  const [carregandoConta, setCarregandoConta] = useState(false);

  const normalizarEmail = (value: string) =>
    value.trim().toLowerCase().replace("@semeare.com", "@semear.com");

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

    const ehMaster = identificadorNormalizado.includes("@")
      ? MASTER_EMAILS.includes(identificadorNormalizado)
      : false;

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
        const identificadorConta = account.email || account.login || identificadorNormalizado;
        const ehMasterPosLogin =
          identificadorConta.includes("@") && MASTER_EMAILS.includes(identificadorConta);
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
        return {
          success: false,
          message:
            error instanceof Error
              ? `${error.message} Se ainda não tem cadastro, faça seu pré-cadastro.`
              : "Falha ao autenticar. Se ainda não tem cadastro, faça seu pré-cadastro.",
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
        message: "Usuário ou senha inválidos. Se ainda não tem cadastro, faça seu pré-cadastro.",
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
