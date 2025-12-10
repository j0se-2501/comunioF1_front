"use client";

import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { ProtectedBoundary } from "@/components/ProtectedBoundary";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-aqua">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/logo.png"
          alt="Formula Comunio"
          className="max-w-3xl w-[15vw] object-contain"
        />
      </div>
      <ProtectedBoundary>
        <div className="mx-auto flex min-h-screen max-w-8xl flex-col px-6 py-4 relative z-10">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </ProtectedBoundary>
    </div>
  );
}
