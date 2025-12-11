"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserChampionships } from "@/lib/api";

export function NavBar() {
  const pathname = usePathname();
  const { user, loading, reloadUser } = useAuth();
  const isAdmin =
    typeof user?.is_admin === "boolean" ? user.is_admin : Boolean(user?.is_admin);

  const [hasChampionships, setHasChampionships] = useState<boolean | null>(null);
  const [checkingChamps, setCheckingChamps] = useState(false);

  const tabs = [
    { name: "Campeonatos", href: "/campeonatos" },
    { name: "Predicciones", href: "/predicciones" },
    { name: "Resultados", href: "/resultados" },
    { name: "Ajustes", href: "/ajustes" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  useEffect(() => {
    reloadUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!user?.id) return;
    setCheckingChamps(true);
    getUserChampionships()
      .then((list) => setHasChampionships(list.length > 0))
      .catch(() => setHasChampionships(false))
      .finally(() => setCheckingChamps(false));
  }, [user?.id]);

  const isTabDisabled = (href: string) => {
    if (checkingChamps) return false; // no bloqueo mientras carga
    if (hasChampionships === false && (href === "/predicciones" || href === "/resultados")) {
      return true;
    }
    return false;
  };

  return (
    <header className="mb-8">
        <nav className="flex items-center justify-between gap-4 rounded-3xl bg-primary text-white px-0 py-0 shadow-md">


          <div className="hidden md:flex flex-1 items-center gap-2 justify-between rounded-full bg-primary px-0 py-0">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href);
              const disabled = isTabDisabled(tab.href);
              const commonClasses =
                "rounded-full px-4 md:px-6 lg:px-14 xl:px-20 2xl:px-30 py-4 font-league transition-colors";

              if (disabled) {
                return (
                  <span
                    key={tab.href}
                    className={clsx(
                      commonClasses,
                      "text-white/60 cursor-not-allowed select-none bg-primary/70"
                    )}
                    title="Únete a un campeonato para acceder"
                  >
                    {tab.name}
                  </span>
                );
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={clsx(
                    commonClasses,
                    active
                      ? "bg-primary-hover text-white shadow-sm"
                      : "text-white hover:bg-primary-hover hover:text-white"
                  )}
                >
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {!loading && (
            <div className="flex shrink-0 items-center gap-3 rounded-full bg-primary pl-6 pr-3 py-2">
              <div className="hidden sm:flex flex-col leading-tight text-right w-[150px]">
                <span className="font-league flex items-center justify-end gap-2 truncate">
                  <span className="truncate">{user?.name ?? "Invitado"}</span>
                  {user?.country && <span className="flex-shrink-0">{user.country}</span>}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white text-primary font-league">
                {user?.profile_pic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_pic}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (user?.name ?? "U").slice(0, 2).toUpperCase()
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Tabs móviles */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const disabled = isTabDisabled(tab.href);
            const baseClasses =
              "whitespace-nowrap rounded-full px-3 py-2 text-xs font-league";

            if (disabled) {
              return (
                <span
                  key={tab.href}
                  className={clsx(
                    baseClasses,
                    "border border-primary/40 bg-white text-primary/50 cursor-not-allowed select-none"
                  )}
                  title="Únete a un campeonato para acceder"
                >
                  {tab.name}
                </span>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  baseClasses,
                  active
                    ? "bg-primary text-white"
                    : "border border-primary bg-white text-primary"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
      </div>
    </header>
  );
}
