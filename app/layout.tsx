import "./globals.css";
import { ReactNode } from "react";
import { League_Spartan, Roboto } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${leagueSpartan.variable} ${roboto.variable} bg-aqua min-h-screen`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 flex items-center justify-center px-4 py-10">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
