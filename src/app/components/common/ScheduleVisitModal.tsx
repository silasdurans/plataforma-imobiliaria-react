/**
 * Modal de reserva inspirado no fluxo do Airbnb.
 * Permite selecionar mais de uma data e horário comercial antes da confirmação.
 */
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, Clock3, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

import { addSchedule, getSchedules } from "../../../data/schedules";
import { Calendar } from "../ui/calendar";
import { useIsMobile } from "../ui/use-mobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

const COMMERCIAL_HOURS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const dateFromKey = (dateKey: string) => new Date(`${dateKey}T12:00:00`);

const formatLongDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const simulatedBookings: Record<string, string[]> = {
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 1)))]: ["10:00", "15:00", "18:30"],
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 2)))]: ["09:30", "14:00", "17:00"],
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 4)))]: ["08:30", "12:30", "16:00"],
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 6)))]: ["11:00", "13:30", "19:00"],
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 8)))]: ["09:00", "15:30"],
};

interface ScheduleVisitModalProps {
  propertyTitle: string;
}

interface ReservationOption {
  date: string;
  time: string;
}

export function ScheduleVisitModal({ propertyTitle }: ScheduleVisitModalProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1279px)");
    const onChange = () => setIsCompactScreen(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const [month, setMonth] = useState(today);
  const [selectedDates, setSelectedDates] = useState<Date[]>([today]);
  const [focusedDate, setFocusedDate] = useState<Date | undefined>(today);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<ReservationOption[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const selectedDateKeys = selectedDates.map((date) => formatDateKey(date));

  const isDateDisabled = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const isPast = compareDate < today;
    return isPast;
  };

  const getPersistedBookedTimesByDate = (dateKey: string) =>
    [
      ...(simulatedBookings[dateKey] ?? []),
      ...getSchedules()
        .filter(
          (schedule) =>
            schedule.propertyTitle === propertyTitle &&
            schedule.date === dateKey &&
            schedule.status !== "cancelado",
        )
        .map((schedule) => schedule.time),
    ];

  const getBookedTimesByDate = (dateKey: string) =>
    [
      ...getPersistedBookedTimesByDate(dateKey),
      ...selectedOptions
        .filter((option) => option.date === dateKey)
        .map((option) => option.time),
    ];

  const handleAddOption = () => {
    if (!selectedDateKeys.length || !selectedTimes.length) {
      return;
    }

    const nextOptions = [...selectedOptions];
    const existingCombinations = new Set(
      selectedOptions.map((option) => `${option.date}-${option.time}`),
    );
    let added = 0;
    let skippedBooked = 0;
    let skippedDuplicate = 0;

    selectedDateKeys.forEach((dateKey) => {
      const unavailableTimes = new Set(getPersistedBookedTimesByDate(dateKey));

      selectedTimes.forEach((time) => {
        const combinationKey = `${dateKey}-${time}`;
        if (unavailableTimes.has(time)) {
          skippedBooked += 1;
          return;
        }
        if (existingCombinations.has(combinationKey)) {
          skippedDuplicate += 1;
          return;
        }

        nextOptions.push({ date: dateKey, time });
        existingCombinations.add(combinationKey);
        added += 1;
      });
    });

    if (!added) {
      setFeedbackMessage(
        skippedDuplicate
          ? "As combinacoes selecionadas ja foram adicionadas."
          : "Nenhuma combinacao disponivel para as datas e horarios selecionados.",
      );
      return;
    }

    setSelectedOptions(nextOptions);
    setSelectedTimes([]);
    if (skippedBooked || skippedDuplicate) {
      setFeedbackMessage(
        `${added} combinacao(oes) adicionada(s). ${skippedBooked} indisponivel(is) e ${skippedDuplicate} duplicada(s) ignorada(s).`,
      );
    } else {
      setFeedbackMessage("");
    }
    setConfirmed(false);
  };

  const handleRemoveOption = (optionToRemove: ReservationOption) => {
    setSelectedOptions((current) =>
      current.filter(
        (option) =>
          !(option.date === optionToRemove.date && option.time === optionToRemove.time),
      ),
    );
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!selectedOptions.length) {
      return;
    }

    const sessionRaw = localStorage.getItem("grupo-sp-client-session");
    if (!sessionRaw) {
      setFeedbackMessage("Faça login como cliente para concluir a reserva.");
      setConfirmed(false);
      setTimeout(() => navigate("/cliente/login"), 900);
      return;
    }

    try {
      const session = JSON.parse(sessionRaw) as { id: string; name: string; email: string };

      await Promise.all(
        selectedOptions.map((option) =>
          addSchedule({
            propertyTitle,
            clientName: session.name,
            clientEmail: session.email,
            clientId: session.id,
            date: option.date,
            time: option.time,
            status: "agendado",
            notes: `Reserva criada pelo cliente ${session.name}.`,
          }),
        ),
      );

      setFeedbackMessage(
        `Os dados de ${session.name} e ${selectedOptions.length} reserva(s) foram enviados para a agenda do painel administrativo.`,
      );
      setConfirmed(true);
    } catch {
      setFeedbackMessage("Nao foi possivel validar a sessao do cliente. Faca login novamente.");
      setConfirmed(false);
    }
  };

  const selectedSummary = selectedOptions
    .map((option) => ({
      ...option,
      label: formatLongDate(dateFromKey(option.date)),
    }))
    .sort((first, second) =>
      `${first.date}-${first.time}`.localeCompare(`${second.date}-${second.time}`),
    );

  const selectedDateLabel =
    selectedDates.length === 0
      ? "Selecione uma ou mais datas"
      : selectedDates.length === 1
      ? formatLongDate(selectedDates[0])
      : `${selectedDates.length} datas selecionadas`;

  const selectedTimeLabel =
    selectedTimes.length === 0
      ? "Selecione um ou mais horarios"
      : selectedTimes.length === 1
      ? selectedTimes[0]
      : `${selectedTimes.length} horarios selecionados`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-3 text-white shadow-lg shadow-[#0F172A]/20 transition-all hover:bg-[#1E293B]"
        >
          <CalendarIcon className="size-5" />
          Reserva
        </motion.button>
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] w-[calc(100%-1rem)] overflow-x-hidden overflow-y-auto rounded-2xl border-0 p-0 sm:max-h-[92vh] sm:rounded-[32px] md:w-[min(94vw,1200px)] md:max-w-none md:aspect-video">
        <DialogHeader className="border-b border-slate-200 px-4 py-4 sm:px-8 sm:py-5">
          <DialogTitle className="pr-8 text-xl text-[#0F172A] sm:text-2xl">Reservar horarios</DialogTitle>
          <DialogDescription className="mt-2 text-slate-500">
            Escolha uma ou mais datas e combine com horarios comerciais para reservar <strong>{propertyTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-4 sm:px-8 sm:py-6">
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[28px]">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-300 bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Data</p>
                <p className="mt-2 text-sm font-semibold text-[#0F172A]">{selectedDateLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Horario</p>
                <p className="mt-2 text-sm font-semibold text-[#0F172A]">{selectedTimeLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Opcoes</p>
                <p className="mt-2 text-sm font-semibold text-[#0F172A]">
                  {selectedOptions.length} combinacao(oes) adicionada(s)
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)]">
            <div className="min-w-0 rounded-[28px] border border-[#DDDDDD] bg-white p-4 shadow-sm sm:p-6 xl:p-8">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#222222]">Escolha as datas</h3>
                  <p className="mt-1 text-sm text-[#6A6A6A]">
                    Selecione um ou mais dias para montar sua reserva.
                  </p>
                </div>
              </div>

              <Calendar
                mode="multiple"
                month={month}
                onMonthChange={setMonth}
                selected={selectedDates}
                onSelect={(dates) => {
                  const nextDates = (dates ?? []).filter((date) => !isDateDisabled(date));
                  setSelectedDates(nextDates);
                  if (!nextDates.length) {
                    setFocusedDate(undefined);
                    setSelectedTimes([]);
                  } else if (
                    !focusedDate ||
                    !nextDates.some(
                      (date) => formatDateKey(date) === formatDateKey(focusedDate),
                    )
                  ) {
                    setFocusedDate(nextDates[0]);
                  }
                  setConfirmed(false);
                }}
                onDayClick={(date, modifiers) => {
                  if (!modifiers.disabled) {
                    setFocusedDate(date);
                  }
                }}
                disabled={isDateDisabled}
                numberOfMonths={isMobile || isCompactScreen ? 1 : 2}
                pagedNavigation
                showOutsideDays={false}
                className="mx-auto w-full max-w-fit p-0"
                classNames={{
                  months: "flex flex-col items-center gap-10 2xl:flex-row 2xl:items-start 2xl:gap-14",
                  month: "w-full max-w-[330px] space-y-3",
                  caption: "relative mb-1 flex h-10 items-center justify-center",
                  caption_label: "text-[22px] font-semibold leading-6 capitalize text-[#222222]",
                  nav_button:
                    "absolute top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDDDDD] bg-white text-[#222222] transition hover:border-[#B0B0B0] hover:bg-[#F7F7F7] sm:size-9",
                  nav_button_previous: "-left-1",
                  nav_button_next: "-right-1",
                  head_row: "grid grid-cols-7 gap-1",
                  head_cell:
                    "flex h-9 w-9 items-center justify-center text-[12px] font-medium text-[#717171] sm:h-10 sm:w-10",
                  row: "mt-1 grid grid-cols-7 gap-1",
                  cell: "relative h-9 w-9 p-0 text-center text-sm sm:h-10 sm:w-10",
                  day: "h-9 w-9 rounded-full p-0 text-[14px] font-medium text-[#222222] transition hover:bg-[#F2F2F2] sm:h-10 sm:w-10",
                  day_selected:
                    "bg-[#222222] text-white hover:bg-[#222222] hover:text-white focus:bg-[#222222] focus:text-white",
                  day_today: "border border-[#B0B0B0] bg-white text-[#222222]",
                  day_disabled: "cursor-not-allowed text-[#D0D0D0] line-through opacity-100",
                }}
                modifiers={{
                  added: selectedOptions.map((option) => dateFromKey(option.date)),
                }}
                modifiersClassNames={{
                  added: "border border-[#222222] bg-[#F7F7F7] text-[#222222] hover:bg-[#EEEEEE]",
                }}
              />
            </div>

            <div className="space-y-5 xl:sticky xl:top-4 xl:self-start">
              <div className="rounded-[28px] border border-[#DDDDDD] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DDDDDD] bg-white text-[#222222]">
                    <Clock3 className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6A6A6A]">Horarios comerciais</p>
                    <h3 className="text-[30px] leading-8 font-semibold text-[#222222]">Escolha um horario</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {COMMERCIAL_HOURS.map((hour) => {
                    const isBookedForAllSelectedDates =
                      selectedDateKeys.length > 0 &&
                      selectedDateKeys.every((dateKey) =>
                        getBookedTimesByDate(dateKey).includes(hour),
                      );
                    const isSelected = selectedTimes.includes(hour);

                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={!selectedDateKeys.length || isBookedForAllSelectedDates}
                        onClick={() =>
                          setSelectedTimes((current) =>
                            current.includes(hour)
                              ? current.filter((time) => time !== hour)
                              : [...current, hour],
                          )
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          isBookedForAllSelectedDates
                            ? "cursor-not-allowed border-[#EAEAEA] bg-[#F7F7F7] text-[#B0B0B0]"
                            : isSelected
                            ? "border-[#222222] bg-[#222222] text-white"
                            : "border-[#DDDDDD] bg-white text-[#222222] hover:border-[#222222]"
                        }`}
                      >
                        {hour}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!selectedDateKeys.length || !selectedTimes.length}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E61E4D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="size-4" />
                  Adicionar combinacoes
                </button>
              </div>

              <div className="rounded-[28px] border border-[#DDDDDD] bg-white p-4 shadow-sm sm:p-5">
                <h3 className="text-lg font-semibold text-[#222222]">Opcoes selecionadas</h3>
                <p className="mt-1 text-sm text-[#6A6A6A]">
                  Monte quantas combinacoes quiser antes de confirmar a reserva.
                </p>

                {selectedSummary.length ? (
                  <div className="mt-4 space-y-3">
                    {selectedSummary.map((option) => (
                      <div
                        key={`${option.date}-${option.time}`}
                        className="flex items-center justify-between rounded-2xl border border-[#EAEAEA] bg-[#F7F7F7] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#222222]">{option.label}</p>
                          <p className="text-xs text-[#6A6A6A]">{option.time}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(option)}
                          className="rounded-full p-2 text-[#6A6A6A] transition hover:bg-white hover:text-red-600"
                          aria-label="Remover opcao"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#DDDDDD] bg-[#F7F7F7] px-4 py-6 text-sm text-[#6A6A6A]">
                    Selecione uma data no calendario, escolha um horario comercial e adicione sua primeira opcao.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-3">
            <DialogClose asChild>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto">
                Fechar
              </button>
            </DialogClose>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedOptions.length}
              className="w-full rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Confirmar reserva
            </button>
          </DialogFooter>
        </div>

        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm sm:mx-8"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 size-6 text-emerald-700" />
              <div>
                <p className="text-lg font-semibold">Reserva confirmada!</p>
                <p className="mt-1 text-sm text-emerald-900/90">
                  {selectedOptions.length > 1
                    ? `Suas ${selectedOptions.length} opcoes de reserva foram registradas com sucesso.`
                    : `Sua reserva foi registrada para ${selectedSummary[0]?.label} as ${selectedSummary[0]?.time}.`}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {feedbackMessage || "Em breve um representante entrara em contato para confirmar os detalhes."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!confirmed && feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:mx-8"
          >
            {feedbackMessage}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
