// lib/api.ts
import axios from "axios";

//
// ============================================================
// CONFIG AXIOS (Sanctum SPA)
// ============================================================
//

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,             // <<--- Required for Sanctum SPA
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Forzamos a enviar el XSRF-TOKEN en el header, porque axios a veces no lo añade en peticiones cross-site.
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

api.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");
  if (token) {
    config.headers = config.headers || {};
    config.headers["X-XSRF-TOKEN"] = token;
  }
  return config;
});

//
// ============================================================
// UTILS
// ============================================================
//

// Necesario antes de cualquier POST / PUT / PATCH / DELETE
export async function csrf() {
  await api.get("/sanctum/csrf-cookie");
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Error desconocido"
    );
  }
  return "Error desconocido";
}

//
// ============================================================
// TYPES (ajusta según tus Resources de Laravel)
// ============================================================
//

export interface User {
  id: number;
  name: string;
  email: string;
  country?: string;
  profile_pic?: string;
}

export interface Championship {
  id: number;
  name: string;
  code: string;
  season_id?: number;
}

export interface ChampionshipMember {
  id: number;
  name: string;
  email: string;
}

export interface Driver {
  id: number;
  name: string;
  short_code: string;
  number: number;
  country?: string;
  team?: {
    id: number;
    name: string;
  };
}

export interface Race {
  id: number;
  name: string;
  round_number?: number;
  round?: number;
  race_date?: string;
  qualy_date?: string;
  grand_prix?: string; // compatibilidad
  date?: string;       // compatibilidad
  deadline?: string;   // compatibilidad
}

export interface PredictionPayload {
  position_1?: number | null;
  position_2?: number | null;
  position_3?: number | null;
  position_4?: number | null;
  position_5?: number | null;
  position_6?: number | null;
  pole?: number | null;
  fastest_lap?: number | null;
  last_place?: number | null;
}

export interface UserSettings {
  name: string;
  email: string;
  country?: string;
  profile_pic?: string;
}

export interface RacePoint {
  id: number;
  prediction_id: number;
  race_id: number;
  championship_id: number;
  user_id: number;
  points: number;
  guessed_p1?: boolean;
  guessed_p2?: boolean;
  guessed_p3?: boolean;
  guessed_p4?: boolean;
  guessed_p5?: boolean;
  guessed_p6?: boolean;
  guessed_pole?: boolean;
  guessed_fastest_lap?: boolean;
  guessed_last_place?: boolean;
  user?: User;
}

//
// ============================================================
// AUTH
// ============================================================
//

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  country?: string;
  profile_pic?: string;
}) {
  try {
    await csrf();
    const { data } = await api.post("/api/register", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function login(email: string, password: string) {
  try {
    await csrf();
    const { data } = await api.post("/api/login", { email, password });

    // Opcional: guardar el usuario para mostrarlo en UI
    if (typeof window !== "undefined" && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function logout() {
  try {
    await csrf();
    await api.post("/api/logout");
  } catch {
    // da igual si falla, limpiamos el front
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  }
}

//
// ============================================================
// USER
// ============================================================
//

export async function getMe(): Promise<User> {
  try {
    const { data } = await api.get("/api/me");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserChampionships(): Promise<Championship[]> {
  try {
    const { data } = await api.get("/api/user/championships");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUserSettings(
  payload: Partial<UserSettings>
): Promise<UserSettings> {
  try {
    await csrf();
    const { data } = await api.put("/api/user", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  try {
    await csrf();
    const { data } = await api.put("/api/user/password", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

//
// ============================================================
// CHAMPIONSHIPS
// ============================================================
//

export async function getChampionships(): Promise<Championship[]> {
  try {
    const { data } = await api.get("/api/championships");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getChampionship(id: number): Promise<Championship> {
  try {
    const { data } = await api.get(`/api/championships/${id}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createChampionship(payload: {
  name: string;
  season_id: number;
}) {
  try {
    await csrf();
    const { data } = await api.post("/api/championships", payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateChampionship(
  id: number,
  payload: Partial<Championship>
) {
  try {
    await csrf();
    const { data } = await api.put(`/api/championships/${id}`, payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function leaveChampionship(id: number) {
  try {
    await csrf();
    const { data } = await api.post(`/api/championships/${id}/leave`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function banChampionshipUser(id: number, userId: number) {
  try {
    await csrf();
    const { data } = await api.post(`/api/championships/${id}/ban/${userId}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function unbanChampionshipUser(id: number, userId: number) {
  try {
    await csrf();
    const { data } = await api.post(`/api/championships/${id}/unban/${userId}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function joinChampionship(invitation_code: string) {
  try {
    await csrf();
    const { data } = await api.post(`/api/championships/join`, {
      invitation_code,
    });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getChampionshipMembers(
  id: number
): Promise<ChampionshipMember[]> {
  try {
    const { data } = await api.get(`/api/championships/${id}/members`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getChampionshipActiveMembers(
  id: number
): Promise<ChampionshipMember[]> {
  try {
    const { data } = await api.get(`/api/championships/${id}/members/active`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getChampionshipBannedMembers(
  id: number
): Promise<ChampionshipMember[]> {
  try {
    const { data } = await api.get(`/api/championships/${id}/members/banned`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateChampionshipName(
  id: number,
  name: string
) {
  try {
    await csrf();
    const { data } = await api.put(`/api/championships/${id}`, { name });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateChampionshipScoring(
  id: number,
  payload: unknown
) {
  try {
    await csrf();
    const { data } = await api.put(`/api/championships/${id}/scoring`, payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getChampionshipScoring(id: number) {
  try {
    const { data } = await api.get(`/api/championships/${id}/scoring`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

//
// ============================================================
// DRIVERS
// ============================================================
//

export async function getDrivers(): Promise<Driver[]> {
  try {
    const { data } = await api.get("/api/drivers");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

//
// ============================================================
// PREDICTIONS
// ============================================================
//

export async function getNextRacePublic(): Promise<Race> {
  try {
    const { data } = await api.get("/api/races/next");
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getNextRace(championshipId: number) {
  try {
    const { data } = await api.get(
      `/api/championships/${championshipId}/races/next`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPrediction(
  championshipId: number,
  raceId: number
) {
  try {
    const { data } = await api.get(
      `/api/championships/${championshipId}/races/${raceId}/prediction`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function savePrediction(
  championshipId: number,
  raceId: number,
  payload: PredictionPayload
) {
  try {
    await csrf();
    const { data } = await api.post(
      `/api/championships/${championshipId}/races/${raceId}/prediction`,
      payload
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

//
// ============================================================
// RACES & RESULTS
// ============================================================
//

export async function getSeasonRaces(seasonId: number): Promise<Race[]> {
  try {
    const { data } = await api.get(`/api/seasons/${seasonId}/races`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRace(raceId: number): Promise<Race> {
  try {
    const { data } = await api.get(`/api/races/${raceId}`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getLastRace(): Promise<Race> {
  try {
    const { data } = await api.get(`/api/races/last`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRaceResults(raceId: number) {
  try {
    const { data } = await api.get(`/api/races/${raceId}/results`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRacePoints(
  championshipId: number,
  raceId: number
): Promise<RacePoint[]> {
  try {
    const { data } = await api.get(
      `/api/championships/${championshipId}/races/${raceId}/race-points`
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
