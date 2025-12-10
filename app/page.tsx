"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);

    const ok = await login(email.trim().toLowerCase(), password); // AuthController espera email

    setSubmitting(false);

    if (ok) {
      router.push("/campeonatos");
    } else {
      setLocalError("Email o contraseña incorrectos.");
    }
  }

  function handleGoRegister() {
    router.push("/register");
  }

  const errorMessage = localError || authError;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-0 text-primary">
      {/* Logo */}
      <div className="flex flex-col items-center mb-4 sm:mb-0">
        <div className="relative h-60 w-[460px] sm:h-72 sm:w-[600px] lg:h-120 lg:w-[700px]">
          <Image
            src="/icons/logo.png"
            alt="Formula Comunio"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="font-league text-base text-primary">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 rounded-none border border-gray-400 bg-white px-2 text-sm font-roboto text-black shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-league text-base text-primary">
            Contraseña:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 rounded-none border border-gray-400 bg-white px-2 text-sm font-roboto text-black shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {errorMessage && (
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
        )}

        <div className="mt-4 flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="min-w-[220px]"
          >
            {submitting ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </div>
      </form>

      {/* Registro */}
      <div className="mt-6 flex flex-col items-center gap-4 sm:gap-0 xl:gap-0">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="min-w-[220px]"
          onClick={handleGoRegister}
        >
          Registrarse
        </Button>
      </div>
    </div>
  );
}
