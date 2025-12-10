"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import {
  getUserChampionships,
  getChampionshipMembers,
  type Championship as ApiChampionship,
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
};

type Championship = {
  id: number;
  name: string;
  code?: string;
  members: ChampionshipMember[];
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

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data =
          (await getUserChampionships()) as ApiChampionshipWithExtras[];
        const mapped: Championship[] = data.map((c) => ({
          id: c.id,
          name: c.name,
          code: c.invitation_code ?? (c as { code?: string }).code ?? "",
          isAdmin: Boolean(c.is_admin) || c.admin_id === user?.id,
          members: [],
          scoring: c.scoring ?? defaultScoring,
        }));
        setChampionships(mapped);
        setSelectedId(mapped[0]?.id ?? null);
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
    load();
  }, [user?.id]);

  const selected = useMemo(
    () => championships.find((c) => c.id === selectedId) ?? null,
    [championships, selectedId]
  );

  useEffect(() => {
    async function loadMembers() {
      if (!selectedId) return;
      try {
        const members =
          (await getChampionshipMembers(selectedId)) as ChampionshipMember[];
        setChampionships((prev) =>
          prev.map((c) => (c.id === selectedId ? { ...c, members } : c))
        );
      } catch (err) {
        console.error("No se pudieron cargar los miembros", err);
      }
    }
    loadMembers();
  }, [selectedId]);

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
                    className={`w-full rounded-3xl px-4 py-3 text-left font-league text-base shadow-sm transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "bg-primary/80 text-white/90 hover:bg-primary"
                    }`}
                  >
                    {c.name}
                    {c.isAdmin ? " (Admin)" : ""}
                  </button>
                );
              })}
              <Button
                variant="secondary"
                className="w-full rounded-3xl py-3 font-league"
              >
                + Añadir nuevo campeonato
              </Button>
            </div>
          )}
        </section>

        {/* Columnas 2 y 3: panel del campeonato */}
        {selected && (
          <ChampionshipPanel
            key={`${selected.id}-${selected.members
              .map((m) => m.id)
              .join("-")}`}
            championship={selected}
          />
        )}
      </div>
    </div>
  );
}

function ChampionshipPanel({ championship }: { championship: Championship }) {
  const [name, setName] = useState(championship.name);
  const [members, setMembers] = useState<ChampionshipMember[]>(
    championship.members
  );
  const [scoring, setScoring] = useState<Scoring>(championship.scoring);

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
              className="mt-1 w-full border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
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

          <div className="space-y-2 max-h-64 overflow-y-auto pr-7">
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
                {championship.isAdmin && (
                  <button
                    type="button"
                    className="text-lg font-semibold text-red-600 hover:scale-110"
                    aria-label="Eliminar miembro"
                    onClick={() =>
                      setMembers(members.filter((_, i) => i !== idx))
                    }
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            className="rounded-xl mt-5 px-4 py-2 text-xs sm:text-sm"
          >
            Usuarios baneados
          </Button>
        </div>
      </section>

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
                  onChange={(e) =>
                    setScoring({
                      ...scoring,
                      [key]: Number(e.target.value),
                    } as Scoring)
                  }
                  className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
          <Button className="w-full rounded-2xl px-5 py-3 font-league sm:w-auto">
            Guardar ajustes
          </Button>
          <Button
            variant="secondary"
            className="w-full rounded-2xl px-5 py-3 font-league sm:w-auto"
          >
            Abandonar campeonato
          </Button>
        </div>
      </section>
    </>
  );
}
