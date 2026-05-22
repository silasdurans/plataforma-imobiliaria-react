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
const STORAGE_KEY = "grupo-sp-schedules";

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
    (schedule.isAllDay as unknown) === 1 ||
    schedule.time?.trim() === "dia-inteiro",
  status: schedule.status ?? "agendado",
  notes: schedule.notes ?? "",
  createdAt: schedule.createdAt ?? new Date().toISOString(),
});

export const formatScheduleTimeLabel = (
  schedule: Pick<ScheduleItem, "time" | "startTime" | "endTime" | "isAllDay">,
) => {
  if (schedule.isAllDay || schedule.time === "dia-inteiro") {
    return "Dia inteiro";
  }

  if (schedule.startTime && schedule.endTime) {
    return `${schedule.startTime} - ${schedule.endTime}`;
  }

  return schedule.startTime || schedule.time || "Não informado";
};

const loadFromStorage = (): ScheduleItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ScheduleItem[];
  } catch {
    // ignore parse errors
  }
  return [];
};

const saveToStorage = (schedules: ScheduleItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};

export const getSchedules = (): ScheduleItem[] => loadFromStorage();

export const fetchSchedules = async (): Promise<ScheduleItem[]> => loadFromStorage();

export const getAvailableScheduleTimes = async (
  propertyTitle: string,
  date: string,
): Promise<string[]> => {
  const schedules = loadFromStorage();
  const hasAllDayBooking = schedules.some(
    (s) =>
      s.propertyTitle === propertyTitle &&
      s.date === date &&
      s.status !== "cancelado" &&
      (s.isAllDay || s.time === "dia-inteiro"),
  );

  if (hasAllDayBooking) return [];

  const bookedTimes = schedules
    .filter(
      (s) =>
        s.propertyTitle === propertyTitle && s.date === date && s.status !== "cancelado",
    )
    .map((s) => s.time);

  return ["09:00", "11:00", "14:00", "16:00"].filter((time) => !bookedTimes.includes(time));
};

export const addSchedule = async (
  schedule: Omit<ScheduleItem, "id" | "createdAt">,
): Promise<ScheduleItem> => {
  const schedules = loadFromStorage();
  const nextId = schedules.length > 0 ? Math.max(...schedules.map((s) => s.id)) + 1 : 1;
  const created = normalizeSchedule({
    ...schedule,
    id: nextId,
    createdAt: new Date().toISOString(),
  });
  schedules.push(created);
  saveToStorage(schedules);
  dispatchSchedulesEvent();
  return created;
};

export const updateSchedule = async (id: number, updates: Partial<ScheduleItem>) => {
  const schedules = loadFromStorage();
  const index = schedules.findIndex((s) => s.id === id);
  if (index !== -1) {
    schedules[index] = normalizeSchedule({ ...schedules[index], ...updates, id });
    saveToStorage(schedules);
    dispatchSchedulesEvent();
  }
};

export const deleteSchedule = async (id: number) => {
  saveToStorage(loadFromStorage().filter((s) => s.id !== id));
  dispatchSchedulesEvent();
};

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    const sync = () => {
      setSchedules(loadFromStorage());
    };

    sync();
    window.addEventListener(SCHEDULES_EVENT, sync);

    return () => {
      window.removeEventListener(SCHEDULES_EVENT, sync);
    };
  }, []);

  return schedules;
};
