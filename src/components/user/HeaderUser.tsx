import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

/* ── Types ── */
interface StoredUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  accountType: "user" | "business";
  createdAt: string;
  photo?: string;
  location?: string;
}

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

/* ── Storage helpers ── */
const USERS_KEY = "zylo_users";
const SESSION_KEY = "zylo_session";
const APPOINTMENTS_KEY = "zylo_appointments";

function getSession(): { email: string; name: string } | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function getAllUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getCurrentUser(): StoredUser | null {
  const session = getSession();
  if (!session) return null;
  return (
    getAllUsers().find(
      (u) => u.email.toLowerCase() === session.email.toLowerCase(),
    ) ?? null
  );
}

function getAppointments(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]") as Appointment[];
  } catch {
    return [];
  }
}

function formatDate(dateTime: string) {
  return new Date(dateTime).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Component ── */
export default function HeaderUser() {
  const [user] = useState<StoredUser | null>(() => getCurrentUser());
  const [showReservationsModal, setShowReservationsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [appointments, setAppointments] = useState<Appointment[]>(() => getAppointments());

  const displayPhoto = user?.photo ?? null;

  const monthLabel = useMemo(
    () =>
      calendarMonth.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      }),
    [calendarMonth],
  );

  const calendarDays = useMemo(() => {
    const firstDayIndex = calendarMonth.getDay();
    const daysCount = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + 1,
      0,
    ).getDate();
    return [
      ...Array(firstDayIndex).fill(null),
      ...Array.from({ length: daysCount }, (_, index) => index + 1),
    ];
  }, [calendarMonth]);

  const appointmentsForSelectedDate = useMemo(
    () =>
      appointments.filter(
        (appt) => appt.date === selectedDate && appt.status === "upcoming",
      ),
    [appointments, selectedDate],
  );

  const cancelAppointment = (id: number) => {
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, status: "cancelled" } : appt,
    ) as Appointment[];
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  };

  const changeAppointmentDateTime = (id: number) => {
    const updated = appointments.map((appt) => {
      if (appt.id !== id || appt.status === "cancelled") return appt;
      // Parse time like "02:00 PM" to Date object
      const timeStr = appt.time.replace(" ", "").toLowerCase();
      const isPM = timeStr.includes("pm");
      const [hourStr, minuteStr] = timeStr.replace("am", "").replace("pm", "").split(":");
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr);
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      const dateObj = new Date(appt.date);
      dateObj.setHours(hour, minute);
      const nextDate = new Date(dateObj.getTime() + 60 * 60 * 1000);
      return {
        ...appt,
        date: nextDate.toISOString().slice(0, 10),
        time: nextDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      };
    }) as Appointment[];
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  };

  return (
    <>
      <header className="bg-[#f9f6f5] flex justify-between items-center px-6 py-4 w-full sticky top-0 z-50 shadow-[0_1px_0_rgba(47,47,46,0.06)]">
        <div className="flex items-center gap-3">
          <Link to="/home">
            <h1 className="font-headline font-extrabold tracking-tight text-2xl text-primary italic">
              Zylo
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 items-center mr-4">
            <span className="text-primary font-semibold cursor-pointer">
              Explorar
            </span>
            <button
              onClick={() => setShowReservationsModal(true)}
              className="text-[#2f2f2e] hover:opacity-80 transition-opacity font-semibold"
            >
              Reservas
            </button>
            <span className="text-[#2f2f2e] hover:opacity-80 transition-opacity cursor-pointer">
              Favoritos
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#e4e2e1] overflow-hidden cursor-pointer active:scale-95 transition-transform">
            <Link to="/profile">
              {displayPhoto ? (
                <img
                  alt="User Profile"
                  className="w-full h-full object-cover"
                  src={displayPhoto}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  ?
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {showReservationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 sm:px-6">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[#e4e2e1]">
              <h2 className="text-xl font-bold">Mis Reservas</h2>
              <button
                onClick={() => setShowReservationsModal(false)}
                className="w-8 h-8 rounded-full bg-[#f3f0ef] flex items-center justify-center hover:bg-[#e7e4e3] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 grid gap-6 lg:grid-cols-[1.2fr_0.85fr] items-start">
              <section className="rounded-[2rem] border border-[#e4e2e1] bg-[#f9f6f5] p-6 min-w-[340px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Calendario</h3>
                    <p className="text-sm text-[#7a7877] mt-1">
                      Selecciona una fecha para ver tus citas.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                      className="rounded-full bg-white p-2 text-[#2f2f2e] transition hover:bg-[#f3f0ef]"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                      className="rounded-full bg-white p-2 text-[#2f2f2e] transition hover:bg-[#f3f0ef]"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>

                <div className="mb-4 rounded-2xl bg-white p-4">
                  <label className="block text-sm font-medium text-[#2f2f2e] mb-2">
                    Cambiar fecha manualmente
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full rounded-xl border border-[#d7d2cf] bg-[#f9f6f5] px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7877]">
                  {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
                    <div key={day} className="py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2 mt-2">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="h-12" />;
                    }

                    const dateString = new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      day,
                    )
                      .toISOString()
                      .slice(0, 10);
                    const isSelected = dateString === selectedDate;
                    const hasAppointments = appointments.some(
                      (appt) => appt.date === dateString && appt.status === "upcoming",
                    );
                    return (
                      <button
                        key={dateString}
                        type="button"
                        onClick={() => setSelectedDate(dateString)}
                        className={`flex h-12 items-center justify-center rounded-2xl text-sm font-semibold transition focus:outline-none ${
                          isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : hasAppointments
                            ? "bg-[#ffe7dd] text-[#c1491c]"
                            : "bg-white text-[#2f2f2e] hover:bg-[#f3f0ef]"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl border border-[#e4e2e1] bg-white p-4 text-sm text-[#7a7877]">
                  <p className="font-semibold text-[#2f2f2e]">Mes actual</p>
                  <p className="mt-1">{monthLabel}</p>
                </div>
              </section>

              <section className="rounded-[2rem] border border-[#e4e2e1] bg-[#f9f6f5] p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">Citas del {formatDate(`${selectedDate}T00:00:00`)}</h3>
                    <p className="text-sm text-[#7a7877] mt-1">
                      Detalles de tus reservas para este día.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7877]">
                    {appointmentsForSelectedDate.length} cita(s)
                  </span>
                </div>

                {appointmentsForSelectedDate.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d7d2cf] p-6 text-center text-sm text-[#7a7877]">
                    No hay citas programadas para este día.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {appointmentsForSelectedDate.map((appt) => (
                      <div
                        key={appt.id}
                        className="rounded-xl border border-[#e4e2e1] bg-white p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-[#7a7877] font-semibold">
                              Confirmada
                            </p>
                            <h4 className="mt-1 text-base font-bold">{appt.service}</h4>
                            <p className="mt-1 text-sm text-[#7a7877]">
                              {appt.businessName} • {appt.professionalName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{appt.time}</p>
                            <p className="text-xs text-[#7a7877]">Hora de inicio</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-[#7a7877]">
                            Fecha: <span className="font-semibold">{formatDate(`${appt.date}T00:00:00`)}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => changeAppointmentDateTime(appt.id)}
                              className="rounded-full border border-[#d7d2cf] bg-[#f9f6f5] px-3 py-1 text-xs font-semibold text-[#2f2f2e] transition hover:border-primary hover:text-primary"
                            >
                              Cambiar fecha/hora
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelAppointment(appt.id)}
                              className="rounded-full bg-[#ab2d00] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#8a2400]"
                            >
                              Cancelar cita
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="p-6 border-t border-[#e4e2e1] flex justify-end">
              <Link
                to="/reservas"
                onClick={() => setShowReservationsModal(false)}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#8a2400]"
              >
                Ver todas las reservas
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
