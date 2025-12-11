"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AdminBoundary({ children }: { children: ReactNode }) {
  const { user, loading, reloadUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    reloadUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isAdmin =
      typeof user?.is_admin === "boolean"
        ? user?.is_admin
        : Boolean(user?.is_admin);
    if (!loading && (!user || !isAdmin)) {
      router.push("/campeonatos");
    }
  }, [loading, user, router]);

  if (loading) {
    return null;
  }

  const isAdmin =
    typeof user?.is_admin === "boolean" ? user.is_admin : Boolean(user?.is_admin);

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
