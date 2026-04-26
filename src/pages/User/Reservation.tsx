import { useMemo, useState } from "react";
import HeaderUser from "../../components/user/HeaderUser";

interface Appointment {
  id: number;
  service: string;
  businessName: string;
  businessCategory: string;
  professionalName: string;
  professionalRole: string;
  date: string;
  time: string;
  price: number;
  businessImage: string;
  status: "upcoming" | "cancelled";
}

const STORAGE_KEY = "zylo_appointments";

function loadAppointments(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Appointment[];
  } catch {
    return [];
  }
}

function saveAppointments(data: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function parseTimeToMinutes(time: string) {
  const normalized = time.trim().toUpperCase();
  const hasPM = normalized.includes("PM");
  const hasAM = normalized.includes("AM");
  const cleaned = normalized.replace("AM", "").replace("PM", "").trim();
  const [hourStr, minuteStr] = cleaned.split(":");
  let hour = Number(hourStr);
  const minute = Number(minuteStr || "0");
  if (hasPM && hour !== 12) hour += 12;
  if (hasAM && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function formatMinutesToTime(value: number) {
  const hour = Math.floor(value / 60) % 24;
  const minute = value % 60;
  return new Date(0, 0, 0, hour, minute).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Reservations() {
  const today = new Date();
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadAppointments());
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today));

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [appointments]);

  const selectedDayAppointments = useMemo(() => {
    return (appointmentsByDate[selectedDate] || []).sort(
      (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
    );
  }, [appointmentsByDate, selectedDate]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{ date: Date; currentMonth: boolean; dateKey: string }> = [];

    for (let i = startOffset; i > 0; i -= 1) {
      const d = new Date(year, month, 1 - i);
      days.push({
        date: d,
        currentMonth: false,
        dateKey: formatDateKey(d),
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        currentMonth: true,
        dateKey: formatDateKey(d),
      });
    }

    while (days.length % 7 !== 0) {
      const d = new Date(year, month, daysInMonth + (days.length % 7) + 1);
      days.push({
        date: d,
        currentMonth: false,
        dateKey: formatDateKey(d),
      });
    }

    return days;
  }, [currentMonth]);

  const goPrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const cancelAppointment = (id: number) => {
    const updated = appointments.map((item) =>
      item.id === id ? { ...item, status: "cancelled" as const } : item,
    ) as Appointment[];
    setAppointments(updated);
    saveAppointments(updated);
  };

  const rescheduleAppointment = (id: number) => {
    const updated = appointments.map((item) => {
      if (item.id !== id || item.status === "cancelled") return item;
      const dateObj = new Date(`${item.date}T00:00:00`);
      dateObj.setDate(dateObj.getDate() + 1);
      const nextMinutes = parseTimeToMinutes(item.time) + 60;
      return {
        ...item,
        date: formatDateKey(dateObj),
        time: formatMinutesToTime(nextMinutes),
      };
    }) as Appointment[];
    setAppointments(updated);
    saveAppointments(updated);
  };

  return (
    <div className="min-h-screen bg-[#f9f6f5] text-[#2f2f2e]">
      <HeaderUser />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-10">
        <section className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#d5521b] mb-2">Mis reservas</p>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Calendario de citas
            </h1>
            <p className="text-sm md:text-base text-[#7a7877] mt-3 max-w-2xl">
              Revisa todas tus reservas en un calendario visual y toca cualquier
              día para ver el detalle completo de tus citas.
            </p>
          </div>

          <div className="bg-white rounded-3xl px-5 py-4 shadow-sm border border-[#f0e5df]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#a19b98] font-bold">
              Total activas
            </p>
            <p className="text-3xl font-extrabold mt-1">
              {appointments.filter((a) => a.status === "upcoming").length}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.9fr] gap-8">
          <section className="bg-white rounded-[28px] shadow-sm border border-[#f0e5df] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f3e8e2]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#a19b98] font-bold">
                  Agenda mensual
                </p>
                <h2 className="text-2xl font-extrabold mt-1">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevMonth}
                  className="w-11 h-11 rounded-full bg-[#f6f1ef] hover:bg-[#efe7e3] transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={goNextMonth}
                  className="w-11 h-11 rounded-full bg-[#f6f1ef] hover:bg-[#efe7e3] transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#a19b98] font-bold">
                    Cambiar fecha manualmente
                  </p>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-3 w-full max-w-[224px] rounded-2xl border border-[#ede6df] bg-[#fcfbfa] px-4 py-3 text-sm text-[#2f2f2e] shadow-sm outline-none transition focus:border-[#d5521b] focus:ring-2 focus:ring-[#ffd1c0]/70"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrevMonth}
                    className="w-11 h-11 rounded-full bg-[#f6f1ef] hover:bg-[#efe7e3] transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={goNextMonth}
                    className="w-11 h-11 rounded-full bg-[#f6f1ef] hover:bg-[#efe7e3] transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="min-w-[420px]">
                  <div className="grid grid-cols-7 gap-3 mb-3 min-w-[420px]">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-[#9a9491] whitespace-nowrap"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-3 min-w-[420px]">
                    {calendarDays.map((item) => {
                      const isSelected = item.dateKey === selectedDate;
                      const isToday = item.dateKey === formatDateKey(today);
                      const hasAppointments =
                        (appointmentsByDate[item.dateKey] || []).length > 0;
                      return (
                        <button
                          key={item.dateKey}
                          onClick={() => setSelectedDate(item.dateKey)}
                          className={`aspect-square min-h-[88px] rounded-[24px] p-3 text-left transition-all border ${
                            isSelected
                              ? "bg-gradient-to-br from-[#d5521b] to-[#ff7851] text-white border-transparent shadow-lg shadow-[#d5521b]/20"
                              : item.currentMonth
                              ? "bg-[#fcfbfa] border-[#f1e6e0] hover:bg-[#faf4f1]"
                              : "bg-[#f6f1ef] border-transparent text-[#b2aaa7]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-bold ${
                                isSelected ? "text-white" : "text-[#2f2f2e]"
                              }`}
                            >
                              {item.date.getDate()}
                            </span>
                            {isToday && !isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#ff7851]" />
                            )}
                          </div>

                          <div className="mt-4 space-y-1">
                            {hasAppointments && (
                              <>
                                <div
                                  className={`text-[11px] font-semibold ${
                                    isSelected ? "text-white/90" : "text-[#7a7877]"
                                  }`}
                                >
                                  {appointmentsByDate[item.dateKey].length} reserva
                                  {appointmentsByDate[item.dateKey].length > 1 ? "s" : ""}
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {appointmentsByDate[item.dateKey]
                                    .slice(0, 2)
                                    .map((appt) => (
                                      <span
                                        key={appt.id}
                                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                          isSelected
                                            ? "bg-white/20 text-white"
                                            : "bg-[#ffe7dd] text-[#c1491c]"
                                        }`}
                                      >
                                        {appt.time}
                                      </span>
                                    ))}
                                </div>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="bg-white rounded-[28px] shadow-sm border border-[#f0e5df] p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-[#a19b98] font-bold mb-2">
                Día seleccionado
              </p>
              <h2 className="text-2xl font-extrabold">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString("es-PE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              <p className="text-sm text-[#7a7877] mt-3">
                Aquí puedes revisar el detalle de tus citas programadas, cancelarlas o moverlas rápidamente.
              </p>
            </section>

            <section className="bg-white rounded-[28px] shadow-sm border border-[#f0e5df] p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold">Citas del día</h3>
                <span className="px-3 py-1 rounded-full bg-[#fff1ea] text-[#c1491c] text-xs font-bold">
                  {selectedDayAppointments.length}
                </span>
              </div>

              {selectedDayAppointments.length === 0 ? (
                <div className="rounded-3xl bg-[#faf6f4] border border-dashed border-[#eadcd5] p-6 text-center">
                  <p className="text-sm font-semibold text-[#5e5a58]">
                    No tienes reservas este día
                  </p>
                  <p className="text-xs text-[#9a9491] mt-2">
                    Cuando confirmes una cita desde un business profile, aparecerá aquí automáticamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayAppointments.map((appointment) => (
                    <article
                      key={appointment.id}
                      className="rounded-[24px] border border-[#f1e6e0] bg-[#fcfbfa] p-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={appointment.businessImage}
                          alt={appointment.businessName}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-[#ffe7dd] text-[#c1491c] text-[10px] font-bold uppercase tracking-wide">
                              {appointment.businessCategory}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                appointment.status === "cancelled"
                                  ? "bg-[#f3e5e5] text-[#9b3b3b]"
                                  : "bg-[#e9f7ef] text-[#2c7a4b]"
                              }`}
                            >
                              {appointment.status === "cancelled" ? "Cancelada" : "Activa"}
                            </span>
                          </div>
                          <h4 className="text-base font-extrabold leading-tight">
                            {appointment.service}
                          </h4>
                          <p className="text-sm text-[#7a7877] mt-1">
                            {appointment.businessName}
                          </p>
                          <p className="text-sm text-[#7a7877]">
                            {appointment.professionalName} · {appointment.professionalRole}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-2xl bg-[#f6f1ef] px-3 py-2">
                              <p className="text-[11px] text-[#9a9491] font-bold uppercase">Hora</p>
                              <p className="font-semibold">{appointment.time}</p>
                            </div>
                            <div className="rounded-2xl bg-[#f6f1ef] px-3 py-2">
                              <p className="text-[11px] text-[#9a9491] font-bold uppercase">Precio</p>
                              <p className="font-semibold">${appointment.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-4">
                            <button
                              onClick={() => cancelAppointment(appointment.id)}
                              disabled={appointment.status === "cancelled"}
                              className="px-4 py-2 rounded-full bg-[#2f2f2e] text-white text-sm font-bold disabled:opacity-40"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => rescheduleAppointment(appointment.id)}
                              disabled={appointment.status === "cancelled"}
                              className="px-4 py-2 rounded-full bg-[#fff1ea] text-[#c1491c] text-sm font-bold disabled:opacity-40"
                            >
                              Reprogramar
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
