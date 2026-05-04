/**
 * Seção inline de reserva exibida diretamente na página do imóvel.
 * Permite selecionar mais de uma data e definir se cada reserva será por dia inteiro
 * ou por um período específico com hora de entrada e saída.
 */
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router";

import { addSchedule, formatScheduleTimeLabel, useSchedules } from "../../../data/schedules";
import { fetchClientSession } from "../../lib/clientSession";
import { Calendar } from "../ui/calendar";
import { useIsMobile } from "../ui/use-mobile";

const ALL_DAY_TIME = "dia-inteiro";

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

const getNextBusinessDate = (baseDate: Date) => {
  const nextDate = new Date(baseDate);

  while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
};

interface ScheduleVisitModalProps {
  propertyTitle: string;
}

interface ReservationOption {
  date: string;
  isAllDay: boolean;
  startTime: string;
  endTime: string;
  time: string;
}

export function ScheduleVisitModal({ propertyTitle }: ScheduleVisitModalProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const schedules = useSchedules();
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const initialDate = useMemo(() => getNextBusinessDate(today), [today]);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1535px)");
    const onChange = () => setIsCompactScreen(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  const [month, setMonth] = useState(initialDate);
  const [selectedDates, setSelectedDates] = useState<Date[]>([initialDate]);
  const [focusedDate, setFocusedDate] = useState<Date | undefined>(initialDate);
  const [selectedOptions, setSelectedOptions] = useState<ReservationOption[]>([]);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [draftIsAllDay, setDraftIsAllDay] = useState(true);
  const [draftStartTime, setDraftStartTime] = useState("09:00");
  const [draftEndTime, setDraftEndTime] = useState("18:00");
  const [confirmed, setConfirmed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const resetReservationFlow = () => {
    setMonth(initialDate);
    setSelectedDates([initialDate]);
    setFocusedDate(initialDate);
    setSelectedOptions([]);
    setShowPeriodPicker(false);
    setDraftIsAllDay(true);
    setDraftStartTime("09:00");
    setDraftEndTime("18:00");
    setConfirmed(false);
    setFeedbackMessage("");
    setIsSubmitting(false);
  };

  const isDateDisabled = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const isPast = compareDate < today;
    const isWeekend = compareDate.getDay() === 0 || compareDate.getDay() === 6;
    return isPast || isWeekend;
  };

  const getPersistedSchedulesByDate = (dateKey: string) =>
    schedules.filter(
      (schedule) =>
        schedule.propertyTitle === propertyTitle &&
        schedule.date === dateKey &&
        schedule.status !== "cancelado",
    );

  const hasAllDayConflict = (dateKey: string) => {
    const persistedAllDay = getPersistedSchedulesByDate(dateKey).some(
      (schedule) => schedule.isAllDay || schedule.time === ALL_DAY_TIME,
    );
    const selectedAllDay = selectedOptions.some(
      (option) => option.date === dateKey && option.isAllDay,
    );
    return persistedAllDay || selectedAllDay;
  };

  const openPeriodPicker = () => {
    if (!selectedDates.length) {
      return;
    }

    setShowPeriodPicker(true);
    setConfirmed(false);
    setFeedbackMessage("");
  };

  const handleAddOption = () => {
    if (!selectedDates.length) {
      return;
    }

    const nextOptions = [...selectedOptions];
    const existingDates = new Set(selectedOptions.map((option) => option.date));
    let added = 0;
    let skippedReserved = 0;
    let skippedDuplicate = 0;

    selectedDates.forEach((date) => {
      const dateKey = formatDateKey(date);

      if (existingDates.has(dateKey)) {
        skippedDuplicate += 1;
        return;
      }

      if (draftIsAllDay && getPersistedSchedulesByDate(dateKey).length > 0) {
        skippedReserved += 1;
        return;
      }

      nextOptions.push({
        date: dateKey,
        isAllDay: draftIsAllDay,
        startTime: draftIsAllDay ? "" : draftStartTime,
        endTime: draftIsAllDay ? "" : draftEndTime,
        time: draftIsAllDay ? ALL_DAY_TIME : draftStartTime,
      });
      existingDates.add(dateKey);
      added += 1;
    });

    if (!added) {
      setFeedbackMessage(
        skippedDuplicate
          ? "As datas selecionadas ja foram adicionadas."
          : "Nenhum dos dias selecionados esta disponivel para esse formato.",
      );
      return;
    }

    setSelectedOptions(nextOptions);
    setShowPeriodPicker(false);

    if (skippedReserved || skippedDuplicate) {
      setFeedbackMessage(
        `${added} dia(s) adicionados. ${skippedReserved} indisponivel(is) e ${skippedDuplicate} duplicado(s) ignorado(s).`,
      );
    } else {
      setFeedbackMessage(`${added} dia(s) adicionados com sucesso.`);
    }

    setConfirmed(false);
  };

  const handleRemoveOption = (optionToRemove: ReservationOption) => {
    setSelectedOptions((current) =>
      current.filter((option) => option.date !== optionToRemove.date),
    );
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!selectedOptions.length || isSubmitting) {
      return;
    }

    const session = await fetchClientSession();

    if (!session) {
      setFeedbackMessage("Faça login como cliente para concluir a reserva.");
      setConfirmed(false);
      setTimeout(() => navigate("/cliente/login"), 900);
      return;
    }

    try {
      setIsSubmitting(true);

      const results = await Promise.allSettled(
        selectedOptions.map((option) =>
          addSchedule({
            propertyTitle,
            clientName: session.name,
            clientEmail: session.email,
            clientId: session.id,
            clientPhone: session.phone || "",
            date: option.date,
            time: option.time,
            startTime: option.startTime,
            endTime: option.endTime,
            isAllDay: option.isAllDay,
            status: "confirmado",
            notes: `Reserva confirmada pelo cliente ${session.name}.`,
          }),
        ),
      );

      const successful = results.filter((result) => result.status === "fulfilled").length;
      const failedResults = results.filter((result) => result.status === "rejected");

      if (!successful) {
        const firstError = failedResults[0];
        setFeedbackMessage(
          firstError?.status === "rejected"
            ? firstError.reason instanceof Error
              ? firstError.reason.message
              : "Nao foi possivel concluir a reserva agora. Tente novamente em instantes."
            : "Nao foi possivel concluir a reserva agora. Tente novamente em instantes.",
        );
        setConfirmed(false);
        return;
      }

      if (failedResults.length > 0) {
        setFeedbackMessage(
          `${successful} opcao(oes) foram confirmadas, mas ${failedResults.length} nao puderam ser reservadas porque ja ficaram indisponiveis durante a confirmacao.`,
        );
      } else {
        setFeedbackMessage(
          successful > 1
            ? `${successful} reservas foram confirmadas e enviadas para a agenda do painel administrativo.`
            : `A reserva de ${session.name} foi confirmada e enviada para a agenda do painel administrativo.`,
        );
      }

      setConfirmed(true);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir a reserva agora. Tente novamente em instantes.",
      );
      setConfirmed(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSummary = selectedOptions
    .map((option) => ({
      ...option,
      label: formatLongDate(dateFromKey(option.date)),
      timeLabel: formatScheduleTimeLabel(option),
    }))
    .sort((first, second) => first.date.localeCompare(second.date));

  const selectedDateLabel =
    selectedDates.length === 0
      ? "Selecione um ou mais dias"
      : selectedDates.length === 1
        ? formatLongDate(selectedDates[0])
        : `${selectedDates.length} dias selecionados`;

  const focusedDateKey = focusedDate ? formatDateKey(focusedDate) : "";
  const focusedDateHasAllDayConflict = !!focusedDateKey && hasAllDayConflict(focusedDateKey);
  const focusedDateAlreadyAdded =
    !!focusedDateKey && selectedOptions.some((option) => option.date === focusedDateKey);
  const focusedDateScheduleCount = focusedDateKey
    ? getPersistedSchedulesByDate(focusedDateKey).length
    : 0;
  const draftPeriodInvalid =
    !draftIsAllDay &&
    (!draftStartTime || !draftEndTime || draftStartTime >= draftEndTime);

  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-lg shadow-slate-200">
          <CalendarIcon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Reserva
          </p>
          <h2 className="mt-1 text-2xl text-[#0F172A]">Reservar dias</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Escolha um ou mais dias para reservar <strong>{propertyTitle}</strong>. Você pode bloquear o dia inteiro ou informar hora de entrada e saída.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Data</p>
          <p className="mt-1.5 text-sm font-semibold text-[#0F172A]">{selectedDateLabel}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Formato</p>
          <p className="mt-1.5 text-sm font-semibold text-[#0F172A]">
            {draftIsAllDay ? "Dia inteiro" : `${draftStartTime} ate ${draftEndTime}`}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Reservas</p>
          <p className="mt-1.5 text-sm font-semibold text-[#0F172A]">
            {selectedOptions.length} dia(s) adicionados
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-[28px] border border-[#DDDDDD] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-[#222222]">Escolha as datas</h3>
            <p className="mt-1 text-sm text-[#6A6A6A]">
              Selecione quantos dias quiser. Depois abra o popup compacto para definir se as datas entram como dia inteiro ou com horario de entrada e saida.
            </p>
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
              } else if (
                !focusedDate ||
                !nextDates.some((date) => formatDateKey(date) === formatDateKey(focusedDate))
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
              months: "flex flex-col items-center gap-6 2xl:flex-row 2xl:items-start 2xl:gap-8",
              month: "w-full max-w-[330px] space-y-3",
              caption: "relative mb-1 flex h-10 items-center justify-center",
              caption_label: "text-[20px] font-semibold leading-6 capitalize text-[#222222]",
              nav_button:
                "absolute top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDDDDD] bg-white text-[#222222] transition hover:border-[#B0B0B0] hover:bg-[#F7F7F7] sm:size-9",
              nav_button_previous: "-left-1",
              nav_button_next: "-right-1",
              head_row: "grid grid-cols-7 gap-1",
              head_cell:
                "flex h-8 w-8 items-center justify-center text-[11px] font-medium text-[#717171] sm:h-9 sm:w-9",
              row: "mt-1 grid grid-cols-7 gap-1",
              cell: "relative h-8 w-8 p-0 text-center text-sm sm:h-9 sm:w-9",
              day: "h-8 w-8 rounded-full p-0 text-[13px] font-medium text-[#222222] transition hover:bg-[#F2F2F2] sm:h-9 sm:w-9",
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

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#DDDDDD] bg-white p-4 shadow-sm sm:p-5">
            <div>
              <p className="text-sm text-[#6A6A6A]">Modelo da reserva</p>
              <h3 className="text-[26px] leading-7 font-semibold text-[#222222]">Dia inteiro ou periodo</h3>
              <p className="mt-2 text-sm leading-6 text-[#6A6A6A]">
                Abra o popup abaixo para definir o formato antes de adicionar as datas selecionadas.
              </p>
            </div>

            {focusedDate && (
              <div className="mb-4 mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dia ativo</p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">{formatLongDate(focusedDate)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {focusedDateHasAllDayConflict
                    ? "Este dia ja possui uma reserva de dia inteiro e nao aceita novos encaixes."
                    : focusedDateAlreadyAdded
                      ? "Este dia ja foi adicionado na sua lista."
                      : focusedDateScheduleCount > 0
                        ? "Este dia ja possui reservas por horario. Você ainda pode tentar um periodo diferente."
                        : "Este dia esta livre para dia inteiro ou para um periodo especifico."}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={openPeriodPicker}
              disabled={!selectedDates.length}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#E61E4D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />
              Definir periodo e adicionar
            </button>
          </div>

          <div className="rounded-[28px] border border-[#DDDDDD] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="text-lg font-semibold text-[#222222]">Reservas selecionadas</h3>
            <p className="mt-1 text-sm text-[#6A6A6A]">
              Cada item abaixo representa uma reserva pronta para ser confirmada.
            </p>

            {selectedSummary.length ? (
              <div className="mt-4 grid gap-2">
                {selectedSummary.map((option) => (
                  <div
                    key={option.date}
                    className="flex items-center justify-between rounded-2xl border border-[#EAEAEA] bg-[#F7F7F7] px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#222222]">{option.label}</p>
                      <p className="text-xs text-[#6A6A6A]">{option.timeLabel}</p>
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
              <div className="mt-4 rounded-2xl border border-dashed border-[#DDDDDD] bg-[#F7F7F7] px-4 py-5 text-sm text-[#6A6A6A]">
                Selecione um ou mais dias no calendario e adicione sua primeira reserva.
              </div>
            )}
          </div>
        </div>
      </div>

      {!confirmed && feedbackMessage && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {feedbackMessage}
        </motion.div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <button
          type="button"
          onClick={resetReservationFlow}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Limpar seleção
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedOptions.length || isSubmitting}
          className="w-full rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Confirmando..." : "Confirmar reserva"}
        </button>
      </div>

      <AnimatePresence>
        {showPeriodPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#0F172A]/45 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Periodo da reserva
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#0F172A]">Defina como os dias serao reservados</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {selectedDates.length > 1
                      ? `As ${selectedDates.length} datas selecionadas receberao o mesmo formato.`
                      : "A data selecionada recebera o formato escolhido abaixo."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPeriodPicker(false)}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Fechar popup de periodo"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDraftIsAllDay(true)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    draftIsAllDay
                      ? "border-[#0F172A] bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Opcao</p>
                  <p className="mt-2 text-base font-semibold">Dia inteiro</p>
                  <p className="mt-1 text-sm opacity-80">Bloqueia o dia completo para a reserva.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDraftIsAllDay(false)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    !draftIsAllDay
                      ? "border-[#FF385C] bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Opcao</p>
                  <p className="mt-2 text-base font-semibold">Periodo customizado</p>
                  <p className="mt-1 text-sm opacity-80">Defina hora de entrada e hora de saida.</p>
                </button>
              </div>

              {!draftIsAllDay && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Hora de entrada
                    </span>
                    <input
                      type="time"
                      value={draftStartTime}
                      onChange={(event) => setDraftStartTime(event.target.value)}
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
                    />
                  </label>
                  <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Hora de saida
                    </span>
                    <input
                      type="time"
                      value={draftEndTime}
                      onChange={(event) => setDraftEndTime(event.target.value)}
                      className="mt-2 w-full bg-transparent text-sm font-semibold text-[#0F172A] outline-none"
                    />
                  </label>
                </div>
              )}

              {draftPeriodInvalid && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Informe uma hora de saida maior que a hora de entrada.
                </div>
              )}

              {draftIsAllDay &&
                selectedDates.some((date) => getPersistedSchedulesByDate(formatDateKey(date)).length > 0) && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Pelo menos uma das datas ja possui reserva. Para esses casos, use um periodo especifico ou escolha outro dia.
                  </div>
                )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowPeriodPicker(false)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={draftPeriodInvalid}
                  className="w-full rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Adicionar datas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {confirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-[#0F172A]/45 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 26, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md rounded-[32px] border border-emerald-200 bg-white p-6 text-center shadow-2xl sm:p-8"
            >
              <div className="mx-auto flex size-18 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                <CheckCircle2 className="size-9" />
              </div>

              <h3 className="mt-5 text-2xl font-semibold text-[#0F172A]">Reserva confirmada!</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedOptions.length > 1
                  ? `Suas ${selectedOptions.length} reservas foram registradas com sucesso.`
                  : `Sua reserva foi registrada para ${selectedSummary[0]?.label}.`}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {feedbackMessage || "Em breve um representante entrara em contato para confirmar os detalhes."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setConfirmed(false)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Continuar vendo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmed(false);
                    resetReservationFlow();
                  }}
                  className="w-full rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
