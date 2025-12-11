"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  getUserChampionships,
  getChampionshipActiveMembers,
  getChampionshipBannedMembers,
  getChampionshipScoring,
  type Championship as ApiChampionship,
  banChampionshipUser,
  unbanChampionshipUser,
  updateChampionshipScoring,
  updateChampionshipName,
  joinChampionship,
  createChampionship,
  leaveChampionship,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Scoring = {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  p5: number;
  p6: number;
  pole: number;
  fastLap: number;
  last: number;
};

type ChampionshipMember = {
  id: number;
  name: string;
  country?: string;
  profile_pic?: string;
  is_banned?: boolean;
  pivot?: {
    is_banned?: boolean | number;
  };
};

type Championship = {
  id: number;
  name: string;
  code?: string;
  season_id?: number;
  members: ChampionshipMember[];
  bannedMembers: ChampionshipMember[];
  scoring: Scoring;
  isAdmin: boolean;
};

type ApiChampionshipWithExtras = ApiChampionship & {
  invitation_code?: string;
  is_admin?: boolean | number;
  admin_id?: number;
  scoring?: Scoring;
};

const defaultScoring: Scoring = {
  p1: 10,
  p2: 6,
  p3: 4,
  p4: 3,
  p5: 2,
  p6: 1,
  pole: 3,
  fastLap: 1,
  last: 3,
};

