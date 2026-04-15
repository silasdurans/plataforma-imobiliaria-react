import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { addSchedule, getSchedules } from "../../../data/schedules";

const HOURS = ["09:00", "11:00", "14:00", "16:00"];

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const getMonthDays = (currentMonth: Date) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = firstDayOfMonth.getDay();
  const firstCalendarDay = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCalendarDay);
    date.setDate(firstCalendarDay.getDate() + index);
    return date;
  });
};

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const simulatedBookings: Record<string, string[]> = {
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 2)))]: ["11:00"],
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 4)))]: ["14:00", "16:00"],
  [formatDateKey(new Date(new Date().setDate(new Date().getDate() + 7)))]: ["09:00"],
};

interface ScheduleVisitModalProps {
  propertyTitle: string;
}

export function ScheduleVisitModal({ propertyTitle }: ScheduleVisitModalProps) {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const monthDays = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : "";
  const bookedTimes = selectedDateKey
    ? [
        ...(simulatedBookings[selectedDateKey] ?? []),
        ...getSchedules()
          .filter(
            (schedule) =>
              schedule.propertyTitle === propertyTitle &&
              schedule.date === selectedDateKey &&
              schedule.status !== "cancelado",
          )
          .map((schedule) => schedule.time),
      ]
    : [];
  const availableTimes = HOURS.filter((hour) => !bookedTimes.includes(hour));

  const isDateDisabled = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const isPast = compareDate < today;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return isPast || isWeekend || date.getMonth() !== currentMonth.getMonth();
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) {
      return;
    }
    setSelectedDate(date);
    setSelectedTime("");
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    const sessionRaw = localStorage.getItem("grupo-sp-client-session");
    if (!sessionRaw) {
      setFeedbackMessage("Faça login como cliente para concluir o agendamento.");
      setConfirmed(false);
      setTimeout(() => navigate("/cliente/login"), 900);
      return;
    }

    try {
      const session = JSON.parse(sessionRaw) as { id: string; name: string; email: string };

      await addSchedule({
        propertyTitle,
        clientName: session.name,
        clientEmail: session.email,
        clientId: session.id,
        date: selectedDateKey,
        time: selectedTime,
        status: "agendado",
        notes: `Agendamento criado pelo cliente ${session.name}.`,
      });

      setFeedbackMessage(
        `Os dados de ${session.name} e o agendamento foram enviados para a agenda do painel administrativo.`,
      );
      setConfirmed(true);
    } catch {
      setFeedbackMessage("Não foi possível validar a sessão do cliente. Faça login novamente.");
      setConfirmed(false);
    }
  };

  const displayDate = selectedDate
    ? selectedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "Nenhuma data selecionada";

  const displayTime = selectedTime || "Nenhum horário selecionado";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#0F172A] text-white py-3 rounded-xl hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0F172A]/20"
        >
          <CalendarIcon className="size-5" />
          Agendar Visita
        </motion.button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>Agendar visita</DialogTitle>
          <DialogDescription>
            Selecione uma data disponível e um horário para visitar <strong>{propertyTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Mês</p>
                <h3 className="text-lg font-semibold text-[#0F172A]">
                  {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition"
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition"
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {weekdayLabels.map((label) => (
                <div key={label} className="py-2">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((date) => {
                const dateKey = formatDateKey(date);
                const isSelected = selectedDate ? formatDateKey(selectedDate) === dateKey : false;
                const disabled = isDateDisabled(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDateSelect(date)}
                    type="button"
                    disabled={disabled}
                    className={
                      `rounded-2xl border p-2 text-sm transition ${
                        isSelected
                          ? "bg-[#0F172A] text-white border-[#0F172A] shadow-lg"
                          : disabled
                          ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-200 hover:border-[#0F172A] hover:text-[#0F172A]"
                      } ${!isCurrentMonth ? "opacity-40" : ""}`
                    }
                  >
                    <span>{date.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Seleção</p>
              <p className="mt-1 text-sm text-[#0F172A] font-semibold">{displayDate}</p>
              <p className="text-xs text-slate-500 mt-1">Somente dias úteis e datas futuras podem ser escolhidos.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F172A] text-white">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Horários disponíveis</p>
                  <h3 className="text-lg font-semibold text-[#0F172A]">Escolha um horário</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {HOURS.map((hour) => {
                  const isBooked = bookedTimes.includes(hour);
                  const isSelectedTime = selectedTime === hour;
                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={!selectedDate || isBooked}
                      onClick={() => setSelectedTime(hour)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        isBooked
                          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                          : isSelectedTime
                          ? "bg-[#0F172A] border-[#0F172A] text-white shadow-lg"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#0F172A] hover:text-[#0F172A]"
                      }`}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 border border-slate-200">
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-1 text-sm text-[#0F172A] font-semibold">{displayTime}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-3">Resumo</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Imóvel</span>
                  <span className="font-semibold text-[#0F172A] text-right max-w-[180px]">{propertyTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data</span>
                  <span className="font-semibold text-[#0F172A]">{displayDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Horário</span>
                  <span className="font-semibold text-[#0F172A]">{displayTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-3">
          <DialogClose asChild>
            <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
              Fechar
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedTime}
            className="rounded-2xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Agendamento
          </button>
        </DialogFooter>

        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <CheckCircle2 className="size-6 text-emerald-700" />
              </div>
              <div>
                <p className="font-semibold text-lg">Agendamento confirmado!</p>
                <p className="mt-1 text-sm text-emerald-900/90">
                  Você agendou sua visita para <strong>{displayDate}</strong> às <strong>{selectedTime}</strong>.
                </p>
                <p className="mt-2 text-sm text-slate-600">{feedbackMessage || "Em breve um representante entrará em contato para confirmar os detalhes."}</p>
              </div>
            </div>
          </motion.div>
        )}

        {!confirmed && feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            {feedbackMessage}
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
