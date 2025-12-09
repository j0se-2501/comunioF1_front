"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { name: "Campeonatos", href: "/campeonatos" },
  { name: "Predicciones", href: "/predicciones" },
  { name: "Resultados", href: "/resultados" },
  { name: "Ajustes", href: "/ajustes" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="mb-6">
      <nav className="flex items-center justify-between gap-4 rounded-2xl bg-primary text-white px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary font-league text-lg">
            F
          </span>
          <span className="font-league text-lg tracking-wide hidden sm:inline">
            Formula Comunio
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  "rounded-full px-3 py-1 text-sm font-league transition-colors",
                  active
                    ? "bg-white text-primary"
                    : "text-white/80 hover:bg-primaryHover"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col leading-tight text-right">
            <span className="text-xs text-white/70">Conectado como</span>
            <span className="text-sm font-league">Usuario Demo</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary font-league text-sm">
            U
          </div>
        </div>
      </nav>

      {/* Tabs móviles */}
      <div className="mt-3 flex md:hidden gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "whitespace-nowrap rounded-full px-3 py-1 text-xs font-league",
                active
                  ? "bg-primary text-white"
                  : "bg-white text-primary border border-primary"
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
