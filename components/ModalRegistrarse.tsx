"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { ModalBanderas } from "@/components/ModalBanderas";
import { ModalProfilePicture } from "@/components/ModalProfilePicture";
import { register as apiRegister } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface ModalRegistrarseProps {
  open: boolean;
  onClose: () => void;
  onRegistered?: () => void;
}

export function ModalRegistrarse({
  open,
  onClose,
  onRegistered,
}: ModalRegistrarseProps) {
  const router = useRouter();
  const { reloadUser } = useAuth();
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [regCountry, setRegCountry] = useState("");
  const [regProfilePic, setRegProfilePic] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showProfilePicker, setShowProfilePicker] = useState(false);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <h2 className="text-xl font-league text-primary mb-4">Crear cuenta</h2>
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setRegError(null);
            setRegLoading(true);
            try {
              await apiRegister({
                name: regName,
                email: regEmail.trim().toLowerCase(),
                password: regPass,
                password_confirmation: regPass2,
                country: regCountry || undefined,
                profile_pic: regProfilePic || undefined,
              });
              await reloadUser(); // backend hace autologin, refrescamos contexto
              router.push("/campeonatos");
              onClose();
              onRegistered?.();
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : "Error al registrar";
              setRegError(message);
            } finally {
              setRegLoading(false);
            }
          }}
        >
          <label className="text-sm font-roboto text-primary">
            Nombre
            <input
              className="mt-1 w-full border border-gray-300 px-2 py-2 text-sm"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-roboto text-primary">
            Email
            <input
              type="email"
              className="mt-1 w-full border border-gray-300 px-2 py-2 text-sm"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
          </label>
          <div className="text-sm font-roboto text-primary">
            Pais (emoji bandera)
            <button
              type="button"
              onClick={() => setShowCountryPicker(true)}
              className="mt-1 w-full border border-gray-300 px-2 py-2 text-left text-sm bg-white hover:border-primary"
            >
              {regCountry || "Elegir pais"}
            </button>
          </div>
          <div className="text-sm font-roboto text-primary">
            Icono de perfil
            <button
              type="button"
              onClick={() => setShowProfilePicker(true)}
              className="mt-1 w-full border border-gray-300 px-2 py-2 text-left text-sm bg-white hover:border-primary"
            >
              {regProfilePic ? "Icono seleccionado" : "Elegir icono"}
            </button>
          </div>
          <label className="text-sm font-roboto text-primary">
            Contraseña
            <input
              type="password"
              className="mt-1 w-full border border-gray-300 px-2 py-2 text-sm"
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <label className="text-sm font-roboto text-primary">
            Confirmar contraseña
            <input
              type="password"
              className="mt-1 w-full border border-gray-300 px-2 py-2 text-sm"
              value={regPass2}
              onChange={(e) => setRegPass2(e.target.value)}
              required
              minLength={6}
            />
          </label>
          {regError && <p className="text-sm text-red-700">{regError}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={regLoading}>
              {regLoading ? "Creando..." : "Crear cuenta"}
            </Button>
          </div>
        </form>
      </Modal>

      <ModalBanderas
        open={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(flag) => setRegCountry(flag)}
      />
      <ModalProfilePicture
        open={showProfilePicker}
        onClose={() => setShowProfilePicker(false)}
        onSelect={(url) => setRegProfilePic(url)}
      />
    </>
  );
}
