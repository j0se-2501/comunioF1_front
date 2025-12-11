"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getUserChampionships,
  getSeasonRaces,
  getRaceResults,
  getChampionshipActiveMembers,
  type Championship as ApiChampionship,
  type Race,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type MemberWithPivot = {
  id: number;
  name: string;
  country?: string;
  profile_pic?: string;
  pivot?: {
    total_points?: number;
    position?: number;
    is_banned?: boolean | number;
  };
};

type RaceResultEntry = {
  id: number;
  position?: number | null;
  is_pole?: boolean;
  fastest_lap?: boolean;
  is_last_place?: boolean;
  driver?: {
    id: number;
    name: string;
    country?: string;
    profile_pic?: string;
  };
};

function getLastFinishedRace(races: Race[]): Race | null {
  const finished = races.filter(
    (race) => (race as { is_result_confirmed?: boolean }).is_result_confirmed
  );

  if (!finished.length) return null;

  return finished
    .slice()
    .sort((a, b) => {
      // Prefer race_date, fallback to round
      const dateA = a.race_date ? new Date(a.race_date).getTime() : 0;
      const dateB = b.race_date ? new Date(b.race_date).getTime() : 0;
      if (dateA !== dateB) return dateB - dateA;
      const roundA = a.round_number ?? (a as { round?: number }).round ?? 0;
      const roundB = b.round_number ?? (b as { round?: number }).round ?? 0;
      return roundB - roundA;
    })
    [0];
}

function formatRaceName(race?: Race | null) {
  if (!race) return "Gran Premio pendiente";
  return race.name ?? race.grand_prix ?? "Gran Premio sin nombre";
}

