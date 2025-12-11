"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Drivers, type PredictionForm } from "@/components/Drivers";
import {
  getUserChampionships,
  getNextRacePublic,
  getPrediction,
  savePrediction,
  getDrivers,
  type Championship as ApiChampionship,
  type Race,
  type Driver,
  type PredictionPayload,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const emptyPrediction: PredictionForm = {
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

export default function PrediccionesPage() {
  const { user } = useAuth();

  const [championships, setChampionships] = useState<ApiChampionship[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [prediction, setPrediction] = useState<PredictionForm>(emptyPrediction);

  const [loading, setLoading] = useState(true);
  const [raceLoading, setRaceLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    loadLocalPrediction();
  }, [user?.id]);

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    loadDrivers();
  }, []);

  useEffect(() => {
    loadNextRace();
  }, []);

  useEffect(() => {
    if (!selectedId || !nextRace) return;
    loadPrediction(selectedId, nextRace.id);
  }, [selectedId, nextRace?.id]);

  const selectedChampionship = useMemo(
    () => championships.find((c) => c.id === selectedId) ?? null,
    [championships, selectedId]
  );

  async function loadInitial() {
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

  async function loadDrivers() {
    try {
      const list = await getDrivers();
      setDrivers(list);
    } catch (err) {
      console.error("No se pudieron cargar los pilotos", err);
    }
  }

  async function loadNextRace() {
    try {
      setRaceLoading(true);
      setError(null);
      const race = await getNextRacePublic();
      setNextRace(race);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo cargar la siguiente carrera";
      setNextRace(null);
      setError(msg);
    } finally {
      setRaceLoading(false);
    }
  }

  async function loadPrediction(champId: number, raceId: number) {
    try {
      const existing = await getPrediction(champId, raceId);
      if (existing) {
        setPrediction({
          position_1: existing.position_1 ?? null,
          position_2: existing.position_2 ?? null,
          position_3: existing.position_3 ?? null,
          position_4: existing.position_4 ?? null,
          position_5: existing.position_5 ?? null,
          position_6: existing.position_6 ?? null,
          pole: existing.pole ?? null,
          fastest_lap: existing.fastest_lap ?? null,
          last_place: existing.last_place ?? null,
        });
        persistLocalPrediction({
          position_1: existing.position_1 ?? null,
          position_2: existing.position_2 ?? null,
          position_3: existing.position_3 ?? null,
          position_4: existing.position_4 ?? null,
          position_5: existing.position_5 ?? null,
          position_6: existing.position_6 ?? null,
          pole: existing.pole ?? null,
          fastest_lap: existing.fastest_lap ?? null,
          last_place: existing.last_place ?? null,
        });
      } else {
        setPrediction(emptyPrediction);
      }
    } catch {
      setPrediction(emptyPrediction);
    }
  }

  function handleSelectChange(key: keyof PredictionForm, value: string) {
    const numericValue = value ? Number(value) : null;

    // campos que deben ser únicos entre sí (puestos 1-6 y último)
    const uniqueKeys: (keyof PredictionForm)[] = [
      "position_1",
      "position_2",
      "position_3",
      "position_4",
      "position_5",
      "position_6",
      "last_place",
    ];

    setPrediction((prev) => {
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
    if (!selectedId || !nextRace) return;

    const requiredKeys: (keyof PredictionForm)[] = [
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

    const hasEmpty = requiredKeys.some((k) => !prediction[k]);
    if (hasEmpty) {
      setToastType("error");
      setToast("Completa todos los campos antes de guardar.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: PredictionPayload = { ...prediction };

    try {
      await savePrediction(selectedId, nextRace.id, payload);
      setToastType("success");
      setToast("¡Su predicción se ha enviado!");
      persistLocalPrediction(payload);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la predicción";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    setPrediction({ ...emptyPrediction });
  }

  function persistLocalPrediction(data: PredictionForm) {
    if (typeof window === "undefined") return;
    const key = `prediction:last:${user?.id ?? "anon"}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  function loadLocalPrediction() {
    if (typeof window === "undefined") return;
    const key = `prediction:last:${user?.id ?? "anon"}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PredictionForm;
      setPrediction((prev) => ({ ...prev, ...parsed }));
    } catch {
      /* noop */
    }
  }

  function formatDate(dateStr?: string | null, withTime = false) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const opts: Intl.DateTimeFormatOptions = withTime
      ? {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { day: "numeric", month: "long" };
    return date.toLocaleDateString("es-ES", opts);
  }

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
        {/* Columna 1: info próxima carrera */}
        <section className="space-y-4 lg:col-span-3">
          <div className="space-y-2">
            <h2 className="text-lg font-league uppercase tracking-wide">
              Próxima carrera:
            </h2>
          </div>

          <div className="space-y-3 rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur">
            {raceLoading ? (
              <p className="text-sm text-primary/80">Buscando próxima carrera...</p>
            ) : nextRace ? (
              <>
                <div>
                  <p className="text-xs font-roboto uppercase tracking-wide text-primary/70">
                    Gran premio
                  </p>
                  <p className="text-lg font-league leading-tight text-primary">
                    {nextRace.name}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {formatDate(nextRace.race_date)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-roboto uppercase tracking-wide text-primary/70">
                    Guardar predicción antes de:
                  </p>
                  <div className="rounded-2xl bg-primary px-4 py-3 text-white shadow-inner">
                    <p className="text-sm font-league leading-tight">
                      {formatDate(nextRace.qualy_date, true)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-primary/70">
                No hay próximas carreras disponibles.
              </p>
            )}
          </div>
        </section>
        {/* Columna 2: título + componente Pilotos */}
        <div className="order-2 lg:order-none lg:col-span-9 space-y-3">
          <h3 className="text-lg font-league uppercase tracking-wide text-primary">
            Predicción:
          </h3>
          <Drivers
            drivers={drivers}
            prediction={prediction}
            raceLoading={raceLoading}
            nextRace={nextRace}
            saving={saving}
            error={error}
            positionLabels={positionLabels}
            onSelect={handleSelectChange}
            onSave={handleSave}
            onClear={handleClear}
          />
        </div>
      </div>

      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-30 -translate-x-1/2 rounded-lg px-4 py-2 text-sm font-roboto text-white shadow-lg ${
            toastType === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
