"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminBoundary } from "@/components/AdminBoundary";
import { Button } from "@/components/Button";
import { Drivers, type PredictionForm } from "@/components/Drivers";
import {
  calculateRacePoints,
  confirmRace,
  getDrivers,
  getRace,
  getRaceResults,
  getSeasonRaces,
  getSeasons,
  saveRaceResults,
  type Driver,
  type Race,
  type Season,
  type RaceResultInput,
} from "@/lib/api";

type RaceResultEntry = {
  driver_id?: number;
  driver?: { id?: number };
  position?: number | null;
  is_pole?: boolean;
  fastest_lap?: boolean;
  is_last_place?: boolean;
};

const emptyResult: PredictionForm = {
  position_1: null,
  position_2: null,
  position_3: null,
  position_4: null,
  position_5: null,
  position_6: null,
  pole: null,
  fastest_lap: null,
  last_place: null,
};

const positionLabels: [keyof PredictionForm, string][] = [
  ["position_1", "1º puesto"],
  ["position_2", "2º puesto"],
  ["position_3", "3º puesto"],
  ["position_4", "4º puesto"],
  ["position_5", "5º puesto"],
  ["position_6", "6º puesto"],
  ["pole", "Pole"],
  ["fastest_lap", "V. rápida"],
  ["last_place", "Último"],
];

