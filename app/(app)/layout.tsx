"use client";

import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";
import { ProtectedBoundary } from "@/components/ProtectedBoundary";

// layout.tsx
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-aqua">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
        <img
          src="/icons/logo.png"
          alt="Formula Comunio"
          className="max-w-3xl w-[15vw] object-contain"
        />
      </div>
      <ProtectedBoundary>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-8xl flex-col px-4 py-3 sm:px-6 sm:py-4">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </ProtectedBoundary>
    </div>
  );
}

