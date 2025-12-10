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

export interface Race {
  id: number;
  name: string;
  grand_prix?: string;
  date: string;
  deadline?: string;
}

export interface PredictionPayload {
  positions: number[];   
  pole: number;
  fastest_lap: number;
  last_place: number;
}

export interface UserSettings {
  name: string;
  email: string;
  country?: string;
  profile_pic?: string;
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
  password: string;
  password_confirmation: string;
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

//
// ============================================================
// PREDICTIONS
// ============================================================
//

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

export async function getRaceResults(raceId: number) {
  try {
    const { data } = await api.get(`/api/races/${raceId}/results`);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
