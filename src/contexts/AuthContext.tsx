import { createContext, useContext, useMemo, useState } from "react";
import { getDefaultRouteForRole, type Role } from "@/auth/permissions";
import { DEMO_CREDENTIALS } from "@/data/demo-credentials";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type LoginResult = {
  success: boolean;
  message?: string;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  defaultRoute: string;
};

const STORAGE_KEY = "semeare.auth";

const DEMO_USERS: Array<User & { password: string }> = DEMO_CREDENTIALS.map(
  (credential, index) => ({
    id: String(index + 1),
    name: credential.name,
    email: credential.email,
    role: credential.role as Role,
    password: credential.password,
  }),
);

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const match = DEMO_USERS.find(
      (candidate) =>
        candidate.email.toLowerCase() === email.toLowerCase() &&
        candidate.password === password,
    );

    if (!match) {
      return {
        success: false,
        message: "Usuário ou senha inválidos.",
      };
    }

    const { password: _password, ...safeUser } = match;
    setUser(safeUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }
  return context;
}
