import { useState, useEffect } from "react";
import HeaderBusiness from "../../components/business/HeaderBusiness";
import ServicesManager from "../../components/business/ServicesManager";
import AvailabilityManager from "../../components/business/AvailabilityManager";
import ReservationsManager from "../../components/business/ReservationsManager";
import TeamManager from "../../components/business/TeamManager";
import { getSession } from "../../hooks/userCurrentUser";
import { apiFetch } from "../../utils/api";

/* ── Types ── */
interface AgendaItem {
  dayLabel: string;
  dayNum: number;
  title: string;
  time?: string;
  client?: string;
  duration?: string;
  initials?: string;
  avatarColor?: string;
  blocked?: boolean;
  active?: boolean;
}

interface DashboardSummary {
  today_bookings: number;
  total_bookings: number;
  pending: number;
  accepted: number;
  rejected: number;
  canceled: number;
  revenue_estimate: number;
}

interface Booking {
  id: string;
  user_name: string;
  service_name: string;
  start_at: string;
  end_at: string;
  notes?: string;
  status: string;
  price: number;
}

/* ── Helpers ── */
const avatarColors = [
  "bg-[#ff7851]",
  "bg-[#a03739]",
  "bg-[#833e9a]",
  "bg-[#4a90e2]",
  "bg-[#50e3c2]",
];

