"use client";

import { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-aqua">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
        <NavBar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
