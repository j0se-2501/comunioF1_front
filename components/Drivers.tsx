"use client";

import { Button } from "@/components/Button";
import type { Driver, Race } from "@/lib/api";

export type PredictionForm = {
  position_1?: number | null;
  position_2?: number | null;
  position_3?: number | null;
  position_4?: number | null;
  position_5?: number | null;
  position_6?: number | null;
  pole?: number | null;
  fastest_lap?: number | null;
  last_place?: number | null;
};

export type DriversProps = {
  drivers: Driver[];
  prediction: PredictionForm;
  positionLabels: [keyof PredictionForm, string][];
  raceLoading: boolean;
  nextRace: Race | null;
  saving: boolean;
  error: string | null;
  onSelect: (key: keyof PredictionForm, value: string) => void;
  onSave: () => void;
  onClear: () => void;
};

export function Drivers({
  drivers,
  prediction,
  positionLabels,
  raceLoading,
  nextRace,
  saving,
  error,
  onSelect,
  onSave,
  onClear,
}: DriversProps) {
  const sortedDrivers = [...drivers].sort(
    (a, b) => (a.number ?? 0) - (b.number ?? 0)
  );

  return (
    <section
      className="
        space-y-6 rounded-2xl bg-white/70 p-4 sm:p-6
        shadow-sm backdrop-blur
      "
    >
      {nextRace?.race_date && (
        <p className="text-xs font-roboto text-primary/70">
          {nextRace.name} · {new Date(nextRace.race_date).toLocaleDateString("es-ES")}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-0 pt-3 gap-y-3 text-sm font-roboto text-primary">
        {positionLabels.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <span className="w-18 sm:w-20 font-semibold">{label}.</span>
            <select
              className="flex rounded-md border border-gray-300 bg-white px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
              value={prediction[key] ?? ""}
              onChange={(e) => onSelect(key, e.target.value)}
              disabled={!drivers.length || raceLoading}
            >
              <option value="">— Selecciona —</option>
              {sortedDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  #{driver.number ?? "?"} {driver.name}
                  {driver.country ? ` (${driver.country})` : ""}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 sm:justify-end sm:self-end">
        <Button
          variant="secondary"
          className="rounded-2xl px-6 py-3 font-league"
          onClick={onClear}
          disabled={raceLoading}
        >
          Vaciar campos
        </Button>
        <Button
          className="rounded-2xl px-6 py-3 font-league"
          onClick={onSave}
          disabled={saving || !nextRace}
        >
          Guardar
        </Button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
