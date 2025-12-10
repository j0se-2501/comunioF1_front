"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const tabs = [
  { name: "Campeonatos", href: "/campeonatos" },
  { name: "Predicciones", href: "/predicciones" },
  { name: "Resultados", href: "/resultados" },
  { name: "Ajustes", href: "/ajustes" },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, loading, reloadUser } = useAuth();

  useEffect(() => {
    reloadUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <header className="mb-8">
      <nav className="flex items-center justify-between gap-4 rounded-3xl bg-primary text-white px-0 py-0 shadow-md">
        

        <div className="hidden md:flex flex-1 items-center gap-2 justify-between rounded-full bg-primary px-0 py-0">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "rounded-full px-20 py-4 font-league transition-colors",
                  active
                    ? "bg-primary-hover text-white shadow-sm"
                    : "text-white hover:bg-primary/60"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>

        {!loading && (
          <div className="flex shrink-0 items-center gap-3 rounded-full bg-primary pl-6 pr-3 py-2">
            <div className="hidden sm:flex flex-col leading-tight text-right max-w-[150px]">
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
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "whitespace-nowrap rounded-full px-3 py-2 text-xs font-league",
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
