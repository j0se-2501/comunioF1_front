"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { ModalBanderas } from "@/components/ModalBanderas";
import { ModalProfilePicture } from "@/components/ModalProfilePicture";
import { useAuth } from "@/context/AuthContext";
import { changePassword, updateUserSettings } from "@/lib/api";

export default function AjustesPage() {
  const { user, reloadUser, logout } = useAuth();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const [showFlags, setShowFlags] = useState(false);
  const [showHelmets, setShowHelmets] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
    setCountry(user?.country ?? "");
    setProfilePic(user?.profile_pic ?? "");
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setSavingProfile(true);
    try {
      await updateUserSettings({
        name,
        country: country || undefined,
        profile_pic: profilePic || undefined,
      });
      await reloadUser();
      setProfileMessage("Ajustes guardados");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassError(null);
    setPassMessage(null);

    if (newPassword !== newPassword2) {
      setPassError("Las contraseñas no coinciden");
      return;
    }

    setSavingPass(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword2,
      });
      setPassMessage("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al cambiar la contraseña";
      setPassError(msg);
    } finally {
      setSavingPass(false);
    }
  }

  return (
    <div className="w-full text-primary">
      <h1 className="my-6 sm:my-10 text-center text-xl sm:text-2xl font-league uppercase tracking-wide">
        Ajustes de usuario
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:gap-80 2xl:gap-120 lg:grid-cols-2">
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl bg-white/70 p-4 sm:p-6 shadow-sm backdrop-blur"
        >
          <h2 className="mb-4 text-lg sm:text-xl font-league">Perfil</h2>
          <label className="mb-3 block text-sm font-roboto">
            Nombre de usuario
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </label>

          <div className="mb-3 text-sm font-roboto">
            Icono de perfil
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-full bg-white shadow mx-auto sm:mx-0">
                {profilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePic} alt="Icono" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-primary/60">
                    Ninguno
                  </div>
                )}
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowHelmets(true)}>
                Elegir icono
              </Button>
            </div>
          </div>

          <div className="mb-4 text-sm font-roboto">
            Bandera
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded bg-white shadow text-lg mx-auto sm:mx-0">
                {country || "-"}
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowFlags(true)}>
                Elegir país
              </Button>
            </div>
          </div>

          {profileError && <p className="text-sm text-red-700">{profileError}</p>}
          {profileMessage && <p className="text-sm text-green-700">{profileMessage}</p>}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button type="submit" disabled={savingProfile} className="w-full sm:w-auto min-w-[180px]">
              {savingProfile ? "Guardando..." : "Guardar ajustes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto min-w-[180px]"
              onClick={() => {
                setName(user?.name ?? "");
                setCountry(user?.country ?? "");
                setProfilePic(user?.profile_pic ?? "");
                setProfileMessage(null);
                setProfileError(null);
              }}
            >
              Deshacer cambios
            </Button>
          </div>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl bg-white/70 p-4 sm:p-6 shadow-sm backdrop-blur"
        >
          <h2 className="mb-4 text-lg sm:text-xl font-league">Cambiar contraseña</h2>

          <label className="mb-3 block text-sm font-roboto">
            Contraseña actual
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </label>
          <label className="mb-3 block text-sm font-roboto">
            Nueva contraseña
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
          </label>
          <label className="mb-3 block text-sm font-roboto">
            Confirmar nueva contraseña
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={6}
            />
          </label>

          {passError && <p className="text-sm text-red-700">{passError}</p>}
          {passMessage && <p className="text-sm text-green-700">{passMessage}</p>}

          <div className="mt-6">
            <Button type="submit" disabled={savingPass} className="w-full sm:w-auto min-w-[200px]">
              {savingPass ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 sm:mt-10 flex justify-center">
        <Button variant="primary" onClick={logout} className="w-full sm:w-auto min-w-[200px]">
          Cerrar sesión
        </Button>
      </div>

      <ModalBanderas
        open={showFlags}
        onClose={() => setShowFlags(false)}
        onSelect={(flag) => setCountry(flag)}
      />
      <ModalProfilePicture
        open={showHelmets}
        onClose={() => setShowHelmets(false)}
        onSelect={(url) => setProfilePic(url)}
      />
    </div>
  );
}
