/**
 * Camada de dados dos agendamentos. Centraliza leitura, persistência e atualização das visitas marcadas.
 */
import { useEffect, useState } from "react";

export type ScheduleStatus = "agendado" | "confirmado" | "cancelado";

export interface ScheduleItem {
  id: number;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientId?: string | null;
  date: string;
  time: string;
  status: ScheduleStatus;
  notes?: string;
  createdAt?: string;
}

const STORAGE_KEY = "grupo-sp-schedules";
const STORAGE_EVENT = "grupo-sp-schedules:updated";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const defaultSchedules: ScheduleItem[] = [
  {
    id: 1,
    propertyTitle: "Apartamento Luxuoso no Centro",
    clientName: "Ana Clara",
    clientEmail: "ana@email.com",
    date: "2026-04-15",
    time: "10:30",
    status: "agendado",
    notes: "Verificar disponibilidade de mobília",
    createdAt: "2026-04-10T10:30:00.000Z",
  },
];

const isBrowser = () => typeof window !== "undefined";

const dispatchSchedulesEvent = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
};

const normalizeSchedule = (schedule: Partial<ScheduleItem>, index = 0): ScheduleItem => ({
  id: Number(schedule.id ?? index + 1),
  propertyTitle: schedule.propertyTitle?.trim() || "",
  clientName: schedule.clientName?.trim() || "",
  clientEmail: schedule.clientEmail?.trim().toLowerCase() || "",
  clientId: schedule.clientId ?? null,
  date: schedule.date?.trim() || "",
  time: schedule.time?.trim() || "",
  status: schedule.status ?? "agendado",
  notes: schedule.notes ?? "",
  createdAt: schedule.createdAt ?? new Date().toISOString(),
});

const cacheSchedules = (schedules: ScheduleItem[], shouldDispatch = false) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  if (shouldDispatch) {
    dispatchSchedulesEvent();
  }
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Erro ao acessar ${path}`;

    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || message;
    } catch {
      // Keep original text when response is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
};

export const getSchedules = (): ScheduleItem[] => {
  if (!isBrowser()) {
    return defaultSchedules;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    cacheSchedules(defaultSchedules);
    return defaultSchedules;
  }

  try {
    return (JSON.parse(raw) as Partial<ScheduleItem>[]).map((item, index) => normalizeSchedule(item, index));
  } catch {
    cacheSchedules(defaultSchedules);
    return defaultSchedules;
  }
};

export const fetchSchedules = async (): Promise<ScheduleItem[]> => {
  try {
    const schedules = (await apiRequest<Partial<ScheduleItem>[]>("/api/schedules")).map((item, index) =>
      normalizeSchedule(item, index),
    );
    cacheSchedules(schedules);
    return schedules;
  } catch {
    return getSchedules();
  }
};

export const getAvailableScheduleTimes = async (propertyTitle: string, date: string): Promise<string[]> => {
  const schedules = await fetchSchedules();
  const bookedTimes = schedules
    .filter(
      (schedule) =>
        schedule.propertyTitle === propertyTitle &&
        schedule.date === date &&
        schedule.status !== "cancelado",
    )
    .map((schedule) => schedule.time);

  return ["09:00", "11:00", "14:00", "16:00"].filter((time) => !bookedTimes.includes(time));
};

export const addSchedule = async (
  schedule: Omit<ScheduleItem, "id" | "createdAt">,
): Promise<ScheduleItem> => {
  const created = normalizeSchedule(
    await apiRequest<Partial<ScheduleItem>>("/api/schedules", {
      method: "POST",
      body: JSON.stringify(schedule),
    }),
  );
  cacheSchedules([created, ...getSchedules().filter((item) => item.id !== created.id)], true);
  return created;
};

export const updateSchedule = async (id: number, updates: Partial<ScheduleItem>) => {
  const updated = normalizeSchedule(
    await apiRequest<Partial<ScheduleItem>>(`/api/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify({ ...updates, id }),
    }),
  );
  const schedules = getSchedules().map((schedule) => (schedule.id === id ? updated : schedule));
  cacheSchedules(schedules, true);
};

export const deleteSchedule = async (id: number) => {
  await apiRequest(`/api/schedules/${id}`, { method: "DELETE" });
  cacheSchedules(getSchedules().filter((schedule) => schedule.id !== id), true);
};

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getSchedules());

  useEffect(() => {
    const sync = async () => setSchedules(await fetchSchedules());

    sync();
    window.addEventListener(STORAGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(STORAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return schedules;
};
