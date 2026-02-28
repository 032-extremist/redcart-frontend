import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { AuthUser } from "../types";
import { storage } from "../utils/storage";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(storage.getUser<AuthUser>());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((me) => {
        const normalizedUser = {
          id: me.id,
          email: me.email,
          firstName: me.firstName,
          lastName: me.lastName,
          role: me.role,
        };
        setUser(normalizedUser);
        storage.setUser(normalizedUser);
        if (me.csrfToken) {
          storage.setCsrfToken(me.csrfToken);
        }
      })
      .catch(() => {
        storage.clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    const response = await authApi.login(payload);
    storage.setToken(response.token);
    storage.setCsrfToken(response.csrfToken);
    storage.setUser(response.user);
    setUser(response.user);
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    const response = await authApi.register(payload);
    storage.setToken(response.token);
    storage.setCsrfToken(response.csrfToken);
    storage.setUser(response.user);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // local cleanup still happens
    } finally {
      storage.clearAuth();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
