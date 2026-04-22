/**
 * Camada de dados dos agendamentos. Centraliza leitura e persistência exclusivamente pela API.
 */
import { useEffect, useState } from "react";

export type ScheduleStatus = "agendado" | "confirmado" | "cancelado";

export interface ScheduleItem {
  id: number;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientId?: string | null;
  clientPhone?: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  status: ScheduleStatus;
  notes?: string;
  createdAt?: string;
}

const SCHEDULES_EVENT = "grupo-sp-schedules:updated";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const dispatchSchedulesEvent = () => {
  window.dispatchEvent(new Event(SCHEDULES_EVENT));
};

const normalizeSchedule = (schedule: Partial<ScheduleItem>, index = 0): ScheduleItem => ({
  id: Number(schedule.id ?? index + 1),
  propertyTitle: schedule.propertyTitle?.trim() || "",
  clientName: schedule.clientName?.trim() || "",
  clientEmail: schedule.clientEmail?.trim().toLowerCase() || "",
  clientId: schedule.clientId ?? null,
  clientPhone: schedule.clientPhone?.trim() || "",
  date: schedule.date?.trim() || "",
  time: schedule.time?.trim() || "",
  startTime: schedule.startTime?.trim() || "",
  endTime: schedule.endTime?.trim() || "",
  isAllDay:
    schedule.isAllDay === true ||
    schedule.isAllDay === 1 ||
    schedule.time?.trim() === "dia-inteiro",
  status: schedule.status ?? "agendado",
  notes: schedule.notes ?? "",
  createdAt: schedule.createdAt ?? new Date().toISOString(),
});

export const formatScheduleTimeLabel = (schedule: Pick<ScheduleItem, "time" | "startTime" | "endTime" | "isAllDay">) => {
  if (schedule.isAllDay || schedule.time === "dia-inteiro") {
    return "Dia inteiro";
  }

  if (schedule.startTime && schedule.endTime) {
    return `${schedule.startTime} - ${schedule.endTime}`;
  }

  return schedule.startTime || schedule.time || "Não informado";
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
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
  return [];
};

export const fetchSchedules = async (): Promise<ScheduleItem[]> => {
  return (await apiRequest<Partial<ScheduleItem>[]>("/api/schedules")).map((item, index) =>
    normalizeSchedule(item, index),
  );
};

export const getAvailableScheduleTimes = async (propertyTitle: string, date: string): Promise<string[]> => {
  const schedules = await fetchSchedules();
  const hasAllDayBooking = schedules.some(
    (schedule) =>
      schedule.propertyTitle === propertyTitle &&
      schedule.date === date &&
      schedule.status !== "cancelado" &&
      (schedule.isAllDay || schedule.time === "dia-inteiro"),
  );

  if (hasAllDayBooking) {
    return [];
  }

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
  dispatchSchedulesEvent();
  return created;
};

export const updateSchedule = async (id: number, updates: Partial<ScheduleItem>) => {
  await apiRequest<Partial<ScheduleItem>>(`/api/schedules/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...updates, id }),
  });
  dispatchSchedulesEvent();
};

export const deleteSchedule = async (id: number) => {
  await apiRequest(`/api/schedules/${id}`, { method: "DELETE" });
  dispatchSchedulesEvent();
};

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const sync = async () => {
      try {
        setSchedules(await fetchSchedules());
      } catch {
        setSchedules([]);
      }
    };

    sync();
    window.addEventListener(SCHEDULES_EVENT, sync);

    return () => {
      window.removeEventListener(SCHEDULES_EVENT, sync);
    };
  }, []);

  return schedules;
};
