"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ProtectedBoundary({ children }: { children: ReactNode }) {
  const { user, loading, reloadUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Intentar cargar el user al montar (por si el AuthProvider aún no lo hizo)
    reloadUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return null; // o un spinner ligero si prefieres
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
