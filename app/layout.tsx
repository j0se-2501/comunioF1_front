import "./globals.css";
import { ReactNode } from "react";
import { League_Spartan, Roboto } from "next/font/google";
import { NavBar } from "@/components/NavBar";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "Formula Comunio",
  description: "Gestión de campeonatos, predicciones y resultados",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${leagueSpartan.variable} ${roboto.variable} bg-aqua min-h-screen`}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <NavBar />
          {children}
        </div>
      </body>
    </html>
  );
}
