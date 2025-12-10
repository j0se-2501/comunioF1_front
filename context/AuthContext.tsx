"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as apiLogin, logout as apiLogout } from "@/lib/api";
import type { User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // arranca cargando
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // Cargar usuario al inicio (si la cookie Sanctum ya existe)
  // ============================================================
  useEffect(() => {
    loadUserOnStart();
  }, []);

  async function loadUserOnStart() {
    try {
      setLoading(true);
      const data = await getMe(); // GET /api/me con cookies
      setUser(data);
    } catch {
      // no logueado o sesión expirada → no pasa nada
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOGIN
  // ============================================================
  async function login(email: string, password: string): Promise<boolean> {
  try {
    setError(null);
    await apiLogin(email, password); // POST /api/login + cookies
    await reloadUser();
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("Error desconocido al iniciar sesión");
    }
    return false;
  }
}


  // ============================================================
  // LOGOUT
  // ============================================================
  async function logout() {
    await apiLogout(); // POST /api/logout + borra cookies
    setUser(null);
  }

  // ============================================================
  // Reload user (cuando guardan ajustes por ej.)
  // ============================================================
  async function reloadUser() {
    try {
      const data = await getMe();
      setUser(data);
    } catch {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        reloadUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

//
// ============================================================
// Hook para acceder al contexto
// ============================================================
//
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