export default function CampeonatosPage() {
  const { user } = useAuth();
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    reloadChampionships();
  }, [user?.id]);

  async function reloadChampionships() {
    try {
      setLoading(true);
      const data =
        (await getUserChampionships()) as ApiChampionshipWithExtras[];
      const mapped: Championship[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.invitation_code ?? (c as { code?: string }).code ?? "",
        season_id: c.season_id,
        isAdmin: Boolean(c.is_admin) || c.admin_id === user?.id,
        members: [],
        bannedMembers: [],
        scoring: c.scoring ?? defaultScoring,
      }));
      setChampionships(mapped);
      setSelectedId((prev) => prev ?? mapped[0]?.id ?? null);
      setError(null);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los campeonatos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const selected = useMemo(
    () => championships.find((c) => c.id === selectedId) ?? null,
    [championships, selectedId]
  );

  useEffect(() => {
    async function loadMembers() {
      if (!selectedId) return;
      try {
        const [activeRaw, bannedRaw, scoringRaw] = await Promise.all([
          getChampionshipActiveMembers(selectedId),
          getChampionshipBannedMembers(selectedId),
          getChampionshipScoring(selectedId),
        ]);

        const normalize = (list: ChampionshipMember[]) =>
          list.map((m) => ({
            ...m,
            is_banned:
              typeof m.is_banned !== "undefined"
                ? Boolean(m.is_banned)
                : Boolean((m as ChampionshipMember).pivot?.is_banned),
          }));

        const active = normalize(activeRaw);
        const banned = normalize(bannedRaw);

        const scoringData: Scoring = scoringRaw
          ? {
              p1: scoringRaw.points_p1 ?? defaultScoring.p1,
              p2: scoringRaw.points_p2 ?? defaultScoring.p2,
              p3: scoringRaw.points_p3 ?? defaultScoring.p3,
              p4: scoringRaw.points_p4 ?? defaultScoring.p4,
              p5: scoringRaw.points_p5 ?? defaultScoring.p5,
              p6: scoringRaw.points_p6 ?? defaultScoring.p6,
              pole: scoringRaw.points_pole ?? defaultScoring.pole,
              fastLap: scoringRaw.points_fastest_lap ?? defaultScoring.fastLap,
              last: scoringRaw.points_last_place ?? defaultScoring.last,
            }
          : defaultScoring;

        setChampionships((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? { ...c, members: active, bannedMembers: banned, scoring: scoringData }
              : c
          )
        );
      } catch (err) {
        console.error("No se pudieron cargar los miembros", err);
      }
    }
    loadMembers();
  }, [selectedId, refreshToken]);

  return (
    <div className="relative w-full text-primary">
      <div
        className="
          relative z-10 grid w-full
          grid-cols-1 gap-8 md:gap-10
          lg:grid-cols-12
          mt-8
        "
      >
        {/* Columna 1: Mis campeonatos */}
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-lg font-league uppercase tracking-wide">
            Mis campeonatos:
          </h2>
          {loading && (
            <p className="text-sm text-primary/80">Cargando...</p>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
          {!loading && !error && (
            <div className="flex flex-col gap-3">
              {championships.map((c) => {
                const isActive = c.id === selected?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full cursor-pointer rounded-3xl px-4 py-3 text-left font-league text-base shadow-sm transition-transform ${
                      isActive
                        ? "bg-primary-hover text-white hover:scale-[1.02]"
                        : "bg-primary text-white/90 hover:bg-primary hover:scale-[1.02]"
                    }`}
                  >
                    {c.name}
                    {c.isAdmin ? " (Admin)" : ""}
                  </button>
                );
              })}
              {championships.length < 5 && (
                <Button
                  variant="secondary"
                  className="w-full cursor-pointer rounded-3xl py-3 font-league transition-transform hover:scale-[1.02] hover:bg-white hover:text-primary"
                  onClick={() => {
                    setJoinCode("");
                    setJoinError(null);
                    setShowAddModal(true);
                  }}
                >
                  + Añadir nuevo campeonato
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Columnas 2 y 3: panel del campeonato */}
        {selected && (
          <ChampionshipPanel
            key={selected.id}
            championship={selected}
            onRefresh={() => setRefreshToken((t) => t + 1)}
            onUpdateChampionship={(champId, patch) =>
              setChampionships((prev) =>
                prev.map((c) =>
                  c.id === champId ? { ...c, ...patch } : c
                )
              )
            }
            onToast={(msg) => setToast(msg)}
            currentUserId={user?.id}
            onLeft={async (leftId) => {
              await reloadChampionships();
              setSelectedId((prev) =>
                prev === leftId
                  ? championships.find((c) => c.id !== leftId)?.id ?? null
                  : prev
              );
            }}
          />
        )}
      </div>
      {toast && (
        <div className="fixed left-1/2 top-6 z-30 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-sm font-roboto text-white shadow-lg">
          {toast}
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-league uppercase tracking-wide text-primary">
                Añadir campeonato
              </h4>
              <button
                className="text-sm cursor-pointer font-semibold text-primary"
                onClick={() => setShowAddModal(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="space-y-3">
              <Button
                className="cursor-pointer w-full rounded-xl px-4 py-3 font-league"
                disabled={createLoading}
                onClick={async () => {
                  setCreateLoading(true);
                  setCreateError(null);
                  try {
                    const defaultName = "Nuevo campeonato";
                    const seasonId =
                      championships[0]?.season_id ??
                      championships.find((c) => c.season_id)?.season_id ??
                      1;
                    const res = await createChampionship({
                      name: defaultName,
                      season_id: seasonId!,
                    });
                    setToast("Campeonato creado.");
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("championships:refresh"));
                    }
                    await reloadChampionships();
                    if (res?.championship?.id) {
                      setSelectedId(res.championship.id);
                    }
                    setShowAddModal(false);
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : "No se pudo crear el campeonato";
                    setCreateError(msg);
                  } finally {
                    setCreateLoading(false);
                  }
                }}
              >
                {createLoading ? "Creando..." : "Crear campeonato"}
              </Button>
              {createError && (
                <p className="text-xs text-red-600">{createError}</p>
              )}
              <div className="rounded-xl border border-primary/20 p-3 space-y-2">
                <p className="text-sm cursor-pointer font-league text-primary uppercase">
                  Unirse a un campeonato
                </p>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Código de invitación"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {joinError && (
                  <p className="text-xs text-red-600">{joinError}</p>
                )}
                <Button
                  className="w-full rounded-xl px-4 py-3 font-league"
                  disabled={joinLoading || !joinCode}
                  onClick={async () => {
                    setJoinLoading(true);
                    setJoinError(null);
                    try {
                      const res = await joinChampionship(joinCode);
                      setToast("Te has unido al campeonato.");
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("championships:refresh"));
                      }
                      await reloadChampionships();
                      if (res?.championship?.id) {
                        setSelectedId(res.championship.id);
                      }
                      setShowAddModal(false);
                    } catch (err) {
                      const msg =
                        err instanceof Error
                          ? err.message
                          : "No se pudo unir al campeonato";
                      setJoinError(msg);
                    } finally {
                      setJoinLoading(false);
                    }
                  }}
                >
                  {joinLoading ? "Uniendo..." : "Unirse"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChampionshipPanel({
  championship,
  onRefresh,
  onUpdateChampionship,
  onToast,
  currentUserId,
  onLeft,
}: {
  championship: Championship;
  onRefresh: () => void;
  onUpdateChampionship: (
    champId: number,
    patch: Partial<Championship>
  ) => void;
  onToast: (msg: string) => void;
  currentUserId?: number;
  onLeft: (champId: number) => void | Promise<void>;
}) {
  const [name, setName] = useState(championship.name);
  const [scoring, setScoring] = useState<Scoring>(championship.scoring);
  const [showBanned, setShowBanned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actualiza los estados locales cuando cambian los datos del campeonato
  useEffect(() => {
    setName(championship.name);
    setScoring(championship.scoring);
  }, [championship.id, championship.name, championship.scoring]);

  async function handleBan(userId?: number) {
    if (!userId) return;
    if (userId === currentUserId) return; // impedir autoban
    const confirmed = window.confirm(
      "¿Banear a este usuario del campeonato? Podrá añadirse solo si lo desbaneas."
    );
    if (!confirmed) return;
    try {
      await banChampionshipUser(championship.id, userId);
      // refetch lists after ban to ensure consistency
      onRefresh();
    } catch (err) {
      console.error("No se pudo banear al usuario", err);
      alert("No se pudo banear al usuario. Inténtalo de nuevo.");
    }
  }

  async function handleUnban(userId?: number) {
    if (!userId) return;
    const confirmed = window.confirm(
      "¿Desbanear a este usuario? Podrá volver a participar en el campeonato."
    );
    if (!confirmed) return;
    try {
      await unbanChampionshipUser(championship.id, userId);
      onRefresh();
    } catch (err) {
      console.error("No se pudo desbanear al usuario", err);
      alert("No se pudo desbanear al usuario. Inténtalo de nuevo.");
    }
  }

  async function handleSave() {
    if (!championship.isAdmin) return;
    setSaving(true);
    setError(null);
    try {
      const scoringPayload = {
        points_p1: Number(scoring.p1),
        points_p2: Number(scoring.p2),
        points_p3: Number(scoring.p3),
        points_p4: Number(scoring.p4),
        points_p5: Number(scoring.p5),
        points_p6: Number(scoring.p6),
        points_pole: Number(scoring.pole),
        points_fastest_lap: Number(scoring.fastLap),
        points_last_place: Number(scoring.last),
      };
      await Promise.all([
        updateChampionshipName(championship.id, name),
        updateChampionshipScoring(championship.id, scoringPayload),
      ]);
      onUpdateChampionship(championship.id, { name, scoring });
      onToast("Sus cambios se han guardado.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudieron guardar los cambios";
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleLeave() {
    const isAdmin = championship.isAdmin;
    const confirmed = window.confirm(
      isAdmin
        ? "Eres admin: se eliminará el campeonato completo. ¿Continuar?"
        : "¿Seguro que quieres abandonar el campeonato?"
    );
    if (!confirmed) return;
    try {
      await leaveChampionship(championship.id);
      onToast(
        isAdmin
          ? "Campeonato eliminado."
          : "Has abandonado el campeonato."
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("championships:refresh"));
      }
      await onLeft(championship.id);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo abandonar/eliminar el campeonato";
      setError(msg);
      alert(msg);
    }
  }

  return (
    <>
      {/* Columna 2: opciones del campeonato (nombre + miembros) */}
      <section
        className="
          order-2 lg:order-none
          lg:col-span-5
          space-y-6 rounded-2xl bg-white/70 p-4 sm:p-6
          shadow-sm backdrop-blur
        "
      >
        <h3 className="text-lg font-league uppercase tracking-wide text-primary">
          Opciones del campeonato:
        </h3>

        {/* Nombre del campeonato */}
        <div>
          <label className="block text-sm font-roboto text-primary">
            Nombre del campeonato:
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!championship.isAdmin}
              className={`mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary ${
                !championship.isAdmin ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
              }`}
            />
          </label>
        </div>

        {/* Miembros */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-league uppercase tracking-wide text-primary">
              Miembros:
            </h4>
            
          </div>

          <MemberList
            members={championship.members.filter((m) => !m.is_banned)}
            isAdmin={championship.isAdmin}
            onBan={handleBan}
            currentUserId={currentUserId}
          />
          {championship.isAdmin && (
            <Button
              variant="secondary"
              className="rounded-xl cursor-pointer mt-5 px-4 py-2 text-xs sm:text-sm"
              onClick={() => setShowBanned(true)}
            >
              Usuarios baneados
            </Button>
          )}
        </div>
      </section>

      {showBanned && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-league uppercase tracking-wide text-primary">
                Usuarios baneados
              </h4>
              <button
                className="text-sm cursor-pointer font-semibold text-primary"
                onClick={() => setShowBanned(false)}
              >
                Cerrar
              </button>
            </div>
            <MemberList
              members={championship.bannedMembers}
              isAdmin={championship.isAdmin}
              onUnban={handleUnban}
              hideActions={false}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      )}

      {/* Columna 3: sistema de puntuación + código */}
      <section
        className="
          order-3 lg:order-none
          lg:col-span-4
          flex h-full flex-col justify-between
          rounded-2xl bg-white/70 p-4 sm:p-6 shadow-sm backdrop-blur
        "
      >
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-league uppercase tracking-wide text-primary">
              Sistema de puntuación
            </h3>
            <p className="text-xs sm:text-sm font-roboto text-primary">
              Código:{" "}
              <span className="font-league text-base sm:text-lg">
                {championship.code || "¿?"}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-roboto text-primary lg:mt-12">
            {[
              ["1º puesto", "p1"],
              ["2º puesto", "p2"],
              ["3º puesto", "p3"],
              ["4º puesto", "p4"],
              ["5º puesto", "p5"],
              ["6º puesto", "p6"],
              ["Pole", "pole"],
              ["V. rápida", "fastLap"],
              ["Último", "last"],
            ].map(([label, key]) => (
              <label key={key} className="flex items-center gap-2">
                <span className="flex-1">{label}.</span>
                <input
                  type="number"
                  value={scoring[key as keyof Scoring]}
                  disabled={!championship.isAdmin}
                  onChange={(e) =>
                    setScoring({
                      ...scoring,
                      [key]: Number(e.target.value),
                    } as Scoring)
                  }
                  className={`w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary ${
                    !championship.isAdmin ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
                  }`}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {championship.isAdmin && (
            <Button
              className="w-full cursor-pointer rounded-2xl px-5 py-3 font-league sm:w-auto"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar ajustes"}
            </Button>
          )}
          <Button
            variant={championship.isAdmin ? "secondary" : "primary"}
            className="w-full rounded-2xl cursor-pointer px-5 py-3 font-league sm:w-auto"
            onClick={handleLeave}
          >
            {championship.isAdmin ? "Eliminar/abandonar" : "Abandonar campeonato"}
          </Button>
        </div>
      </section>
    </>
  );
}

function MemberList({
  title,
  members,
  isAdmin,
  onBan,
  onUnban,
  hideActions = false,
  currentUserId,
}: {
  title?: string;
  members: ChampionshipMember[];
  isAdmin: boolean;
  onBan?: (userId?: number) => void;
  onUnban?: (userId?: number) => void;
  hideActions?: boolean;
  currentUserId?: number;
}) {
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-7">
      {title && (
        <p className="text-xs font-roboto uppercase tracking-wide text-primary/80">
          {title}
        </p>
      )}
      {members.map((m, idx) => (
        <div key={m.id ?? idx} className="flex items-center gap-2">
          <span className="w-5 text-right text-sm">{idx + 1}.</span>
          <span className="w-12 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs shadow-inner text-primary text-center">
            {m.country || "N/A"}
          </span>
          {m.profile_pic ? (
            <img
              src={m.profile_pic}
              alt={m.name ?? "Avatar"}
              className="h-8 w-8 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full border border-gray-200 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {(m.name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="flex-1 rounded-md border border-gray-200 px-2 py-2 text-sm shadow-inner text-primary">
            {m.name}
          </span>
          {!hideActions && isAdmin && (onBan || onUnban) && (
            (() => {
              const isSelf = m.id === currentUserId;
              const label = onBan
                ? isSelf
                  ? "Admin"
                  : "Banear"
                : "Desbanear";
              const colorClass = onBan
                ? isSelf
                  ? "text-primary/80"
                  : "text-red-600"
                : "text-green-600";
              return (
                <button
                  type="button"
                  className={`text-sm font-semibold hover:underline ${colorClass}`}
                  aria-label={onBan ? "Banear miembro" : "Desbanear miembro"}
                  disabled={isSelf}
                  onClick={() =>
                    onBan
                      ? !isSelf && onBan(m.id)
                      : onUnban && onUnban(m.id)
                  }
                >
                  {label}
                </button>
              );
            })()
          )}
        </div>
      ))}
      {members.length === 0 && (
        <p className="text-sm text-primary/60">No hay usuarios en esta lista.</p>
      )}
    </div>
  );
}
