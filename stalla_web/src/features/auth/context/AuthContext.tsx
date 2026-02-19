import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { setUnauthorizedHandler } from "../../../core/api";
import { clearSession, getToken, getUser } from "../../../core/storage";
import type { AuthUser } from "../../../core/types";
import { login, registerAdmin as registerAdminRequest } from "../services/authService";

interface ActionResult {
  ok: boolean;
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAdmin: (identifier: string, password: string) => Promise<ActionResult>;
  registerAdmin: (name: string, email: string, password: string) => Promise<ActionResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  return getToken() ? getUser() : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Drop the in-memory session as soon as the API rejects the token.
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const loginAdmin = useCallback(async (identifier: string, password: string): Promise<ActionResult> => {
    const response = await login({ identifier, password });
    if (!response.success) return { ok: false, message: response.message };
    if (response.data.user.role !== "ADMIN") {
      logout();
      return { ok: false, message: "Accès refusé: compte non administrateur." };
    }
    setUser(response.data.user);
    return { ok: true, message: response.message };
  }, [logout]);

  const registerAdmin = useCallback(async (name: string, email: string, password: string): Promise<ActionResult> => {
    const response = await registerAdminRequest({ name, email, password });
    return { ok: response.success, message: response.message };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "ADMIN",
      loginAdmin,
      registerAdmin,
      logout,
    }),
    [user, loginAdmin, registerAdmin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