const NAV_ITEMS = [
  { icon: "calendar_today", label: "Bookings" },
  { icon: "favorite", label: "Saved" },
  { icon: "chat_bubble", label: "Messages" },
  { icon: "person_outline", label: "Profile" },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durationLabel(start: string, end: string) {
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  return mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ""}`
    : `${mins}m`;
}

/* ── Main ── */
export default function BusinessDashboard() {
  const [blocked, setBlocked] = useState(true);
  const [activeNav, setActiveNav] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "services" | "availability" | "reservations" | "team"
  >("team");

  // Data from API
  const [userName, setUserName] = useState("Usuario");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Lunes
    return start;
  });

  // Load user name from session
  useEffect(() => {
    const session = getSession();
    if (session?.name) setUserName(session.name);
  }, []);

  // Load dashboard summary
  useEffect(() => {
    setSummaryLoading(true);
    apiFetch("/businesses/me/dashboard-summary")
      .then((data) => setSummary(data.summary))
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    apiFetch("/businesses/me/bookings/accepted")
      .then((data) => {
        const bookings: Booking[] = data.items || [];

        if (bookings.length === 0) {
          return;
        }

        const weekStart = currentWeekStart;
        const items: AgendaItem[] = [];

        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          return date;
        });

        weekDays.forEach((date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;

          const dayBookings = bookings.filter((b) => {
            const match = b.start_at?.startsWith(dateStr);
            return match;
          });

          dayBookings.forEach((b) => {
            items.push({
              dayLabel: date.toLocaleDateString("es-ES", {
                weekday: "short",
              }),
              dayNum: date.getDate(),
              title: b.service_name || "Servicio",
              time: formatTime(b.start_at),
              client: b.user_name || "Cliente",
              duration: durationLabel(b.start_at, b.end_at),
              initials: (b.user_name || "U").slice(0, 2).toUpperCase(),
              avatarColor:
                avatarColors[Math.floor(Math.random() * avatarColors.length)],
              active: true,
            });
          });
        });

        setAgenda(items);
      })
      .catch((err) => console.error("❌ Error en agenda:", err));
  }, [currentWeekStart]);

  const nextWeek = () =>
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });

  const prevWeek = () =>
    setCurrentWeekStart((prev) => {
      const p = new Date(prev);
      p.setDate(prev.getDate() - 7);
      return p;
    });

  const revenueDisplay = summary
    ? `S/ ${summary.revenue_estimate.toLocaleString("es-PE", { minimumFractionDigits: 0 })}`
    : "S/ —";

  return (
    <div className="bg-[#f9f6f5] text-[#2f2f2e] min-h-screen font-body">
      <HeaderBusiness />

      <main className="pt-24 pb-36 px-6 max-w-7xl mx-auto">
        {/* ── Welcome ── */}
        <section className="mb-12">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2">
            Hola, {userName}
          </h1>
          <p className="text-on-surface-variant">
            {summaryLoading
              ? "Cargando citas..."
              : `Tienes ${summary?.today_bookings ?? 0} citas programadas para hoy.`}
          </p>
        </section>

        {/* ── Bento Stats ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total bookings */}
          <div className="md:col-span-2 bg-[#ffffff] p-8 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col justify-between min-h-[200px] relative overflow-hidden group">
            <div className="relative z-10">
              <span className="font-label font-semibold text-primary uppercase tracking-wider text-xs">
                Citas totales
              </span>
              <div className="text-6xl font-headline font-extrabold mt-4">
                {summaryLoading ? "—" : (summary?.total_bookings ?? 0)}
              </div>
            </div>
            {!summaryLoading && summary && (
              <div className="flex gap-4 mt-4 relative z-10 flex-wrap">
                <span className="text-xs font-semibold text-[#856404] bg-[#fff3cd] px-2 py-1 rounded-full">
                  {summary.pending} pendientes
                </span>
                <span className="text-xs font-semibold text-[#155724] bg-[#d4edda] px-2 py-1 rounded-full">
                  {summary.accepted} aceptadas
                </span>
                <span className="text-xs font-semibold text-[#721c24] bg-[#f8d7da] px-2 py-1 rounded-full">
                  {summary.rejected} rechazadas
                </span>
              </div>
            )}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#ff785133] rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          </div>

          {/* Revenue */}
          <div className="bg-[#ffffff] p-8 rounded-xl shadow-[0_4px_40px_rgba(47,47,46,0.06)] flex flex-col justify-between">
            <div>
              <span className="font-label font-semibold text-on-surface-variant uppercase tracking-wider text-xs">
                Ingresos Estimados
              </span>
              <div className="font-headline text-3xl font-bold mt-4">
                {summaryLoading ? "—" : revenueDisplay}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                De reservas aceptadas/completadas
              </p>
            </div>
            <div className="mt-4 h-12 flex items-end gap-1">
              {[40, 60, 90, 50, 100].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${
                    i === 2
                      ? "bg-primary"
                      : i === 4
                        ? "bg-[#ff7851]"
                        : "bg-[#e4e2e1]"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>


        </section>

        {/* ── Agenda + Sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Agenda */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline text-2xl font-bold">
                Agenda Semanal
              </h2>
              <div className="flex gap-2">
                {["chevron_left", "chevron_right"].map((icon, index) => (
                  <button
                    key={icon}
                    onClick={index === 0 ? prevWeek : nextWeek}
                    className="p-2 rounded-full hover:bg-[#f3f0ef] transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
            {agenda.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant bg-white rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-2 block">
                  event_available
                </span>
                <p>No hay reservas esta semana.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agenda.map((item, i) => (
                  <AgendaCard key={i} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Status breakdown */}
            {summary && (
              <div className="bg-[#f3f0ef] p-8 rounded-xl">
                <h3 className="font-headline text-xl font-bold mb-6">
                  Pulso de servicio
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Aceptadas",
                      value: summary.accepted,
                      total: summary.total_bookings,
                      color: "bg-[#28a745]",
                    },
                    {
                      label: "Pendientes",
                      value: summary.pending,
                      total: summary.total_bookings,
                      color: "bg-[#ffc107]",
                    },
                    {
                      label: "Hoy",
                      value: summary.today_bookings,
                      total: summary.total_bookings,
                      color: "bg-primary",
                    },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">
                          {stat.label}
                        </span>
                        <span className="text-primary font-bold">
                          {stat.value}
                        </span>
                      </div>
                      <div className="w-full bg-[#e4e2e1] h-2 rounded-full overflow-hidden">
                        <div
                          className={`${stat.color} h-full rounded-full`}
                          style={{
                            width:
                              stat.total > 0
                                ? `${(stat.value / stat.total) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>

        {/* ── Panel Modal ── */}
        {showPanel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[#f9f6f5] text-[#2f2f2e] w-full max-w-4xl rounded-2xl p-8 shadow-[0_4px_40px_rgba(47,47,46,0.06)] relative">
              <button
                onClick={() => setShowPanel(false)}
                className="absolute top-4 right-4 text-[#2f2f2e] hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="flex gap-8 mb-8 border-b border-[#e4e2e1] pb-4">
                {(
                  ["team", "services", "availability", "reservations"] as const
                ).map((panel) => (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(panel)}
                    className={`pb-2 font-headline font-semibold text-sm uppercase tracking-wider transition-colors ${
                      activePanel === panel
                        ? "text-primary border-b-2 border-primary"
                        : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {panel === "team"
                      ? "Equipo"
                      : panel === "services"
                        ? "Servicios"
                        : panel === "availability"
                          ? "Disponibilidad"
                          : "Reservas"}
                  </button>
                ))}
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {activePanel === "team" && <TeamManager />}
                {activePanel === "services" && <ServicesManager />}
                {activePanel === "availability" && <AvailabilityManager />}
                {activePanel === "reservations" && <ReservationsManager />}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-xl shadow-[0_-4px_40px_rgba(47,47,46,0.06)] rounded-t-[3rem] md:hidden">
        <button
          onClick={() => setActiveNav(-1)}
          className="flex flex-col items-center justify-center signature-gradient text-white rounded-full p-3 mb-1 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(i)}
            className={`flex flex-col items-center justify-center p-2 transition-all active:scale-[0.98] ${
              activeNav === i
                ? "text-primary"
                : "text-[#2f2f2e] hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold font-label mt-1">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 z-40 hover:scale-110 transition-transform duration-200"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}

/* ── Sub-components ── */
function AgendaCard({ item }: { item: AgendaItem }) {
  if (item.blocked) {
    return (
      <div className="bg-[#f3f0ef] p-6 rounded-xl flex items-center gap-6 opacity-60">
        <DayBadge label={item.dayLabel} num={item.dayNum} />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-on-surface-variant italic">
            {item.title}
          </h3>
          <p className="text-on-surface-variant text-sm">Todo el día</p>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">
          lock
        </span>
      </div>
    );
  }
  return (
    <div className="bg-[#ffffff] p-6 rounded-xl flex items-center gap-6 hover:scale-[0.99] transition-transform cursor-pointer">
      <DayBadge label={item.dayLabel} num={item.dayNum} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <h3 className="font-bold text-lg truncate">{item.title}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${item.active ? "bg-[#ff785133] text-primary" : "bg-[#e4e2e1] text-on-surface-variant"}`}
          >
            {item.time}
          </span>
        </div>
        <p className="text-on-surface-variant text-sm flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            person
          </span>
          {item.client} • {item.duration}
        </p>
      </div>
      {item.initials && (
        <div
          className={`w-8 h-8 rounded-full border-2 border-[#ffffff] ${item.avatarColor} flex items-center justify-center text-[10px] text-white font-bold shrink-0`}
        >
          {item.initials}
        </div>
      )}
    </div>
  );
}

function DayBadge({ label, num }: { label: string; num: number }) {
  return (
    <div className="w-16 flex flex-col items-center border-r border-[#afadac]/20 pr-6 shrink-0">
      <span className="text-xs font-bold text-on-surface-variant uppercase">
        {label}
      </span>
      <span className="font-headline text-2xl font-extrabold">{num}</span>
    </div>
  );
}