export default function ResultadosPage() {
  const { user } = useAuth();

  const [championships, setChampionships] = useState<ApiChampionship[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [members, setMembers] = useState<MemberWithPivot[]>([]);
  const [lastRace, setLastRace] = useState<Race | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResultEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [raceLoading, setRaceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChampionship = useMemo(
    () => championships.find((c) => c.id === selectedId) ?? null,
    [championships, selectedId]
  );

  useEffect(() => {
    loadChampionships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!selectedChampionship) return;
    loadMembers(selectedChampionship.id);
    loadLastRace(selectedChampionship);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChampionship?.id]);

  async function loadChampionships() {
    try {
      setLoading(true);
      const data = await getUserChampionships();
      setChampionships(data);
      setSelectedId((prev) => prev ?? data[0]?.id ?? null);
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

  async function loadMembers(championshipId: number) {
    try {
      const list = await getChampionshipActiveMembers(championshipId);
      setMembers(list);
    } catch (err) {
      console.error("No se pudieron cargar los miembros", err);
    }
  }

  async function loadLastRace(championship: ApiChampionship) {
    if (!championship.season_id) {
      setLastRace(null);
      setRaceResults([]);
      return;
    }

    try {
      setRaceLoading(true);
      const races = await getSeasonRaces(championship.season_id);
      const latest = getLastFinishedRace(races);
      setLastRace(latest);

      if (latest) {
        try {
          const results = await getRaceResults(latest.id);
          setRaceResults(results);
        } catch (err) {
          console.error("No se pudieron cargar los resultados", err);
          setRaceResults([]);
        }
      } else {
        setRaceResults([]);
      }
    } catch (err) {
      console.error("No se pudieron cargar las carreras", err);
      setLastRace(null);
      setRaceResults([]);
    } finally {
      setRaceLoading(false);
    }
  }

  const orderedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const posA = a.pivot?.position ?? 999;
      const posB = b.pivot?.position ?? 999;
      if (posA !== posB) return posA - posB;
      return (b.pivot?.total_points ?? 0) - (a.pivot?.total_points ?? 0);
    });
  }, [members]);

  const raceSummary = useMemo(() => {
    const ordered = [...raceResults].sort(
      (a, b) => (a.position ?? 99) - (b.position ?? 99)
    );
    const top6 = ordered.filter((r) => r.position).slice(0, 6);
    const pole = raceResults.find((r) => r.is_pole);
    const fast = raceResults.find((r) => r.fastest_lap);
    const last =
      raceResults.find((r) => r.is_last_place) ??
      ordered[ordered.length - 1] ??
      null;

    return { top6, pole, fast, last };
  }, [raceResults]);

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
        {/* Columna 1: mis campeonatos + resultado oficial */}
        <section className="space-y-6 lg:col-span-4">
          <div className="space-y-3">
            <h2 className="text-lg font-league uppercase tracking-wide">
              Mis campeonatos:
            </h2>
            {loading && (
              <p className="text-sm text-primary/70">Cargando campeonatos...</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="flex flex-col gap-3">
                {championships.map((c) => {
                  const isActive = c.id === selectedChampionship?.id;
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
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-league uppercase tracking-wide">
              {formatRaceName(lastRace)}
            </h3>
            <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur space-y-3">
              {raceLoading ? (
                <p className="text-sm text-primary/70">
                  Buscando resultados confirmados...
                </p>
              ) : lastRace && raceSummary.top6.length ? (
                <div className="space-y-2 text-sm font-roboto text-primary">
                  {raceSummary.top6.map((entry, idx) => (
                    <RaceResultRow
                      key={entry.id}
                      label={`${idx + 1}º puesto`}
                      driver={entry.driver?.name ?? "Sin piloto"}
                      country={entry.driver?.country}
                    />
                  ))}
                  {raceSummary.pole && (
                    <RaceResultRow
                      label="Pole"
                      driver={raceSummary.pole.driver?.name ?? "Sin piloto"}
                      country={raceSummary.pole.driver?.country}
                    />
                  )}
                  {raceSummary.fast && (
                    <RaceResultRow
                      label="V. rápida"
                      driver={raceSummary.fast.driver?.name ?? "Sin piloto"}
                      country={raceSummary.fast.driver?.country}
                    />
                  )}
                  {raceSummary.last && (
                    <RaceResultRow
                      label="Último"
                      driver={raceSummary.last.driver?.name ?? "Sin piloto"}
                      country={raceSummary.last.driver?.country}
                    />
                  )}
                </div>
              ) : (
                <p className="text-sm text-primary/70">
                  Aún no hay un Gran Premio con resultados confirmados en esta
                  season.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Columna 2: resultados del último GP (puntos) */}
        <section className="space-y-3 lg:col-span-4">
          <h3 className="text-lg font-league uppercase tracking-wide">
            Resultados del último GP:
          </h3>
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
            {lastRace ? (
              <div className="space-y-3">
                <p className="text-sm font-roboto text-primary/80">
                  Mostramos la tabla de puntos cuando el backend exponga los
                  RacePoints de la carrera. Por ahora puedes consultar la
                  clasificación general a la derecha.
                </p>
                <div className="rounded-2xl bg-primary/90 text-white px-4 py-3 font-league text-center">
                  {formatRaceName(lastRace)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-primary/70">
                No hay GP finalizado todavía para mostrar puntuaciones.
              </p>
            )}
          </div>
        </section>

        {/* Columna 3: clasificación del mundial / campeonato */}
        <section className="space-y-3 lg:col-span-4">
          <h3 className="text-lg font-league uppercase tracking-wide">
            Clasificación del mundial:
          </h3>
          <div className="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur space-y-3">
            {orderedMembers.length ? (
              orderedMembers.map((member, idx) => (
                <StandingRow
                  key={member.id ?? idx}
                  position={member.pivot?.position ?? idx + 1}
                  name={member.name}
                  country={member.country}
                  points={member.pivot?.total_points ?? 0}
                />
              ))
            ) : (
              <p className="text-sm text-primary/70">
                Añade participantes al campeonato para ver la clasificación.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function RaceResultRow({
  label,
  driver,
  country,
}: {
  label: string;
  driver: string;
  country?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 text-left font-semibold">{label}.</span>
      <span className="rounded-md bg-white px-3 py-2 shadow-inner border border-gray-200 flex items-center gap-2 flex-1">
        <span className="flex-1 font-league text-primary">{driver}</span>
        {country && (
          <span className="text-xs font-semibold text-primary/80">{country}</span>
        )}
      </span>
    </div>
  );
}

function StandingRow({
  position,
  name,
  country,
  points,
}: {
  position: number;
  name: string;
  country?: string;
  points: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-primary/90 px-4 py-2 text-white shadow-sm">
      <span className="w-6 text-center font-league">{position}.</span>
      <div className="flex items-center gap-2 flex-1">
        {country && (
          <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-primary">
            {country}
          </span>
        )}
        <span className="font-league truncate">{name}</span>
      </div>
      <span className="min-w-[48px] text-right font-semibold">{points}</span>
    </div>
  );
}