export default function AdminPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const selectedRace = useMemo(
    () => races.find((r) => r.id === selectedRaceId) ?? null,
    [races, selectedRaceId]
  );

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState<PredictionForm>(emptyResult);

  const [loading, setLoading] = useState(true);
  const [raceLoading, setRaceLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    loadInitial();
    loadDrivers();
  }, []);

  useEffect(() => {
    if (selectedSeasonId) {
      loadRaces(selectedSeasonId);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    if (selectedRaceId) {
      loadRaceData(selectedRaceId);
    }
  }, [selectedRaceId]);

  async function loadInitial() {
    try {
      setLoading(true);
      const data = await getSeasons();
      setSeasons(data);
      setError(null);
      const current =
        data.find((s) =>
          typeof s.is_current_season === "boolean"
            ? s.is_current_season
            : Boolean(s.is_current_season)
        ) ?? data[0];
      setSelectedSeasonId(current?.id ?? null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudieron cargar las temporadas";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loadDrivers() {
    try {
      const list = await getDrivers();
      setDrivers(list);
    } catch (err) {
      console.error("No se pudieron cargar los pilotos", err);
    }
  }

  async function loadRaces(seasonId: number) {
    try {
      setRaceLoading(true);
      setError(null);
      const list = await getSeasonRaces(seasonId);
      setRaces(list);

      setSelectedRaceId((prev) => {
        if (prev && list.some((r) => r.id === prev)) return prev;
        const pending = list.find(
          (r) =>
            typeof r.is_result_confirmed === "boolean"
              ? !r.is_result_confirmed
              : !Boolean(r.is_result_confirmed)
        );
        return pending?.id ?? list[0]?.id ?? null;
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudieron cargar las carreras";
      setError(msg);
      setRaces([]);
      setSelectedRaceId(null);
    } finally {
      setRaceLoading(false);
    }
  }

  async function loadRaceData(raceId: number) {
    try {
      setRaceLoading(true);
      setError(null);
      const [raceDetail, existingResultsRaw] = await Promise.all([
        getRace(raceId),
        getRaceResults(raceId).catch(() => []),
      ]);
      const existingResults: RaceResultEntry[] = existingResultsRaw ?? [];

      setRaces((prev) =>
        prev.map((r) => (r.id === raceDetail.id ? { ...r, ...raceDetail } : r))
      );

      if (existingResults && existingResults.length) {
        const findByPosition = (pos: number) => {
          const entry = existingResults.find(
            (r) => (r.position ?? null) === pos
          );
          return entry?.driver_id ?? entry?.driver?.id ?? null;
        };

        const findFlag = (flag: keyof RaceResultEntry) => {
          const entry = existingResults.find((r) => r[flag]);
          return entry?.driver_id ?? entry?.driver?.id ?? null;
        };

        setForm({
          position_1: findByPosition(1),
          position_2: findByPosition(2),
          position_3: findByPosition(3),
          position_4: findByPosition(4),
          position_5: findByPosition(5),
          position_6: findByPosition(6),
          pole: findFlag("is_pole"),
          fastest_lap: findFlag("fastest_lap"),
          last_place: findFlag("is_last_place"),
        });
      } else {
        setForm({ ...emptyResult });
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo cargar la carrera seleccionada";
      setError(msg);
      setForm({ ...emptyResult });
    } finally {
      setRaceLoading(false);
    }
  }

  function handleSelectChange(key: keyof PredictionForm, value: string) {
    const numericValue = value ? Number(value) : null;
    const uniqueKeys: (keyof PredictionForm)[] = [
      "position_1",
      "position_2",
      "position_3",
      "position_4",
      "position_5",
      "position_6",
      "last_place",
    ];

    setForm((prev) => {
      const updated = { ...prev };
      updated[key] = numericValue;

      if (numericValue && uniqueKeys.includes(key)) {
        uniqueKeys.forEach((k) => {
          if (k !== key && updated[k] === numericValue) {
            updated[k] = null;
          }
        });
      }

      return updated;
    });
  }

  async function handleSave() {
    if (!selectedRaceId) return;

    const required: (keyof PredictionForm)[] = [
      "position_1",
      "position_2",
      "position_3",
      "position_4",
      "position_5",
      "position_6",
      "pole",
      "fastest_lap",
      "last_place",
    ];

    const hasEmpty = required.some((k) => !form[k]);
    if (hasEmpty) {
      setError("Completa todos los campos antes de guardar.");
      return;
    }

    const entries = new Map<number, RaceResultInput>();
    const ensureEntry = (driverId: number) => {
      if (!entries.has(driverId)) {
        entries.set(driverId, { driver_id: driverId });
      }
      return entries.get(driverId) as RaceResultInput;
    };

    [
      ["position_1", 1],
      ["position_2", 2],
      ["position_3", 3],
      ["position_4", 4],
      ["position_5", 5],
      ["position_6", 6],
    ].forEach(([key, pos]) => {
      const driverId = form[key as keyof PredictionForm];
      if (driverId) {
        const entry = ensureEntry(driverId as number);
        entry.position = pos as number;
      }
    });

    if (form.pole) {
      const entry = ensureEntry(form.pole);
      entry.is_pole = true;
    }
    if (form.fastest_lap) {
      const entry = ensureEntry(form.fastest_lap);
      entry.fastest_lap = true;
    }
    if (form.last_place) {
      const entry = ensureEntry(form.last_place);
      entry.is_last_place = true;
    }

    const payload = Array.from(entries.values());

    setSaving(true);
    setError(null);
    try {
      await saveRaceResults(selectedRaceId, payload);
      await confirmRace(selectedRaceId);
      setToast("Resultado guardado y carrera confirmada.");
      await loadRaceData(selectedRaceId);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se pudo guardar el resultado";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleCalculate() {
    if (!selectedRaceId) return;
    setSaving(true);
    setError(null);
    try {
      await calculateRacePoints(selectedRaceId);
      setToast("Puntos recalculados para la carrera.");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron recalcular los puntos";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const isConfirmed = useMemo(() => {
    if (!selectedRace) return false;
    return typeof selectedRace.is_result_confirmed === "boolean"
      ? selectedRace.is_result_confirmed
      : Boolean(selectedRace.is_result_confirmed);
  }, [selectedRace]);

  return (
    <AdminBoundary>
      <div className="relative w-full text-primary">
        <div
          className="
            relative z-10 grid w-full
            grid-cols-1 gap-8 md:gap-10
            lg:grid-cols-12
            mt-8
          "
        >
          <section className="space-y-5 lg:col-span-4">
            <div className="space-y-3">
              <h2 className="text-lg font-league uppercase tracking-wide">
                Panel de admin:
              </h2>
              {loading && (
                <p className="text-sm text-primary/70">Cargando temporadas...</p>
              )}
              {error && <p className="text-sm text-red-700">{error}</p>}
              {!loading && seasons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-roboto uppercase tracking-wide text-primary/70">
                    Temporada:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seasons.map((season) => {
                      const active = season.id === selectedSeasonId;
                      return (
                        <button
                          key={season.id}
                          className={`rounded-full px-4 py-2 font-league text-sm shadow-sm transition-transform ${
                            active
                              ? "bg-primary text-white"
                              : "bg-white text-primary border border-primary/40 hover:bg-primary/10"
                          }`}
                          onClick={() => setSelectedSeasonId(season.id)}
                        >
                          {season.year}
                          {Boolean(season.is_current_season) ? " (actual)" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs font-roboto uppercase tracking-wide text-primary/70">
                Carrera:
              </p>
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur space-y-3">
                {raceLoading && (
                  <p className="text-sm text-primary/70">Cargando carreras...</p>
                )}
                {!raceLoading && races.length === 0 && (
                  <p className="text-sm text-primary/70">
                    No hay carreras para esta temporada.
                  </p>
                )}
                {!raceLoading && races.length > 0 && (
                  <select
                    value={selectedRaceId ?? ""}
                    onChange={(e) => setSelectedRaceId(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  >
                    <option value="">- Selecciona carrera -</option>
                    {races.map((race) => (
                      <option key={race.id} value={race.id}>
                        {race.round ?? race.round_number ?? "-"} · {race.name}
                      </option>
                    ))}
                  </select>
                )}

                {selectedRace && (
                  <div className="space-y-1 text-sm font-roboto text-primary">
                    <p>
                      <span className="font-semibold">GP:</span>{" "}
                      {selectedRace.name}
                    </p>
                    <p>
                      <span className="font-semibold">Fecha:</span>{" "}
                      {formatDate(selectedRace.race_date)}
                    </p>
                    <p>
                      <span className="font-semibold">Estado:</span>{" "}
                      {isConfirmed ? "Confirmado" : "Pendiente"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                variant="primary"
                className="rounded-2xl px-5 py-3 font-league cursor-pointer"
                onClick={handleCalculate}
                disabled={saving || raceLoading || !selectedRace}
              >
                Recalcular puntos
              </Button>
            </div>
          </section>

          <section className="order-2 lg:order-none lg:col-span-8 space-y-3">
            <h3 className="text-lg font-league uppercase tracking-wide text-primary">
              Resultado oficial:
            </h3>
            <Drivers
              drivers={drivers}
              prediction={form}
              raceLoading={raceLoading}
              nextRace={selectedRace}
              saving={saving}
              error={error}
              positionLabels={positionLabels}
              onSelect={handleSelectChange}
              onSave={handleSave}
              onClear={() => {
                setError(null);
                setForm({ ...emptyResult });
              }}
            />
          </section>
        </div>

        {toast && (
          <div className="fixed left-1/2 top-6 z-30 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-sm font-roboto text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </AdminBoundary>
  );
}
